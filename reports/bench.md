# Loop 1 benchmark

249 papers, 249 with a gold label (data/gold.jsonl). Jev's confidences come from its probability distribution; generative models write theirs down themselves, so only labels are compared. Cost is estimated from models.pricing in finder.config.ts.

| model | n (gold) | label acc | include acc | include precision | include recall | in tok | out tok | latency | est. $/1000 papers |
|---|---|---|---|---|---|---|---|---|---|
| jev:jev-1.13.0 | 249 | 91% | 94% | 90% | 100% | 1479 | 0 | - | - |
| openai:gpt-5 | 249 | 45% | 69% | 63% | 100% | 1536 | 0 | - | - |

## jev:jev-1.13.0: label confusion (rows gold, columns jev:jev-1.13.0)

| | core | adjacent | irrelevant |
|---|---|---|---|
| core | 33 | 7 | 0 |
| adjacent | 0 | 93 | 0 |
| irrelevant | 0 | 15 | 101 |

## openai:gpt-5: label confusion (rows gold, columns openai:gpt-5)

| | core | adjacent | irrelevant |
|---|---|---|---|
| core | 40 | 0 | 0 |
| adjacent | 60 | 33 | 0 |
| irrelevant | 16 | 62 | 38 |

## jev:jev-1.13.0 vs openai:gpt-5: label disagreements (149)

| id | gold | Jev | other | title |
|---|---|---|---|---|
| [2609.22085](https://arxiv.org/abs/2609.22085) | core | adjacent (0.25) | core (0.9) | SeeQ: Training Generalist Value Functions for Long-Horizon Robotic Manipulation |
| [2609.22075](https://arxiv.org/abs/2609.22075) | adjacent | adjacent (0.7) | core (0.82) | LIMBO: Learning and Internalizing Model-Free Barrier Objectives for Agile and Safe Whole-Body Control |
| [2609.22083](https://arxiv.org/abs/2609.22083) | irrelevant | irrelevant (0.6) | adjacent (0.7) |  |
| [2609.22060](https://arxiv.org/abs/2609.22060) | irrelevant | irrelevant (0.73) | adjacent (0.78) |  |
| [2609.21982](https://arxiv.org/abs/2609.21982) | adjacent | adjacent (0.48) | core (0.86) | CARF: Contrastive Attraction-Repulsion of Failure-Guided Flow Matching |
| [2609.21942](https://arxiv.org/abs/2609.21942) | adjacent | adjacent (0.68) | core (0.76) | When Should a Failing Robot Ask? Initiating Corrective Human-Robot Dialogue from Audited Sensor Evidence |
| [2609.21938](https://arxiv.org/abs/2609.21938) | irrelevant | irrelevant (0.35) | adjacent (0.72) |  |
| [2609.21929](https://arxiv.org/abs/2609.21929) | adjacent | adjacent (0.4) | core (0.82) | MAAP: Multi-Agent Active Perception for Collaborative Manipulation |
| [2609.21906](https://arxiv.org/abs/2609.21906) | irrelevant | irrelevant (0.52) | adjacent (0.62) |  |
| [2609.21883](https://arxiv.org/abs/2609.21883) | irrelevant | adjacent (0.31) | core (0.78) | VIRGA: Virtual-Agent-Intermediated Riemannian Geometry for Active-Sensing Air-Ground Coordination |
| [2609.21872](https://arxiv.org/abs/2609.21872) | irrelevant | irrelevant (0.83) | adjacent (0.63) |  |
| [2609.21838](https://arxiv.org/abs/2609.21838) | adjacent | adjacent (0.65) | core (0.68) | PopNavShift: Stress-Testing Social Navigation under Behavioral Population Shift |
| [2609.21804](https://arxiv.org/abs/2609.21804) | irrelevant | irrelevant (0.59) | adjacent (0.69) |  |
| [2609.21803](https://arxiv.org/abs/2609.21803) | irrelevant | irrelevant (0.7) | core (0.77) |  |
| [2609.21788](https://arxiv.org/abs/2609.21788) | core | adjacent (0.32) | core (0.9) | From Pretraining to Proficiency: Real-World Subtask RL for Long-Horizon Manipulation with Minimal Human Intervention |
| [2609.21792](https://arxiv.org/abs/2609.21792) | adjacent | adjacent (0.68) | core (0.71) | AcousticDiffusion: Semantically Conditioned Audio-Guided Diffusion Policy for Search-and-Rescue Assistance |
| [2609.21780](https://arxiv.org/abs/2609.21780) | irrelevant | irrelevant (0.76) | adjacent (0.73) |  |
| [2609.21777](https://arxiv.org/abs/2609.21777) | irrelevant | irrelevant (0.63) | adjacent (0.77) |  |
| [2609.21770](https://arxiv.org/abs/2609.21770) | irrelevant | irrelevant (0.56) | adjacent (0.69) |  |
| [2609.21767](https://arxiv.org/abs/2609.21767) | adjacent | adjacent (0.29) | core (0.86) | Scaling Vision-Language Reward Learning for Robot Manipulation in Parallel Simulation |
| [2609.21761](https://arxiv.org/abs/2609.21761) | adjacent | adjacent (0.71) | core (0.76) | CRISP: Contact-Rich Robotic Simulation Platform with Extensive Geometries and Contact Solvers |
| [2609.21754](https://arxiv.org/abs/2609.21754) | irrelevant | irrelevant (0.7) | adjacent (0.72) |  |
| [2609.21748](https://arxiv.org/abs/2609.21748) | adjacent | adjacent (0.61) | core (0.8) | World Modeling in Transformers |
| [2609.21735](https://arxiv.org/abs/2609.21735) | irrelevant | irrelevant (0.67) | adjacent (0.73) |  |
| [2609.21734](https://arxiv.org/abs/2609.21734) | irrelevant | irrelevant (0.65) | adjacent (0.7) |  |
| [2609.21726](https://arxiv.org/abs/2609.21726) | adjacent | adjacent (0.3) | core (0.85) | ZeroTouch: Tactile-Supervised Visual Contact Estimation for Contact-Rich Manipulation |
| [2609.21718](https://arxiv.org/abs/2609.21718) | irrelevant | irrelevant (0.74) | adjacent (0.7) |  |
| [2609.21716](https://arxiv.org/abs/2609.21716) | adjacent | adjacent (0.75) | core (0.78) | AgenticSwarm: Semantic Perception and Adaptive Task Allocation for Heterogeneous Multi-UAV Missions |
| [2609.21707](https://arxiv.org/abs/2609.21707) | adjacent | adjacent (0.6) | core (0.8) | NeuRIO: A Streaming Neural Estimator for Zero-Shot Sim-to-Real Multi-Robot Relative Inertial Odometry |
| [2609.21690](https://arxiv.org/abs/2609.21690) | adjacent | adjacent (0.74) | core (0.86) | RAYA: Learning Where and When to Intervene for Robot Recovery |
| [2609.21621](https://arxiv.org/abs/2609.21621) | adjacent | adjacent (0.38) | core (0.9) | Towards Fine-Grained Object Manipulation: SAM3-Guided Visuomotor Policy with Persistent Memory Learning and Focused Visual Conditioning |
| [2609.21617](https://arxiv.org/abs/2609.21617) | adjacent | adjacent (0.55) | core (0.78) | CounterPlay: Counterfactual Post-Training for Self-Play Driving Policies |
| [2609.21609](https://arxiv.org/abs/2609.21609) | adjacent | adjacent (0.77) | core (0.87) | Potential-Field Action Representation for Reinforcement Learning in Contact-Rich Manipulation |
| [2609.21597](https://arxiv.org/abs/2609.21597) | irrelevant | irrelevant (0.64) | adjacent (0.68) |  |
| [2609.21590](https://arxiv.org/abs/2609.21590) | irrelevant | irrelevant (0.59) | core (0.7) |  |
| [2609.21580](https://arxiv.org/abs/2609.21580) | irrelevant | irrelevant (0.81) | adjacent (0.69) |  |
| [2609.21572](https://arxiv.org/abs/2609.21572) | adjacent | adjacent (0.32) | core (0.86) | SABER: Learning Attention-based Semantic Affordance for Legged Locomotion |
| [2609.21516](https://arxiv.org/abs/2609.21516) | irrelevant | irrelevant (0.39) | adjacent (0.72) |  |
| [2609.21511](https://arxiv.org/abs/2609.21511) | adjacent | adjacent (0.55) | core (0.88) | 2nd Place Solution to the HANDS 2026 Workshop Challenge-Dexterous Grasp Motion Track: Single-Shot Trajectory Warping for Grasp Motion Generation |
| [2609.21504](https://arxiv.org/abs/2609.21504) | adjacent | adjacent (0.45) | core (0.89) | DPed-VLN: A Benchmark for Socially Compliant Vision-and-Language Navigation in Dynamic Pedestrian Environments |
| [2609.21502](https://arxiv.org/abs/2609.21502) | core | adjacent (0.73) | core (0.86) | Adaptive World Memory 3D Foundation Model for Scalable 3D Mapping, Localization, and Rendering |
| [2609.21497](https://arxiv.org/abs/2609.21497) | adjacent | adjacent (0.73) | core (0.91) | FORTE: Task-Adaptive Force Capability Optimization for Mobile Manipulators |
| [2609.21486](https://arxiv.org/abs/2609.21486) | adjacent | adjacent (0.6) | core (0.78) | Driving on Registers, Reasoning on Risk: Risk-Aware Occupancy for Register-Based End-to-End Autonomous Driving |
| [2609.21470](https://arxiv.org/abs/2609.21470) | adjacent | adjacent (0.41) | core (0.9) | Risk-Aware Occupancy for Safety-Oriented End-to-End Autonomous Driving |
| [2609.21467](https://arxiv.org/abs/2609.21467) | adjacent | adjacent (0.32) | core (0.86) | Learning Distance-Conditioned Object Transport for Humanoid Loco-Manipulation from a Single Motion Clip |
| [2609.21447](https://arxiv.org/abs/2609.21447) | adjacent | adjacent (0.34) | core (0.86) | FootQuery: Future-Touchdown-Guided Retrieval from Depth History for Perceptive Humanoid Locomotion |
| [2609.21437](https://arxiv.org/abs/2609.21437) | irrelevant | irrelevant (0.64) | adjacent (0.65) |  |
| [2609.21416](https://arxiv.org/abs/2609.21416) | irrelevant | irrelevant (0.85) | adjacent (0.64) |  |
| [2609.21404](https://arxiv.org/abs/2609.21404) | adjacent | adjacent (0.63) | core (0.8) | Stabilizing Trajectory Outputs in End-to-End Autonomous Driving via SC-IMM Based Teacher Signals |
| [2609.21402](https://arxiv.org/abs/2609.21402) | irrelevant | irrelevant (0.57) | adjacent (0.55) |  |
| [2609.21400](https://arxiv.org/abs/2609.21400) | adjacent | adjacent (0.79) | core (0.6) | A Scene Language Model for Open-Vocabulary Scene Mapping |
| [2609.21379](https://arxiv.org/abs/2609.21379) | core | adjacent (0.38) | core (0.9) | JEPA Guided Diffusion: Predictive Vision-Language Conditioning for Generative Traffic Forecasting |
| [2609.21377](https://arxiv.org/abs/2609.21377) | adjacent | adjacent (0.62) | core (0.86) | AVT-Fabric: Active Visuo-Tactile Perception via Adaptive Evidence Selection for Efficient Robotic Fabric Comparison |
| [2609.21369](https://arxiv.org/abs/2609.21369) | adjacent | adjacent (0.82) | core (0.85) | ProTracer: Proprioception-Guided Failure Diagnosis in Robot Manipulation |
| [2609.21365](https://arxiv.org/abs/2609.21365) | adjacent | adjacent (0.65) | core (0.9) | MicroHookACT: Monocular Microscopic Vision Guided Visuomotor Policy for Flexible Microelectrode Hooking |
| [2609.21347](https://arxiv.org/abs/2609.21347) | irrelevant | irrelevant (0.59) | adjacent (0.78) |  |
| [2609.21323](https://arxiv.org/abs/2609.21323) | irrelevant | irrelevant (0.41) | adjacent (0.63) |  |
| [2609.21316](https://arxiv.org/abs/2609.21316) | adjacent | adjacent (0.62) | core (0.82) | NaViRrator: Robot Navigation from Human-Readable Maps through a Learned Visual Route |
| [2609.21307](https://arxiv.org/abs/2609.21307) | adjacent | adjacent (0.89) | core (0.84) | Stability-aware Residual Reinforcement Learning Framework for Robotic Manipulator Disturbance Compensation |
| [2609.21226](https://arxiv.org/abs/2609.21226) | irrelevant | irrelevant (0.25) | adjacent (0.7) | AirSplan: Risk-Aware Motion Planning for Quadrotors in Cluttered 3D Gaussian Splats |
| [2609.21221](https://arxiv.org/abs/2609.21221) | irrelevant | adjacent (0.86) | core (0.68) | A Fully Differentiable Neuro-Soft-Symbolic Framework for Perceptual Task Planning |
| [2609.21219](https://arxiv.org/abs/2609.21219) | irrelevant | irrelevant (0.28) | adjacent (0.7) |  |
| [2609.21212](https://arxiv.org/abs/2609.21212) | adjacent | adjacent (0.46) | core (0.86) | Visual Navigation Transformer with Pose Attention |
| [2609.21207](https://arxiv.org/abs/2609.21207) | irrelevant | adjacent (0.29) | irrelevant (0.82) | Hand-Aware Transition Modeling for Bimanual Procedural Anomaly Detection |
| [2609.21186](https://arxiv.org/abs/2609.21186) | irrelevant | irrelevant (0.74) | adjacent (0.62) |  |
| [2609.21176](https://arxiv.org/abs/2609.21176) | irrelevant | irrelevant (0.65) | adjacent (0.71) |  |
| [2609.21167](https://arxiv.org/abs/2609.21167) | irrelevant | irrelevant (0.69) | adjacent (0.62) |  |
| [2609.21138](https://arxiv.org/abs/2609.21138) | irrelevant | adjacent (0.69) | core (0.7) | Diverse and Adaptable Arm Coordination for Octopus-Crawling via Diffusion-Based Uncertainty-Aware Optimization |
| [2609.21130](https://arxiv.org/abs/2609.21130) | irrelevant | adjacent (0.62) | core (0.78) | SAGE: Safety-Aligned Gradient Enforcement for Human--Robot Collaboration |
| [2609.21123](https://arxiv.org/abs/2609.21123) | irrelevant | irrelevant (0.88) | adjacent (0.62) |  |
| [2609.21114](https://arxiv.org/abs/2609.21114) | irrelevant | irrelevant (0.58) | adjacent (0.78) |  |
| [2609.21109](https://arxiv.org/abs/2609.21109) | irrelevant | irrelevant (0.69) | adjacent (0.71) |  |
| [2609.21108](https://arxiv.org/abs/2609.21108) | irrelevant | irrelevant (0.74) | adjacent (0.55) |  |
| [2609.21107](https://arxiv.org/abs/2609.21107) | adjacent | adjacent (0.3) | core (0.9) | Learning Scene-Aware Humanoid Locomotion through 3D Clutter from Immersive Human Demonstrations |
| [2609.21100](https://arxiv.org/abs/2609.21100) | irrelevant | adjacent (0.6) | core (0.79) | Dynamics-Induced Commitment in Learning-Based Robotic Penalty Kicks |
| [2609.21099](https://arxiv.org/abs/2609.21099) | irrelevant | irrelevant (0.89) | adjacent (0.66) |  |
| [2609.21082](https://arxiv.org/abs/2609.21082) | irrelevant | irrelevant (0.51) | adjacent (0.75) |  |
| [2609.21054](https://arxiv.org/abs/2609.21054) | irrelevant | adjacent (0.37) | irrelevant (0.93) | Physically Based Rendering in the Latent Space |
| [2609.21053](https://arxiv.org/abs/2609.21053) | irrelevant | irrelevant (0.56) | adjacent (0.7) |  |
| [2609.21046](https://arxiv.org/abs/2609.21046) | irrelevant | irrelevant (0.86) | adjacent (0.7) |  |
| [2609.21015](https://arxiv.org/abs/2609.21015) | irrelevant | irrelevant (0.87) | adjacent (0.74) |  |
| [2609.21005](https://arxiv.org/abs/2609.21005) | irrelevant | irrelevant (0.63) | adjacent (0.66) |  |
| [2609.21000](https://arxiv.org/abs/2609.21000) | irrelevant | irrelevant (0.81) | core (0.74) |  |
| [2609.20983](https://arxiv.org/abs/2609.20983) | adjacent | adjacent (0.78) | core (0.78) | PIVOT: Physically Informed Vision-Language Off-Road Traversability for Field Robot Navigation |
| [2609.20970](https://arxiv.org/abs/2609.20970) | adjacent | adjacent (0.69) | core (0.79) | Shake to Learn: Dynamic Interrogation of Hidden Object Physics for Robotic Manipulation with Physical Reservoir Computing |
| [2609.20954](https://arxiv.org/abs/2609.20954) | irrelevant | irrelevant (0.64) | adjacent (0.55) |  |
| [2609.20822](https://arxiv.org/abs/2609.20822) | adjacent | adjacent (0.52) | core (0.92) | Coding Agents with an Obstacle-Aware Harness for Safe Robot Manipulation |
| [2609.20820](https://arxiv.org/abs/2609.20820) | adjacent | adjacent (0.25) | core (0.86) | Workspace Models: Lightweight Robotic Memory via Saliency-Driven Supervision |
| [2609.20819](https://arxiv.org/abs/2609.20819) | core | adjacent (0.63) | core (0.82) | Can 4D Foundation Models Remember? |
| [2609.20818](https://arxiv.org/abs/2609.20818) | irrelevant | adjacent (0.31) | irrelevant (0.9) | SplashSplat: Reconstructing Splashing Liquids from Real-World Multi-View Videos |
| [2609.20817](https://arxiv.org/abs/2609.20817) | irrelevant | adjacent (0.46) | core (0.7) | FAMOS: Feed-Forward 3D Articulation Modeling from Sparse Observations |
| [2609.20794](https://arxiv.org/abs/2609.20794) | irrelevant | irrelevant (0.46) | adjacent (0.6) |  |
| [2609.20791](https://arxiv.org/abs/2609.20791) | adjacent | adjacent (0.54) | core (0.79) | StageGuard: Learning Stage Transitions for Long-Horizon Robot Tasks via Agentic Distillation |
| [2609.20731](https://arxiv.org/abs/2609.20731) | irrelevant | irrelevant (0.54) | adjacent (0.62) |  |
| [2609.20694](https://arxiv.org/abs/2609.20694) | irrelevant | irrelevant (0.54) | adjacent (0.7) |  |
| [2609.20691](https://arxiv.org/abs/2609.20691) | irrelevant | irrelevant (0.88) | adjacent (0.7) |  |
| [2609.20680](https://arxiv.org/abs/2609.20680) | core | adjacent (0.46) | core (0.78) | Towards Scaling Marine Perception with Synthetic Data |
| [2609.20673](https://arxiv.org/abs/2609.20673) | adjacent | adjacent (0.8) | core (0.78) | FunArt: Decoding Functional Structure and Articulation from Generative 3D Latents |
| [2609.20629](https://arxiv.org/abs/2609.20629) | adjacent | adjacent (0.7) | core (0.83) | RTK-Vision PPO for Autonomous Micro UAV Recovery on an Airborne Carrier |
| [2609.20624](https://arxiv.org/abs/2609.20624) | adjacent | adjacent (0.62) | core (0.8) | SmellDiffusion: Diffusion-Based Quadruped Navigation with Olfactory Scene Graphs |
| [2609.20615](https://arxiv.org/abs/2609.20615) | irrelevant | adjacent (0.71) | core (0.8) | INSPECT: Learning Robot View Selection from Assistant Use |
| [2609.20598](https://arxiv.org/abs/2609.20598) | irrelevant | irrelevant (0.82) | adjacent (0.69) |  |
| [2609.20589](https://arxiv.org/abs/2609.20589) | irrelevant | irrelevant (0.85) | adjacent (0.67) |  |
| [2609.20586](https://arxiv.org/abs/2609.20586) | adjacent | adjacent (0.67) | core (0.64) | CoRef-GS: Cooperative Referring Gaussian Splatting for Multi-Agent Scene Understanding |
| [2609.20570](https://arxiv.org/abs/2609.20570) | irrelevant | irrelevant (0.76) | core (0.63) |  |
| [2609.20566](https://arxiv.org/abs/2609.20566) | adjacent | adjacent (0.52) | core (0.86) | OmniMimic: Dynamics-completed Motion Augmentation for Multi-style Omnidirectional Quadruped Locomotion |
| [2609.20558](https://arxiv.org/abs/2609.20558) | adjacent | adjacent (0.63) | core (0.9) | Learning Slope-Adaptive Whole-Body Locomotion for Humanoid Robots in Roofing Construction |
| [2609.20540](https://arxiv.org/abs/2609.20540) | irrelevant | irrelevant (0.91) | adjacent (0.74) |  |
| [2609.20524](https://arxiv.org/abs/2609.20524) | irrelevant | adjacent (0.55) | irrelevant (0.86) | S4R: Scaling for Rigid-Body Interpenetration Resolution |
| [2609.20499](https://arxiv.org/abs/2609.20499) | irrelevant | irrelevant (0.35) | adjacent (0.64) |  |
| [2609.20443](https://arxiv.org/abs/2609.20443) | adjacent | adjacent (0.57) | core (0.9) | Spatial-Semantic Uncertainty in VLM-Based Target Search: Balancing Exploration and Identification |
| [2609.20435](https://arxiv.org/abs/2609.20435) | irrelevant | irrelevant (0.73) | adjacent (0.66) |  |
| [2609.20414](https://arxiv.org/abs/2609.20414) | adjacent | adjacent (0.33) | core (0.74) | TouchSight: Bare-Handed Tactile Prediction from Egocentric Video via Generative Visual Augmentation |
| [2609.20407](https://arxiv.org/abs/2609.20407) | irrelevant | irrelevant (0.71) | adjacent (0.61) |  |
| [2609.20388](https://arxiv.org/abs/2609.20388) | adjacent | adjacent (0.29) | core (0.87) | Navi-Agent: Unlocalized Monocular Navigation Agent |
| [2609.20348](https://arxiv.org/abs/2609.20348) | irrelevant | irrelevant (0.5) | adjacent (0.82) |  |
| [2609.20330](https://arxiv.org/abs/2609.20330) | adjacent | adjacent (0.58) | core (0.79) | RoboFind: Multi-Agent Personalized Object Search for People Who Are Blind or Have Low Vision |
| [2609.20116](https://arxiv.org/abs/2609.20116) | adjacent | adjacent (0.42) | core (0.78) | How Far Can GPT-6-Astra Go? Evaluating Capabilities in Zero-Shot Vision-and-Language Navigation |
| [2609.20114](https://arxiv.org/abs/2609.20114) | adjacent | adjacent (0.74) | core (0.9) | Universal Navigation Interface: Robot-Free Data for Wheeled Robot Navigation |
| [2609.20106](https://arxiv.org/abs/2609.20106) | adjacent | adjacent (0.77) | core (0.8) | AnyviewMeter: Adapting Robotic Reward Models with Camera Geometry and Multi-View Attention |
| [2609.20078](https://arxiv.org/abs/2609.20078) | adjacent | adjacent (0.58) | core (0.85) | FlipToSee: A Probabilistic Stable Placement Prior for Active Visual Exploration via Regrasping |
| [2609.20048](https://arxiv.org/abs/2609.20048) | irrelevant | irrelevant (0.25) | adjacent (0.75) | Mechanical Precision Weeding with a Quadruped Robot |
| [2609.20035](https://arxiv.org/abs/2609.20035) | irrelevant | irrelevant (0.46) | core (0.78) |  |
| [2609.20026](https://arxiv.org/abs/2609.20026) | irrelevant | irrelevant (0.98) | adjacent (0.63) |  |
| [2609.20012](https://arxiv.org/abs/2609.20012) | irrelevant | irrelevant (0.83) | adjacent (0.7) |  |
| [2609.19996](https://arxiv.org/abs/2609.19996) | irrelevant | irrelevant (0.98) | adjacent (0.6) |  |
| [2609.19974](https://arxiv.org/abs/2609.19974) | adjacent | adjacent (0.58) | core (0.86) | MaskHarness-WAM: Instance-Grounded Harnessing for Long-Horizon Robot Manipulation |
| [2609.19973](https://arxiv.org/abs/2609.19973) | irrelevant | irrelevant (0.35) | adjacent (0.7) |  |
| [2609.19962](https://arxiv.org/abs/2609.19962) | adjacent | adjacent (0.68) | core (0.9) | Hybrid Residual Reinforcement Learning for Contact-Rich Robotic Book Insertion |
| [2609.19961](https://arxiv.org/abs/2609.19961) | irrelevant | adjacent (0.53) | core (0.67) | Neuro-Symbolic Agentic AI for Networked Low-Altitude UAVs |
| [2609.19954](https://arxiv.org/abs/2609.19954) | irrelevant | irrelevant (0.57) | adjacent (0.63) |  |
| [2609.19946](https://arxiv.org/abs/2609.19946) | irrelevant | adjacent (0.59) | core (0.86) | Execution-Aware Pre-Execution Ranking for Grasp-Conditioned Robotic Placement |
| [2609.19912](https://arxiv.org/abs/2609.19912) | irrelevant | irrelevant (0.73) | adjacent (0.82) |  |
| [2609.19906](https://arxiv.org/abs/2609.19906) | adjacent | adjacent (0.71) | core (0.79) | Learning and Transferring Closed-Loop Robot Software |
| [2609.19903](https://arxiv.org/abs/2609.19903) | core | adjacent (0.56) | core (0.66) | REARL: A Closed-loop Autonomous Driving Simulation Enhancement Framework with Real Traffic Data and Large Language Models |
| [2609.19894](https://arxiv.org/abs/2609.19894) | adjacent | adjacent (0.79) | core (0.79) | Learning Reliable Parking Policies via Offline Reinforcement Learning with Quantized Action Representations |
| [2609.19878](https://arxiv.org/abs/2609.19878) | adjacent | adjacent (0.57) | core (0.8) | Uni-LaDiR: Latent Diffusion Unifies Multimodal Reasoning |
| [2609.19876](https://arxiv.org/abs/2609.19876) | irrelevant | irrelevant (0.61) | adjacent (0.69) |  |
| [2609.19850](https://arxiv.org/abs/2609.19850) | irrelevant | adjacent (0.68) | core (0.8) | GR2PO: Group Relative Return Policy Optimization for Continuous Robot Control |
| [2609.19817](https://arxiv.org/abs/2609.19817) | adjacent | adjacent (0.5) | core (0.86) | RotateIt! Fast and Reliable Single-Arm Garment Unfolding via Online-Adaptive Dynamic Rotation |
| [2609.19803](https://arxiv.org/abs/2609.19803) | irrelevant | adjacent (0.58) | core (0.69) | HEROIC: Heterogeneous Evidential Reasoning for Open-Vocabulary Identification and Cross-Robot Collaboration |
| [2609.19768](https://arxiv.org/abs/2609.19768) | irrelevant | irrelevant (0.66) | adjacent (0.63) |  |
| [2609.19742](https://arxiv.org/abs/2609.19742) | irrelevant | irrelevant (0.84) | adjacent (0.6) |  |
| [2609.19726](https://arxiv.org/abs/2609.19726) | irrelevant | irrelevant (0.73) | adjacent (0.68) |  |
| [2609.19690](https://arxiv.org/abs/2609.19690) | adjacent | adjacent (0.7) | core (0.82) | UniExo: Unified Multi-Skill Policies for Musculoskeletal Locomotion and Co-Adaptive Exoskeleton Control |
| [2609.19665](https://arxiv.org/abs/2609.19665) | adjacent | adjacent (0.5) | core (0.74) | Runtime Safety Filtering for Two-Terminal Hazards in Robotic Battery Recycling |
| [2609.19647](https://arxiv.org/abs/2609.19647) | irrelevant | irrelevant (0.66) | adjacent (0.78) |  |
| [2609.19636](https://arxiv.org/abs/2609.19636) | irrelevant | irrelevant (0.68) | adjacent (0.6) |  |
| [2609.19628](https://arxiv.org/abs/2609.19628) | irrelevant | irrelevant (0.85) | adjacent (0.7) |  |
