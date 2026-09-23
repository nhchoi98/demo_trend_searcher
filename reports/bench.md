# Loop 1 benchmark

249 papers, 249 with a gold label (data/gold.jsonl). Jev's confidences come from its probability distribution; generative models write theirs down themselves, so only labels are compared. "served as" is what the endpoint reported running when it differs from the requested name (a dated snapshot, or the upstream model/provider behind a router). Cost is estimated from models.pricing in finder.config.ts.

| model | served as | n (gold) | label acc | include acc | include precision | include recall | in tok | out tok | latency | est. $/1000 papers |
|---|---|---|---|---|---|---|---|---|---|---|
| jev:jev-1.13.0 | - | 249 | 91% | 94% | 90% | 100% | 1479 | 0 | - | $0.06 |
| openai:gpt-5 | - | 249 | 45% | 69% | 63% | 100% | 1536 | 0 | - | $1.92 |
| openai:gpt-5-mini | gpt-5-mini-2025-08-07 | 249 | 32% | 66% | 61% | 100% | 1589 | 1285 | 13896 ms | $2.97 |
| openai:gpt-5-nano | gpt-5-nano-2025-08-07 | 249 | 31% | 61% | 58% | 100% | 1589 | 2264 | 15031 ms | $0.99 |

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

## openai:gpt-5-mini: label confusion (rows gold, columns openai:gpt-5-mini)

| | core | adjacent | irrelevant |
|---|---|---|---|
| core | 40 | 0 | 0 |
| adjacent | 86 | 7 | 0 |
| irrelevant | 54 | 30 | 32 |

## openai:gpt-5-nano: label confusion (rows gold, columns openai:gpt-5-nano)

| | core | adjacent | irrelevant |
|---|---|---|---|
| core | 35 | 5 | 0 |
| adjacent | 70 | 23 | 0 |
| irrelevant | 32 | 64 | 20 |

## jev:jev-1.13.0 vs openai:gpt-5: label disagreements (149)

| id | gold | Jev | other | title |
|---|---|---|---|---|
| [2609.22085](https://arxiv.org/abs/2609.22085) | core | adjacent (0.25) | core (0.9) | SeeQ: Training Generalist Value Functions for Long-Horizon Robotic Manipulation |
| [2609.22075](https://arxiv.org/abs/2609.22075) | adjacent | adjacent (0.7) | core (0.82) | LIMBO: Learning and Internalizing Model-Free Barrier Objectives for Agile and Safe Whole-Body Control |
| [2609.22083](https://arxiv.org/abs/2609.22083) | irrelevant | irrelevant (0.6) | adjacent (0.7) | MintAct: A Unified Visual Agent for Digital Environments |
| [2609.22060](https://arxiv.org/abs/2609.22060) | irrelevant | irrelevant (0.73) | adjacent (0.78) | Traffic Sign Recognition for Autonomous Driving Using Branched YOLOv2 and Geometric Features |
| [2609.21982](https://arxiv.org/abs/2609.21982) | adjacent | adjacent (0.48) | core (0.86) | CARF: Contrastive Attraction-Repulsion of Failure-Guided Flow Matching |
| [2609.21942](https://arxiv.org/abs/2609.21942) | adjacent | adjacent (0.68) | core (0.76) | When Should a Failing Robot Ask? Initiating Corrective Human-Robot Dialogue from Audited Sensor Evidence |
| [2609.21938](https://arxiv.org/abs/2609.21938) | irrelevant | irrelevant (0.35) | adjacent (0.72) | Info3R: Information-Adaptive Test-Time Training for 3D Reconstruction |
| [2609.21929](https://arxiv.org/abs/2609.21929) | adjacent | adjacent (0.4) | core (0.82) | MAAP: Multi-Agent Active Perception for Collaborative Manipulation |
| [2609.21906](https://arxiv.org/abs/2609.21906) | irrelevant | irrelevant (0.52) | adjacent (0.62) | Intervention Granularity Matters: Coherent Treatment Bundles in Counterfactual Simulation with Clinical World Models |
| [2609.21883](https://arxiv.org/abs/2609.21883) | irrelevant | adjacent (0.31) | core (0.78) | VIRGA: Virtual-Agent-Intermediated Riemannian Geometry for Active-Sensing Air-Ground Coordination |
| [2609.21872](https://arxiv.org/abs/2609.21872) | irrelevant | irrelevant (0.83) | adjacent (0.63) | Chronosphere: Space-Time Tessellation of Local Climate Experts |
| [2609.21838](https://arxiv.org/abs/2609.21838) | adjacent | adjacent (0.65) | core (0.68) | PopNavShift: Stress-Testing Social Navigation under Behavioral Population Shift |
| [2609.21804](https://arxiv.org/abs/2609.21804) | irrelevant | irrelevant (0.59) | adjacent (0.69) | VideoReloc: Long-Term Indoor Video Relocalization against a Kilobyte-Scale Semantic Scene Graph |
| [2609.21803](https://arxiv.org/abs/2609.21803) | irrelevant | irrelevant (0.7) | core (0.77) | Contact-Rich Motion Planning via GPU-Parallel Mode Evaluation |
| [2609.21788](https://arxiv.org/abs/2609.21788) | core | adjacent (0.32) | core (0.9) | From Pretraining to Proficiency: Real-World Subtask RL for Long-Horizon Manipulation with Minimal Human Intervention |
| [2609.21792](https://arxiv.org/abs/2609.21792) | adjacent | adjacent (0.68) | core (0.71) | AcousticDiffusion: Semantically Conditioned Audio-Guided Diffusion Policy for Search-and-Rescue Assistance |
| [2609.21780](https://arxiv.org/abs/2609.21780) | irrelevant | irrelevant (0.76) | adjacent (0.73) | PointLAM: Local Attentive Mamba for Efficient Point-based 3D Object Detection |
| [2609.21777](https://arxiv.org/abs/2609.21777) | irrelevant | irrelevant (0.63) | adjacent (0.77) | TRACE: Coverage Path Planning for Unknown Environments Using Hierarchical Coverage Tree |
| [2609.21770](https://arxiv.org/abs/2609.21770) | irrelevant | irrelevant (0.56) | adjacent (0.69) | XCalib Depth-Guided Geometric Optimization for Dense Thermal-Visible Video Registration |
| [2609.21767](https://arxiv.org/abs/2609.21767) | adjacent | adjacent (0.29) | core (0.86) | Scaling Vision-Language Reward Learning for Robot Manipulation in Parallel Simulation |
| [2609.21761](https://arxiv.org/abs/2609.21761) | adjacent | adjacent (0.71) | core (0.76) | CRISP: Contact-Rich Robotic Simulation Platform with Extensive Geometries and Contact Solvers |
| [2609.21754](https://arxiv.org/abs/2609.21754) | irrelevant | irrelevant (0.7) | adjacent (0.72) | SFVO: Decoupled Confidence-Guided Stereo-Flow Visual Odometry with Bidirectional PnP |
| [2609.21748](https://arxiv.org/abs/2609.21748) | adjacent | adjacent (0.61) | core (0.8) | World Modeling in Transformers |
| [2609.21735](https://arxiv.org/abs/2609.21735) | irrelevant | irrelevant (0.67) | adjacent (0.73) | GEM-MPC: Balancing Exploration and Exploitation through Expert-Guided Planning |
| [2609.21734](https://arxiv.org/abs/2609.21734) | irrelevant | irrelevant (0.65) | adjacent (0.7) | When Should Robots Intervene? Balancing Engagement and Intrusiveness in Human-Robot Interaction |
| [2609.21726](https://arxiv.org/abs/2609.21726) | adjacent | adjacent (0.3) | core (0.85) | ZeroTouch: Tactile-Supervised Visual Contact Estimation for Contact-Rich Manipulation |
| [2609.21718](https://arxiv.org/abs/2609.21718) | irrelevant | irrelevant (0.74) | adjacent (0.7) | A Novel Path-Tracking Algorithm for Automated Tractor-Trailer Forward and Backward Maneuvers |
| [2609.21716](https://arxiv.org/abs/2609.21716) | adjacent | adjacent (0.75) | core (0.78) | AgenticSwarm: Semantic Perception and Adaptive Task Allocation for Heterogeneous Multi-UAV Missions |
| [2609.21707](https://arxiv.org/abs/2609.21707) | adjacent | adjacent (0.6) | core (0.8) | NeuRIO: A Streaming Neural Estimator for Zero-Shot Sim-to-Real Multi-Robot Relative Inertial Odometry |
| [2609.21690](https://arxiv.org/abs/2609.21690) | adjacent | adjacent (0.74) | core (0.86) | RAYA: Learning Where and When to Intervene for Robot Recovery |
| [2609.21621](https://arxiv.org/abs/2609.21621) | adjacent | adjacent (0.38) | core (0.9) | Towards Fine-Grained Object Manipulation: SAM3-Guided Visuomotor Policy with Persistent Memory Learning and Focused Visual Conditioning |
| [2609.21617](https://arxiv.org/abs/2609.21617) | adjacent | adjacent (0.55) | core (0.78) | CounterPlay: Counterfactual Post-Training for Self-Play Driving Policies |
| [2609.21609](https://arxiv.org/abs/2609.21609) | adjacent | adjacent (0.77) | core (0.87) | Potential-Field Action Representation for Reinforcement Learning in Contact-Rich Manipulation |
| [2609.21597](https://arxiv.org/abs/2609.21597) | irrelevant | irrelevant (0.64) | adjacent (0.68) | HAT: Hypothesis-Anchored Tracking for Video Monocular Spacecraft Pose Estimation |
| [2609.21590](https://arxiv.org/abs/2609.21590) | irrelevant | irrelevant (0.59) | core (0.7) | Periodic Neural Mapping for Unsteady Rotor-Blade Pressure and Aeroelastic Load Prediction |
| [2609.21580](https://arxiv.org/abs/2609.21580) | irrelevant | irrelevant (0.81) | adjacent (0.69) | Tilt as a Certified Resource: Preserving Motor Wrench-Rate Authority on Articulated Multirotors |
| [2609.21572](https://arxiv.org/abs/2609.21572) | adjacent | adjacent (0.32) | core (0.86) | SABER: Learning Attention-based Semantic Affordance for Legged Locomotion |
| [2609.21516](https://arxiv.org/abs/2609.21516) | irrelevant | irrelevant (0.39) | adjacent (0.72) | 2D GauSS-MI: Efficient Active Scene Reconstruction with Balanced Visual and Geometric Quality |
| [2609.21511](https://arxiv.org/abs/2609.21511) | adjacent | adjacent (0.55) | core (0.88) | 2nd Place Solution to the HANDS 2026 Workshop Challenge-Dexterous Grasp Motion Track: Single-Shot Trajectory Warping for Grasp Motion Generation |
| [2609.21504](https://arxiv.org/abs/2609.21504) | adjacent | adjacent (0.45) | core (0.89) | DPed-VLN: A Benchmark for Socially Compliant Vision-and-Language Navigation in Dynamic Pedestrian Environments |
| [2609.21502](https://arxiv.org/abs/2609.21502) | core | adjacent (0.73) | core (0.86) | Adaptive World Memory 3D Foundation Model for Scalable 3D Mapping, Localization, and Rendering |
| [2609.21497](https://arxiv.org/abs/2609.21497) | adjacent | adjacent (0.73) | core (0.91) | FORTE: Task-Adaptive Force Capability Optimization for Mobile Manipulators |
| [2609.21486](https://arxiv.org/abs/2609.21486) | adjacent | adjacent (0.6) | core (0.78) | Driving on Registers, Reasoning on Risk: Risk-Aware Occupancy for Register-Based End-to-End Autonomous Driving |
| [2609.21470](https://arxiv.org/abs/2609.21470) | adjacent | adjacent (0.41) | core (0.9) | Risk-Aware Occupancy for Safety-Oriented End-to-End Autonomous Driving |
| [2609.21467](https://arxiv.org/abs/2609.21467) | adjacent | adjacent (0.32) | core (0.86) | Learning Distance-Conditioned Object Transport for Humanoid Loco-Manipulation from a Single Motion Clip |
| [2609.21447](https://arxiv.org/abs/2609.21447) | adjacent | adjacent (0.34) | core (0.86) | FootQuery: Future-Touchdown-Guided Retrieval from Depth History for Perceptive Humanoid Locomotion |
| [2609.21437](https://arxiv.org/abs/2609.21437) | irrelevant | irrelevant (0.64) | adjacent (0.65) | Think Locally, Refine Globally for Memory-Efficient 3D Reconstruction |
| [2609.21416](https://arxiv.org/abs/2609.21416) | irrelevant | irrelevant (0.85) | adjacent (0.64) | A Unified Dynamic Force Guidance Framework for Performance-Optimized Kinesthetic Teaching |
| [2609.21404](https://arxiv.org/abs/2609.21404) | adjacent | adjacent (0.63) | core (0.8) | Stabilizing Trajectory Outputs in End-to-End Autonomous Driving via SC-IMM Based Teacher Signals |
| [2609.21402](https://arxiv.org/abs/2609.21402) | irrelevant | irrelevant (0.57) | adjacent (0.55) | SIRA: Reasoning-Aware Surgical Instrument Segmentation via Query-Anchored Alignment |
| [2609.21400](https://arxiv.org/abs/2609.21400) | adjacent | adjacent (0.79) | core (0.6) | A Scene Language Model for Open-Vocabulary Scene Mapping |
| [2609.21379](https://arxiv.org/abs/2609.21379) | core | adjacent (0.38) | core (0.9) | JEPA Guided Diffusion: Predictive Vision-Language Conditioning for Generative Traffic Forecasting |
| [2609.21377](https://arxiv.org/abs/2609.21377) | adjacent | adjacent (0.62) | core (0.86) | AVT-Fabric: Active Visuo-Tactile Perception via Adaptive Evidence Selection for Efficient Robotic Fabric Comparison |
| [2609.21369](https://arxiv.org/abs/2609.21369) | adjacent | adjacent (0.82) | core (0.85) | ProTracer: Proprioception-Guided Failure Diagnosis in Robot Manipulation |
| [2609.21365](https://arxiv.org/abs/2609.21365) | adjacent | adjacent (0.65) | core (0.9) | MicroHookACT: Monocular Microscopic Vision Guided Visuomotor Policy for Flexible Microelectrode Hooking |
| [2609.21347](https://arxiv.org/abs/2609.21347) | irrelevant | irrelevant (0.59) | adjacent (0.78) | Cube-Splat: High-Fidelity 360° Gaussian Splatting SLAM via Cubemap Factorization and Adjoint-Consistent Optimization |
| [2609.21323](https://arxiv.org/abs/2609.21323) | irrelevant | irrelevant (0.41) | adjacent (0.63) | VeriFuse: Bounded Vision-Language Arbitration and Reason-Guided Refinement for Cooperative 3D Perception |
| [2609.21316](https://arxiv.org/abs/2609.21316) | adjacent | adjacent (0.62) | core (0.82) | NaViRrator: Robot Navigation from Human-Readable Maps through a Learned Visual Route |
| [2609.21307](https://arxiv.org/abs/2609.21307) | adjacent | adjacent (0.89) | core (0.84) | Stability-aware Residual Reinforcement Learning Framework for Robotic Manipulator Disturbance Compensation |
| [2609.21226](https://arxiv.org/abs/2609.21226) | irrelevant | irrelevant (0.25) | adjacent (0.7) | AirSplan: Risk-Aware Motion Planning for Quadrotors in Cluttered 3D Gaussian Splats |
| [2609.21221](https://arxiv.org/abs/2609.21221) | irrelevant | adjacent (0.86) | core (0.68) | A Fully Differentiable Neuro-Soft-Symbolic Framework for Perceptual Task Planning |
| [2609.21219](https://arxiv.org/abs/2609.21219) | irrelevant | irrelevant (0.28) | adjacent (0.7) | Multi-viewpoint Geo-localization with Event Cameras |
| [2609.21212](https://arxiv.org/abs/2609.21212) | adjacent | adjacent (0.46) | core (0.86) | Visual Navigation Transformer with Pose Attention |
| [2609.21207](https://arxiv.org/abs/2609.21207) | irrelevant | adjacent (0.29) | irrelevant (0.82) | Hand-Aware Transition Modeling for Bimanual Procedural Anomaly Detection |
| [2609.21186](https://arxiv.org/abs/2609.21186) | irrelevant | irrelevant (0.74) | adjacent (0.62) | Robust Structureless Monocular Visual Inertial Initialization Exploiting Line Features and Vanishing Points |
| [2609.21176](https://arxiv.org/abs/2609.21176) | irrelevant | irrelevant (0.65) | adjacent (0.71) | 4DGS-Fixer: Generative Sparse-View 4D Gaussian Splatting with Iterative Refinement Guided by Video Diffusion Priors |
| [2609.21167](https://arxiv.org/abs/2609.21167) | irrelevant | irrelevant (0.69) | adjacent (0.62) | MA-LIPP: Cooperative Multi-Agent Load-Aware Informative Path Planning for Heterogeneous Robot Teams |
| [2609.21138](https://arxiv.org/abs/2609.21138) | irrelevant | adjacent (0.69) | core (0.7) | Diverse and Adaptable Arm Coordination for Octopus-Crawling via Diffusion-Based Uncertainty-Aware Optimization |
| [2609.21130](https://arxiv.org/abs/2609.21130) | irrelevant | adjacent (0.62) | core (0.78) | SAGE: Safety-Aligned Gradient Enforcement for Human--Robot Collaboration |
| [2609.21123](https://arxiv.org/abs/2609.21123) | irrelevant | irrelevant (0.88) | adjacent (0.62) | Signal-Centric Remote Sensing via Alternative Preprocessing and Acoustic Processing for ML-Driven Applications |
| [2609.21114](https://arxiv.org/abs/2609.21114) | irrelevant | irrelevant (0.58) | adjacent (0.78) | Noctif3R: Feed-Forward Monocular Real-Time SLAM for Photon-Limited Scenes on Embedded Hardware |
| [2609.21109](https://arxiv.org/abs/2609.21109) | irrelevant | irrelevant (0.69) | adjacent (0.71) | Talk to Me, Jarvis: An Open-Source Edge-Deployable Voice Assistant Framework for Autonomous Racecars |
| [2609.21108](https://arxiv.org/abs/2609.21108) | irrelevant | irrelevant (0.74) | adjacent (0.55) | REFINEPPO: Learning Continuous Control Policies by Iterative Action Refinement |
| [2609.21107](https://arxiv.org/abs/2609.21107) | adjacent | adjacent (0.3) | core (0.9) | Learning Scene-Aware Humanoid Locomotion through 3D Clutter from Immersive Human Demonstrations |
| [2609.21100](https://arxiv.org/abs/2609.21100) | irrelevant | adjacent (0.6) | core (0.79) | Dynamics-Induced Commitment in Learning-Based Robotic Penalty Kicks |
| [2609.21099](https://arxiv.org/abs/2609.21099) | irrelevant | irrelevant (0.89) | adjacent (0.66) | Dynamic Modeling and LQR Control of a Single Coaxial Drone with 2DOF Thrust Vectoring Mechanism |
| [2609.21082](https://arxiv.org/abs/2609.21082) | irrelevant | irrelevant (0.51) | adjacent (0.75) | Design of Adaptive PID Controller Based On Asynchronous Advantage Actor Critic Learning Method for QuadCopter Control |
| [2609.21054](https://arxiv.org/abs/2609.21054) | irrelevant | adjacent (0.37) | irrelevant (0.93) | Physically Based Rendering in the Latent Space |
| [2609.21053](https://arxiv.org/abs/2609.21053) | irrelevant | irrelevant (0.56) | adjacent (0.7) | Square Root Gauss-Newton iLQR |
| [2609.21046](https://arxiv.org/abs/2609.21046) | irrelevant | irrelevant (0.86) | adjacent (0.7) | Constraint-Unified MPC for Over-Actuated Surface Vehicles with Post-Detection Fault Reconfiguration |
| [2609.21015](https://arxiv.org/abs/2609.21015) | irrelevant | irrelevant (0.87) | adjacent (0.74) | Towards Effective Visual-Inertial SLAM with Passive-Only Sensors for Low-Cost Autonomous Underwater Vehicles |
| [2609.21005](https://arxiv.org/abs/2609.21005) | irrelevant | irrelevant (0.63) | adjacent (0.66) | Project SCOUT: Interceptor Drone for Perimeter Defense |
| [2609.21000](https://arxiv.org/abs/2609.21000) | irrelevant | irrelevant (0.81) | core (0.74) | Do Spinning Radar Doppler Velocity Measurements Improve Vehicle Detection and Tracking? |
| [2609.20983](https://arxiv.org/abs/2609.20983) | adjacent | adjacent (0.78) | core (0.78) | PIVOT: Physically Informed Vision-Language Off-Road Traversability for Field Robot Navigation |
| [2609.20970](https://arxiv.org/abs/2609.20970) | adjacent | adjacent (0.69) | core (0.79) | Shake to Learn: Dynamic Interrogation of Hidden Object Physics for Robotic Manipulation with Physical Reservoir Computing |
| [2609.20954](https://arxiv.org/abs/2609.20954) | irrelevant | irrelevant (0.64) | adjacent (0.55) | Efficient Bayes-Adaptive Reinforcement Learning with Temporal Logic Specifications |
| [2609.20822](https://arxiv.org/abs/2609.20822) | adjacent | adjacent (0.52) | core (0.92) | Coding Agents with an Obstacle-Aware Harness for Safe Robot Manipulation |
| [2609.20820](https://arxiv.org/abs/2609.20820) | adjacent | adjacent (0.25) | core (0.86) | Workspace Models: Lightweight Robotic Memory via Saliency-Driven Supervision |
| [2609.20819](https://arxiv.org/abs/2609.20819) | core | adjacent (0.63) | core (0.82) | Can 4D Foundation Models Remember? |
| [2609.20818](https://arxiv.org/abs/2609.20818) | irrelevant | adjacent (0.31) | irrelevant (0.9) | SplashSplat: Reconstructing Splashing Liquids from Real-World Multi-View Videos |
| [2609.20817](https://arxiv.org/abs/2609.20817) | irrelevant | adjacent (0.46) | core (0.7) | FAMOS: Feed-Forward 3D Articulation Modeling from Sparse Observations |
| [2609.20794](https://arxiv.org/abs/2609.20794) | irrelevant | irrelevant (0.46) | adjacent (0.6) | PosteriorBench: From Point Estimates to Posterior Matching in Evaluating Generative Inverse Solvers |
| [2609.20791](https://arxiv.org/abs/2609.20791) | adjacent | adjacent (0.54) | core (0.79) | StageGuard: Learning Stage Transitions for Long-Horizon Robot Tasks via Agentic Distillation |
| [2609.20731](https://arxiv.org/abs/2609.20731) | irrelevant | irrelevant (0.54) | adjacent (0.62) | Underwater Visual Target Tracking with Target-Specific Depth Estimation and Adaptive Model-Fusion Predictive Control |
| [2609.20694](https://arxiv.org/abs/2609.20694) | irrelevant | irrelevant (0.54) | adjacent (0.7) | HOPHY: A Hierarchical Hypergraph Representation for Off-Road Path and Mission Planning |
| [2609.20691](https://arxiv.org/abs/2609.20691) | irrelevant | irrelevant (0.88) | adjacent (0.7) | Custom PX4 firmware for autonomous hybrid aerial-marine missions |
| [2609.20680](https://arxiv.org/abs/2609.20680) | core | adjacent (0.46) | core (0.78) | Towards Scaling Marine Perception with Synthetic Data |
| [2609.20673](https://arxiv.org/abs/2609.20673) | adjacent | adjacent (0.8) | core (0.78) | FunArt: Decoding Functional Structure and Articulation from Generative 3D Latents |
| [2609.20629](https://arxiv.org/abs/2609.20629) | adjacent | adjacent (0.7) | core (0.83) | RTK-Vision PPO for Autonomous Micro UAV Recovery on an Airborne Carrier |
| [2609.20624](https://arxiv.org/abs/2609.20624) | adjacent | adjacent (0.62) | core (0.8) | SmellDiffusion: Diffusion-Based Quadruped Navigation with Olfactory Scene Graphs |
| [2609.20615](https://arxiv.org/abs/2609.20615) | irrelevant | adjacent (0.71) | core (0.8) | INSPECT: Learning Robot View Selection from Assistant Use |
| [2609.20598](https://arxiv.org/abs/2609.20598) | irrelevant | irrelevant (0.82) | adjacent (0.69) | COIN-GP: Cooperative Online Learning in Networked Distributed Systems with Partial Measurements via Gaussian Process Regression |
| [2609.20589](https://arxiv.org/abs/2609.20589) | irrelevant | irrelevant (0.85) | adjacent (0.67) | RawSLAM: Online HDR Gaussian SLAM from Linear Radiance |
| [2609.20586](https://arxiv.org/abs/2609.20586) | adjacent | adjacent (0.67) | core (0.64) | CoRef-GS: Cooperative Referring Gaussian Splatting for Multi-Agent Scene Understanding |
| [2609.20570](https://arxiv.org/abs/2609.20570) | irrelevant | irrelevant (0.76) | core (0.63) | Walking on the Slope: Stable Bipedal Gaits with Genetic-Algorithm-Optimized Trajectories |
| [2609.20566](https://arxiv.org/abs/2609.20566) | adjacent | adjacent (0.52) | core (0.86) | OmniMimic: Dynamics-completed Motion Augmentation for Multi-style Omnidirectional Quadruped Locomotion |
| [2609.20558](https://arxiv.org/abs/2609.20558) | adjacent | adjacent (0.63) | core (0.9) | Learning Slope-Adaptive Whole-Body Locomotion for Humanoid Robots in Roofing Construction |
| [2609.20540](https://arxiv.org/abs/2609.20540) | irrelevant | irrelevant (0.91) | adjacent (0.74) | Integrated Guidance and Control of a Mother-Child UAV-UGV System for Cooperative Missions |
| [2609.20524](https://arxiv.org/abs/2609.20524) | irrelevant | adjacent (0.55) | irrelevant (0.86) | S4R: Scaling for Rigid-Body Interpenetration Resolution |
| [2609.20499](https://arxiv.org/abs/2609.20499) | irrelevant | irrelevant (0.35) | adjacent (0.64) | Towards AI-enhanced control: a numerical technique for trajectory smoothing of a parallel robot for pancreatic surgery |
| [2609.20443](https://arxiv.org/abs/2609.20443) | adjacent | adjacent (0.57) | core (0.9) | Spatial-Semantic Uncertainty in VLM-Based Target Search: Balancing Exploration and Identification |
| [2609.20435](https://arxiv.org/abs/2609.20435) | irrelevant | irrelevant (0.73) | adjacent (0.66) | Time-Efficient Iterative Learning Planning for Safety-Critical Dynamic Obstacle Avoidance |
| [2609.20414](https://arxiv.org/abs/2609.20414) | adjacent | adjacent (0.33) | core (0.74) | TouchSight: Bare-Handed Tactile Prediction from Egocentric Video via Generative Visual Augmentation |
| [2609.20407](https://arxiv.org/abs/2609.20407) | irrelevant | irrelevant (0.71) | adjacent (0.61) | Resilient Motion Planning for Free-Flying Space Robots under Actuator Failures |
| [2609.20388](https://arxiv.org/abs/2609.20388) | adjacent | adjacent (0.29) | core (0.87) | Navi-Agent: Unlocalized Monocular Navigation Agent |
| [2609.20348](https://arxiv.org/abs/2609.20348) | irrelevant | irrelevant (0.5) | adjacent (0.82) | EliGSiR: Continual RGB-D Mapping with Gaussian Splatting under Bounded Compute |
| [2609.20330](https://arxiv.org/abs/2609.20330) | adjacent | adjacent (0.58) | core (0.79) | RoboFind: Multi-Agent Personalized Object Search for People Who Are Blind or Have Low Vision |
| [2609.20116](https://arxiv.org/abs/2609.20116) | adjacent | adjacent (0.42) | core (0.78) | How Far Can GPT-6-Astra Go? Evaluating Capabilities in Zero-Shot Vision-and-Language Navigation |
| [2609.20114](https://arxiv.org/abs/2609.20114) | adjacent | adjacent (0.74) | core (0.9) | Universal Navigation Interface: Robot-Free Data for Wheeled Robot Navigation |
| [2609.20106](https://arxiv.org/abs/2609.20106) | adjacent | adjacent (0.77) | core (0.8) | AnyviewMeter: Adapting Robotic Reward Models with Camera Geometry and Multi-View Attention |
| [2609.20078](https://arxiv.org/abs/2609.20078) | adjacent | adjacent (0.58) | core (0.85) | FlipToSee: A Probabilistic Stable Placement Prior for Active Visual Exploration via Regrasping |
| [2609.20048](https://arxiv.org/abs/2609.20048) | irrelevant | irrelevant (0.25) | adjacent (0.75) | Mechanical Precision Weeding with a Quadruped Robot |
| [2609.20035](https://arxiv.org/abs/2609.20035) | irrelevant | irrelevant (0.46) | core (0.78) | DR-MPC: Fast and Feasible Dynamics-Relaxed Model-Predictive Control for Legged Locomotion |
| [2609.20026](https://arxiv.org/abs/2609.20026) | irrelevant | irrelevant (0.98) | adjacent (0.63) | FedeRICo: Federated Region-Influenced Coupling for Traffic Flow Prediction |
| [2609.20012](https://arxiv.org/abs/2609.20012) | irrelevant | irrelevant (0.83) | adjacent (0.7) | GRF-Recon: Global Ray-Field Optimization for Long-Sequence Feed-forward Reconstruction |
| [2609.19996](https://arxiv.org/abs/2609.19996) | irrelevant | irrelevant (0.98) | adjacent (0.6) | Customizable and Jointly Optimized Route Planning: A Deep Architecture Enabling Differentiable Shortest-Path Search |
| [2609.19974](https://arxiv.org/abs/2609.19974) | adjacent | adjacent (0.58) | core (0.86) | MaskHarness-WAM: Instance-Grounded Harnessing for Long-Horizon Robot Manipulation |
| [2609.19973](https://arxiv.org/abs/2609.19973) | irrelevant | irrelevant (0.35) | adjacent (0.7) | An Event Preserving Velocity Invariant Representation for Event Cameras |
| [2609.19962](https://arxiv.org/abs/2609.19962) | adjacent | adjacent (0.68) | core (0.9) | Hybrid Residual Reinforcement Learning for Contact-Rich Robotic Book Insertion |
| [2609.19961](https://arxiv.org/abs/2609.19961) | irrelevant | adjacent (0.53) | core (0.67) | Neuro-Symbolic Agentic AI for Networked Low-Altitude UAVs |
| [2609.19954](https://arxiv.org/abs/2609.19954) | irrelevant | irrelevant (0.57) | adjacent (0.63) | LapaTrack-3D: 6 DoF pre-operative shape tracking for laparoscopic surgery |
| [2609.19946](https://arxiv.org/abs/2609.19946) | irrelevant | adjacent (0.59) | core (0.86) | Execution-Aware Pre-Execution Ranking for Grasp-Conditioned Robotic Placement |
| [2609.19912](https://arxiv.org/abs/2609.19912) | irrelevant | irrelevant (0.73) | adjacent (0.82) | Distributed Model Predictive Control with Connectivity-based Contracts |
| [2609.19906](https://arxiv.org/abs/2609.19906) | adjacent | adjacent (0.71) | core (0.79) | Learning and Transferring Closed-Loop Robot Software |
| [2609.19903](https://arxiv.org/abs/2609.19903) | core | adjacent (0.56) | core (0.66) | REARL: A Closed-loop Autonomous Driving Simulation Enhancement Framework with Real Traffic Data and Large Language Models |
| [2609.19894](https://arxiv.org/abs/2609.19894) | adjacent | adjacent (0.79) | core (0.79) | Learning Reliable Parking Policies via Offline Reinforcement Learning with Quantized Action Representations |
| [2609.19878](https://arxiv.org/abs/2609.19878) | adjacent | adjacent (0.57) | core (0.8) | Uni-LaDiR: Latent Diffusion Unifies Multimodal Reasoning |
| [2609.19876](https://arxiv.org/abs/2609.19876) | irrelevant | irrelevant (0.61) | adjacent (0.69) | SlugTrails: An Egocentric Benchmark for Floor Plan Localization in Large Buildings |
| [2609.19850](https://arxiv.org/abs/2609.19850) | irrelevant | adjacent (0.68) | core (0.8) | GR2PO: Group Relative Return Policy Optimization for Continuous Robot Control |
| [2609.19817](https://arxiv.org/abs/2609.19817) | adjacent | adjacent (0.5) | core (0.86) | RotateIt! Fast and Reliable Single-Arm Garment Unfolding via Online-Adaptive Dynamic Rotation |
| [2609.19803](https://arxiv.org/abs/2609.19803) | irrelevant | adjacent (0.58) | core (0.69) | HEROIC: Heterogeneous Evidential Reasoning for Open-Vocabulary Identification and Cross-Robot Collaboration |
| [2609.19768](https://arxiv.org/abs/2609.19768) | irrelevant | irrelevant (0.66) | adjacent (0.63) | OceanMoE: Structured Conditional Sparse Computation for Long-Horizon Multivariate Ocean Forecasting |
| [2609.19742](https://arxiv.org/abs/2609.19742) | irrelevant | irrelevant (0.84) | adjacent (0.6) | Equivariant Filter Design for Acoustic and Depth Aided Inertial Navigation Systems |
| [2609.19726](https://arxiv.org/abs/2609.19726) | irrelevant | irrelevant (0.73) | adjacent (0.68) | Decoupling Physical Speed from Path Parameterization in Singularity-Free Guiding Vector Fields |
| [2609.19690](https://arxiv.org/abs/2609.19690) | adjacent | adjacent (0.7) | core (0.82) | UniExo: Unified Multi-Skill Policies for Musculoskeletal Locomotion and Co-Adaptive Exoskeleton Control |
| [2609.19665](https://arxiv.org/abs/2609.19665) | adjacent | adjacent (0.5) | core (0.74) | Runtime Safety Filtering for Two-Terminal Hazards in Robotic Battery Recycling |
| [2609.19647](https://arxiv.org/abs/2609.19647) | irrelevant | irrelevant (0.66) | adjacent (0.78) | Well-posedness of neural turbulence closures and tangent dissipation |
| [2609.19636](https://arxiv.org/abs/2609.19636) | irrelevant | irrelevant (0.68) | adjacent (0.6) | Reach or Solve? Attributing Agentic RL Gains with Checkpoint Handoffs |
| [2609.19628](https://arxiv.org/abs/2609.19628) | irrelevant | irrelevant (0.85) | adjacent (0.7) | VGGT-GS SLAM: Uncalibrated Monocular Gaussian Splatting SLAM with Feed-Forward Priors |

## jev:jev-1.13.0 vs openai:gpt-5-mini: label disagreements (175)

| id | gold | Jev | other | title |
|---|---|---|---|---|
| [2609.22085](https://arxiv.org/abs/2609.22085) | core | adjacent (0.25) | core (0.9) | SeeQ: Training Generalist Value Functions for Long-Horizon Robotic Manipulation |
| [2609.22075](https://arxiv.org/abs/2609.22075) | adjacent | adjacent (0.7) | core (0.9) | LIMBO: Learning and Internalizing Model-Free Barrier Objectives for Agile and Safe Whole-Body Control |
| [2609.22083](https://arxiv.org/abs/2609.22083) | irrelevant | irrelevant (0.6) | adjacent (0.85) | MintAct: A Unified Visual Agent for Digital Environments |
| [2609.22060](https://arxiv.org/abs/2609.22060) | irrelevant | irrelevant (0.73) | core (0.87) | Traffic Sign Recognition for Autonomous Driving Using Branched YOLOv2 and Geometric Features |
| [2609.21982](https://arxiv.org/abs/2609.21982) | adjacent | adjacent (0.48) | core (0.85) | CARF: Contrastive Attraction-Repulsion of Failure-Guided Flow Matching |
| [2609.21942](https://arxiv.org/abs/2609.21942) | adjacent | adjacent (0.68) | core (0.92) | When Should a Failing Robot Ask? Initiating Corrective Human-Robot Dialogue from Audited Sensor Evidence |
| [2609.21938](https://arxiv.org/abs/2609.21938) | irrelevant | irrelevant (0.35) | core (0.85) | Info3R: Information-Adaptive Test-Time Training for 3D Reconstruction |
| [2609.21929](https://arxiv.org/abs/2609.21929) | adjacent | adjacent (0.4) | core (0.8) | MAAP: Multi-Agent Active Perception for Collaborative Manipulation |
| [2609.21906](https://arxiv.org/abs/2609.21906) | irrelevant | irrelevant (0.52) | core (0.84) | Intervention Granularity Matters: Coherent Treatment Bundles in Counterfactual Simulation with Clinical World Models |
| [2609.21883](https://arxiv.org/abs/2609.21883) | irrelevant | adjacent (0.31) | core (0.75) | VIRGA: Virtual-Agent-Intermediated Riemannian Geometry for Active-Sensing Air-Ground Coordination |
| [2609.21872](https://arxiv.org/abs/2609.21872) | irrelevant | irrelevant (0.83) | adjacent (0.72) | Chronosphere: Space-Time Tessellation of Local Climate Experts |
| [2609.21838](https://arxiv.org/abs/2609.21838) | adjacent | adjacent (0.65) | core (0.8) | PopNavShift: Stress-Testing Social Navigation under Behavioral Population Shift |
| [2609.21804](https://arxiv.org/abs/2609.21804) | irrelevant | irrelevant (0.59) | adjacent (0.7) | VideoReloc: Long-Term Indoor Video Relocalization against a Kilobyte-Scale Semantic Scene Graph |
| [2609.21803](https://arxiv.org/abs/2609.21803) | irrelevant | irrelevant (0.7) | core (0.85) | Contact-Rich Motion Planning via GPU-Parallel Mode Evaluation |
| [2609.21788](https://arxiv.org/abs/2609.21788) | core | adjacent (0.32) | core (0.92) | From Pretraining to Proficiency: Real-World Subtask RL for Long-Horizon Manipulation with Minimal Human Intervention |
| [2609.21792](https://arxiv.org/abs/2609.21792) | adjacent | adjacent (0.68) | core (0.85) | AcousticDiffusion: Semantically Conditioned Audio-Guided Diffusion Policy for Search-and-Rescue Assistance |
| [2609.21780](https://arxiv.org/abs/2609.21780) | irrelevant | irrelevant (0.76) | adjacent (0.85) | PointLAM: Local Attentive Mamba for Efficient Point-based 3D Object Detection |
| [2609.21777](https://arxiv.org/abs/2609.21777) | irrelevant | irrelevant (0.63) | core (0.9) | TRACE: Coverage Path Planning for Unknown Environments Using Hierarchical Coverage Tree |
| [2609.21770](https://arxiv.org/abs/2609.21770) | irrelevant | irrelevant (0.56) | adjacent (0.85) | XCalib Depth-Guided Geometric Optimization for Dense Thermal-Visible Video Registration |
| [2609.21767](https://arxiv.org/abs/2609.21767) | adjacent | adjacent (0.29) | core (0.88) | Scaling Vision-Language Reward Learning for Robot Manipulation in Parallel Simulation |
| [2609.21761](https://arxiv.org/abs/2609.21761) | adjacent | adjacent (0.71) | core (0.86) | CRISP: Contact-Rich Robotic Simulation Platform with Extensive Geometries and Contact Solvers |
| [2609.21754](https://arxiv.org/abs/2609.21754) | irrelevant | irrelevant (0.7) | core (0.82) | SFVO: Decoupled Confidence-Guided Stereo-Flow Visual Odometry with Bidirectional PnP |
| [2609.21748](https://arxiv.org/abs/2609.21748) | adjacent | adjacent (0.61) | core (0.89) | World Modeling in Transformers |
| [2609.21735](https://arxiv.org/abs/2609.21735) | irrelevant | irrelevant (0.67) | adjacent (0.8) | GEM-MPC: Balancing Exploration and Exploitation through Expert-Guided Planning |
| [2609.21734](https://arxiv.org/abs/2609.21734) | irrelevant | irrelevant (0.65) | adjacent (0.88) | When Should Robots Intervene? Balancing Engagement and Intrusiveness in Human-Robot Interaction |
| [2609.21726](https://arxiv.org/abs/2609.21726) | adjacent | adjacent (0.3) | core (0.9) | ZeroTouch: Tactile-Supervised Visual Contact Estimation for Contact-Rich Manipulation |
| [2609.21718](https://arxiv.org/abs/2609.21718) | irrelevant | irrelevant (0.74) | core (0.75) | A Novel Path-Tracking Algorithm for Automated Tractor-Trailer Forward and Backward Maneuvers |
| [2609.21716](https://arxiv.org/abs/2609.21716) | adjacent | adjacent (0.75) | core (0.88) | AgenticSwarm: Semantic Perception and Adaptive Task Allocation for Heterogeneous Multi-UAV Missions |
| [2609.21707](https://arxiv.org/abs/2609.21707) | adjacent | adjacent (0.6) | core (0.9) | NeuRIO: A Streaming Neural Estimator for Zero-Shot Sim-to-Real Multi-Robot Relative Inertial Odometry |
| [2609.21690](https://arxiv.org/abs/2609.21690) | adjacent | adjacent (0.74) | core (0.86) | RAYA: Learning Where and When to Intervene for Robot Recovery |
| [2609.21621](https://arxiv.org/abs/2609.21621) | adjacent | adjacent (0.38) | core (0.9) | Towards Fine-Grained Object Manipulation: SAM3-Guided Visuomotor Policy with Persistent Memory Learning and Focused Visual Conditioning |
| [2609.21617](https://arxiv.org/abs/2609.21617) | adjacent | adjacent (0.55) | core (0.86) | CounterPlay: Counterfactual Post-Training for Self-Play Driving Policies |
| [2609.21609](https://arxiv.org/abs/2609.21609) | adjacent | adjacent (0.77) | core (0.88) | Potential-Field Action Representation for Reinforcement Learning in Contact-Rich Manipulation |
| [2609.21597](https://arxiv.org/abs/2609.21597) | irrelevant | irrelevant (0.64) | core (0.8) | HAT: Hypothesis-Anchored Tracking for Video Monocular Spacecraft Pose Estimation |
| [2609.21590](https://arxiv.org/abs/2609.21590) | irrelevant | irrelevant (0.59) | core (0.8) | Periodic Neural Mapping for Unsteady Rotor-Blade Pressure and Aeroelastic Load Prediction |
| [2609.21580](https://arxiv.org/abs/2609.21580) | irrelevant | irrelevant (0.81) | core (0.82) | Tilt as a Certified Resource: Preserving Motor Wrench-Rate Authority on Articulated Multirotors |
| [2609.21572](https://arxiv.org/abs/2609.21572) | adjacent | adjacent (0.32) | core (0.83) | SABER: Learning Attention-based Semantic Affordance for Legged Locomotion |
| [2609.21516](https://arxiv.org/abs/2609.21516) | irrelevant | irrelevant (0.39) | adjacent (0.78) | 2D GauSS-MI: Efficient Active Scene Reconstruction with Balanced Visual and Geometric Quality |
| [2609.21511](https://arxiv.org/abs/2609.21511) | adjacent | adjacent (0.55) | core (0.85) | 2nd Place Solution to the HANDS 2026 Workshop Challenge-Dexterous Grasp Motion Track: Single-Shot Trajectory Warping for Grasp Motion Generation |
| [2609.21504](https://arxiv.org/abs/2609.21504) | adjacent | adjacent (0.45) | core (0.8) | DPed-VLN: A Benchmark for Socially Compliant Vision-and-Language Navigation in Dynamic Pedestrian Environments |
| [2609.21502](https://arxiv.org/abs/2609.21502) | core | adjacent (0.73) | core (0.92) | Adaptive World Memory 3D Foundation Model for Scalable 3D Mapping, Localization, and Rendering |
| [2609.21497](https://arxiv.org/abs/2609.21497) | adjacent | adjacent (0.73) | core (0.8) | FORTE: Task-Adaptive Force Capability Optimization for Mobile Manipulators |
| [2609.21486](https://arxiv.org/abs/2609.21486) | adjacent | adjacent (0.6) | core (0.86) | Driving on Registers, Reasoning on Risk: Risk-Aware Occupancy for Register-Based End-to-End Autonomous Driving |
| [2609.21470](https://arxiv.org/abs/2609.21470) | adjacent | adjacent (0.41) | core (0.85) | Risk-Aware Occupancy for Safety-Oriented End-to-End Autonomous Driving |
| [2609.21467](https://arxiv.org/abs/2609.21467) | adjacent | adjacent (0.32) | core (0.9) | Learning Distance-Conditioned Object Transport for Humanoid Loco-Manipulation from a Single Motion Clip |
| [2609.21447](https://arxiv.org/abs/2609.21447) | adjacent | adjacent (0.34) | core (0.83) | FootQuery: Future-Touchdown-Guided Retrieval from Depth History for Perceptive Humanoid Locomotion |
| [2609.21437](https://arxiv.org/abs/2609.21437) | irrelevant | irrelevant (0.64) | adjacent (0.68) | Think Locally, Refine Globally for Memory-Efficient 3D Reconstruction |
| [2609.21416](https://arxiv.org/abs/2609.21416) | irrelevant | irrelevant (0.85) | core (0.9) | A Unified Dynamic Force Guidance Framework for Performance-Optimized Kinesthetic Teaching |
| [2609.21404](https://arxiv.org/abs/2609.21404) | adjacent | adjacent (0.63) | core (0.88) | Stabilizing Trajectory Outputs in End-to-End Autonomous Driving via SC-IMM Based Teacher Signals |
| [2609.21400](https://arxiv.org/abs/2609.21400) | adjacent | adjacent (0.79) | core (0.9) | A Scene Language Model for Open-Vocabulary Scene Mapping |
| [2609.21379](https://arxiv.org/abs/2609.21379) | core | adjacent (0.38) | core (0.85) | JEPA Guided Diffusion: Predictive Vision-Language Conditioning for Generative Traffic Forecasting |
| [2609.21377](https://arxiv.org/abs/2609.21377) | adjacent | adjacent (0.62) | core (0.8) | AVT-Fabric: Active Visuo-Tactile Perception via Adaptive Evidence Selection for Efficient Robotic Fabric Comparison |
| [2609.21369](https://arxiv.org/abs/2609.21369) | adjacent | adjacent (0.82) | core (0.86) | ProTracer: Proprioception-Guided Failure Diagnosis in Robot Manipulation |
| [2609.21365](https://arxiv.org/abs/2609.21365) | adjacent | adjacent (0.65) | core (0.87) | MicroHookACT: Monocular Microscopic Vision Guided Visuomotor Policy for Flexible Microelectrode Hooking |
| [2609.21347](https://arxiv.org/abs/2609.21347) | irrelevant | irrelevant (0.59) | core (0.75) | Cube-Splat: High-Fidelity 360° Gaussian Splatting SLAM via Cubemap Factorization and Adjoint-Consistent Optimization |
| [2609.21323](https://arxiv.org/abs/2609.21323) | irrelevant | irrelevant (0.41) | core (0.85) | VeriFuse: Bounded Vision-Language Arbitration and Reason-Guided Refinement for Cooperative 3D Perception |
| [2609.21316](https://arxiv.org/abs/2609.21316) | adjacent | adjacent (0.62) | core (0.88) | NaViRrator: Robot Navigation from Human-Readable Maps through a Learned Visual Route |
| [2609.21307](https://arxiv.org/abs/2609.21307) | adjacent | adjacent (0.89) | core (0.88) | Stability-aware Residual Reinforcement Learning Framework for Robotic Manipulator Disturbance Compensation |
| [2609.21226](https://arxiv.org/abs/2609.21226) | irrelevant | irrelevant (0.25) | core (0.85) | AirSplan: Risk-Aware Motion Planning for Quadrotors in Cluttered 3D Gaussian Splats |
| [2609.21221](https://arxiv.org/abs/2609.21221) | irrelevant | adjacent (0.86) | core (0.83) | A Fully Differentiable Neuro-Soft-Symbolic Framework for Perceptual Task Planning |
| [2609.21219](https://arxiv.org/abs/2609.21219) | irrelevant | irrelevant (0.28) | adjacent (0.83) | Multi-viewpoint Geo-localization with Event Cameras |
| [2609.21212](https://arxiv.org/abs/2609.21212) | adjacent | adjacent (0.46) | core (0.93) | Visual Navigation Transformer with Pose Attention |
| [2609.21207](https://arxiv.org/abs/2609.21207) | irrelevant | adjacent (0.29) | core (0.84) | Hand-Aware Transition Modeling for Bimanual Procedural Anomaly Detection |
| [2609.21186](https://arxiv.org/abs/2609.21186) | irrelevant | irrelevant (0.74) | core (0.75) | Robust Structureless Monocular Visual Inertial Initialization Exploiting Line Features and Vanishing Points |
| [2609.21176](https://arxiv.org/abs/2609.21176) | irrelevant | irrelevant (0.65) | core (0.8) | 4DGS-Fixer: Generative Sparse-View 4D Gaussian Splatting with Iterative Refinement Guided by Video Diffusion Priors |
| [2609.21167](https://arxiv.org/abs/2609.21167) | irrelevant | irrelevant (0.69) | core (0.9) | MA-LIPP: Cooperative Multi-Agent Load-Aware Informative Path Planning for Heterogeneous Robot Teams |
| [2609.21138](https://arxiv.org/abs/2609.21138) | irrelevant | adjacent (0.69) | core (0.9) | Diverse and Adaptable Arm Coordination for Octopus-Crawling via Diffusion-Based Uncertainty-Aware Optimization |
| [2609.21130](https://arxiv.org/abs/2609.21130) | irrelevant | adjacent (0.62) | core (0.95) | SAGE: Safety-Aligned Gradient Enforcement for Human--Robot Collaboration |
| [2609.21123](https://arxiv.org/abs/2609.21123) | irrelevant | irrelevant (0.88) | adjacent (0.62) | Signal-Centric Remote Sensing via Alternative Preprocessing and Acoustic Processing for ML-Driven Applications |
| [2609.21114](https://arxiv.org/abs/2609.21114) | irrelevant | irrelevant (0.58) | core (0.88) | Noctif3R: Feed-Forward Monocular Real-Time SLAM for Photon-Limited Scenes on Embedded Hardware |
| [2609.21109](https://arxiv.org/abs/2609.21109) | irrelevant | irrelevant (0.69) | core (0.8) | Talk to Me, Jarvis: An Open-Source Edge-Deployable Voice Assistant Framework for Autonomous Racecars |
| [2609.21108](https://arxiv.org/abs/2609.21108) | irrelevant | irrelevant (0.74) | adjacent (0.72) | REFINEPPO: Learning Continuous Control Policies by Iterative Action Refinement |
| [2609.21107](https://arxiv.org/abs/2609.21107) | adjacent | adjacent (0.3) | core (0.9) | Learning Scene-Aware Humanoid Locomotion through 3D Clutter from Immersive Human Demonstrations |
| [2609.21100](https://arxiv.org/abs/2609.21100) | irrelevant | adjacent (0.6) | core (0.85) | Dynamics-Induced Commitment in Learning-Based Robotic Penalty Kicks |
| [2609.21099](https://arxiv.org/abs/2609.21099) | irrelevant | irrelevant (0.89) | adjacent (0.78) | Dynamic Modeling and LQR Control of a Single Coaxial Drone with 2DOF Thrust Vectoring Mechanism |
| [2609.21082](https://arxiv.org/abs/2609.21082) | irrelevant | irrelevant (0.51) | adjacent (0.85) | Design of Adaptive PID Controller Based On Asynchronous Advantage Actor Critic Learning Method for QuadCopter Control |
| [2609.21053](https://arxiv.org/abs/2609.21053) | irrelevant | irrelevant (0.56) | adjacent (0.8) | Square Root Gauss-Newton iLQR |
| [2609.21046](https://arxiv.org/abs/2609.21046) | irrelevant | irrelevant (0.86) | core (0.89) | Constraint-Unified MPC for Over-Actuated Surface Vehicles with Post-Detection Fault Reconfiguration |
| [2609.21015](https://arxiv.org/abs/2609.21015) | irrelevant | irrelevant (0.87) | core (0.9) | Towards Effective Visual-Inertial SLAM with Passive-Only Sensors for Low-Cost Autonomous Underwater Vehicles |
| [2609.21005](https://arxiv.org/abs/2609.21005) | irrelevant | irrelevant (0.63) | core (0.85) | Project SCOUT: Interceptor Drone for Perimeter Defense |
| [2609.21000](https://arxiv.org/abs/2609.21000) | irrelevant | irrelevant (0.81) | core (0.8) | Do Spinning Radar Doppler Velocity Measurements Improve Vehicle Detection and Tracking? |
| [2609.20983](https://arxiv.org/abs/2609.20983) | adjacent | adjacent (0.78) | core (0.88) | PIVOT: Physically Informed Vision-Language Off-Road Traversability for Field Robot Navigation |
| [2609.20970](https://arxiv.org/abs/2609.20970) | adjacent | adjacent (0.69) | core (0.85) | Shake to Learn: Dynamic Interrogation of Hidden Object Physics for Robotic Manipulation with Physical Reservoir Computing |
| [2609.20954](https://arxiv.org/abs/2609.20954) | irrelevant | irrelevant (0.64) | adjacent (0.8) | Efficient Bayes-Adaptive Reinforcement Learning with Temporal Logic Specifications |
| [2609.20822](https://arxiv.org/abs/2609.20822) | adjacent | adjacent (0.52) | core (0.86) | Coding Agents with an Obstacle-Aware Harness for Safe Robot Manipulation |
| [2609.20820](https://arxiv.org/abs/2609.20820) | adjacent | adjacent (0.25) | core (0.85) | Workspace Models: Lightweight Robotic Memory via Saliency-Driven Supervision |
| [2609.20819](https://arxiv.org/abs/2609.20819) | core | adjacent (0.63) | core (0.92) | Can 4D Foundation Models Remember? |
| [2609.20818](https://arxiv.org/abs/2609.20818) | irrelevant | adjacent (0.31) | core (0.8) | SplashSplat: Reconstructing Splashing Liquids from Real-World Multi-View Videos |
| [2609.20817](https://arxiv.org/abs/2609.20817) | irrelevant | adjacent (0.46) | core (0.8) | FAMOS: Feed-Forward 3D Articulation Modeling from Sparse Observations |
| [2609.20794](https://arxiv.org/abs/2609.20794) | irrelevant | irrelevant (0.46) | adjacent (0.86) | PosteriorBench: From Point Estimates to Posterior Matching in Evaluating Generative Inverse Solvers |
| [2609.20791](https://arxiv.org/abs/2609.20791) | adjacent | adjacent (0.54) | core (0.9) | StageGuard: Learning Stage Transitions for Long-Horizon Robot Tasks via Agentic Distillation |
| [2609.20731](https://arxiv.org/abs/2609.20731) | irrelevant | irrelevant (0.54) | core (0.88) | Underwater Visual Target Tracking with Target-Specific Depth Estimation and Adaptive Model-Fusion Predictive Control |
| [2609.20694](https://arxiv.org/abs/2609.20694) | irrelevant | irrelevant (0.54) | core (0.86) | HOPHY: A Hierarchical Hypergraph Representation for Off-Road Path and Mission Planning |
| [2609.20691](https://arxiv.org/abs/2609.20691) | irrelevant | irrelevant (0.88) | adjacent (0.8) | Custom PX4 firmware for autonomous hybrid aerial-marine missions |
| [2609.20680](https://arxiv.org/abs/2609.20680) | core | adjacent (0.46) | core (0.85) | Towards Scaling Marine Perception with Synthetic Data |
| [2609.20673](https://arxiv.org/abs/2609.20673) | adjacent | adjacent (0.8) | core (0.86) | FunArt: Decoding Functional Structure and Articulation from Generative 3D Latents |
| [2609.20629](https://arxiv.org/abs/2609.20629) | adjacent | adjacent (0.7) | core (0.83) | RTK-Vision PPO for Autonomous Micro UAV Recovery on an Airborne Carrier |
| [2609.20624](https://arxiv.org/abs/2609.20624) | adjacent | adjacent (0.62) | core (0.88) | SmellDiffusion: Diffusion-Based Quadruped Navigation with Olfactory Scene Graphs |
| [2609.20615](https://arxiv.org/abs/2609.20615) | irrelevant | adjacent (0.71) | core (0.9) | INSPECT: Learning Robot View Selection from Assistant Use |
| [2609.20598](https://arxiv.org/abs/2609.20598) | irrelevant | irrelevant (0.82) | adjacent (0.7) | COIN-GP: Cooperative Online Learning in Networked Distributed Systems with Partial Measurements via Gaussian Process Regression |
| [2609.20589](https://arxiv.org/abs/2609.20589) | irrelevant | irrelevant (0.85) | core (0.88) | RawSLAM: Online HDR Gaussian SLAM from Linear Radiance |
| [2609.20586](https://arxiv.org/abs/2609.20586) | adjacent | adjacent (0.67) | core (0.85) | CoRef-GS: Cooperative Referring Gaussian Splatting for Multi-Agent Scene Understanding |
| [2609.20570](https://arxiv.org/abs/2609.20570) | irrelevant | irrelevant (0.76) | adjacent (0.92) | Walking on the Slope: Stable Bipedal Gaits with Genetic-Algorithm-Optimized Trajectories |
| [2609.20566](https://arxiv.org/abs/2609.20566) | adjacent | adjacent (0.52) | core (0.9) | OmniMimic: Dynamics-completed Motion Augmentation for Multi-style Omnidirectional Quadruped Locomotion |
| [2609.20558](https://arxiv.org/abs/2609.20558) | adjacent | adjacent (0.63) | core (0.86) | Learning Slope-Adaptive Whole-Body Locomotion for Humanoid Robots in Roofing Construction |
| [2609.20540](https://arxiv.org/abs/2609.20540) | irrelevant | irrelevant (0.91) | core (0.9) | Integrated Guidance and Control of a Mother-Child UAV-UGV System for Cooperative Missions |
| [2609.20499](https://arxiv.org/abs/2609.20499) | irrelevant | irrelevant (0.35) | core (0.78) | Towards AI-enhanced control: a numerical technique for trajectory smoothing of a parallel robot for pancreatic surgery |
| [2609.20443](https://arxiv.org/abs/2609.20443) | adjacent | adjacent (0.57) | core (0.92) | Spatial-Semantic Uncertainty in VLM-Based Target Search: Balancing Exploration and Identification |
| [2609.20435](https://arxiv.org/abs/2609.20435) | irrelevant | irrelevant (0.73) | core (0.85) | Time-Efficient Iterative Learning Planning for Safety-Critical Dynamic Obstacle Avoidance |
| [2609.20414](https://arxiv.org/abs/2609.20414) | adjacent | adjacent (0.33) | core (0.9) | TouchSight: Bare-Handed Tactile Prediction from Egocentric Video via Generative Visual Augmentation |
| [2609.20407](https://arxiv.org/abs/2609.20407) | irrelevant | irrelevant (0.71) | core (0.8) | Resilient Motion Planning for Free-Flying Space Robots under Actuator Failures |
| [2609.20388](https://arxiv.org/abs/2609.20388) | adjacent | adjacent (0.29) | core (0.88) | Navi-Agent: Unlocalized Monocular Navigation Agent |
| [2609.20348](https://arxiv.org/abs/2609.20348) | irrelevant | irrelevant (0.5) | core (0.82) | EliGSiR: Continual RGB-D Mapping with Gaussian Splatting under Bounded Compute |
| [2609.20330](https://arxiv.org/abs/2609.20330) | adjacent | adjacent (0.58) | core (0.85) | RoboFind: Multi-Agent Personalized Object Search for People Who Are Blind or Have Low Vision |
| [2609.20116](https://arxiv.org/abs/2609.20116) | adjacent | adjacent (0.42) | core (0.85) | How Far Can GPT-6-Astra Go? Evaluating Capabilities in Zero-Shot Vision-and-Language Navigation |
| [2609.20114](https://arxiv.org/abs/2609.20114) | adjacent | adjacent (0.74) | core (0.86) | Universal Navigation Interface: Robot-Free Data for Wheeled Robot Navigation |
| [2609.20106](https://arxiv.org/abs/2609.20106) | adjacent | adjacent (0.77) | core (0.85) | AnyviewMeter: Adapting Robotic Reward Models with Camera Geometry and Multi-View Attention |
| [2609.20078](https://arxiv.org/abs/2609.20078) | adjacent | adjacent (0.58) | core (0.9) | FlipToSee: A Probabilistic Stable Placement Prior for Active Visual Exploration via Regrasping |
| [2609.20048](https://arxiv.org/abs/2609.20048) | irrelevant | irrelevant (0.25) | core (0.7) | Mechanical Precision Weeding with a Quadruped Robot |
| [2609.20035](https://arxiv.org/abs/2609.20035) | irrelevant | irrelevant (0.46) | core (0.8) | DR-MPC: Fast and Feasible Dynamics-Relaxed Model-Predictive Control for Legged Locomotion |
| [2609.20012](https://arxiv.org/abs/2609.20012) | irrelevant | irrelevant (0.83) | adjacent (0.8) | GRF-Recon: Global Ray-Field Optimization for Long-Sequence Feed-forward Reconstruction |
| [2609.19974](https://arxiv.org/abs/2609.19974) | adjacent | adjacent (0.58) | core (0.87) | MaskHarness-WAM: Instance-Grounded Harnessing for Long-Horizon Robot Manipulation |
| [2609.19973](https://arxiv.org/abs/2609.19973) | irrelevant | irrelevant (0.35) | core (0.85) | An Event Preserving Velocity Invariant Representation for Event Cameras |
| [2609.19962](https://arxiv.org/abs/2609.19962) | adjacent | adjacent (0.68) | core (0.86) | Hybrid Residual Reinforcement Learning for Contact-Rich Robotic Book Insertion |
| [2609.19961](https://arxiv.org/abs/2609.19961) | irrelevant | adjacent (0.53) | core (0.8) | Neuro-Symbolic Agentic AI for Networked Low-Altitude UAVs |
| [2609.19954](https://arxiv.org/abs/2609.19954) | irrelevant | irrelevant (0.57) | adjacent (0.83) | LapaTrack-3D: 6 DoF pre-operative shape tracking for laparoscopic surgery |
| [2609.19946](https://arxiv.org/abs/2609.19946) | irrelevant | adjacent (0.59) | core (0.9) | Execution-Aware Pre-Execution Ranking for Grasp-Conditioned Robotic Placement |
| [2609.19912](https://arxiv.org/abs/2609.19912) | irrelevant | irrelevant (0.73) | core (0.78) | Distributed Model Predictive Control with Connectivity-based Contracts |
| [2609.19906](https://arxiv.org/abs/2609.19906) | adjacent | adjacent (0.71) | core (0.84) | Learning and Transferring Closed-Loop Robot Software |
| [2609.19903](https://arxiv.org/abs/2609.19903) | core | adjacent (0.56) | core (0.88) | REARL: A Closed-loop Autonomous Driving Simulation Enhancement Framework with Real Traffic Data and Large Language Models |
| [2609.19894](https://arxiv.org/abs/2609.19894) | adjacent | adjacent (0.79) | core (0.85) | Learning Reliable Parking Policies via Offline Reinforcement Learning with Quantized Action Representations |
| [2609.19876](https://arxiv.org/abs/2609.19876) | irrelevant | irrelevant (0.61) | core (0.78) | SlugTrails: An Egocentric Benchmark for Floor Plan Localization in Large Buildings |
| [2609.19850](https://arxiv.org/abs/2609.19850) | irrelevant | adjacent (0.68) | core (0.75) | GR2PO: Group Relative Return Policy Optimization for Continuous Robot Control |
| [2609.19817](https://arxiv.org/abs/2609.19817) | adjacent | adjacent (0.5) | core (0.9) | RotateIt! Fast and Reliable Single-Arm Garment Unfolding via Online-Adaptive Dynamic Rotation |
| [2609.19803](https://arxiv.org/abs/2609.19803) | irrelevant | adjacent (0.58) | core (0.86) | HEROIC: Heterogeneous Evidential Reasoning for Open-Vocabulary Identification and Cross-Robot Collaboration |
| [2609.19768](https://arxiv.org/abs/2609.19768) | irrelevant | irrelevant (0.66) | core (0.86) | OceanMoE: Structured Conditional Sparse Computation for Long-Horizon Multivariate Ocean Forecasting |
| [2609.19742](https://arxiv.org/abs/2609.19742) | irrelevant | irrelevant (0.84) | core (0.8) | Equivariant Filter Design for Acoustic and Depth Aided Inertial Navigation Systems |
| [2609.19726](https://arxiv.org/abs/2609.19726) | irrelevant | irrelevant (0.73) | core (0.85) | Decoupling Physical Speed from Path Parameterization in Singularity-Free Guiding Vector Fields |
| [2609.19690](https://arxiv.org/abs/2609.19690) | adjacent | adjacent (0.7) | core (0.85) | UniExo: Unified Multi-Skill Policies for Musculoskeletal Locomotion and Co-Adaptive Exoskeleton Control |
| [2609.19665](https://arxiv.org/abs/2609.19665) | adjacent | adjacent (0.5) | core (0.92) | Runtime Safety Filtering for Two-Terminal Hazards in Robotic Battery Recycling |
| [2609.19647](https://arxiv.org/abs/2609.19647) | irrelevant | irrelevant (0.66) | core (0.85) | Well-posedness of neural turbulence closures and tangent dissipation |
| [2609.19636](https://arxiv.org/abs/2609.19636) | irrelevant | irrelevant (0.68) | adjacent (0.7) | Reach or Solve? Attributing Agentic RL Gains with Checkpoint Handoffs |
| [2609.19628](https://arxiv.org/abs/2609.19628) | irrelevant | irrelevant (0.85) | core (0.9) | VGGT-GS SLAM: Uncalibrated Monocular Gaussian Splatting SLAM with Feed-Forward Priors |
| [2609.19610](https://arxiv.org/abs/2609.19610) | adjacent | adjacent (0.38) | core (0.83) | SIMLIFE: Pattern Understanding for Long-Horizon Human-Agent Partnership |
| [2609.19662](https://arxiv.org/abs/2609.19662) | adjacent | adjacent (0.39) | core (0.78) | Towards Active Cross-View Object Geo-Localization |
| [2609.19793](https://arxiv.org/abs/2609.19793) | adjacent | adjacent (0.74) | core (0.9) | AI Smart Glasses for Wearable Intelligence: From Egocentric Sensing to Agentic Personalization |
| [2609.19802](https://arxiv.org/abs/2609.19802) | adjacent | adjacent (0.31) | core (0.8) | Affective Shared Autonomy: Temporal Affect Dynamics and Subjective Evaluation in Bimanual Teleoperation Tasks |
| [2609.19813](https://arxiv.org/abs/2609.19813) | adjacent | adjacent (0.44) | core (0.88) | Vehicle Trajectory Prediction via Neural Fusion of Multiple EKF-Based Trajectory Candidates |
| [2609.19815](https://arxiv.org/abs/2609.19815) | adjacent | adjacent (0.8) | core (0.88) | SnapPhysics: A Physics-Aware Scene Graph from a Single View for Interactive Mixed Reality Scenes |
| [2609.19911](https://arxiv.org/abs/2609.19911) | adjacent | adjacent (0.59) | core (0.86) | CitySTAR: Structured and Topology-Aware Reasoning for Open-Vocabulary Urban 3D Grounding |
| [2609.20103](https://arxiv.org/abs/2609.20103) | adjacent | adjacent (0.47) | core (0.9) | Safety-Critical Scenarios Emerge from Initial Scenes |
| [2609.20437](https://arxiv.org/abs/2609.20437) | adjacent | adjacent (0.74) | core (0.84) | A Mathematical Model of Motivated Emotional Mind - Cognitive Embodied System |
| [2609.20451](https://arxiv.org/abs/2609.20451) | adjacent | adjacent (0.47) | core (0.9) | Seismic Site Response Prediction from Sparse Observations Using Finite-Element-Pretrained Latent Dynamics |
| [2609.20475](https://arxiv.org/abs/2609.20475) | adjacent | adjacent (0.6) | core (0.9) | SenseFuse: Label-Free Fusion of Image and Shape Encoders for Open-Vocabulary 3D Instance Segmentation |
| [2609.20480](https://arxiv.org/abs/2609.20480) | adjacent | adjacent (0.25) | core (0.8) | Worst-Case Hidden-Vehicle Trajectory Search in Spatiotemporal Occlusion Regions |
| [2609.20604](https://arxiv.org/abs/2609.20604) | adjacent | adjacent (0.76) | core (0.87) | Semantic SLAM in Precision Agriculture using Bayesian Inference |
| [2609.20605](https://arxiv.org/abs/2609.20605) | adjacent | adjacent (0.53) | core (0.85) | Bayesian Continuum Robot Dynamics and State Estimation |
| [2609.20620](https://arxiv.org/abs/2609.20620) | adjacent | adjacent (0.53) | core (0.89) | A Simulation Platform for AUV Fault Recovery: Exploring LLM-Based Diagnostic Strategies |
| [2609.20814](https://arxiv.org/abs/2609.20814) | adjacent | adjacent (0.25) | core (0.9) | How Does Distribution Shift Shape Pretraining Gains in Neural PDE Surrogates? |
| [2609.20982](https://arxiv.org/abs/2609.20982) | adjacent | adjacent (0.41) | core (0.8) | ASGARD: Action-Space Guard for UAV Resilience via Reinforcement Learning |
| [2609.21008](https://arxiv.org/abs/2609.21008) | adjacent | adjacent (0.71) | core (0.9) | SPARROW: Survival-POMCP for Adaptive Robot Routing, Observation, and Waiting |
| [2609.21185](https://arxiv.org/abs/2609.21185) | adjacent | adjacent (0.61) | core (0.93) | When to Waddle: A Comparative Study of Bipedal Torso-Stabilization on Low-Friction Surfaces |
| [2609.21211](https://arxiv.org/abs/2609.21211) | adjacent | adjacent (0.54) | core (0.9) | Stochastic Neural Signed Swept Volume for Real-time Chance-Constrained Trajectory Optimization |
| [2609.21275](https://arxiv.org/abs/2609.21275) | adjacent | adjacent (0.56) | core (0.87) | LOInK: Learned Optimal Inverse Kinematics via Structured Neural Surrogate Models |
| [2609.21455](https://arxiv.org/abs/2609.21455) | adjacent | adjacent (0.58) | core (0.85) | CompAdapt: Adaptable Composite Motion Modeling for Physics-Consistent Text-to-Video Generation |
| [2609.21493](https://arxiv.org/abs/2609.21493) | adjacent | adjacent (0.73) | core (0.9) | PolyBridgeBench: Benchmarking Multimodal LLMs for Physics-Grounded Bridge Design |
| [2609.21828](https://arxiv.org/abs/2609.21828) | adjacent | adjacent (0.66) | core (0.88) | Touvigation: Embodied Adaptive Object Acquisition for Blind and Low-Vision Users in Unfamiliar Indoor Environments |
| [2609.21945](https://arxiv.org/abs/2609.21945) | adjacent | adjacent (0.49) | core (0.9) | Learning to Move Cities: Deep Meta-Models and Reinforcement Policies for Calibration and Control in Urban Networks |
| [2609.22062](https://arxiv.org/abs/2609.22062) | adjacent | adjacent (0.51) | core (0.9) | Gripper-Aware Automatic Dense Packing of Irregular Objects |
| [2609.22073](https://arxiv.org/abs/2609.22073) | adjacent | adjacent (0.26) | core (0.85) | Duty Factor Predicts Robust Constrained Quadrupedal Locomotion Across Gait Types |
| [2609.19867](https://arxiv.org/abs/2609.19867) | irrelevant | irrelevant (0.84) | adjacent (0.8) | Socialized UAV Cross-Task Learning: Towards Cross-Granularity Collaboration through Hierarchical Interaction |
| [2609.19990](https://arxiv.org/abs/2609.19990) | irrelevant | irrelevant (0.99) | adjacent (0.84) | QCPruner: Query-Conditioned Population Coverage for Visual Token Pruning |
| [2609.20510](https://arxiv.org/abs/2609.20510) | irrelevant | irrelevant (0.61) | adjacent (0.8) | Truncated automatic sparse differentiation for machine learning interatomic potentials |
| [2609.21363](https://arxiv.org/abs/2609.21363) | irrelevant | irrelevant (0.99) | adjacent (0.75) | Hiding in Plain Sight: A Diffusion-based Mitigation of Geolocation Privacy Leakage in Vision-Language Models |
| [2609.21521](https://arxiv.org/abs/2609.21521) | irrelevant | irrelevant (0.99) | adjacent (0.79) | VidOmni-Bench: A Benchmark for Fine-Grained Video Understanding via Spatio-Temporal Event Verification across Complexity and Duration |

## jev:jev-1.13.0 vs openai:gpt-5-nano: label disagreements (166)

| id | gold | Jev | other | title |
|---|---|---|---|---|
| [2609.22075](https://arxiv.org/abs/2609.22075) | adjacent | adjacent (0.7) | core (0.65) | LIMBO: Learning and Internalizing Model-Free Barrier Objectives for Agile and Safe Whole-Body Control |
| [2609.22083](https://arxiv.org/abs/2609.22083) | irrelevant | irrelevant (0.6) | adjacent (0.55) | MintAct: A Unified Visual Agent for Digital Environments |
| [2609.22060](https://arxiv.org/abs/2609.22060) | irrelevant | irrelevant (0.73) | core (0.6) | Traffic Sign Recognition for Autonomous Driving Using Branched YOLOv2 and Geometric Features |
| [2609.21982](https://arxiv.org/abs/2609.21982) | adjacent | adjacent (0.48) | core (0.7) | CARF: Contrastive Attraction-Repulsion of Failure-Guided Flow Matching |
| [2609.21942](https://arxiv.org/abs/2609.21942) | adjacent | adjacent (0.68) | core (0.72) | When Should a Failing Robot Ask? Initiating Corrective Human-Robot Dialogue from Audited Sensor Evidence |
| [2609.21938](https://arxiv.org/abs/2609.21938) | irrelevant | irrelevant (0.35) | core (0.65) | Info3R: Information-Adaptive Test-Time Training for 3D Reconstruction |
| [2609.21929](https://arxiv.org/abs/2609.21929) | adjacent | adjacent (0.4) | core (0.88) | MAAP: Multi-Agent Active Perception for Collaborative Manipulation |
| [2609.21906](https://arxiv.org/abs/2609.21906) | irrelevant | irrelevant (0.52) | core (0.82) | Intervention Granularity Matters: Coherent Treatment Bundles in Counterfactual Simulation with Clinical World Models |
| [2609.21883](https://arxiv.org/abs/2609.21883) | irrelevant | adjacent (0.31) | core (0.72) | VIRGA: Virtual-Agent-Intermediated Riemannian Geometry for Active-Sensing Air-Ground Coordination |
| [2609.21872](https://arxiv.org/abs/2609.21872) | irrelevant | irrelevant (0.83) | adjacent (0.62) | Chronosphere: Space-Time Tessellation of Local Climate Experts |
| [2609.21838](https://arxiv.org/abs/2609.21838) | adjacent | adjacent (0.65) | core (0.88) | PopNavShift: Stress-Testing Social Navigation under Behavioral Population Shift |
| [2609.21804](https://arxiv.org/abs/2609.21804) | irrelevant | irrelevant (0.59) | adjacent (0.6) | VideoReloc: Long-Term Indoor Video Relocalization against a Kilobyte-Scale Semantic Scene Graph |
| [2609.21803](https://arxiv.org/abs/2609.21803) | irrelevant | irrelevant (0.7) | core (0.75) | Contact-Rich Motion Planning via GPU-Parallel Mode Evaluation |
| [2609.21788](https://arxiv.org/abs/2609.21788) | core | adjacent (0.32) | core (0.68) | From Pretraining to Proficiency: Real-World Subtask RL for Long-Horizon Manipulation with Minimal Human Intervention |
| [2609.21792](https://arxiv.org/abs/2609.21792) | adjacent | adjacent (0.68) | core (0.72) | AcousticDiffusion: Semantically Conditioned Audio-Guided Diffusion Policy for Search-and-Rescue Assistance |
| [2609.21780](https://arxiv.org/abs/2609.21780) | irrelevant | irrelevant (0.76) | core (0.75) | PointLAM: Local Attentive Mamba for Efficient Point-based 3D Object Detection |
| [2609.21777](https://arxiv.org/abs/2609.21777) | irrelevant | irrelevant (0.63) | adjacent (0.55) | TRACE: Coverage Path Planning for Unknown Environments Using Hierarchical Coverage Tree |
| [2609.21770](https://arxiv.org/abs/2609.21770) | irrelevant | irrelevant (0.56) | adjacent (0.65) | XCalib Depth-Guided Geometric Optimization for Dense Thermal-Visible Video Registration |
| [2609.21767](https://arxiv.org/abs/2609.21767) | adjacent | adjacent (0.29) | core (0.66) | Scaling Vision-Language Reward Learning for Robot Manipulation in Parallel Simulation |
| [2609.21754](https://arxiv.org/abs/2609.21754) | irrelevant | irrelevant (0.7) | adjacent (0.65) | SFVO: Decoupled Confidence-Guided Stereo-Flow Visual Odometry with Bidirectional PnP |
| [2609.21748](https://arxiv.org/abs/2609.21748) | adjacent | adjacent (0.61) | core (0.8) | World Modeling in Transformers |
| [2609.21735](https://arxiv.org/abs/2609.21735) | irrelevant | irrelevant (0.67) | adjacent (0.62) | GEM-MPC: Balancing Exploration and Exploitation through Expert-Guided Planning |
| [2609.21734](https://arxiv.org/abs/2609.21734) | irrelevant | irrelevant (0.65) | adjacent (0.65) | When Should Robots Intervene? Balancing Engagement and Intrusiveness in Human-Robot Interaction |
| [2609.21726](https://arxiv.org/abs/2609.21726) | adjacent | adjacent (0.3) | core (0.65) | ZeroTouch: Tactile-Supervised Visual Contact Estimation for Contact-Rich Manipulation |
| [2609.21718](https://arxiv.org/abs/2609.21718) | irrelevant | irrelevant (0.74) | core (0.72) | A Novel Path-Tracking Algorithm for Automated Tractor-Trailer Forward and Backward Maneuvers |
| [2609.21716](https://arxiv.org/abs/2609.21716) | adjacent | adjacent (0.75) | core (0.72) | AgenticSwarm: Semantic Perception and Adaptive Task Allocation for Heterogeneous Multi-UAV Missions |
| [2609.21707](https://arxiv.org/abs/2609.21707) | adjacent | adjacent (0.6) | core (0.8) | NeuRIO: A Streaming Neural Estimator for Zero-Shot Sim-to-Real Multi-Robot Relative Inertial Odometry |
| [2609.21690](https://arxiv.org/abs/2609.21690) | adjacent | adjacent (0.74) | core (0.86) | RAYA: Learning Where and When to Intervene for Robot Recovery |
| [2609.21621](https://arxiv.org/abs/2609.21621) | adjacent | adjacent (0.38) | core (0.72) | Towards Fine-Grained Object Manipulation: SAM3-Guided Visuomotor Policy with Persistent Memory Learning and Focused Visual Conditioning |
| [2609.21617](https://arxiv.org/abs/2609.21617) | adjacent | adjacent (0.55) | core (0.7) | CounterPlay: Counterfactual Post-Training for Self-Play Driving Policies |
| [2609.21609](https://arxiv.org/abs/2609.21609) | adjacent | adjacent (0.77) | core (0.66) | Potential-Field Action Representation for Reinforcement Learning in Contact-Rich Manipulation |
| [2609.21597](https://arxiv.org/abs/2609.21597) | irrelevant | irrelevant (0.64) | core (0.72) | HAT: Hypothesis-Anchored Tracking for Video Monocular Spacecraft Pose Estimation |
| [2609.21590](https://arxiv.org/abs/2609.21590) | irrelevant | irrelevant (0.59) | adjacent (0.65) | Periodic Neural Mapping for Unsteady Rotor-Blade Pressure and Aeroelastic Load Prediction |
| [2609.21580](https://arxiv.org/abs/2609.21580) | irrelevant | irrelevant (0.81) | core (0.66) | Tilt as a Certified Resource: Preserving Motor Wrench-Rate Authority on Articulated Multirotors |
| [2609.21572](https://arxiv.org/abs/2609.21572) | adjacent | adjacent (0.32) | core (0.72) | SABER: Learning Attention-based Semantic Affordance for Legged Locomotion |
| [2609.21516](https://arxiv.org/abs/2609.21516) | irrelevant | irrelevant (0.39) | adjacent (0.58) | 2D GauSS-MI: Efficient Active Scene Reconstruction with Balanced Visual and Geometric Quality |
| [2609.21511](https://arxiv.org/abs/2609.21511) | adjacent | adjacent (0.55) | core (0.62) | 2nd Place Solution to the HANDS 2026 Workshop Challenge-Dexterous Grasp Motion Track: Single-Shot Trajectory Warping for Grasp Motion Generation |
| [2609.21504](https://arxiv.org/abs/2609.21504) | adjacent | adjacent (0.45) | core (0.65) | DPed-VLN: A Benchmark for Socially Compliant Vision-and-Language Navigation in Dynamic Pedestrian Environments |
| [2609.21502](https://arxiv.org/abs/2609.21502) | core | adjacent (0.73) | core (0.82) | Adaptive World Memory 3D Foundation Model for Scalable 3D Mapping, Localization, and Rendering |
| [2609.21486](https://arxiv.org/abs/2609.21486) | adjacent | adjacent (0.6) | core (0.78) | Driving on Registers, Reasoning on Risk: Risk-Aware Occupancy for Register-Based End-to-End Autonomous Driving |
| [2609.21470](https://arxiv.org/abs/2609.21470) | adjacent | adjacent (0.41) | core (0.72) | Risk-Aware Occupancy for Safety-Oriented End-to-End Autonomous Driving |
| [2609.21447](https://arxiv.org/abs/2609.21447) | adjacent | adjacent (0.34) | core (0.78) | FootQuery: Future-Touchdown-Guided Retrieval from Depth History for Perceptive Humanoid Locomotion |
| [2609.21437](https://arxiv.org/abs/2609.21437) | irrelevant | irrelevant (0.64) | adjacent (0.6) | Think Locally, Refine Globally for Memory-Efficient 3D Reconstruction |
| [2609.21416](https://arxiv.org/abs/2609.21416) | irrelevant | irrelevant (0.85) | core (0.62) | A Unified Dynamic Force Guidance Framework for Performance-Optimized Kinesthetic Teaching |
| [2609.21402](https://arxiv.org/abs/2609.21402) | irrelevant | irrelevant (0.57) | adjacent (0.58) | SIRA: Reasoning-Aware Surgical Instrument Segmentation via Query-Anchored Alignment |
| [2609.21400](https://arxiv.org/abs/2609.21400) | adjacent | adjacent (0.79) | core (0.72) | A Scene Language Model for Open-Vocabulary Scene Mapping |
| [2609.21379](https://arxiv.org/abs/2609.21379) | core | adjacent (0.38) | core (0.84) | JEPA Guided Diffusion: Predictive Vision-Language Conditioning for Generative Traffic Forecasting |
| [2609.21377](https://arxiv.org/abs/2609.21377) | adjacent | adjacent (0.62) | core (0.75) | AVT-Fabric: Active Visuo-Tactile Perception via Adaptive Evidence Selection for Efficient Robotic Fabric Comparison |
| [2609.21365](https://arxiv.org/abs/2609.21365) | adjacent | adjacent (0.65) | core (0.88) | MicroHookACT: Monocular Microscopic Vision Guided Visuomotor Policy for Flexible Microelectrode Hooking |
| [2609.21347](https://arxiv.org/abs/2609.21347) | irrelevant | irrelevant (0.59) | adjacent (0.68) | Cube-Splat: High-Fidelity 360° Gaussian Splatting SLAM via Cubemap Factorization and Adjoint-Consistent Optimization |
| [2609.21323](https://arxiv.org/abs/2609.21323) | irrelevant | irrelevant (0.41) | adjacent (0.65) | VeriFuse: Bounded Vision-Language Arbitration and Reason-Guided Refinement for Cooperative 3D Perception |
| [2609.21316](https://arxiv.org/abs/2609.21316) | adjacent | adjacent (0.62) | core (0.74) | NaViRrator: Robot Navigation from Human-Readable Maps through a Learned Visual Route |
| [2609.21226](https://arxiv.org/abs/2609.21226) | irrelevant | irrelevant (0.25) | adjacent (0.55) | AirSplan: Risk-Aware Motion Planning for Quadrotors in Cluttered 3D Gaussian Splats |
| [2609.21219](https://arxiv.org/abs/2609.21219) | irrelevant | irrelevant (0.28) | adjacent (0.6) | Multi-viewpoint Geo-localization with Event Cameras |
| [2609.21212](https://arxiv.org/abs/2609.21212) | adjacent | adjacent (0.46) | core (0.75) | Visual Navigation Transformer with Pose Attention |
| [2609.21186](https://arxiv.org/abs/2609.21186) | irrelevant | irrelevant (0.74) | adjacent (0.55) | Robust Structureless Monocular Visual Inertial Initialization Exploiting Line Features and Vanishing Points |
| [2609.21176](https://arxiv.org/abs/2609.21176) | irrelevant | irrelevant (0.65) | adjacent (0.6) | 4DGS-Fixer: Generative Sparse-View 4D Gaussian Splatting with Iterative Refinement Guided by Video Diffusion Priors |
| [2609.21167](https://arxiv.org/abs/2609.21167) | irrelevant | irrelevant (0.69) | core (0.75) | MA-LIPP: Cooperative Multi-Agent Load-Aware Informative Path Planning for Heterogeneous Robot Teams |
| [2609.21138](https://arxiv.org/abs/2609.21138) | irrelevant | adjacent (0.69) | core (0.78) | Diverse and Adaptable Arm Coordination for Octopus-Crawling via Diffusion-Based Uncertainty-Aware Optimization |
| [2609.21130](https://arxiv.org/abs/2609.21130) | irrelevant | adjacent (0.62) | core (0.65) | SAGE: Safety-Aligned Gradient Enforcement for Human--Robot Collaboration |
| [2609.21123](https://arxiv.org/abs/2609.21123) | irrelevant | irrelevant (0.88) | adjacent (0.42) | Signal-Centric Remote Sensing via Alternative Preprocessing and Acoustic Processing for ML-Driven Applications |
| [2609.21114](https://arxiv.org/abs/2609.21114) | irrelevant | irrelevant (0.58) | core (0.75) | Noctif3R: Feed-Forward Monocular Real-Time SLAM for Photon-Limited Scenes on Embedded Hardware |
| [2609.21109](https://arxiv.org/abs/2609.21109) | irrelevant | irrelevant (0.69) | adjacent (0.72) | Talk to Me, Jarvis: An Open-Source Edge-Deployable Voice Assistant Framework for Autonomous Racecars |
| [2609.21108](https://arxiv.org/abs/2609.21108) | irrelevant | irrelevant (0.74) | adjacent (0.58) | REFINEPPO: Learning Continuous Control Policies by Iterative Action Refinement |
| [2609.21107](https://arxiv.org/abs/2609.21107) | adjacent | adjacent (0.3) | core (0.62) | Learning Scene-Aware Humanoid Locomotion through 3D Clutter from Immersive Human Demonstrations |
| [2609.21100](https://arxiv.org/abs/2609.21100) | irrelevant | adjacent (0.6) | core (0.72) | Dynamics-Induced Commitment in Learning-Based Robotic Penalty Kicks |
| [2609.21099](https://arxiv.org/abs/2609.21099) | irrelevant | irrelevant (0.89) | adjacent (0.65) | Dynamic Modeling and LQR Control of a Single Coaxial Drone with 2DOF Thrust Vectoring Mechanism |
| [2609.21082](https://arxiv.org/abs/2609.21082) | irrelevant | irrelevant (0.51) | core (0.78) | Design of Adaptive PID Controller Based On Asynchronous Advantage Actor Critic Learning Method for QuadCopter Control |
| [2609.21053](https://arxiv.org/abs/2609.21053) | irrelevant | irrelevant (0.56) | adjacent (0.58) | Square Root Gauss-Newton iLQR |
| [2609.21046](https://arxiv.org/abs/2609.21046) | irrelevant | irrelevant (0.86) | core (0.62) | Constraint-Unified MPC for Over-Actuated Surface Vehicles with Post-Detection Fault Reconfiguration |
| [2609.21015](https://arxiv.org/abs/2609.21015) | irrelevant | irrelevant (0.87) | adjacent (0.56) | Towards Effective Visual-Inertial SLAM with Passive-Only Sensors for Low-Cost Autonomous Underwater Vehicles |
| [2609.21005](https://arxiv.org/abs/2609.21005) | irrelevant | irrelevant (0.63) | adjacent (0.65) | Project SCOUT: Interceptor Drone for Perimeter Defense |
| [2609.21000](https://arxiv.org/abs/2609.21000) | irrelevant | irrelevant (0.81) | core (0.72) | Do Spinning Radar Doppler Velocity Measurements Improve Vehicle Detection and Tracking? |
| [2609.20983](https://arxiv.org/abs/2609.20983) | adjacent | adjacent (0.78) | core (0.82) | PIVOT: Physically Informed Vision-Language Off-Road Traversability for Field Robot Navigation |
| [2609.20970](https://arxiv.org/abs/2609.20970) | adjacent | adjacent (0.69) | core (0.82) | Shake to Learn: Dynamic Interrogation of Hidden Object Physics for Robotic Manipulation with Physical Reservoir Computing |
| [2609.20954](https://arxiv.org/abs/2609.20954) | irrelevant | irrelevant (0.64) | adjacent (0.55) | Efficient Bayes-Adaptive Reinforcement Learning with Temporal Logic Specifications |
| [2609.20822](https://arxiv.org/abs/2609.20822) | adjacent | adjacent (0.52) | core (0.78) | Coding Agents with an Obstacle-Aware Harness for Safe Robot Manipulation |
| [2609.20820](https://arxiv.org/abs/2609.20820) | adjacent | adjacent (0.25) | core (0.65) | Workspace Models: Lightweight Robotic Memory via Saliency-Driven Supervision |
| [2609.20819](https://arxiv.org/abs/2609.20819) | core | adjacent (0.63) | core (0.72) | Can 4D Foundation Models Remember? |
| [2609.20791](https://arxiv.org/abs/2609.20791) | adjacent | adjacent (0.54) | core (0.75) | StageGuard: Learning Stage Transitions for Long-Horizon Robot Tasks via Agentic Distillation |
| [2609.20731](https://arxiv.org/abs/2609.20731) | irrelevant | irrelevant (0.54) | core (0.75) | Underwater Visual Target Tracking with Target-Specific Depth Estimation and Adaptive Model-Fusion Predictive Control |
| [2609.20694](https://arxiv.org/abs/2609.20694) | irrelevant | irrelevant (0.54) | core (0.68) | HOPHY: A Hierarchical Hypergraph Representation for Off-Road Path and Mission Planning |
| [2609.20691](https://arxiv.org/abs/2609.20691) | irrelevant | irrelevant (0.88) | adjacent (0.58) | Custom PX4 firmware for autonomous hybrid aerial-marine missions |
| [2609.20680](https://arxiv.org/abs/2609.20680) | core | adjacent (0.46) | core (0.72) | Towards Scaling Marine Perception with Synthetic Data |
| [2609.20673](https://arxiv.org/abs/2609.20673) | adjacent | adjacent (0.8) | core (0.78) | FunArt: Decoding Functional Structure and Articulation from Generative 3D Latents |
| [2609.20629](https://arxiv.org/abs/2609.20629) | adjacent | adjacent (0.7) | core (0.72) | RTK-Vision PPO for Autonomous Micro UAV Recovery on an Airborne Carrier |
| [2609.20624](https://arxiv.org/abs/2609.20624) | adjacent | adjacent (0.62) | core (0.75) | SmellDiffusion: Diffusion-Based Quadruped Navigation with Olfactory Scene Graphs |
| [2609.20615](https://arxiv.org/abs/2609.20615) | irrelevant | adjacent (0.71) | core (0.68) | INSPECT: Learning Robot View Selection from Assistant Use |
| [2609.20598](https://arxiv.org/abs/2609.20598) | irrelevant | irrelevant (0.82) | core (0.72) | COIN-GP: Cooperative Online Learning in Networked Distributed Systems with Partial Measurements via Gaussian Process Regression |
| [2609.20589](https://arxiv.org/abs/2609.20589) | irrelevant | irrelevant (0.85) | adjacent (0.58) | RawSLAM: Online HDR Gaussian SLAM from Linear Radiance |
| [2609.20570](https://arxiv.org/abs/2609.20570) | irrelevant | irrelevant (0.76) | core (0.74) | Walking on the Slope: Stable Bipedal Gaits with Genetic-Algorithm-Optimized Trajectories |
| [2609.20566](https://arxiv.org/abs/2609.20566) | adjacent | adjacent (0.52) | core (0.68) | OmniMimic: Dynamics-completed Motion Augmentation for Multi-style Omnidirectional Quadruped Locomotion |
| [2609.20558](https://arxiv.org/abs/2609.20558) | adjacent | adjacent (0.63) | core (0.85) | Learning Slope-Adaptive Whole-Body Locomotion for Humanoid Robots in Roofing Construction |
| [2609.20540](https://arxiv.org/abs/2609.20540) | irrelevant | irrelevant (0.91) | core (0.62) | Integrated Guidance and Control of a Mother-Child UAV-UGV System for Cooperative Missions |
| [2609.20499](https://arxiv.org/abs/2609.20499) | irrelevant | irrelevant (0.35) | adjacent (0.72) | Towards AI-enhanced control: a numerical technique for trajectory smoothing of a parallel robot for pancreatic surgery |
| [2609.20443](https://arxiv.org/abs/2609.20443) | adjacent | adjacent (0.57) | core (0.66) | Spatial-Semantic Uncertainty in VLM-Based Target Search: Balancing Exploration and Identification |
| [2609.20435](https://arxiv.org/abs/2609.20435) | irrelevant | irrelevant (0.73) | core (0.65) | Time-Efficient Iterative Learning Planning for Safety-Critical Dynamic Obstacle Avoidance |
| [2609.20414](https://arxiv.org/abs/2609.20414) | adjacent | adjacent (0.33) | core (0.72) | TouchSight: Bare-Handed Tactile Prediction from Egocentric Video via Generative Visual Augmentation |
| [2609.20407](https://arxiv.org/abs/2609.20407) | irrelevant | irrelevant (0.71) | adjacent (0.63) | Resilient Motion Planning for Free-Flying Space Robots under Actuator Failures |
| [2609.20388](https://arxiv.org/abs/2609.20388) | adjacent | adjacent (0.29) | core (0.74) | Navi-Agent: Unlocalized Monocular Navigation Agent |
| [2609.20348](https://arxiv.org/abs/2609.20348) | irrelevant | irrelevant (0.5) | adjacent (0.6) | EliGSiR: Continual RGB-D Mapping with Gaussian Splatting under Bounded Compute |
| [2609.20330](https://arxiv.org/abs/2609.20330) | adjacent | adjacent (0.58) | core (0.78) | RoboFind: Multi-Agent Personalized Object Search for People Who Are Blind or Have Low Vision |
| [2609.20116](https://arxiv.org/abs/2609.20116) | adjacent | adjacent (0.42) | core (0.65) | How Far Can GPT-6-Astra Go? Evaluating Capabilities in Zero-Shot Vision-and-Language Navigation |
| [2609.20078](https://arxiv.org/abs/2609.20078) | adjacent | adjacent (0.58) | core (0.78) | FlipToSee: A Probabilistic Stable Placement Prior for Active Visual Exploration via Regrasping |
| [2609.20048](https://arxiv.org/abs/2609.20048) | irrelevant | irrelevant (0.25) | core (0.72) | Mechanical Precision Weeding with a Quadruped Robot |
| [2609.20035](https://arxiv.org/abs/2609.20035) | irrelevant | irrelevant (0.46) | core (0.65) | DR-MPC: Fast and Feasible Dynamics-Relaxed Model-Predictive Control for Legged Locomotion |
| [2609.20012](https://arxiv.org/abs/2609.20012) | irrelevant | irrelevant (0.83) | adjacent (0.55) | GRF-Recon: Global Ray-Field Optimization for Long-Sequence Feed-forward Reconstruction |
| [2609.19996](https://arxiv.org/abs/2609.19996) | irrelevant | irrelevant (0.98) | adjacent (0.62) | Customizable and Jointly Optimized Route Planning: A Deep Architecture Enabling Differentiable Shortest-Path Search |
| [2609.19974](https://arxiv.org/abs/2609.19974) | adjacent | adjacent (0.58) | core (0.72) | MaskHarness-WAM: Instance-Grounded Harnessing for Long-Horizon Robot Manipulation |
| [2609.19973](https://arxiv.org/abs/2609.19973) | irrelevant | irrelevant (0.35) | adjacent (0.62) | An Event Preserving Velocity Invariant Representation for Event Cameras |
| [2609.19962](https://arxiv.org/abs/2609.19962) | adjacent | adjacent (0.68) | core (0.75) | Hybrid Residual Reinforcement Learning for Contact-Rich Robotic Book Insertion |
| [2609.19961](https://arxiv.org/abs/2609.19961) | irrelevant | adjacent (0.53) | core (0.72) | Neuro-Symbolic Agentic AI for Networked Low-Altitude UAVs |
| [2609.19954](https://arxiv.org/abs/2609.19954) | irrelevant | irrelevant (0.57) | adjacent (0.58) | LapaTrack-3D: 6 DoF pre-operative shape tracking for laparoscopic surgery |
| [2609.19946](https://arxiv.org/abs/2609.19946) | irrelevant | adjacent (0.59) | core (0.78) | Execution-Aware Pre-Execution Ranking for Grasp-Conditioned Robotic Placement |
| [2609.19912](https://arxiv.org/abs/2609.19912) | irrelevant | irrelevant (0.73) | adjacent (0.6) | Distributed Model Predictive Control with Connectivity-based Contracts |
| [2609.19894](https://arxiv.org/abs/2609.19894) | adjacent | adjacent (0.79) | core (0.72) | Learning Reliable Parking Policies via Offline Reinforcement Learning with Quantized Action Representations |
| [2609.19878](https://arxiv.org/abs/2609.19878) | adjacent | adjacent (0.57) | core (0.72) | Uni-LaDiR: Latent Diffusion Unifies Multimodal Reasoning |
| [2609.19876](https://arxiv.org/abs/2609.19876) | irrelevant | irrelevant (0.61) | adjacent (0.62) | SlugTrails: An Egocentric Benchmark for Floor Plan Localization in Large Buildings |
| [2609.19817](https://arxiv.org/abs/2609.19817) | adjacent | adjacent (0.5) | core (0.78) | RotateIt! Fast and Reliable Single-Arm Garment Unfolding via Online-Adaptive Dynamic Rotation |
| [2609.19768](https://arxiv.org/abs/2609.19768) | irrelevant | irrelevant (0.66) | adjacent (0.75) | OceanMoE: Structured Conditional Sparse Computation for Long-Horizon Multivariate Ocean Forecasting |
| [2609.19742](https://arxiv.org/abs/2609.19742) | irrelevant | irrelevant (0.84) | core (0.72) | Equivariant Filter Design for Acoustic and Depth Aided Inertial Navigation Systems |
| [2609.19726](https://arxiv.org/abs/2609.19726) | irrelevant | irrelevant (0.73) | adjacent (0.62) | Decoupling Physical Speed from Path Parameterization in Singularity-Free Guiding Vector Fields |
| [2609.19690](https://arxiv.org/abs/2609.19690) | adjacent | adjacent (0.7) | core (0.82) | UniExo: Unified Multi-Skill Policies for Musculoskeletal Locomotion and Co-Adaptive Exoskeleton Control |
| [2609.19665](https://arxiv.org/abs/2609.19665) | adjacent | adjacent (0.5) | core (0.66) | Runtime Safety Filtering for Two-Terminal Hazards in Robotic Battery Recycling |
| [2609.19647](https://arxiv.org/abs/2609.19647) | irrelevant | irrelevant (0.66) | core (0.65) | Well-posedness of neural turbulence closures and tangent dissipation |
| [2609.19636](https://arxiv.org/abs/2609.19636) | irrelevant | irrelevant (0.68) | adjacent (0.6) | Reach or Solve? Attributing Agentic RL Gains with Checkpoint Handoffs |
| [2609.19628](https://arxiv.org/abs/2609.19628) | irrelevant | irrelevant (0.85) | adjacent (0.62) | VGGT-GS SLAM: Uncalibrated Monocular Gaussian Splatting SLAM with Feed-Forward Priors |
| [2609.19661](https://arxiv.org/abs/2609.19661) | core | core (0.89) | adjacent (0.65) | ReShoot: Generative Visual Domain Randomization of Recorded Robot Demonstrations for Visuomotor Policy Learning |
| [2609.20056](https://arxiv.org/abs/2609.20056) | core | core (0.31) | adjacent (0.6) | MAGMA-GEN: Validated Recovery Supervision from Ambiguous Failures via Counterfactual Re-Execution |
| [2609.21220](https://arxiv.org/abs/2609.21220) | core | core (0.26) | adjacent (0.55) | Safe Real-Time Policy Steering via Noise-Space Trajectory Optimization for One-Step Generative Policies |
| [2609.19610](https://arxiv.org/abs/2609.19610) | adjacent | adjacent (0.38) | core (0.75) | SIMLIFE: Pattern Understanding for Long-Horizon Human-Agent Partnership |
| [2609.19662](https://arxiv.org/abs/2609.19662) | adjacent | adjacent (0.39) | core (0.72) | Towards Active Cross-View Object Geo-Localization |
| [2609.19802](https://arxiv.org/abs/2609.19802) | adjacent | adjacent (0.31) | core (0.68) | Affective Shared Autonomy: Temporal Affect Dynamics and Subjective Evaluation in Bimanual Teleoperation Tasks |
| [2609.19813](https://arxiv.org/abs/2609.19813) | adjacent | adjacent (0.44) | core (0.82) | Vehicle Trajectory Prediction via Neural Fusion of Multiple EKF-Based Trajectory Candidates |
| [2609.20103](https://arxiv.org/abs/2609.20103) | adjacent | adjacent (0.47) | core (0.75) | Safety-Critical Scenarios Emerge from Initial Scenes |
| [2609.20437](https://arxiv.org/abs/2609.20437) | adjacent | adjacent (0.74) | core (0.72) | A Mathematical Model of Motivated Emotional Mind - Cognitive Embodied System |
| [2609.20480](https://arxiv.org/abs/2609.20480) | adjacent | adjacent (0.25) | core (0.75) | Worst-Case Hidden-Vehicle Trajectory Search in Spatiotemporal Occlusion Regions |
| [2609.20604](https://arxiv.org/abs/2609.20604) | adjacent | adjacent (0.76) | core (0.62) | Semantic SLAM in Precision Agriculture using Bayesian Inference |
| [2609.20605](https://arxiv.org/abs/2609.20605) | adjacent | adjacent (0.53) | core (0.72) | Bayesian Continuum Robot Dynamics and State Estimation |
| [2609.20670](https://arxiv.org/abs/2609.20670) | adjacent | adjacent (0.68) | core (0.72) | MAGNETAR: Multipath-Guided Spatial Posteriors for Transmitter Pose Inference in the Upper Mid-Band |
| [2609.20814](https://arxiv.org/abs/2609.20814) | adjacent | adjacent (0.25) | core (0.78) | How Does Distribution Shift Shape Pretraining Gains in Neural PDE Surrogates? |
| [2609.20982](https://arxiv.org/abs/2609.20982) | adjacent | adjacent (0.41) | core (0.82) | ASGARD: Action-Space Guard for UAV Resilience via Reinforcement Learning |
| [2609.21008](https://arxiv.org/abs/2609.21008) | adjacent | adjacent (0.71) | core (0.62) | SPARROW: Survival-POMCP for Adaptive Robot Routing, Observation, and Waiting |
| [2609.21185](https://arxiv.org/abs/2609.21185) | adjacent | adjacent (0.61) | core (0.8) | When to Waddle: A Comparative Study of Bipedal Torso-Stabilization on Low-Friction Surfaces |
| [2609.21211](https://arxiv.org/abs/2609.21211) | adjacent | adjacent (0.54) | core (0.72) | Stochastic Neural Signed Swept Volume for Real-time Chance-Constrained Trajectory Optimization |
| [2609.21455](https://arxiv.org/abs/2609.21455) | adjacent | adjacent (0.58) | core (0.92) | CompAdapt: Adaptable Composite Motion Modeling for Physics-Consistent Text-to-Video Generation |
| [2609.21493](https://arxiv.org/abs/2609.21493) | adjacent | adjacent (0.73) | core (0.65) | PolyBridgeBench: Benchmarking Multimodal LLMs for Physics-Grounded Bridge Design |
| [2609.21576](https://arxiv.org/abs/2609.21576) | adjacent | adjacent (0.53) | core (0.75) | GestureFAR: Streaming Co-Speech Gesture Generation with Flow Autoregression |
| [2609.22062](https://arxiv.org/abs/2609.22062) | adjacent | adjacent (0.51) | core (0.75) | Gripper-Aware Automatic Dense Packing of Irregular Objects |
| [2609.22073](https://arxiv.org/abs/2609.22073) | adjacent | adjacent (0.26) | core (0.65) | Duty Factor Predicts Robust Constrained Quadrupedal Locomotion Across Gait Types |
| [2609.19634](https://arxiv.org/abs/2609.19634) | irrelevant | irrelevant (1) | adjacent (0.62) | Scientific Image Quality Assessment via Multi-modal Retrieval-Augmented Generation |
| [2609.19867](https://arxiv.org/abs/2609.19867) | irrelevant | irrelevant (0.84) | adjacent (0.62) | Socialized UAV Cross-Task Learning: Towards Cross-Granularity Collaboration through Hierarchical Interaction |
| [2609.19902](https://arxiv.org/abs/2609.19902) | irrelevant | irrelevant (0.93) | adjacent (0.6) | Self-Replicating Neural Cellular Automata: Quantifying Emergent Phenotypic and Genotypic Diversity in an OpenEnded Substrate |
| [2609.19990](https://arxiv.org/abs/2609.19990) | irrelevant | irrelevant (0.99) | adjacent (0.58) | QCPruner: Query-Conditioned Population Coverage for Visual Token Pruning |
| [2609.20004](https://arxiv.org/abs/2609.20004) | irrelevant | irrelevant (0.77) | adjacent (0.62) | EPIG-Tree: Compute-Optimal Branching for Gradient-Efficient Reinforcement Learning |
| [2609.20110](https://arxiv.org/abs/2609.20110) | irrelevant | irrelevant (1) | adjacent (0.62) | Perception, Layout, and Validation: Calibrated Confidence for Reliable Straight-Through Processing of Financial Documents |
| [2609.20419](https://arxiv.org/abs/2609.20419) | irrelevant | irrelevant (1) | adjacent (0.58) | SCGFM-ART: Amortized Relational Transport for Structure-Centric Graph Foundation Models |
| [2609.20474](https://arxiv.org/abs/2609.20474) | irrelevant | irrelevant (1) | adjacent (0.6) | How Do Agent Harnesses Create Value? Planning Information and Release Control in Stateful LLM Agents |
| [2609.20510](https://arxiv.org/abs/2609.20510) | irrelevant | irrelevant (0.61) | core (0.65) | Truncated automatic sparse differentiation for machine learning interatomic potentials |
| [2609.21075](https://arxiv.org/abs/2609.21075) | irrelevant | irrelevant (1) | adjacent (0.6) | Aligning with Lived Experience: Heterogeneous Benefits of Fine Tuning in Mental Health Support Generation |
| [2609.21363](https://arxiv.org/abs/2609.21363) | irrelevant | irrelevant (0.99) | adjacent (0.62) | Hiding in Plain Sight: A Diffusion-based Mitigation of Geolocation Privacy Leakage in Vision-Language Models |
| [2609.21425](https://arxiv.org/abs/2609.21425) | irrelevant | irrelevant (1) | adjacent (0.6) | Tracing the Evidence Behind Zero-Shot Time-Series Forecasting: A Source-First Taxonomy and Audit Framework |
| [2609.21521](https://arxiv.org/abs/2609.21521) | irrelevant | irrelevant (0.99) | adjacent (0.65) | VidOmni-Bench: A Benchmark for Fine-Grained Video Understanding via Spatio-Temporal Event Verification across Complexity and Duration |
| [2609.21683](https://arxiv.org/abs/2609.21683) | irrelevant | irrelevant (1) | adjacent (0.64) | Listen Before You Speak: Response Planning from Listener Facial Reactions for Conversational Speech Generation |
| [2609.21805](https://arxiv.org/abs/2609.21805) | irrelevant | irrelevant (1) | adjacent (0.55) | An Agentic Just-in-Time Adaptive Intervention System for Personalized Sleep Support: Proof-of-Concept Study with N of 1 Data |
| [2609.21894](https://arxiv.org/abs/2609.21894) | irrelevant | irrelevant (1) | adjacent (0.62) | LLMs as Feature Engineers for Text-and-Tabular Prediction |
