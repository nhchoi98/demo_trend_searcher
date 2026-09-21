# trend-finder

관심 연구 주제의 신규 논문을 매일 찾아서, 관련도 판정을 거친 것만 요약해 리포트로 남기는 작은 파이프라인입니다. 기본 설정은 world model, physical AI, NVIDIA Cosmos입니다.

```
arXiv 수집 → 이미 본 논문 제외 → 루프 1: 판정(Jev) → 루프 2: 요약(GPT) → reports/<날짜>.md + Teams 카드
```

판정은 TypeSafe의 Jev가 합니다. Jev는 텍스트를 생성하지 않고, 타입이 정해진 질문에 확률이 붙은 답만 돌려주는 모델입니다. 빠르고 싸서 하루 수백 건을 전부 판정하는 데 맞습니다. GPT는 글을 쓰는 일(요약)만 맡습니다. Jev가 확신하지 못한 논문은 다른 모델에 다시 묻지 않고 리포트에 "경계"로 표시해서 읽는 사람이 판단합니다.

기본 수집 방식은 키워드 검색이 아닙니다. 지정한 arXiv 카테고리의 신규 논문을 전부 받아 온 뒤 루프 1이 초록을 읽고 고릅니다. 그래서 설정한 구문을 쓰지 않은 논문도 잡힙니다.

서버와 DB가 없습니다. GitHub Actions가 하루 한 번 실행하고, 상태는 `data/*.jsonl`로 레포에 커밋됩니다.

## 처리 흐름

```mermaid
flowchart TD
    A[arXiv API<br/>category: 카테고리 신규 전부<br/>keyword: 토픽 구문 검색] --> B[중복 제외<br/>data/papers.jsonl의 id와 대조]
    B --> C{gate.maxNewPerRun<br/>초과?}
    C -- 넘친 논문 --> D[다음 실행으로 이월<br/>기록하지 않음]
    C -- 배치 --> E

    subgraph L1[루프 1: 판정 · 논문당 1회 호출]
        E[질문 15개 fan-out<br/>label · topic · contribution<br/>significance · tag × 11] --> F[TypeSafe Jev]
        F --> G[combine · 코드<br/>포함 확률 · 경계 · 우선순위 · 태그]
    end
    S[Semantic Scholar<br/>저자 h-index · 실행당 배치 1회<br/>미색인 논문은 항 제외] -.-> G

    F -. 호출마다 .-> H[(data/decisions.jsonl)]
    G --> I{포함 확률 ≥ includeThreshold<br/>그리고 priority ≥ minPriority?}
    I -- 아니오 --> J[(papers.jsonl<br/>즉시 기록)]
    I -- 예 --> K

    subgraph L2[루프 2: 요약]
        K[GPT · 제목과 초록만 사용<br/>한 줄 요약 + 문제·방법·결과·의의<br/>링크·저자·인용은 쓰지 않음]
    end

    K --> M[(papers.jsonl<br/>요약 완료 후 일괄 기록)]
    M --> N[reports/날짜.md<br/>논문마다 arXiv 링크 + References<br/>피드 메타데이터로 프로그램이 붙임]
    N --> O[Teams Adaptive Card<br/>제목 클릭 → arXiv, Full report 버튼<br/>TEAMS_WEBHOOK_URL 있을 때]
    N --> P[GitHub Actions가<br/>data/ · reports/ 커밋]
    M -. 30일 뒤 citations 명령 .-> R[(data/citations.jsonl<br/>인용 수 1회 기록)]

    F -. 실패 .-> Q[기록하지 않음<br/>다음 실행에서 재시도]
    K -. 실패 .-> Q
```

### 단계별로 풀어 쓰면

한 번의 실행(`node src/cli.ts run`)은 아래 순서로 진행됩니다. 기본 설정 기준이며 괄호 안이 설정 키입니다.

1. **수집.** arXiv API에서 지정한 카테고리(`arxiv.categories`, 기본 cs.CV·cs.RO·cs.LG·cs.AI)의 최근 4일(`lookbackDays`) 신규 논문을 200건씩 페이지로 전부 받습니다. 요청 사이에 3초를 쉽니다. 키워드 검색이 아니므로 설정한 구문을 쓰지 않은 논문도 들어옵니다. 각 논문에 대해 "키워드 검색이었다면 걸렸을까"를 로컬에서 계산해 `matchedTopics`로 남깁니다. 리포트의 "키워드 검색이었다면 놓쳤을 논문 N건"이 여기서 나옵니다.
2. **중복 제외.** `data/papers.jsonl`에 이미 있는 id는 뺍니다. 수집 창이 겹쳐도 같은 논문을 두 번 처리하지 않고, 실행이 하루 빠져도 다음 실행이 메웁니다.
3. **비용 상한.** 남은 신규 논문을 최신순으로 정렬해 앞에서 `gate.maxNewPerRun`(1500)건만 이번 실행에 넣습니다. 넘친 논문은 기록하지 않으므로 다음 실행이 다시 봅니다.
4. **저자 실적 조회.** 이번 배치의 arXiv id 전부를 Semantic Scholar 배치 API에 한 번에 보내 논문별 저자 최대 h-index를 받습니다. 제출 후 며칠은 색인이 안 된 논문이 많은데, 그런 논문은 이 값이 없는 채로 다음 단계로 갑니다. API가 실패해도 경고만 남기고 실행은 계속됩니다.
5. **루프 1, 판정.** 논문마다 Jev를 한 번 호출하고 질문 15개를 함께 보냅니다. 관련도(core / adjacent / irrelevant), 토픽, 기여 유형, 중요도(0~3), 태그 11개의 예/아니오입니다. Jev는 각 답에 확률을 붙여 돌려줍니다. 최대 8건(`concurrency`)을 동시에 처리하고, 호출 하나하나가 `data/decisions.jsonl`에 한 줄로 남습니다.
6. **종합.** 모델이 아니라 코드(`combine()`)가 답들을 숫자로 합칩니다.
   - 포함 확률 = P(core) + P(adjacent).
   - priority = 관련도(0.6) · 중요도(0.4) · 저자 h-index(0.15, 40에서 포화)의 가중 평균. h-index를 모르는 논문은 그 항을 빼고 나머지로 평균합니다.
   - 경계 = 포함됐지만 라벨 confidence가 0.7 미만.
   - 태그 = "예" 확률이 0.5 이상인 것.
7. **탈락.** 포함 확률이 0.5 미만이거나 priority가 0.82 미만이면 여기서 끝입니다. id·라벨·confidence·포함 확률만 `papers.jsonl`에 즉시 기록합니다. 실행이 중간에 죽어도 이미 판정한 수백 건을 다시 판정하지 않기 위해서입니다.
8. **루프 2, 요약.** 통과한 논문만 GPT에 보냅니다. 제목과 초록만 주고, 설정 언어로 한 줄 요약과 문제·방법·결과·의의 한 문단을 받습니다. 링크·저자·인용은 쓰지 말라고 지시합니다. 모델이 지어낸 URL을 막기 위해서입니다.
9. **기록.** 요약이 모두 끝난 뒤, 통과한 논문 전체를 제목·URL·토픽·태그·priority 등 전체 필드로 `papers.jsonl`에 한꺼번에 기록합니다. 게시보다 먼저 저장하므로 게시가 실패해도 내일 같은 논문이 다시 올라가지 않습니다. 5번이나 8번에서 실패한 논문은 어디에도 기록되지 않아 다음 실행이 다시 시도합니다.
10. **리포트.** `reports/<날짜>.md`를 씁니다. 토픽과 상관없이 priority 높은 순 한 목록이고, 논문마다 arXiv 링크와 문서 끝 References를 피드 메타데이터로 프로그램이 붙입니다. 통과한 논문이 없는 날은 파일을 만들지 않습니다.
11. **게시.** `TEAMS_WEBHOOK_URL`이 있으면 Adaptive Card를 올립니다. 제목이 arXiv 링크이고 "Full report" 버튼이 마크다운으로 갑니다. 게시가 실패하면 실행은 빨간색으로 끝나지만 리포트 파일과 상태는 남습니다.
12. **인용 확인.** 워크플로가 이어서 `citations` 명령을 돌립니다. 리포트된 지 30일 지난 논문의 인용 수를 Semantic Scholar에서 받아 `data/citations.jsonl`에 논문당 한 번 기록합니다. 매일 리포트에는 영향이 없고, 판정이 맞았는지 나중에 되짚는 데이터입니다.
13. **커밋.** GitHub Actions가 `data/`와 `reports/`의 변경을 커밋합니다. finder가 실패했어도 그때까지 저장된 상태는 커밋됩니다.

저장 시점만 따로 기억하면 됩니다. 판정 로그는 호출마다, 탈락 논문은 판정 즉시, 통과 논문은 요약이 다 끝난 뒤 게시 전에, 실패한 논문은 기록하지 않음.

## 내 레포에서 돌리기

1. 이 레포를 fork하거나 템플릿으로 복사합니다.
2. **Actions 탭에서 워크플로를 활성화합니다.** fork한 레포는 예약 워크플로가 기본으로 꺼져 있습니다.
3. Settings → Secrets and variables → Actions에 등록합니다.
   - Secret `OPENAI_API_KEY` (필수. 요약에 씁니다)
   - Secret `TYPESAFE_API_KEY` (필수. 루프 1 판정에 씁니다)
   - Secret `TEAMS_WEBHOOK_URL` (선택. 없으면 마크다운 리포트만 남깁니다)
   - Variable `FINDER_JEV_MODEL`, `FINDER_ESCALATE_MODEL`, `FINDER_SUMMARY_MODEL` (선택. 모델 교체용)
   - Secret `SEMANTIC_SCHOLAR_API_KEY` (선택. 저자 h-index와 인용 조회는 키 없이도 되고, 키가 있으면 전용 속도 제한을 받습니다)
   - `REPORT_BASE_URL` (선택. Teams 카드의 "Full report" 링크 기준 URL. Actions 안에서는 레포 주소에서 자동으로 만들어지므로 로컬에서 Teams까지 테스트할 때만 필요합니다)
4. `finder.config.ts`에서 주제, 태그, 관심사 설명을 자기 것으로 바꿉니다.
5. Actions 탭에서 `daily-finder`를 수동 실행(Run workflow)해 확인합니다.

Teams 웹훅은 채널의 Workflows 앱에서 "Send webhook alerts to a channel" 템플릿으로 만듭니다. 예전 Office 365 커넥터 웹훅은 종료되어 쓸 수 없습니다. 웹훅 URL은 그 자체가 비밀 값이므로 코드나 로그에 남기지 마세요.

## 로컬 실행

Node 24 LTS 이상과 pnpm이 필요합니다. 빌드 단계는 없습니다. Node가 `.ts`를 직접 실행하고, TypeScript 7은 타입 검사에만 씁니다.

```bash
pnpm install
pnpm dry-run                              # 수집과 중복 제거만. LLM 호출·파일 쓰기·게시 없음
cp .env.example .env                      # 키 입력
node --env-file=.env src/cli.ts run       # 전체 실행
node src/cli.ts citations --after-days 30 # 리포트된 지 30일 지난 논문의 인용 수 기록 (키 불필요)
pnpm typecheck && pnpm test
```

SSL 검사를 하는 사내 프록시 뒤에서는 `NODE_EXTRA_CA_CERTS`에 사내 CA 인증서 경로를 지정하세요.

종료 코드는 세 가지입니다. Actions 실행 목록에서 빨간색이면 아래 중 하나입니다.

| 코드 | 뜻 |
| --- | --- |
| 0 | 정상. 통과한 논문이 없는 날도 0입니다 |
| 1 | 상태는 저장했지만 Teams 게시가 실패했거나, 판정을 시도한 논문이 전부 실패했습니다 |
| 2 | 사용법 오류이거나 `OPENAI_API_KEY`·`TYPESAFE_API_KEY`가 없습니다 |

`pnpm test`는 Node 내장 테스트 러너로 돕니다. 외부 호출 없이 arXiv 응답 픽스처(`test/fixtures/arxiv-feed.xml`)와 가짜 백엔드로 파이프라인 전체(판정 → 요약 → 저장 → 다음 실행에서 중복 제외), `combine()`의 임계값·가중치 계산, Jev SDK 요청·응답 변환을 확인합니다.

## CI

`.github/workflows/ci.yml`이 PR과 `main` push마다 `pnpm typecheck`와 `pnpm test`를 돌립니다. `daily-finder`가 커밋하는 `data/`와 `reports/` 변경은 CI를 건너뜁니다. 하루 한 번 실행하는 쪽은 `.github/workflows/daily-finder.yml`이고, 평일 11:17 KST(arXiv 발표 직후)에 돕니다.

## 루프 1: 작은 질문 여러 개를 한 번에

논문 한 편당 Jev를 한 번 호출하고, 그 호출에 질문 15개를 함께 실어 보냅니다(fan-out). Jev는 출력 토큰이 무료이고 질문들을 병렬로 답하므로, 질문을 쪼개도 비용과 시간이 거의 늘지 않습니다. 대신 답마다 확률이 따로 붙어서 각각 임계값을 걸고 평가할 수 있습니다.

| 질문 | 타입 | 쓰임 |
| --- | --- | --- |
| `label` | choice: core / adjacent / irrelevant | 리포트 포함 여부와 "경계" 표시 |
| `topic` | choice: 설정의 토픽 + none | 리포트 섹션 |
| `contribution` | choice: method / model-release / dataset-benchmark / survey / application / analysis | 리포트 표기 |
| `significance` | score: 4단계 | 우선순위 |
| `tag:<키>` × 태그 수 | noul (예/아니오 확률) | 확률이 `gate.tagThreshold` 이상이면 태그 부여 |

**판정을 종합하는 단계는 모델이 아니라 코드입니다** (`combine()` in `src/loops/triage.ts`). TypeSafe 문서가 권하는 방식(composite scoring)이기도 합니다. 가중치가 눈에 보이고, 결과가 마음에 안 들면 프롬프트가 아니라 숫자를 고치면 됩니다. Jev는 숫자 비교와 여러 단계를 거치는 추론에 약하다고 문서에 명시되어 있어서, 앞선 판정 결과를 다시 Jev에 넣어 종합시키는 구조는 피했습니다.

- **포함 여부**: `label`의 확률 분포에서 `gate.include` 라벨들의 확률을 더한 값이 `gate.includeThreshold`(0.5) 이상이면 포함합니다. 1등 라벨만 보지 않으므로, core 0.3 · adjacent 0.3 · irrelevant 0.4처럼 갈린 논문도 놓치지 않습니다. 이 값은 `papers.jsonl`의 `includeProbability`로 남아서, 나중에 다른 임계값을 적용했으면 어땠을지 다시 계산할 수 있습니다.
- **경계 표시**: 포함됐지만 `label`의 confidence가 `gate.borderlineBelow`(0.7)보다 낮으면 리포트에 "경계(직접 판단 필요)"로 표시합니다.
- **우선순위**: 세 신호를 `gate.priorityWeights`로 가중 평균합니다. 기대 관련도(core 1, adjacent 0.5를 확률로 가중, 가중치 0.6), 정규화한 significance(0.4), 그리고 저자 실적(0.15)입니다. 저자 실적은 실행 시작 때 Semantic Scholar 배치 API로 논문별 저자 최대 h-index를 받아 `gate.authorHIndexCap`(40)으로 나눈 0~1 값입니다. Jev와 무관한 유일한 외부 신호입니다. **모르는 값은 0이 아니라 제외입니다.** 아직 색인되지 않은 논문(제출 후 며칠은 흔합니다)이나 API 실패 시엔 그 항을 빼고 나머지로 평균하므로 불이익이 없습니다. `author: 0`이면 조회 자체를 하지 않습니다. 결과가 `gate.minPriority`(0.82) 미만이면 라벨이 통과해도 리포트에 싣지 않습니다. 하루치 리포트 분량을 조절하는 손잡이입니다. 0이면 끕니다.

**확신이 낮은 논문을 GPT로 재판정하지 않습니다.** Jev의 "잘 모르겠다"는 확률 분포에서 나온 보정된 신호인데, 재판정은 그것을 GPT가 스스로 적어낸 숫자로 덮어씁니다. 판정자가 둘이 되면 쌓이는 데이터의 기준도 섞입니다. 오판정 비용이 낮은 작업이라 마지막 판단은 읽는 사람에게 맡겼습니다. 두 백엔드를 나란히 비교하는 실험을 할 때만 `gate.escalate: true`로 켜세요. 그러면 경계 논문에 같은 질문을 GPT에도 묻고, 두 호출이 같은 `inputHash`로 `decisions.jsonl`에 남습니다.

질문 문구는 `finder.config.ts`에서 나옵니다. `interest`, 토픽의 `description`, 태그의 서술문이 그대로 질문이 됩니다. Jev는 "의도한 질문이 아니라 적힌 질문에 답한다"고 문서에 나와 있으니, 판정이 이상하면 이 문구부터 고치세요.

## 수집 모드

`finder.config.ts`의 `arxiv.mode`로 고릅니다.

| 모드 | 수집 대상 | 게이트 호출 수 | 약점 |
| --- | --- | --- | --- |
| `category` (기본) | 카테고리의 수집 창 안 신규 논문 전부 | 하루 수백 건 | 판단 모델 비용이 호출 수에 비례 |
| `keyword` | 토픽 구문이 제목·초록에 있는 논문만 | 하루 수십 건 | 구문을 안 쓴 논문과 새 용어를 놓침 |

`category` 모드에서도 각 논문이 키워드 검색에 걸렸을지를 로컬에서 계산해 `matchedTopics`에 남깁니다. 리포트 첫 줄의 "키워드 검색이었다면 놓쳤을 논문 N건"과 논문별 "키워드 미매칭" 표시가 이 값입니다. 이 숫자가 계속 0에 가까우면 `keyword` 모드로 돌아가도 잃는 게 없다는 뜻입니다.

비용 상한은 `gate.maxNewPerRun`입니다. 한 실행에서 판정하는 신규 논문 수를 제한하고, 넘친 논문은 최신순으로 밀려 다음 실행에서 처리됩니다. 첫 실행은 수집 창 전체(기본 4일 치)를 한꺼번에 보므로 따라잡는 데 2~3회가 걸릴 수 있습니다.

## 구조

| 경로 | 역할 |
| --- | --- |
| `finder.config.ts` | 주제·태그·게이트 기준·모델·리포트 언어. 보통 이 파일만 고칩니다 |
| `src/config.ts` | 위 설정의 타입과 각 항목의 뜻(주석). `FINDER_*_MODEL` 환경 변수 덮어쓰기 |
| `src/cli.ts` | 진입점. 키 유무에 따라 백엔드를 고르고 `run`을 호출한 뒤 종료 코드를 정합니다 |
| `src/pipeline.ts` | 한 번의 실행 전체: 수집 → 중복 제외 → 비용 상한 → 루프 1·2(동시 실행) → 저장 → 리포트 → 게시 |
| `src/store.ts` | `data/*.jsonl` 읽기·쓰기. 동시 append를 직렬화하고, 깨진 마지막 줄은 경고만 내고 건너뜁니다 |
| `src/types.ts` | `Paper`, 판정 결과, 저장 레코드의 타입 |
| `src/util.ts` | 동시 실행 제한(`mapLimit`), 타임존 날짜, 해시 |
| `src/sources/arxiv.ts` | arXiv API 수집. 카테고리 전체 페이지네이션 또는 주제별 키워드 쿼리, 요청 간 3초 간격 |
| `src/sources/semanticscholar.ts` | Semantic Scholar 배치 조회(500건씩). 저자 h-index와 인용 수 |
| `src/citations.ts` | `citations` 명령. 리포트된 지 N일 지난 논문의 인용 수를 한 번씩 기록 |
| `src/llm/backend.ts` | `DecisionBackend`(choice·noul·score 질문에 답하는 `ask()`)와 `TextBackend`(글쓰기) 인터페이스 |
| `src/llm/jev.ts` | `DecisionBackend`의 Jev 구현 (`@typesafe-ai/sdk`) |
| `src/llm/openai.ts` | 같은 질문 형식을 structured output으로 흉내 내는 OpenAI 구현, 그리고 글쓰기 구현 |
| `src/loops/triage.ts` | 루프 1: 질문 구성, 코드에서의 종합(`combine`), 판단 로그, 선택적 재판정 |
| `src/paper.ts` | 모델에 보여줄 논문 표현. 판단에 필요한 제목·카테고리·초록만 넘깁니다 |
| `src/loops/summarize.ts` | 루프 2: 요약. 제목과 초록에 있는 내용만 사용 |
| `src/report.ts` | 마크다운 리포트. **레퍼런스는 피드 메타데이터로만 만들고 LLM이 쓰지 않습니다** |
| `src/sinks/teams.ts` | Adaptive Card 게시. 페이로드 크기 제한에 맞춰 항목 수를 줄입니다 |
| `data/papers.jsonl` | 지금까지 본 논문과 판정 결과. 중복 방지와 트렌드 집계의 원천. 탈락한 논문은 id·라벨·confidence·포함 확률만 남깁니다 |
| `data/decisions.jsonl` | 모든 판단 호출의 로그(백엔드, 모델, 입력 해시, 질문별 답과 확실성, 입력 토큰) |
| `data/citations.jsonl` | 리포트 논문의 인용 수 확인 기록(id, 실행일, 확인 시각, 경과 일수, 인용 수, 영향력 인용 수) |
| `reports/<날짜>.md` | 그날의 마크다운 리포트. 통과한 논문이 없는 날은 파일을 만들지 않습니다 |
| `test/` | 파이프라인·판정·arXiv 파서 테스트와 피드 픽스처 |

## 리포트 형식

논문은 토픽과 상관없이 우선순위(priority) 높은 순으로 하나의 목록에 실립니다. 토픽은 논문마다 메타데이터 줄에 표시되고, 게이트가 `none`을 고르면 "기타"입니다. 각 논문은 메타데이터 한 줄, 한 줄 요약, 문제·방법·결과·의의 한 문단으로 구성되고, 레퍼런스 번호는 문서 끝 References 목록을 가리킵니다.

```markdown
# 리서치 트렌드 리포트 · 2026-09-21

수집 412건 · 신규 388건 · 리포트 대상 7건 · 그중 키워드 검색이었다면 놓쳤을 논문 2건

### <논문 제목> [1]

priority 0.87 · World Models · core (0.91) · method · h-index 22 · A. Kim, B. Lee, C. Park et al. · 2026-09-19 · [arXiv:2609.01234](…) · world-model, video-generation

**한 줄 요약**

문제. 방법. 결과. 왜 중요한가.

## References

1. A. Kim, B. Lee, C. Park et al. "<논문 제목>." arXiv:2609.01234 (2026-09-19). https://arxiv.org/abs/2609.01234
```

리포트 언어는 `report.language`로 정하고, 현재 제목·통계 줄 등 고정 문구는 한국어와 영어(그 외 값)만 있습니다. 다른 언어를 쓰려면 `src/report.ts`의 `LABELS`에 항목을 추가하세요. 요약 본문은 모델이 설정한 언어로 씁니다.

## 동작 원칙

- **같은 논문은 한 번만 처리합니다.** 키는 버전을 뗀 arXiv id입니다. 수집 창(`lookbackDays`)이 겹쳐도 안전하므로, 실행이 하루 빠져도 다음 실행이 메웁니다.
- **실패한 논문은 본 것으로 기록하지 않습니다.** 다음 실행에서 다시 시도합니다.
- **탈락한 논문은 판정 즉시 기록합니다.** 실행이 중간에 죽어도 이미 판정한 수백 건을 다시 판정하지 않습니다. 리포트 대상 논문은 요약이 모두 끝난 뒤 한꺼번에 기록합니다. 리포트에 실리지 못한 논문이 "보고됨"으로 남는 일을 막기 위해서입니다.
- **수집이 중간에 끊기면 조용히 넘어가지 않고 실행을 실패시킵니다.** arXiv API는 결과 중간에 빈 페이지를 돌려줄 때가 있습니다. 3회 재시도 후에도 비어 있으면 오류로 끝내고, 다음 실행이 같은 창을 다시 받습니다.
- **상태를 먼저 저장하고 나서 게시합니다.** Teams 게시가 실패해도 같은 논문이 내일 다시 올라가지 않습니다. 이 경우 실행은 실패(빨간색)로 표시되고 리포트 파일은 남습니다.
- **통과한 논문이 없는 날은 게시하지 않습니다.**

## 백엔드 비교 실험

`data/decisions.jsonl`에는 호출 한 번이 한 줄로 남습니다. `answers`는 질문 이름마다 `[값, 확실성]`이고, 확실성은 choice·score면 confidence, noul이면 "예"일 확률입니다.

```json
{"loop":"triage","subjectId":"2609.01234","backend":"jev","model":"jev-1.13.0","inputHash":"…",
 "answers":{"label":["core",0.91],"topic":["world-model",0.84],"significance":[1.6,0.55],"tag:vla":[false,0.08]},
 "inputTokens":812}
```

두 백엔드의 숫자는 같은 뜻이 아닙니다. Jev의 confidence는 모델의 확률 분포에서 계산된 값이고, OpenAI 쪽은 모델이 스스로 적어낸 숫자입니다. 같은 임계값으로 둘을 다루기 전에 직접 재보세요. 논문 100~200건에 정답 라벨을 달고 아래처럼 조인하면 백엔드별 정확도와 confidence 구간별 실제 정답률이 나옵니다. `gate.escalate`를 켜고 돌린 기간에는 경계 논문마다 같은 `inputHash`로 두 백엔드의 답이 나란히 남으므로 바로 비교할 수 있습니다.

```sql
-- DuckDB 예시: 백엔드별, label과 그 confidence 구간별 건수
SELECT backend, model,
       answers->>'$.label[0]' AS label,
       round(CAST(answers->>'$.label[1]' AS DOUBLE), 1) AS confidence_bucket,
       count(*) AS n
FROM read_json('data/decisions.jsonl', format='newline_delimited',
               columns={loop:'VARCHAR', backend:'VARCHAR', model:'VARCHAR', answers:'JSON'})
WHERE loop = 'triage'
GROUP BY ALL ORDER BY ALL;
```

## 인용 확인

리포트에 실린 논문이 나중에 실제로 인용됐는지 돌아보는 기능입니다. 매일 리포트에는 영향이 없고, 판정 기준을 검증하는 데이터만 쌓습니다.

```bash
node src/cli.ts citations --after-days 30   # 기본 30일
```

`data/papers.jsonl`에서 `reported: true`이고 실행일로부터 30일이 지난 논문을 골라 Semantic Scholar에 배치로 묻고, 논문당 한 줄을 `data/citations.jsonl`에 남깁니다. 한 번 기록한 논문은 다시 묻지 않습니다. 아직 색인되지 않은 논문은 건너뛰고 다음 실행에서 다시 시도합니다. `daily-finder` 워크플로가 매일 finder 다음 단계로 이 명령을 돌리며, 실패해도 실행 결과나 커밋에는 영향을 주지 않습니다.

한 달쯤 쌓이면 판정과 결과를 이어 볼 수 있습니다. 예를 들어 significance나 h-index가 인용을 예측했는지 아래처럼 봅니다.

```sql
SELECT p.label, round(p.significance) AS significance, count(*) AS n,
       avg(c.citationCount) AS avg_citations
FROM read_json('data/papers.jsonl', format='newline_delimited') p
JOIN read_json('data/citations.jsonl', format='newline_delimited') c USING (id)
GROUP BY ALL ORDER BY ALL;
```

## 알려진 제약

- `category` 모드에서는 `data/` 파일이 하루 수백 줄씩 늡니다. 대략 하루 200KB, 1년에 수십 MB 수준입니다. 판단 로그를 끄는 설정은 아직 없습니다. 백엔드 비교 실험이 끝나 로그가 필요 없어지면 `src/pipeline.ts`의 `appendDecisions` 호출을 빼거나 `decisions.jsonl`의 오래된 줄을 잘라내세요.
- TypeScript 7.0에는 아직 안정된 프로그래밍 API가 없어 typescript-eslint를 쓸 수 없습니다. 그래서 린터를 넣지 않았습니다.
- Teams 카드의 "Full report" 링크는 게시 직후 몇 초간 404일 수 있습니다. 리포트 커밋이 게시 다음 단계이기 때문입니다.
- 퍼블릭 레포는 60일간 활동이 없으면 GitHub가 예약 워크플로를 끕니다. 알림 메일이 오면 Actions 탭에서 다시 켜세요.
- Semantic Scholar는 제출 후 며칠간 색인되지 않은 논문이 많습니다(도입 당일 기준 리포트 25건 중 10건만 색인). 그래서 저자 h-index 항은 일부 논문에만 붙고, 붙은 논문과 안 붙은 논문의 priority는 완전히 같은 잣대가 아닙니다. 색인된 논문 중 h-index가 낮으면 priority가 내려갈 수 있습니다. 편향이 거슬리면 `priorityWeights.author`를 낮추거나 0으로 두세요.
- 인용 수는 제출 직후엔 0이라 판정에 쓰지 않고, 30일 뒤 확인용으로만 기록합니다.
- 소스는 현재 arXiv 하나입니다. 블로그 RSS와 GitHub 릴리스는 `src/sources/`에 같은 형태(`Paper[]` 반환)로 추가하면 됩니다.

## License

MIT
