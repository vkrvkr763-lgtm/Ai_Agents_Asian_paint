const API_URL = "http://localhost:8000";

async function startAnalysis() {
    const rfpText = document.getElementById('rfp-input').value.trim();
    
    if (!rfpText) {
        alert("Please paste some RFP text to analyze.");
        return;
    }

    // 1. Switch Views
    document.getElementById('view-welcome').classList.add('hidden');
    document.getElementById('view-active').classList.remove('hidden');
    
    // 2. Add User Message
    addMessageToFeed(`Uploaded Analysis Request for: "${rfpText.substring(0, 50)}..."`);

    // 3. Call Strategist API
    updateAgentStatus('strategist', 'active', 'Analyzing Bid...');
    const thinkingId = addThinkingMessage('Strategist Agent');

    try {
        const response = await fetch(`${API_URL}/analyze-rfp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: rfpText })
        });
        
        const data = await response.json();
        
        // Update Strategist UI
        updateStrategistUI(thinkingId, data, rfpText);
        
    } catch (error) {
        console.error("API Error:", error);
        document.getElementById(thinkingId).innerHTML = `<div class="text-red-500">Backend Error: Ensure server is running on port 8000</div>`;
    }
}

async function runDrafterAgent(rfpText) {
    updateAgentStatus('drafter', 'active', 'Drafting...');
    const thinkingId = addThinkingMessage('Drafter Agent');

    try {
        const response = await fetch(`${API_URL}/draft-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requirement: rfpText })
        });
        
        const data = await response.json();
        const draftText = data.draft;

        // Update Drafter UI
        document.getElementById(thinkingId).innerHTML = `
            <div class="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0"><i class="ph-fill ph-pen-nib text-xl"></i></div>
            <div class="bg-white border border-slate-200 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm max-w-3xl w-full">
                <div class="flex items-center gap-2 mb-3">
                    <span class="font-bold text-slate-800">Drafter Agent</span>
                    <span class="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">Draft Generated</span>
                </div>
                <div class="prose prose-sm text-slate-600 max-w-none">${draftText}</div>
            </div>
        `;
        updateAgentStatus('drafter', 'idle', 'Draft Complete');

        // Automatically Trigger Compliance
        runComplianceAgent(draftText);

    } catch (error) {
        console.error("API Error:", error);
    }
}

async function runComplianceAgent(draftText) {
    updateAgentStatus('compliance', 'active', 'Auditing...');
    const thinkingId = addThinkingMessage('Compliance Agent');

    try {
        const response = await fetch(`${API_URL}/check-compliance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draft_text: draftText })
        });
        
        const data = await response.json();
        const auditText = data.audit;
        const isRisk = auditText.includes("RISK DETECTED");
        const colorClass = isRisk ? "red" : "green";
        const statusText = isRisk ? "RISK FOUND" : "CLEAN";

        document.getElementById(thinkingId).innerHTML = `
            <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-${colorClass}-600 flex items-center justify-center text-white shadow-lg flex-shrink-0 ${isRisk ? 'animate-pulse' : ''}">
                    <i class="ph-fill ph-shield-check text-xl"></i>
                </div>
                <div class="bg-${colorClass}-50 border border-${colorClass}-200 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm max-w-2xl w-full">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="font-bold text-${colorClass}-800">Compliance Agent</span>
                        <span class="text-xs bg-${colorClass}-200 text-${colorClass}-800 px-2 py-0.5 rounded-full font-bold">${statusText}</span>
                    </div>
                    <div class="text-sm text-${colorClass}-800 whitespace-pre-wrap font-medium">${auditText}</div>
                </div>
            </div>
        `;
        updateAgentStatus('compliance', isRisk ? 'alert' : 'idle', isRisk ? 'Risk Found' : 'Audit Passed');

    } catch (error) {
        console.error("API Error:", error);
    }
}

// --- Helper UI Functions (Same as before) ---
function addMessageToFeed(text) {
    const chatFeed = document.getElementById('chat-feed');
    chatFeed.innerHTML += `<div class="flex justify-end"><div class="bg-slate-100 text-slate-800 px-6 py-4 rounded-2xl rounded-tr-none max-w-xl"><p class="font-medium">${text}</p></div></div>`;
}

function addThinkingMessage(agentName) {
    const chatFeed = document.getElementById('chat-feed');
    const id = 'thinking-' + Date.now();
    chatFeed.innerHTML += `
        <div id="${id}" class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-300 flex-shrink-0"><i class="ph-fill ph-spinner animate-spin text-xl"></i></div>
            <div class="bg-white border border-slate-200 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm max-w-md w-full">
                <div class="flex items-center gap-2 mb-2"><span class="font-bold text-slate-800">${agentName}</span><span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Processing...</span></div>
                <div class="space-y-2"><div class="h-2 bg-slate-100 rounded w-3/4 animate-pulse"></div><div class="h-2 bg-slate-100 rounded w-1/2 animate-pulse"></div></div>
            </div>
        </div>`;
    return id;
}

function updateAgentStatus(agentId, status, text) {
    const card = document.getElementById('agent-' + agentId);
    const dot = document.getElementById('status-' + agentId);
    const desc = document.getElementById('desc-' + agentId);
    
    // Remove active classes
    document.querySelectorAll('.agent-card').forEach(c => {
        c.classList.remove('agent-active', 'bg-slate-800', 'border-slate-700');
        c.classList.add('bg-slate-800/30');
    });

    if (status === 'active') {
        card.classList.add('agent-active');
        dot.className = 'status-dot status-active';
        desc.innerText = text;
        desc.classList.add('text-green-400');
    } else if (status === 'alert') {
        card.classList.add('agent-active');
        card.style.borderLeftColor = '#ef4444';
        dot.className = 'status-dot status-alert';
        desc.innerText = text;
        desc.classList.add('text-red-400');
    } else {
        dot.className = 'status-dot status-idle';
        desc.innerText = text;
        desc.classList.remove('text-green-400', 'text-red-400');
    }
}

function updateStrategistUI(containerId, data, rfpText) {
    const container = document.getElementById(containerId);
    const colorClass = data.decision === "BID" ? "green" : "red";
    
    container.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <i class="ph-fill ph-brain text-xl"></i>
        </div>
        <div class="bg-white border border-slate-200 p-0 rounded-2xl rounded-tl-none shadow-sm max-w-2xl w-full overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-slate-50/50">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-slate-800 text-lg">Strategic Analysis</h3>
                        <p class="text-sm text-slate-500">Based on RFP Content</p>
                    </div>
                    <span class="bg-${colorClass}-100 text-${colorClass}-700 px-3 py-1 rounded-full text-xs font-bold border border-${colorClass}-200">DECISION: ${data.decision}</span>
                </div>
            </div>
            <div class="p-5 grid grid-cols-3 gap-4">
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <div class="text-2xl font-bold text-slate-800">${data.probability}</div>
                    <div class="text-xs text-slate-500 font-medium uppercase mt-1">Win Prob.</div>
                </div>
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <div class="text-2xl font-bold text-slate-800">${data.value}</div>
                    <div class="text-xs text-slate-500 font-medium uppercase mt-1">Est. Value</div>
                </div>
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <div class="text-2xl font-bold text-orange-500">${data.effort}</div>
                    <div class="text-xs text-slate-500 font-medium uppercase mt-1">Effort</div>
                </div>
            </div>
            <div class="px-5 pb-4">
                <p class="text-sm text-slate-600 italic">"${data.reasoning}"</p>
            </div>
            <div class="p-4 bg-blue-50/50 border-t border-blue-100 flex justify-between items-center">
                <p class="text-sm text-blue-800"><span class="font-semibold">Insight:</span> ${data.insight}</p>
                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition" onclick="runDrafterAgent('${rfpText.replace(/['"\n]/g, " ")}')">Start Drafting</button>
            </div>
        </div>
    `;
    updateAgentStatus('strategist', 'idle', 'Analysis Complete');
}