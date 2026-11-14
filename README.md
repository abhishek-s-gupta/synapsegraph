 <div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=260&section=header&text=SynapseGraph&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Self-Evolving%20AI%20Research%20Knowledge%20Canvas&descSize=20&descAlignY=60" width="100%" alt="SynapseGraph Banner" />

<a href="https://github.com/abhishek-s-gupta">
<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=900&color=8B5CF6&center=true&vCenter=true&width=760&lines=Research+that+reproduces+itself.;AI+agents+that+heal+their+own+crashes.;Every+decision+stays+in+your+hands.;Runs+on+a+laptop+CPU.+Zero+GPU." alt="Typing Animation" />
</a>

<br/>

![License](https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

<br/>

![CPU Only](https://img.shields.io/badge/Architecture-Pure_CPU_Sandbox-10B981?style=for-the-badge)
![Offline](https://img.shields.io/badge/Offline_Safe-Yes-F59E0B?style=for-the-badge)

<br/>

**[🚀 Quick Start](#-quick-start) • [✨ Features](#-13-signature-features) • [🏛️ Architecture](#-system-architecture) • [🎬 Demo](#-3-minute-demo-script) • [📡 API](#-backend-rest--sse-endpoints)**

</div>

---

## 💡 The Problem We Solve

<table>
<tr>
<td width="50%" valign="top">

### 🗂️ The Organization Gap

Research papers, datasets, code repositories, and notes live in disconnected places.

Connections between ideas get lost, making it difficult to understand the complete research landscape.

</td>
<td width="50%" valign="top">

### ⚙️ The Execution Gap

Broken environments, missing dependencies, and non-reproducible baselines make experiment reproduction difficult.

Researchers spend more time debugging environments than exploring ideas.

</td>
</tr>
</table>

<div align="center">

### ⬇️ SynapseGraph closes both gaps ⬇️

**One visual canvas + A self-evolving, human-controllable team of AI agents**

</div>

---

## 🔁 The 6-Stage Research Loop

```mermaid
flowchart LR
    A["📥 Collect<br/>arXiv · PDF · Repo · Question"] --> B["🧩 Organize<br/>Auto-clustered graph"]
    B --> C["🔎 Understand<br/>Notes · Tags · Views"]
    C --> D["🧪 Experiment<br/>Reproduce baseline"]
    D --> E["🩹 Learn<br/>Self-healing memory"]
    E --> F["📤 Share<br/>MD · PDF · JSON"]
    F -.->|Iterate| A

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

    subgraph UI["Frontend: React 18 + Vite + Tailwind"]
        Landing["Landing Page<br/>Live graph simulation"]
        Canvas["React Flow Canvas<br/>6 node types · 8 edge types"]
        Sidebar["Workspaces · Tags · Drop Zone"]
        Inspector["Node Inspector<br/>Code · Diff · Audit"]
        Arena["Agent Arena<br/>Score rings · Prompt diff"]
        Stream["Thought Stream<br/>Approve · Reject · Redirect"]
        Timeline["Replay Timeline"]
        Insights["Insights<br/>Hardware gauges · Gap Finder"]
    end

    subgraph Backend["Backend: FastAPI Multi-Agent Engine"]
        API["REST Endpoints"]
        SSEBus["EventBus<br/>SSE broadcaster"]
        AgentEngine["Agent Governance<br/>Evolution Controller"]
        GapEngine["Graph-Theoretic<br/>Gap Engine"]
        Sandbox["CPU Subprocess Sandbox<br/>10s timeout"]
    end

    subgraph Agents["Autonomous Agents"]
        Reader["Reader"]
        CodeGen["Code Generator"]
        Debugger["Debugger"]
        Critic["Critic"]
    end

    subgraph Storage["SQLite Database"]
        Workspaces["Workspaces"]
        Nodes["Nodes"]
        Edges["Edges"]
        Memories["Failure Memories"]
        Registry["Agent Registry"]
    end

    UI <-->|HTTP + SSE| API
    API <--> Storage
    API --> AgentEngine
    API --> Sandbox
    AgentEngine --> Agents
    Sandbox -->|Traceback| AgentEngine
    AgentEngine -->|Recovery Events| SSEBus
    API --> GapEngine
    SSEBus -.-> Stream
```

**Communication:** REST APIs for operations and Server-Sent Events (SSE) for real-time agent updates.

---

## 🤖 Meet the Agents

| Agent | Responsibility | Initial Score |
|:---:|---|:---:|
| 🧠 **Controller** | Breaks goals into subtasks and coordinates specialists | Orchestrator |
| 📖 **Reader** | Extracts claims, datasets, and hyperparameters | 80/100 |
| 💻 **Code-Gen** | Converts methodologies into Python scripts | 80/100 |
| 🩹 **Debugger** | Analyzes tracebacks and proposes fixes | 80/100 |
| 🕵️ **Critic** | Evaluates results against paper baselines | 80/100 |

### 🧬 Agent Evolution & Reward System

```mermaid
flowchart TD
    S["Agent Performance Score<br/>80 / 100"]

    S -->|"Verified task +3"| U["⬆️ Score increases"]
    S -->|"Autonomous repair +5"| U
    S -->|"User approval +2"| U

    S -->|"Execution crash -3"| D["⬇️ Score decreases"]
    S -->|"User rejection -5"| D

    D -->|"Score below 60"| R["🧬 Retire Agent<br/>Spawn evolved successor"]

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

A guided tour demonstrating the complete research workflow:

Ingest → Audit → Code → Crash → Heal → Verify → What-If → Export.

</td>
<td width="33%" valign="top">

### 💥 2. Break It

Inject a controlled experiment failure, capture the traceback, and let the Debugger attempt autonomous recovery.

</td>
<td width="33%" valign="top">

### 🎯 3. Reproducibility Gauge

Visual comparison of measured experiment results against reference paper baselines.

</td>
</tr>
<tr>
<td valign="top">

### 🌿 4. What-If Branching

Create experiment branches, modify hyperparameters, and compare outcomes.

</td>
<td valign="top">

### 🧠 5. Failure Memory

Store resolved error signatures and reuse previously successful recovery strategies.

</td>
<td valign="top">

### ⌘ 6. Command Palette

Use `Ctrl + K` to search nodes, trigger actions, and navigate the research workspace.

</td>
</tr>
<tr>
<td valign="top">

### 🛡️ 7. Resilient Mode

Offline-first workflows with deterministic fallback behavior when external services are unavailable.

</td>
<td valign="top">

### 🧬 8. Agent Evolution

Retire underperforming agents and introduce evolved successors based on performance scores.

</td>
<td valign="top">

### 👥 9. Presence

Collaborator avatars and shareable read-only workspace experiences.

</td>
</tr>
<tr>
<td valign="top">

### ⌨️ 10. Keyboard Shortcuts

Press `?` to access the keyboard shortcut guide.

</td>
<td valign="top">

### 📊 11. Live Telemetry

Monitor CPU usage, RAM, agent latency, and execution metrics.

</td>
<td valign="top">

### 🔍 12. Research Gap Finder

Identify isolated graph clusters and unresolved relationships to suggest research directions.

</td>
</tr>
<tr>
<td colspan="3" valign="top" align="center">

### 🎙️ 13. Voice Commands

Use voice input to trigger supported research actions such as reproducing experiments, finding gaps, and starting demos.

</td>
</tr>
</table>

---

## 🎨 Design System

### Node Color Palette

| Node | Color | Hex |
|:---:|---|:---:|
| 📄 **Paper** | Electric Violet | `#8B5CF6` |
| ❓ **Question** | Warm Amber | `#F59E0B` |
| 🗄️ **Dataset** | Emerald | `#10B981` |
| 💻 **Code** | Cyan | `#06B6D4` |
| 🔥 **Failure** | Rose | `#F43F5E` |
| 🏆 **Result** | Fuchsia | `#A855F7` |

### Visual Identity

- **Dark-first:** Near-black `#07080C` background.
- **Effects:** Glassmorphism cards and subtle glowing borders.
- **Gradients:** Violet → Cyan.
- **Typography:** Inter and JetBrains Mono.
- **Motion:** Smooth transitions, spring animations, and staggered reveals.

### Eight Graph Relationships

`cites` · `supports` · `contradicts` · `answers` · `generates_code` · `failed_with` · `patched_to` · `what_if_branch`

---

## 🎬 See It In Action

<div align="center">

<!-- Add your actual GIF and screenshots inside docs/assets/ -->

<img src="docs/assets/demo.gif" width="92%" alt="SynapseGraph Demo"/>

<br/><br/>

| Research Canvas | Self-Healing | Agent Arena |
|:---:|:---:|:---:|
| <img src="docs/assets/canvas.png" width="260" alt="Research Canvas"/> | <img src="docs/assets/self-heal.png" width="260" alt="Self Healing"/> | <img src="docs/assets/arena.png" width="260" alt="Agent Arena"/> |

</div>

---

## 🚀 Quick Start

**Requirements**

- Python 3.11+
- Node.js 18+
- npm
- No GPU required for the CPU-based workflows.

### 1. Clone Repository

```bash
git clone https://github.com/abhishek-s-gupta/synapsegraph.git

cd synapsegraph
```

### 2. Windows

If the repository includes the startup script:

```powershell
.\start.ps1
```

### 3. Manual Setup

**Terminal 1 — Backend**

```bash
cd backend

python -m venv .venv
```

Windows:

```powershell
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend using the entry point configured in your project. For example:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend**

```bash
cd frontend

npm install

npm run dev
```

### Application URLs

| Service | URL |
|---|---|
| 🎨 Frontend | http://localhost:5173 |
| ⚙️ Backend | http://localhost:8000 |
| 📚 API Documentation | http://localhost:8000/docs |

---

## 🧪 3-Minute Demo Script

<details open>
<summary><b>⏱️ 0:00 – 0:30 | Landing Page</b></summary>

- Show the animated hero graph.
- Introduce the research intelligence concept.
- Launch the workspace.

</details>

<details>
<summary><b>🗺️ 0:30 – 1:00 | Research Canvas</b></summary>

- Open the Research Canvas.
- Select a Paper node.
- Demonstrate graph relationships.
- Switch between Graph, Cluster, List, and Grid views if available.

</details>

<details>
<summary><b>💥 1:00 – 1:40 | Self-Healing</b></summary>

1. Trigger the controlled failure demonstration.
2. Show the sandbox execution error.
3. Open the captured traceback.
4. Demonstrate the Debugger's recovery attempt.
5. Show the verification result.

</details>

<details>
<summary><b>🧬 1:40 – 2:10 | Agent Evolution</b></summary>

- Open the Agent Arena.
- Demonstrate reward scoring.
- Show the agent retirement and successor workflow, if enabled.

</details>

<details>
<summary><b>🔍 2:10 – 2:40 | Research Gaps & What-If</b></summary>

- Open the Insights panel.
- Run research gap analysis.
- Create a hypothesis.
- Fork an experiment and modify its parameters.

</details>

<details>
<summary><b>🎙️ 2:40 – 3:00 | Voice & Export</b></summary>

- Demonstrate a supported voice command.
- Export the research workspace.
- Finish with the complete connected knowledge graph.

</details>

---

## 📡 Backend REST & SSE Endpoints

| Method | Endpoint | Description |
|:---:|---|---|
| GET | `/api/health` | Hardware telemetry and service status |
| GET | `/api/workspaces` | List research workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces/{id}` | Retrieve complete graph |
| POST | `/api/workspaces/{id}/ingest` | Import research material |
| POST | `/api/workspaces/{id}/reproduce` | Start experiment reproduction |
| POST | `/api/workspaces/{id}/break-it` | Controlled failure demonstration |
| POST | `/api/workspaces/{id}/what-if` | Fork experiment results |
| GET | `/api/workspaces/{id}/gaps` | Research gap analysis |
| POST | `/api/workspaces/{id}/hypothesis` | Create hypothesis node |
| GET | `/api/workspaces/{id}/export` | Export workspace |
| GET | `/api/workspaces/{id}/stream` | Real-time thought stream |
| GET | `/api/metrics/stream` | Live system metrics |
| POST | `/api/agents/{id}/control` | Approve, pause, reject, redirect |
| POST | `/api/agents/{id}/evolve` | Agent evolution |
| POST | `/api/voice/intent` | Process voice intent |

> Check your actual FastAPI routes before publishing this endpoint list.

---

## 🧾 Core Graph Schema

<details>
<summary><b>Click to expand JSON example</b></summary>

```json
{
  "workspace_id": "ws_01",
  "title": "Edge Anomaly Detection Study",
  "nodes": [
    {
      "id": "node_101",
      "type": "paper",
      "title": "Research Paper",
      "content": "Research methodology",
      "metadata": {
        "tags": ["TinyML"],
        "metrics": {
          "f1": 0.88
        }
      },
      "position": {
        "x": 120,
        "y": 240
      },
      "created_at": "2026-11-13T10:00:00Z"
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_101",
      "target": "node_102",
      "relation": "supports"
    }
  ],
  "agent_registry": [
    {
      "id": "debugger",
      "reward_score": 92,
      "runs": 14,
      "status": "active"
    }
  ]
}
```

</details>

---

## 🔒 Sandbox Safety

The execution sandbox is designed with the following safeguards:

- ⏱️ Configurable subprocess execution timeout.
- 📁 Temporary workspace for experiment files.
- 🔁 Limited debugging retry attempts.
- 🧯 stdout, stderr, and traceback capture.
- 🛡️ Controlled execution environment.

**Note:** A subprocess sandbox and temporary directory alone do not provide strong security isolation against malicious code. Do not run untrusted research scripts without additional operating-system-level restrictions.

---

## 💻 Hardware Requirements

| Component | Requirement |
|---|---|
| Processor | Modern Intel / AMD / Apple Silicon CPU |
| Memory | 4 GB RAM minimum (project-dependent) |
| GPU | Not required for CPU-based workflows |
| Storage | Depends on imported papers and datasets |

---

## 🛠️ Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![React Flow](https://img.shields.io/badge/React_Flow-FF0072?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## 🏆 Hackathon

<div align="center">

**NavUtkarsh x Leo Hackathon 2026**

**Problem Statement 03 — ResearchGraph**

Built to make scientific research more connected, reproducible, and accessible.

</div>

---

## 👨‍💻 Built By

<div align="center">

### [Abhishek Gupta](https://github.com/abhishek-s-gupta)(https://www.linkedin.com/in/abhishek-s-gupta)

*Built with ❤️ for modern autonomous scientific research.*

⭐ **If SynapseGraph impressed you, give the repository a star!** ⭐

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=140&section=footer" width="100%" alt="Footer Banner"/>

</div>
