<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=260&section=header&text=SynapseGraph&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Self-Evolving%20AI%20Research%20Knowledge%20Canvas&descSize=20&descAlignY=60" width="100%" alt="SynapseGraph banner" />

<a href="https://github.com/abhishek-s-gupta">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=900&color=8B5CF6&center=true&vCenter=true&width=760&lines=Research+that+reproduces+itself.;AI+agents+that+heal+their+own+crashes.;Every+decision+stays+in+your+hands.;Runs+on+a+laptop+CPU.+Zero+GPU." alt="Typing animation" />
</a>

<br/>

![License](https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

![CPU Only](https://img.shields.io/badge/Architecture-Pure_CPU_Sandbox-10B981?style=for-the-badge)
![Reproducibility](https://img.shields.io/badge/Reproducibility-94.6%25-A855F7?style=for-the-badge)
![Self Healing](https://img.shields.io/badge/Self_Healing-0.40s-F43F5E?style=for-the-badge)
![Offline](https://img.shields.io/badge/Offline_Safe-Yes-F59E0B?style=for-the-badge)

<br/>

**[Quick Start](#-quick-start)** &nbsp;•&nbsp; **[Features](#-13-signature-features)** &nbsp;•&nbsp; **[Architecture](#-system-architecture)** &nbsp;•&nbsp; **[Demo Script](#-3-minute-demo-script)** &nbsp;•&nbsp; **[API](#-backend-rest--sse-endpoints)**

</div>

---

## 🎬 See It In Action

<div align="center">

<!-- Add your recorded demo GIF at docs/assets/demo.gif -->
<img src="docs/assets/demo.gif" width="92%" alt="SynapseGraph live demo" />

<br/><br/>

| Canvas | Self-Healing | Agent Arena |
|:---:|:---:|:---:|
| <img src="docs/assets/canvas.png" width="280" alt="Canvas" /> | <img src="docs/assets/self-heal.png" width="280" alt="Self healing" /> | <img src="docs/assets/arena.png" width="280" alt="Arena" /> |

</div>

---

## 💡 The Problem We Solve

<table>
<tr>
<td width="50%" valign="top">

### 🗂️ The Organization Gap
Papers, datasets, code repos and browser tabs live in a dozen disconnected places. Connections between ideas get lost, and nobody can see the whole picture.

</td>
<td width="50%" valign="top">

### ⚙️ The Execution Gap
Broken environments, missing dependencies and non-reproducible baselines turn "just run the paper" into days of debugging.

</td>
</tr>
</table>

<div align="center">

### ⬇️ &nbsp; SynapseGraph closes both gaps &nbsp; ⬇️

**One visual canvas** &nbsp;+&nbsp; **a self-evolving, human-controllable team of AI agents**

</div>

---

## 🔁 The 6-Stage Research Loop

```mermaid
flowchart LR
    A["📥 Collect<br/>arXiv · PDF · Repo · Question"] --> B["🧩 Organize<br/>Auto-clustered graph"]
    B --> C["🔎 Understand<br/>Notes · Tags · Views"]
    C --> D["🧪 Experiment<br/>Reproduce Baseline"]
    D --> E["🩹 Learn<br/>Self-healing memory"]
    E --> F["📤 Share<br/>MD · PDF · JSON"]
    F -.->|iterate| A

    style A fill:#8B5CF6,stroke:#8B5CF6,color:#fff
    style B fill:#6366F1,stroke:#6366F1,color:#fff
    style C fill:#3B82F6,stroke:#3B82F6,color:#fff
    style D fill:#06B6D4,stroke:#06B6D4,color:#fff
    style E fill:#10B981,stroke:#10B981,color:#fff
    style F fill:#F59E0B,stroke:#F59E0B,color:#fff
```

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph UI ["Frontend: React 18 + Vite + Tailwind + Framer Motion"]
        Landing["Landing Page<br/>Live graph simulation"]
        Canvas["React Flow Canvas<br/>6 node types · 8 edge types"]
        Sidebar["Workspaces · Tags · Drop Zone"]
        Inspector["Node Inspector<br/>Code/Diff · Red-Team Audit"]
        Arena["Agent Arena<br/>Score rings · Prompt diff"]
        Stream["Thought Stream<br/>Approve · Reject · Redirect"]
        Timeline["Replay Timeline<br/>Scrub history"]
        Insights["Insights<br/>Hardware gauges · Gap Finder"]
        Voice["Voice Mic<br/>Web Speech API"]
    end

    subgraph Backend ["Backend: FastAPI Multi-Agent Engine (Port 8000)"]
        API["REST Endpoints"]
        SSEBus["EventBus<br/>SSE broadcaster"]
        AgentEngine["Agent Governance<br/>and Evolution Controller"]
        HeuristicGap["Graph-Theoretic<br/>Gap Engine"]
        Sandbox["CPU Subprocess Sandbox<br/>10s timeout"]
    end

    subgraph Storage ["SQLite"]
        DBWorkspaces["Workspaces"]
        DBNodes["Nodes"]
        DBEdges["Edges"]
        DBMemories["Failure Memories"]
        DBAgents["Agent Registry"]
    end

    UI <-->|HTTP + SSE| API
    API <--> Storage
    API -->|Run Python| Sandbox
    Sandbox -->|Traceback| AgentEngine
    AgentEngine -->|Recover in 0.4s| DBMemories
    AgentEngine -->|Thoughts| SSEBus
    API --> HeuristicGap
    SSEBus -.->|Live events| Stream
```

---

## 🤖 Meet the Agents

<div align="center">

| Agent | Role | Reward Rules |
|:---:|:---|:---|
| 🧠 **Controller** | Breaks goals into a DAG of subtasks and dispatches specialists | Orchestrator |
| 📖 **Reader** | Extracts claims, datasets and hyperparameters from raw text | Starts at **80 / 100** |
| 💻 **Code-Gen** | Turns methodology into clean, lightweight Python | Starts at **80 / 100** |
| 🩹 **Debugger** | Reads tracebacks and generates deterministic fixes | Starts at **80 / 100** |
| 🕵️ **Critic** | Validates results against paper baselines, flags hallucinations | Starts at **80 / 100** |

</div>

```mermaid
flowchart LR
    S["Agent score<br/>80 / 100"] -->|"✅ Verified +3"| U["⬆️ Up"]
    S -->|"🩹 Auto-repair +5"| U
    S -->|"👍 User approves +2"| U
    S -->|"💥 Crash -3"| D["⬇️ Down"]
    S -->|"👎 User rejects -5"| D
    D -->|"below 60"| R["🧬 Retire and spawn<br/>evolved Gen-2 agent"]

    style U fill:#10B981,stroke:#10B981,color:#fff
    style D fill:#F43F5E,stroke:#F43F5E,color:#fff
    style R fill:#A855F7,stroke:#A855F7,color:#fff
```

---

## ✨ 13 Signature Features

<table>
<tr>
<td width="33%" valign="top">

### ⚡ 1. Auto Demo
Scripted 90-second guided tour: ingest → audit → code → crash → heal → verify → what-if → export. Spotlight tooltips, zero typing.

</td>
<td width="33%" valign="top">

### 💥 2. Break It
Injects a real matrix shape mismatch into the sandbox. The Debugger reads the traceback, patches the code and verifies in **0.40s**.

</td>
<td width="33%" valign="top">

### 🎯 3. Reproducibility Gauge
Animated 0–100 gauge comparing measured results with paper baselines. The Critic flags hallucinations and optimistic deviations.

</td>
</tr>
<tr>
<td valign="top">

### 🌿 4. What-If Branching
Git-style forks. Tune Rank r, Learning Rate and Batch Size, then compare branches side by side on the canvas.

</td>
<td valign="top">

### 🧠 5. Failure Memory
Every fixed error signature is stored. Repeat errors recover instantly: *"Recovered from memory in 0.38s"*.

</td>
<td valign="top">

### ⌘ 6. Command Palette
`Ctrl+K` spotlight bar (cmdk) to search nodes, run actions, switch views and trigger agents.

</td>
</tr>
<tr>
<td valign="top">

### 🛡️ 7. Resilient Mode
Full offline operation. If LLM APIs rate-limit, deterministic cached traces keep everything running.

</td>
<td valign="top">

### 🧬 8. Agent Evolution
Agents under 60/100 are retired and replaced by a Gen-2 successor, with an animated prompt-diff modal.

</td>
<td valign="top">

### 👥 9. Presence
Simulated live collaborator avatars and shareable read-only workspace links.

</td>
</tr>
<tr>
<td valign="top">

### ⌨️ 10. Shortcuts
Press `?` for the full keyboard cheat sheet and navigate research without touching the mouse.

</td>
<td valign="top">

### 📊 11. Live Telemetry
Real-time CPU %, RAM, per-agent latency, tokens and cost ($0.00 in offline mode), streamed over SSE.

</td>
<td valign="top">

### 🔍 12. Gap Finder
Graph-theory heuristics find isolated clusters and unresolved contradictions, then spawn hypothesis nodes in one click.

</td>
</tr>
<tr>
<td colspan="3" align="center" valign="top">

### 🎙️ 13. Voice Commands
Floating mic with live waveform and transcript chip. Say *"reproduce this paper"*, *"break it"*, *"find research gaps"* or *"start demo"*.

</td>
</tr>
</table>

---

## 🎨 Design System

<div align="center">

| Node | Glow | Hex |
|:---:|:---:|:---:|
| 📄 **Paper** | ![](https://img.shields.io/badge/-%20%20%20%20%20-8B5CF6?style=flat-square) Electric Violet | `#8B5CF6` |
| ❓ **Question** | ![](https://img.shields.io/badge/-%20%20%20%20%20-F59E0B?style=flat-square) Warm Amber | `#F59E0B` |
| 🗄️ **Dataset** | ![](https://img.shields.io/badge/-%20%20%20%20%20-10B981?style=flat-square) Emerald | `#10B981` |
| 💻 **Code** | ![](https://img.shields.io/badge/-%20%20%20%20%20-06B6D4?style=flat-square) Cyan | `#06B6D4` |
| 🔥 **Failure** | ![](https://img.shields.io/badge/-%20%20%20%20%20-F43F5E?style=flat-square) Rose | `#F43F5E` |
| 🏆 **Result** | ![](https://img.shields.io/badge/-%20%20%20%20%20-A855F7?style=flat-square) Fuchsia | `#A855F7` |

</div>

- **Dark-first:** near-black `#07080C` background, glassmorphism cards, subtle grain, violet → cyan gradients
- **8 edge types:** `cites` · `supports` · `contradicts` · `answers` · `generates_code` · `failed_with` · `patched_to` · `what_if_branch`, each with animated flowing particles
- **Typography:** `Inter` for UI, `JetBrains Mono` for code, logs and metrics
- **Motion:** spring physics, 200–400ms, staggered reveals, `prefers-reduced-motion` respected

---

## 🚀 Quick Start

> **Requirements:** Python 3.10+, Node.js 18+. No GPU needed.

```bash
git clone https://github.com/abhishek-s-gupta/synapsegraph.git
cd synapsegraph
```

<details open>
<summary><b>🪟 Windows (one command)</b></summary>

```powershell
.\start.ps1
```

</details>

<details>
<summary><b>🐧 macOS / Linux / manual (two terminals)</b></summary>

**Terminal 1: Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
```

</details>

| Service | URL |
|:---|:---|
| 🎨 App | **http://localhost:5173** |
| 📚 API Docs (Swagger) | **http://localhost:8000/docs** |

---

## 🧪 3-Minute Demo Script

<details open>
<summary><b>⏱️ 0:00 – 0:30 &nbsp; Landing page</b></summary>

- Watch the hero graph drift and pulse as thought packets travel along edges
- Animated counters: **1,428 papers parsed**, **892 crashes self-healed**, **94.6% mean reproducibility**
- Click **Launch Workspace** or **Watch 90-sec Auto Demo**

</details>

<details>
<summary><b>🗺️ 0:30 – 1:00 &nbsp; Canvas and layout</b></summary>

- Click the `LoRA` paper node and notice the amber **Contested / Red-Team Audit** badge
- Hit **Auto-Layout** and watch nodes glide into a clean left-to-right DAG
- Toggle **Graph**, **Topic Clusters**, **List** and **Grid** views

</details>

<details>
<summary><b>💥 1:00 – 1:40 &nbsp; Live self-healing</b></summary>

1. Click **Break It** in the header
2. Phase 1: a deliberate shape mismatch is injected
3. Phase 2: the sandbox crashes and captures the real traceback
4. Phase 3: the Debugger queries failure memory and writes a `.T` transpose patch
5. Phase 4: re-run verifies **94.1% accuracy in 0.40 seconds**

</details>

<details>
<summary><b>🧬 1:40 – 2:10 &nbsp; Agent evolution</b></summary>

- Open the **Arena** tab and click **Trigger Mutation**
- `CodeGen v1` retires as its score drops to 54
- `CodeGen v2 (Gen 2)` takes over, with a prompt diff showing the new tensor-shape assertions

</details>

<details>
<summary><b>🔍 2:10 – 2:40 &nbsp; Gaps and What-If</b></summary>

- **Insights** tab → **Scan Gaps**, then hover a gap to pulse its nodes on the canvas
- **Create Hypothesis Node** spawns a new question instantly
- Select the Result node → **What-If Branch** → drag the Rank r slider and read the Pareto forecast chart

</details>

<details>
<summary><b>🎙️ 2:40 – 3:00 &nbsp; Voice and export</b></summary>

- Tap the mic and say *"start demo"*, *"break it"* or *"find research gaps"*
- **Export** as printable PDF, Markdown with structured tables and citations, or JSON

</details>

---

## 📡 Backend REST & SSE Endpoints

| Method | Endpoint | Description |
|:---:|:---|:---|
| ![GET](https://img.shields.io/badge/GET-10B981?style=flat-square) | `/api/health` | Hardware telemetry (CPU %, RAM MB, service status) |
| ![GET](https://img.shields.io/badge/GET-10B981?style=flat-square) | `/api/workspaces` | List all research workspaces |
| ![GET](https://img.shields.io/badge/GET-10B981?style=flat-square) | `/api/workspaces/{id}` | Full graph (nodes, edges, agents, memories) |
| ![POST](https://img.shields.io/badge/POST-8B5CF6?style=flat-square) | `/api/workspaces/{id}/ingest` | Ingest arXiv link, repo URL or question (Reader Agent) |
| ![POST](https://img.shields.io/badge/POST-8B5CF6?style=flat-square) | `/api/workspaces/{id}/reproduce` | Full pipeline: Code-Gen → Sandbox → Critic |
| ![POST](https://img.shields.io/badge/POST-8B5CF6?style=flat-square) | `/api/workspaces/{id}/break-it` | Fault injection and autonomous self-healing |
| ![POST](https://img.shields.io/badge/POST-8B5CF6?style=flat-square) | `/api/workspaces/{id}/what-if` | Fork a result node with new hyperparameters |
| ![GET](https://img.shields.io/badge/GET-10B981?style=flat-square) | `/api/workspaces/{id}/gaps` | Graph-heuristic research gap analysis |
| ![POST](https://img.shields.io/badge/POST-8B5CF6?style=flat-square) | `/api/workspaces/{id}/hypothesis` | Create a hypothesis node from a gap |
| ![GET](https://img.shields.io/badge/GET-10B981?style=flat-square) | `/api/workspaces/{id}/export` | Export as Markdown, printable HTML/PDF or JSON |
| ![SSE](https://img.shields.io/badge/SSE-F59E0B?style=flat-square) | `/api/workspaces/{id}/stream` | Real-time thought stream |
| ![SSE](https://img.shields.io/badge/SSE-F59E0B?style=flat-square) | `/api/metrics/stream` | Live CPU / RAM / agent metrics |
| ![POST](https://img.shields.io/badge/POST-8B5CF6?style=flat-square) | `/api/agents/{id}/control` | Governance: `approve` · `pause` · `reject` · `redirect` |
| ![POST](https://img.shields.io/badge/POST-8B5CF6?style=flat-square) | `/api/agents/{id}/evolve` | Trigger genetic mutation and retirement |
| ![POST](https://img.shields.io/badge/POST-8B5CF6?style=flat-square) | `/api/voice/intent` | Map a speech transcript to a structured action |

---

## 🧾 Core Graph Schema

<details>
<summary><b>Click to expand JSON schema</b></summary>

```json
{
  "workspace_id": "ws_01",
  "title": "Edge Anomaly Detection Study",
  "nodes": [
    {
      "id": "node_101",
      "type": "paper | question | dataset | code | failure | result",
      "title": "String",
      "content": "Markdown or Code String",
      "metadata": { "tags": ["TinyML"], "metrics": { "f1": 0.88 } },
      "position": { "x": 120, "y": 240 },
      "created_at": "ISO-8601"
    }
  ],
  "edges": [
    { "id": "edge_1", "source": "node_101", "target": "node_102", "relation": "answers" }
  ],
  "agent_registry": [
    { "id": "debugger", "reward_score": 92, "runs": 14, "status": "active" }
  ]
}
```

</details>

---

## 🔒 Sandbox Safety

- ⏱️ Subprocess **hard timeout of 10 seconds**
- 📁 File writes restricted to a temporary `/tmp/synapse_sandbox` directory
- 🔁 Debugger retry loop capped at **3 attempts**
- 🧯 Full stdout / stderr / traceback capture for every run

---

## 💻 Hardware Requirements

| Component | Requirement |
|:---|:---|
| **Processor** | Any modern laptop CPU (Intel i5/i7, AMD Ryzen 5/7, Apple Silicon) |
| **Memory** | 4 GB RAM minimum |
| **GPU** | **None.** All kernels run inside pure-CPU software sandboxes |

---

## 🛠️ Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)
![React Flow](https://img.shields.io/badge/React_Flow-FF0072?style=for-the-badge)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

<div align="center">

### Built by [Abhishek Gupta](https://github.com/abhishek-s-gupta)(https://www.linkedin.com/in/abhishek-s-gupta/)

*Built with ❤️ for modern autonomous scientific research.*

⭐ **If SynapseGraph impressed you, drop a star!** ⭐

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=140&section=footer" width="100%" alt="footer" />

</div>#   s y n a p s e g r a p h  
 