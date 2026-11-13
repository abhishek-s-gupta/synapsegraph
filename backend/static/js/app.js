/**
 * SynapseGraph Precision Research Workspace Controller
 * Hackathon PS 03 (ResearchGraph)
 * 5 Signature Features: Red-Team Critic, Time-Travel Branching, CPU Benchmark, Genetic Evolution, Literature Export
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- APPLICATION STATE ---
  let currentWorkspaceId = "ws_01";
  let activeBranch = "main";
  let currentTimelineStep = 7; // default latest (t=7)
  let workspaceData = null;
  let expandedAuditNodes = new Set(["node_101"]); // auto-expand paper audit

  // --- DOM REFERENCES ---
  const elGraphNodesLayer = document.getElementById("graph-nodes-layer");
  const elGraphEdgesSvg = document.getElementById("graph-edges-svg");
  const elTimelineTrack = document.getElementById("timeline-scrubber-track");
  const elAgentRoster = document.getElementById("agent-roster-list");
  const elBranchPill = document.getElementById("active-branch-pill");
  const elBranchSelect = document.getElementById("branch-select");

  // Benchmark Drawer
  const elBenchmarkDrawer = document.getElementById("benchmark-drawer");
  const elTerminalBody = document.getElementById("terminal-body");
  const elComparisonBody = document.getElementById("comparison-table-body");
  const elCloseBenchmarkBtn = document.getElementById("close-benchmark-btn");
  const elRunBenchmarkBtn = document.getElementById("btn-run-benchmark-global");

  // Ingest Modal
  const elIngestModal = document.getElementById("ingest-modal");
  const elOpenIngestBtn = document.getElementById("btn-open-ingest");
  const elCloseIngestBtn = document.getElementById("close-ingest-btn");
  const elSubmitIngestBtn = document.getElementById("submit-ingest-btn");
  const elInputText = document.getElementById("ingest-input-text");
  const elSourceUrl = document.getElementById("ingest-source-url");

  // Branch Modal
  const elBranchModal = document.getElementById("branch-modal");
  const elOpenBranchBtn = document.getElementById("btn-open-branch");
  const elCloseBranchBtn = document.getElementById("close-branch-btn");
  const elConfirmBranchBtn = document.getElementById("confirm-branch-btn");
  const elBranchNameInput = document.getElementById("new-branch-name");

  // Evolution Trigger Button
  const elSimulateEvolutionBtn = document.getElementById("btn-simulate-evolution");

  // Export Button
  const elExportBtn = document.getElementById("btn-export-review");

  // ==============================================================================
  // 1. DATA FETCHING & WORKSPACE RENDERING
  // ==============================================================================
  function loadWorkspace() {
    const url = `/api/workspaces/${currentWorkspaceId}?branch=${encodeURIComponent(activeBranch)}&step=${currentTimelineStep}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        workspaceData = data;
        renderWorkspace(data);
      })
      .catch(err => console.error("Failed to load workspace data", err));
  }

  function renderWorkspace(data) {
    if (!data) return;

    // 1. Update Header Metadata
    if (elBranchPill) elBranchPill.innerText = `branch: ${data.active_branch}`;
    updateBranchDropdown(data.branches);

    // 2. Render Graph Nodes & Connecting Edges
    renderGraph(data.nodes, data.edges);

    // 3. Render Bottom Timeline Scrubber
    renderTimelineScrubber(data.timeline);

    // 4. Render Right Agent Roster
    renderAgentRoster(data.agent_registry);
  }

  function updateBranchDropdown(branches) {
    if (!elBranchSelect) return;
    elBranchSelect.innerHTML = branches.map(b => `
      <option value="${b.id}" ${b.id === activeBranch ? 'selected' : ''}>
        ${b.name} (${b.id})
      </option>
    `).join("");
    elBranchSelect.onchange = (e) => {
      activeBranch = e.target.value;
      loadWorkspace();
    };
  }

  // ==============================================================================
  // 2. GRAPH CANVAS & NODE RENDERING
  // ==============================================================================
  function renderGraph(nodes, edges) {
    elGraphNodesLayer.innerHTML = "";
    elGraphEdgesSvg.innerHTML = "";

    const nodePositions = {};

    // 1. Render Nodes
    nodes.forEach(node => {
      nodePositions[node.id] = {
        x: node.position.x,
        y: node.position.y,
        w: 290,
        h: 160
      };

      const nodeEl = document.createElement("div");
      nodeEl.className = "research-node";
      nodeEl.style.left = `${node.position.x}px`;
      nodeEl.style.top = `${node.position.y}px`;
      nodeEl.id = `dom_${node.id}`;

      // Node type indicator color
      const typeColor = getNodeColor(node.type);

      // Audit status badge (Feature 1)
      let auditBadgeHtml = "";
      if (node.audit_status === "CONTESTED") {
        auditBadgeHtml = `
          <button class="badge-contested" title="Adversarial Critic flagged potential claim bias" onclick="window.toggleAudit('${node.id}')">
            <span>⚠️ Contested / Red-Team Audit</span>
          </button>
        `;
      }

      // Expandable Audit Card (Feature 1)
      let auditCardHtml = "";
      if (node.audit_status === "CONTESTED" && expandedAuditNodes.has(node.id) && node.audit_data) {
        const a = node.audit_data;
        auditCardHtml = `
          <div class="audit-popover">
            <div class="audit-popover-title">Adversarial Red-Team Audit:</div>
            <div class="audit-popover-text"><strong>Identified Vulnerability:</strong> ${a.vulnerability}</div>
            <div class="audit-popover-text" style="margin-top: 4px;"><strong>Counter-Hypothesis:</strong> ${a.counter_hypothesis}</div>
            <div class="audit-popover-text" style="margin-top: 4px;"><strong>Verification Test:</strong> <code>${a.verification_test}</code></div>
          </div>
        `;
      }

      // Quick action button
      let actionBtnHtml = "";
      if (node.type === "paper" || node.type === "code") {
        actionBtnHtml = `
          <button class="btn btn-outline" style="font-size: 10px; padding: 2px 7px;" onclick="window.runBenchmarkForNode('${node.id}')">
            ▶ Run Benchmark
          </button>
        `;
      }

      nodeEl.innerHTML = `
        <div class="node-header">
          <div class="node-type-indicator">
            <span class="node-dot" style="background-color: ${typeColor};"></span>
            <span style="color: ${typeColor};">${node.type.toUpperCase()}</span>
          </div>
          <span class="font-mono" style="font-size: 10px; color: var(--text-faint); font-weight: 600;">[#${node.id.replace('node_', '')}]</span>
        </div>

        <div class="node-title">${node.title}</div>
        <div class="node-content-snippet">${node.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>

        ${auditBadgeHtml ? `<div style="margin-top: 6px;">${auditBadgeHtml}</div>` : ''}
        ${auditCardHtml}

        <div class="node-footer">
          <span class="font-mono" style="color: var(--text-muted); font-size: 10px;">step: t=${node.timeline_step}</span>
          ${actionBtnHtml}
        </div>
      `;

      elGraphNodesLayer.appendChild(nodeEl);
    });

    // 2. Render SVG Edges (Beziers connecting nodes)
    edges.forEach(edge => {
      const src = nodePositions[edge.source];
      const tgt = nodePositions[edge.target];
      if (!src || !tgt) return;

      const x1 = src.x + src.w;
      const y1 = src.y + 60;
      const x2 = tgt.x;
      const y2 = tgt.y + 60;

      const dx = (x2 - x1) * 0.45;
      const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", edge.relation === "failed_with" ? "var(--accent-failure)" : (edge.relation === "what_if_branch" ? "var(--accent-question)" : "#CBD5E1"));
      path.setAttribute("stroke-width", "1.75");
      path.setAttribute("stroke-dasharray", edge.relation === "what_if_branch" ? "4,3" : "none");

      // Midpoint relation label
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", midX);
      text.setAttribute("y", midY - 4);
      text.setAttribute("fill", "#64748B");
      text.setAttribute("font-size", "9.5");
      text.setAttribute("font-family", "'JetBrains Mono', monospace");
      text.setAttribute("text-anchor", "middle");
      text.textContent = edge.relation;

      elGraphEdgesSvg.appendChild(path);
      elGraphEdgesSvg.appendChild(text);
    });
  }

  function getNodeColor(type) {
    switch (type) {
      case "paper": return "var(--accent-paper)";
      case "question": return "var(--accent-question)";
      case "dataset": return "var(--accent-dataset)";
      case "code": return "var(--accent-code)";
      case "failure": return "var(--accent-failure)";
      case "result": return "var(--accent-result)";
      default: return "#4B5563";
    }
  }

  window.toggleAudit = function(nodeId) {
    if (expandedAuditNodes.has(nodeId)) {
      expandedAuditNodes.delete(nodeId);
    } else {
      expandedAuditNodes.add(nodeId);
    }
    renderGraph(workspaceData.nodes, workspaceData.edges);
  };

  // ==============================================================================
  // 3. FEATURE 2: TIME-TRAVEL EVOLUTION SCRUBBER & BRANCHING
  // ==============================================================================
  function renderTimelineScrubber(timeline) {
    if (!elTimelineTrack) return;
    elTimelineTrack.innerHTML = timeline.map(t => `
      <button class="timeline-step-btn ${t.step === currentTimelineStep ? 'active' : ''}" onclick="window.scrubToStep(${t.step})">
        <span class="step-label">t=${t.step} • ${t.action_type.toUpperCase()}</span>
        <span class="step-sub" title="${t.title}">${t.title}</span>
      </button>
    `).join("");
  }

  window.scrubToStep = function(stepIndex) {
    currentTimelineStep = stepIndex;
    loadWorkspace();
  };

  if (elOpenBranchBtn) {
    elOpenBranchBtn.onclick = () => {
      document.getElementById("branch-modal-sub").innerText = `Forking from branch '${activeBranch}' at snapshot milestone t=${currentTimelineStep}`;
      elBranchModal.classList.add("open");
    };
  }

  if (elCloseBranchBtn) {
    elCloseBranchBtn.onclick = () => elBranchModal.classList.remove("open");
  }

  if (elConfirmBranchBtn) {
    elConfirmBranchBtn.onclick = () => {
      const name = elBranchNameInput.value.trim() || `branch-hyp-${Date.now() % 1000}`;
      fetch(`/api/workspaces/${currentWorkspaceId}/branch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_branch: activeBranch,
          fork_step: currentTimelineStep,
          branch_name: name,
          description: `Alternate hypothesis branch forked at t=${currentTimelineStep}`
        })
      })
        .then(res => res.json())
        .then(res => {
          elBranchModal.classList.remove("open");
          activeBranch = res.branch_id;
          currentTimelineStep = res.forked_at_step + 1;
          loadWorkspace();
        });
    };
  }

  // ==============================================================================
  // 4. FEATURE 3: PAPER-TO-RUNNABLE-BENCHMARK TERMINAL DRAWER
  // ==============================================================================
  window.runBenchmarkForNode = function(nodeId) {
    elBenchmarkDrawer.classList.remove("collapsed");
    elTerminalBody.textContent = "[SYNAPSE_SANDBOX] Spawning CPU container & dispatching task...\n";
    elComparisonBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Running benchmark execution...</td></tr>`;

    fetch(`/api/workspaces/${currentWorkspaceId}/benchmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ node_id: nodeId })
    })
      .then(res => res.json())
      .then(res => {
        elTerminalBody.textContent = res.stdout;
        renderComparisonTable(res.comparison);
      });
  };

  if (elRunBenchmarkBtn) {
    elRunBenchmarkBtn.onclick = () => window.runBenchmarkForNode("node_105");
  }

  if (elCloseBenchmarkBtn) {
    elCloseBenchmarkBtn.onclick = () => elBenchmarkDrawer.classList.add("collapsed");
  }

  function renderComparisonTable(comparisons) {
    if (!elComparisonBody) return;
    elComparisonBody.innerHTML = comparisons.map(c => `
      <tr>
        <td style="font-weight: 600;">${c.metric}</td>
        <td class="font-mono">${c.reported}${c.unit}</td>
        <td class="font-mono" style="font-weight: 700;">${c.reproduced}${c.unit}</td>
        <td class="font-mono" style="font-weight: 700; color: ${c.delta < 0 ? 'var(--accent-failure)' : 'var(--accent-code)'};">
          ${c.delta_pct}
        </td>
        <td>
          <span class="badge ${c.verdict === 'DEGRADED' ? 'badge-amber' : 'badge-slate'}">${c.verdict}</span>
        </td>
      </tr>
    `).join("");
  }

  // ==============================================================================
  // 5. FEATURE 4: AGENT GENETIC EVOLUTION & RETIREMENT ARENA
  // ==============================================================================
  function renderAgentRoster(agents) {
    if (!elAgentRoster) return;
    elAgentRoster.innerHTML = agents.map(ag => `
      <div class="agent-card ${ag.status === 'retired' ? 'retired' : ''}">
        <div class="agent-top-row">
          <span class="agent-name">${ag.name}</span>
          <span class="badge ${ag.status === 'retired' ? 'badge-slate' : (ag.reward_score >= 80 ? 'badge-emerald' : 'badge-amber')} font-mono">
            ${ag.status.toUpperCase()} (GEN ${ag.generation})
          </span>
        </div>
        <div class="agent-role">${ag.role}</div>

        <div class="reward-meter-wrap">
          <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">REWARD:</span>
          <div class="reward-bar-bg">
            <div class="reward-bar-fill" style="width: ${ag.reward_score}%; background-color: ${ag.reward_score >= 80 ? 'var(--accent-dataset)' : (ag.reward_score >= 60 ? 'var(--accent-code)' : 'var(--accent-failure)')};"></div>
          </div>
          <span class="reward-score-val">${ag.reward_score}/100</span>
        </div>

        ${ag.retirement_reason ? `
          <div style="font-size: 10px; color: var(--accent-failure); margin-top: 4px; line-height: 1.3;">
            ⚠️ <strong>Retirement Reason:</strong> ${ag.retirement_reason}
          </div>
        ` : ''}

        ${ag.status !== 'retired' ? `
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button class="btn btn-outline" style="font-size: 10px; padding: 2px 7px;" onclick="window.controlAgent('${ag.id}', 'approve')">Approve (+2)</button>
            <button class="btn btn-outline" style="font-size: 10px; padding: 2px 7px;" onclick="window.controlAgent('${ag.id}', 'reject')">Reject (-5)</button>
            <button class="btn btn-outline" style="font-size: 10px; padding: 2px 7px;" onclick="window.controlAgent('${ag.id}', 'pause')">Pause</button>
          </div>
        ` : ''}
      </div>
    `).join("");
  }

  window.controlAgent = function(agentId, action) {
    fetch(`/api/agents/${agentId}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    })
      .then(res => res.json())
      .then(() => loadWorkspace());
  };

  if (elSimulateEvolutionBtn) {
    elSimulateEvolutionBtn.onclick = () => {
      fetch("/api/agents/simulate-failure", { method: "POST" })
        .then(res => res.json())
        .then(() => loadWorkspace());
    };
  }

  // ==============================================================================
  // 6. FEATURE 1: PAPER INGESTION & RED-TEAM AUDIT TRIGGER
  // ==============================================================================
  if (elOpenIngestBtn) {
    elOpenIngestBtn.onclick = () => elIngestModal.classList.add("open");
  }
  if (elCloseIngestBtn) {
    elCloseIngestBtn.onclick = () => elIngestModal.classList.remove("open");
  }

  if (elSubmitIngestBtn) {
    elSubmitIngestBtn.onclick = () => {
      const text = elInputText.value.trim();
      const url = elSourceUrl.value.trim();
      if (!text) return;

      fetch(`/api/workspaces/${currentWorkspaceId}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_text: text,
          source_url: url,
          branch: activeBranch
        })
      })
        .then(res => res.json())
        .then(res => {
          elIngestModal.classList.remove("open");
          elInputText.value = "";
          expandedAuditNodes.add(res.node_id);
          currentTimelineStep = 8;
          loadWorkspace();
        });
    };
  }

  // ==============================================================================
  // 7. FEATURE 5: 1-CLICK CITATION-BACKED LITERATURE REVIEW EXPORT
  // ==============================================================================
  if (elExportBtn) {
    elExportBtn.onclick = () => {
      window.location.href = `/api/workspaces/${currentWorkspaceId}/export?branch=${encodeURIComponent(activeBranch)}`;
    };
  }

  // --- INITIAL LOAD ---
  loadWorkspace();
});
