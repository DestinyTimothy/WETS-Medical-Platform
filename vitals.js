/* ==========================================================================
   WETS - Advanced Real-Time Telemetry & AI Classification Pipeline Engine
   ========================================================================== */

// 1. Core State Configuration Matrix
let isWaveformRunning = true;
let canvas, ctx;
let animationFrameId;
let currentRhythmMode = "NORM";
let globalDataBufferIndex = 0;

// 2. 7-Class Signal Mapping Registry (Mathematical Rhythm Representations)
const CARDIO_SHAPES_REGISTRY = {
    "NORM":  [0, 0, 0, 0, 0, 0.02, 0.05, 0.1, 0.15, 0.1, 0.05, 0, -0.05, 0.2, 1.2, -0.4, 0, 0.1, 0.2, 0.3, 0.2, 0.1, 0, 0, 0, 0],
    "STACH": [0, 0, 0.1, 0.2, 1.3, -0.5, 0, 0.3, 0.4, 0.2, 0, 0, 0.1, 0.2, 1.3, -0.5, 0, 0.3, 0.4, 0.2, 0],
    "SBRAD": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05, 0.1, 1.1, -0.3, 0, 0.2, 0.3, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "MI":    [0, 0, 0, 0, 0.05, 0.1, 1.0, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0, 0, 0, 0, 0.05, 0.1, 1.0, 0.7, 0.6, 0.5],
    "CD":    [0, 0, 0.05, 0.05, 0, 1.1, -0.4, 0, 0.1, 0, 0, 0, 0, 0.05, 0.05, 0, 1.1, -0.4, 0, 0.1, 0, 0, 0, 0],
    "AFIB":  [0, 0.1, -0.1, 0.15, -0.05, 0.2, 0.9, -0.3, 0.1, -0.1, 0.2, -0.1, 0.05, -0.1, 0.1, 0.8, -0.2, 0.15, -0.05],
    "PVC":   [0, 0, 0, 0.1, 1.4, -0.8, -0.4, -0.1, 0, 0, 0, 0, 0, 0, 0, 0.1, 1.4, -0.8, -0.4, -0.1, 0, 0, 0, 0, 0]
};

// Mock string matching the format expected by Python backend processing
const hardwareTelemetryMockStream = "0.0, 0.0, 0.05, 0.1, 1.2, -0.4, 0.0, 0.2, 0.0";

/* ==========================================================================
   Initialization Gateways
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initializeECGCanvas();
    startTelemetryPipelineLoop();
});

// Canvas Context Workspace Setup
function initializeECGCanvas() {
    canvas = document.getElementById("vitalsMiniWaveform");
    if (!canvas) return;
    
    ctx = canvas.getContext("2d");
    
    // Set explicit internal resolution matching actual bounding box sizes
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Start drawing loop frame cycle
    renderWaveformCycle();
}

/* ==========================================================================
   The Continuous Canvas Drawing Loop
   ========================================================================== */
function renderWaveformCycle() {
    if (!isWaveformRunning) return;

    // Get active wave configuration data based on system diagnosis state
    const targetPattern = CARDIO_SHAPES_REGISTRY[currentRhythmMode] || CARDIO_SHAPES_REGISTRY["NORM"];
    
    // Shift canvas pixel layout left by 2 pixels to animate rolling effect
    let imageData = ctx.getImageData(2, 0, canvas.width - 2, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    // Clear the tiny trailing edge slice to keep rendering crisp
    ctx.fillStyle = "#040d1a"; // Deep matching slate canvas variable
    ctx.fillRect(canvas.width - 2, 0, 2, canvas.height);
    
    // Draw grid lines on trailing edge slice to map telemetry matrix layout
    ctx.strokeStyle = "rgba(16, 185, 129, 0.04)";
    if (Math.floor(Date.now() / 20) % 10 === 0) {
        ctx.beginPath();
        ctx.moveTo(canvas.width - 2, 0);
        ctx.lineTo(canvas.width - 2, canvas.height);
        ctx.stroke();
    }

    // Capture precise baseline value heights
    const centerY = canvas.height / 2;
    const valueIndex = globalDataBufferIndex % targetPattern.length;
    const rawSignalValue = targetPattern[valueIndex];
    
    // Scale current vector point onto visual pixel grid heights
    const mappedY = centerY - (rawSignalValue * (canvas.height * 0.35));
    
    // Draw pixel segment line matching modern neon glow themes
    ctx.strokeStyle = currentRhythmMode === "NORM" ? "#10b981" : "#dc2626"; // Green for safe, Red for warning signatures
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = ctx.strokeStyle;
    
    ctx.beginPath();
    ctx.moveTo(canvas.width - 3, centerY); // Simple vector path connection anchor
    ctx.lineTo(canvas.width - 1, mappedY);
    ctx.stroke();
    
    // Reset shadow matrices so background rendering optimization stays high
    ctx.shadowBlur = 0;
    
    globalDataBufferIndex++;
    animationFrameId = requestAnimationFrame(renderWaveformCycle);
}

/* ==========================================================================
   Asynchronous Backend AI Communication Layer
   ========================================================================== */
function startTelemetryPipelineLoop() {
    // Fire immediate execution check, then lock tracking to a solid 4-second update cycle
    fetchAIDiagnosticPacket();
    setInterval(fetchAIDiagnosticPacket, 4000);
}

async function fetchAIDiagnosticPacket() {
    try {
        const payload = {
            patient_id: "MRN_08050852601333",
            signal_string: hardwareTelemetryMockStream
        };

        const response = await fetch("http://127.0.0.1:8000/api/vitals/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Network pipe responded with rejection status code");
        
        const data = await response.json();
        
        // Push the data out to live DOM node update engines
        updateNumericalCards(data.metrics);
        renderWETSAIDiagnosticClassification(data.diagnosis);

    } catch (error) {
        console.warn("Telemetry connection standby mode. Local baseline fallback active. Detail: ", error.message);
        // Fallback safety baseline if backend server is cycling or offline
        const fallbackDiagnosis = { class_code: "NORM", rhythm_classification: "Normal Sinus Rhythm" };
        renderWETSAIDiagnosticClassification(fallbackDiagnosis);
    }
}

/* ==========================================================================
   UI DOM Element Modifiers (Lighting Up the Triage Screen)
   ========================================================================== */
function updateNumericalCards(metrics) {
    if (!metrics) return;
    
    const hrDisplay = document.getElementById("vitalsHeartRateDisplay");
    const spo2Display = document.getElementById("vitalsSpO2Display");
    
    if (hrDisplay && metrics.heart_rate) hrDisplay.innerText = Math.round(metrics.heart_rate);
    if (spo2Display && metrics.spo2) spo2Display.innerText = Math.round(metrics.spo2);
}

/**
 * Sweeps through the 7-class triage list, resets previous markers,
 * and flashes the target classification with high-contrast alert or healthy styles.
 */
function renderWETSAIDiagnosticClassification(diagnosis) {
    if (!diagnosis || !diagnosis.class_code) return;
    
    const targetCode = diagnosis.class_code.toUpperCase(); // e.g., NORM, MI, AFIB
    
    // Update active loop tracker variable so the canvas instantly swaps its rhythm signature shape
    if (CARDIO_SHAPES_REGISTRY[targetCode]) {
        currentRhythmMode = targetCode;
    }

    // 1. Loop through all 7 rows and reset them completely back to default standby mode
    document.querySelectorAll('.disease-row-item').forEach(row => {
        row.className = "disease-row-item dynamic-status-inactive";
        
        const statusTextNode = row.querySelector('.row-status-text');
        if (statusTextNode) statusTextNode.innerText = "Standby";
    });

    // 2. Identify the target diagnostic component container row matching the active code
    const targetActiveRow = document.getElementById(`class-row-${targetCode}`);
    if (targetActiveRow) {
        const statusTextNode = targetActiveRow.querySelector('.row-status-text');
        
        if (targetCode === "NORM") {
            // Apply premium safe/healthy styling overrides
            targetActiveRow.className = "disease-row-item dynamic-status-active-healthy";
            if (statusTextNode) statusTextNode.innerText = "Active Trace";
        } else {
            // Apply premium glowing high-contrast critical triage alert styling overrides
            targetActiveRow.className = "disease-row-item dynamic-status-active-alert";
            if (statusTextNode) statusTextNode.innerText = "CRITICAL TRACE";
        }
    }
}

/* ==========================================================================
   Hardware Functional Control Button Stubs
   ========================================================================== */
function loadECG() { console.log("Restoring archived telemetry configuration files..."); }
function saveECG() { console.log("Exporting active baseline trace metrics to system logs..."); }

function pauseECG() {
    isWaveformRunning = !isWaveformRunning;
    if (isWaveformRunning) {
        renderWaveformCycle();
        console.log("Telemetry animation track resumed.");
    } else {
        cancelAnimationFrame(animationFrameId);
        console.log("Telemetry animation track frozen.");
    }
}

function stopECG() {
    isWaveformRunning = false;
    cancelAnimationFrame(animationFrameId);
    if (ctx && canvas) {
        ctx.fillStyle = "#040d1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    console.log("System telemetry pipeline stream terminated.");
}

function toggleUDP() { console.log("Cycling target hardware communication sockets..."); }
function addConsultation() { console.log("Opening consultation entry module..."); }
function addDrugPrescription() { console.log("Opening prescription matrix panel..."); }
function showPersonalInfo() { console.log("Opening personal detail context window..."); }

function navigateTo(targetUrl) {
    window.location.href = targetUrl;
}