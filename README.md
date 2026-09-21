# trend-finder

관심 연구 주제의 신규 논문을 매일 찾아서, 관련도 판정을 거친 것만 요약해 리포트로 남기는 작은 파이프라인입니다. 기본 설정은 world model, physical AI, NVIDIA Cosmos입니다.

```
arXiv 수집 → 이미 본 논문 제외 → 관련도 게이트(LLM) → 요약(LLM) → reports/<날짜>.md + Teams 카드
```

서버와 DB가 없습니다. GitHub Actions가 하루 한 번 실행하고, 상태는 `data/*.jsonl`로 레포에 커밋됩니다.

## 내 레포에서 돌리기

1. 이 레포를 fork하거나 템플릿으로 복사합니다.
2. **Actions 탭에서 워크플로를 활성화합니다.** fork한 레포는 예약 워크플로가 기본으로 꺼져 있습니다.
3. Settings → Secrets and variables → Actions에 등록합니다.
   - Secret `OPENAI_API_KEY` (필수)
   - Secret `TEAMS_WEBHOOK_URL` (선택. 없으면 마크다운 리포트만 남깁니다)
   - Variable `FINDER_DECIDE_MODEL`, `FINDER_ESCALATE_MODEL`, `FINDER_SUMMARY_MODEL` (선택. 모델 교체용)
4. `finder.config.ts`에서 주제, 태그, 관심사 설명을 자기 것으로 바꿉니다.
5. Actions 탭에서 `daily-finder`를 수동 실행(Run workflow)해 확인합니다.

Teams 웹훅은 채널의 Workflows 앱에서 "Send webhook alerts to a channel" 템플릿으로 만듭니다. 예전 Office 365 커넥터 웹훅은 종료되어 쓸 수 없습니다. 웹훅 URL은 그 자체가 비밀 값이므로 코드나 로그에 남기지 마세요.

## 로컬 실행

Node 22.18 이상과 pnpm이 필요합니다. 빌드 단계는 없습니다. Node가 `.ts`를 직접 실행하고, TypeScript 7은 타입 검사에만 씁니다.

```bash
pnpm install
pnpm dry-run                              # 수집과 중복 제거만. LLM 호출·파일 쓰기·게시 없음
cp .env.example .env                      # 키 입력
node --env-file=.env src/cli.ts run       # 전체 실행
pnpm typecheck && pnpm test
```

SSL 검사를 하는 사내 프록시 뒤에서는 `NODE_EXTRA_CA_CERTS`에 사내 CA 인증서 경로를 지정하세요.

## 구조

| 경로 | 역할 |
| --- | --- |
| `finder.config.ts` | 주제·태그·게이트 기준·모델·리포트 언어. 보통 이 파일만 고칩니다 |
| `src/sources/arxiv.ts` | arXiv API 수집. 주제별 1회 요청, 요청 간 3초 간격 |
| `src/llm/backend.ts` | `DecisionBackend`(판단)와 `TextBackend`(글쓰기) 인터페이스 |
| `src/llm/openai.ts` | 두 인터페이스의 OpenAI 구현 (structured output) |
| `src/loops/relevance.ts` | 루프 1: 관련도 게이트. confidence가 낮으면 상위 모델로 재판정 |
| `src/loops/summarize.ts` | 루프 2: 요약. 제목과 초록에 있는 내용만 사용 |
| `src/report.ts` | 마크다운 리포트. **레퍼런스는 피드 메타데이터로만 만들고 LLM이 쓰지 않습니다** |
| `src/sinks/teams.ts` | Adaptive Card 게시. 페이로드 크기 제한에 맞춰 항목 수를 줄입니다 |
| `data/papers.jsonl` | 지금까지 본 논문과 판정 결과. 중복 방지와 트렌드 집계의 원천 |
| `data/decisions.jsonl` | 모든 판단 로그(백엔드, 모델, 입력 해시, 값, confidence) |

## 동작 원칙

- **같은 논문은 한 번만 처리합니다.** 키는 버전을 뗀 arXiv id입니다. 수집 창(`lookbackDays`)이 겹쳐도 안전하므로, 실행이 하루 빠져도 다음 실행이 메웁니다.
- **실패한 논문은 본 것으로 기록하지 않습니다.** 다음 실행에서 다시 시도합니다.
- **상태를 먼저 저장하고 나서 게시합니다.** Teams 게시가 실패해도 같은 논문이 내일 다시 올라가지 않습니다. 이 경우 실행은 실패(빨간색)로 표시되고 리포트 파일은 남습니다.
- **통과한 논문이 없는 날은 게시하지 않습니다.**

## 백엔드 비교 실험

`DecisionBackend`는 "비정형 상태를 넣으면 타입이 정해진 값과 confidence가 나온다"는 계약 하나입니다. Jev 같은 판단 전용 모델을 붙이려면 이 인터페이스를 구현해 `src/cli.ts`에서 갈아 끼우면 됩니다.

OpenAI 구현의 confidence는 모델이 스스로 적어낸 숫자이며 보정된 확률이 아닙니다. 믿을 수 있는지는 직접 재야 합니다. 논문 100~200건에 정답 라벨을 달고 `data/decisions.jsonl`과 조인하면 백엔드별 정확도와 confidence 구간별 실제 정답률을 볼 수 있습니다.

```sql
-- DuckDB 예시: confidence 구간별 건수
SELECT backend, model, round(confidence, 1) AS bucket, count(*)
FROM read_json_auto('data/decisions.jsonl')
WHERE loop = 'relevance'
GROUP BY ALL ORDER BY ALL;
```

## 알려진 제약

- TypeScript 7.0에는 아직 안정된 프로그래밍 API가 없어 typescript-eslint를 쓸 수 없습니다. 그래서 린터를 넣지 않았습니다.
- Teams 카드의 "Full report" 링크는 게시 직후 몇 초간 404일 수 있습니다. 리포트 커밋이 게시 다음 단계이기 때문입니다.
- 퍼블릭 레포는 60일간 활동이 없으면 GitHub가 예약 워크플로를 끕니다. 알림 메일이 오면 Actions 탭에서 다시 켜세요.
- 소스는 현재 arXiv 하나입니다. 블로그 RSS와 GitHub 릴리스는 `src/sources/`에 같은 형태(`Paper[]` 반환)로 추가하면 됩니다.

## License

MIT
