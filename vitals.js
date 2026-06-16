/**
 * WETS - Vitals Dashboard Core Processing Engine & AI Mediator
 * Fully Integrated Canvas Animation Loop and FastAPI Handshake Pipeline
 */

// Architectural Real-world Cardiac Shapes Matrix (Look-Up Tables)
const CARDIO_SHAPES_REGISTRY = {
    "NORM": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05, 0.1, 0.15, 0.1, 0.05, 0, 0, 0, 0, 0, -0.1, 0.2, 1.2, -0.4, 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.25, 0.2, 0.1, 0, 0, 0, 0, 0], 
    "STACH": [0, 0, 0.1, 1.3, -0.5, 0, 0.3, 0, 0], // Compressed time-domain (Fast Heartbeat)
    "SBRAD": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05, 0.1, 1.1, -0.3, 0, 0.2, 0, 0, 0, 0, 0, 0, 0, 0], // Extended resting line (Slow Heartbeat)
    "MI": [0, 0, 0, 0.05, 0.1, 1.0, 0.6, 0.5, 0.4, 0.2, 0, 0, 0], // Elevated ST-Segment (Heart Attack signature)
    "CD": [0, 0, 0.05, 0.05, 0.0, 1.1, -0.4, 0, 0, 0.1, 0, 0, 0] // Widened, notched QRS layout (Electrical block)
};

// Canvas and Animation Architecture Variables
let ecgCanvas;
let ecgCtx;
let ecgAnimationId;
let ecgData = [];
let shapeIndex = 0;
let ecgRunning = true;
let ecgPaused = false;

// Default visual profile tracking state
let currentActiveShape = CARDIO_SHAPES_REGISTRY["NORM"];
let vitalsAIIntervalId = null; 

// Initializer: Fires automatically when DOM loading completes
document.addEventListener('DOMContentLoaded', function() {
    ecgCanvas = document.getElementById('vitalsMiniWaveform') || document.getElementById('ecgMonitoringWaveform');
    
    if (ecgCanvas) {
        ecgCtx = ecgCanvas.getContext('2d');
        
        // Formulate layout mapping sizes
        resizeVitalsCanvas();
        window.addEventListener('resize', resizeVitalsCanvas);
        
        // Cold start animation cycle
        startVitalsECG();
    }
    
    // Cold start standalone test run configuration for profile testing
    initializeVitalsAIProcessing("Osama Elnahas");
});

function resizeVitalsCanvas() {
    if (!ecgCanvas) return;
    const container = ecgCanvas.parentElement;
    ecgCanvas.width = container.clientWidth;
    ecgCanvas.height = 220; // Specialized baseline height matrix optimized for dashboard layout slots
}

/**
 * Appends transformed data calculations into the active runtime graphics array
 */
function generateNextVitalsPoint() {
    if (!ecgCanvas) return;

    // Route points dynamically based on the active disease shape selected by the AI payload
    let nextValue = currentActiveShape[shapeIndex];
    
    shapeIndex++;
    if (shapeIndex >= currentActiveShape.length) {
        shapeIndex = 0; // Wrap tracking registers back to zero smoothly
    }
    
    const midPoint = ecgCanvas.height / 2;
    const amplitudeScale = ecgCanvas.height * 0.35; // Locked 35% height boundary scale factor
    let yPixelCoordinate = midPoint - (nextValue * amplitudeScale);
    
    ecgData.push(yPixelCoordinate);
    
    // Maintain maximum boundary limits matched step-for-pixel to physical screen width
    if (ecgData.length > ecgCanvas.width) {
        ecgData.shift(); // Leftward timeline shift
    }
}

/**
 * Core Hardware-Accelerated Animation Loop Control Engine
 */
function animateVitalsECG() {
    if (!ecgRunning || ecgPaused) return;
    
    generateNextVitalsPoint();
    drawVitalsScreen();
    
    ecgAnimationId = requestAnimationFrame(animateVitalsECG);
}

function drawVitalsGrid() {
    ecgCtx.strokeStyle = 'rgba(16, 37, 64, 0.4)';
    ecgCtx.lineWidth = 1;
    const gridSpacing = 20;
    
    for (let x = 0; x < ecgCanvas.width; x += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(x, 0); ecgCtx.lineTo(x, ecgCanvas.height); ecgCtx.stroke();
    }
    for (let y = 0; y < ecgCanvas.height; y += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(0, y); ecgCtx.lineTo(ecgCanvas.width, y); ecgCtx.stroke();
    }
}

function drawVitalsScreen() {
    // Reset background canvas buffer box frame
    ecgCtx.fillStyle = '#040d1a';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    
    drawVitalsGrid();
    
    // Graphic stroke configuration layout parameters
    ecgCtx.strokeStyle = '#10b981'; // Healthcare Neon Green track line
    ecgCtx.lineWidth = 2.2;
    ecgCtx.lineJoin = 'round';
    ecgCtx.beginPath();
    
    for (let i = 0; i < ecgData.length; i++) {
        if (i === 0) ecgCtx.moveTo(i, ecgData[i]);
        else ecgCtx.lineTo(i, ecgData[i]);
    }
    ecgCtx.stroke();
}

function startVitalsECG() {
    ecgRunning = true;
    ecgPaused = false;
    ecgData = [];
    shapeIndex = 0;
    
    if (ecgCanvas) {
        const midPoint = ecgCanvas.height / 2;
        // Prefill trace data list matrix to stop trace lag glitches on initialization 
        for (let i = 0; i < ecgCanvas.width; i++) {
            ecgData.push(midPoint);
        }
    }
    animateVitalsECG();
}

/* ==========================================================================
   WETS Interface Pipeline Extensions - FastAPI Core Server Connections
   ========================================================================== */

/**
 * Initializes the recurring background synchronization loops
 */
function initializeVitalsAIProcessing(patientId) {
    if (vitalsAIIntervalId) clearInterval(vitalsAIIntervalId);

    // Mock representation string of raw file inputs streaming across data parameters
    const hardwareTelemetryMockStream = "0.0, 0.0, 0.05, 0.1, 1.2, -0.4, 0.0, 0.2, 0.0";

    // Immediate first execution fetch
    requestVitalsDiagnosticAnalysis(patientId, hardwareTelemetryMockStream);

    // Poll the FastAPI model every 4 seconds
    vitalsAIIntervalId = setInterval(() => {
        if (ecgRunning && !ecgPaused) {
            requestVitalsDiagnosticAnalysis(patientId, hardwareTelemetryMockStream);
        }
    }, 4000);
}

/**
 * Posts active tracking parameters over network fetch requests to Python
 */
async function requestVitalsDiagnosticAnalysis(patientId, rawTelemetryString) {
    const targetEndpoint = "http://127.0.0.1:8000/api/telemetry/analyze";

    try {
        const response = await fetch(targetEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patient_id: patientId, signal_string: rawTelemetryString })
        });

        if (!response.ok) throw new Error("Vitals interface handshake route error.");
        const clinicalPackage = await response.json();

        if (clinicalPackage.status === "success") {
            renderAICardiacProfileMetrics(clinicalPackage);
        }
    } catch (netError) {
        console.error("Vitals AI Synchronization Stream Interrupted:", netError);
    }
}

/**
 * Alters DOM element inner text data nodes dynamically from AI predictions
 */
function renderAICardiacProfileMetrics(aiData) {
    // 1. Locate and alter numerical dashboard card displays
    const bpmElement = document.querySelector('.vital-card-heartrate .vital-value') || document.getElementById('vitalsHeartRateDisplay');
    const spo2Element = document.querySelector('.vital-card-spo2 .vital-value') || document.getElementById('vitalsSpO2Display');
    
    if (bpmElement) bpmElement.textContent = aiData.metrics.heart_rate;
    if (spo2Element) spo2Element.textContent = Math.round(aiData.metrics.spo2) + "%";

    // 2. Locate or dynamically insert the specialized clinical assessment badge inside sidebar
    let aiBadgeNode = document.getElementById('wetsVitalsAIBadge');
    
    if (!aiBadgeNode) {
        const targetSidebarContainer = document.querySelector('.patient-card') || document.querySelector('.sidebar') || document.querySelector('.left-column');
        if (targetSidebarContainer) {
            aiBadgeNode = document.createElement('div');
            aiBadgeNode.id = 'wetsVitalsAIBadge';
            aiBadgeNode.style.marginTop = '20px';
            aiBadgeNode.style.paddingTop = '15px';
            aiBadgeNode.style.borderTop = '1px solid rgba(255,255,255,0.1)';
            targetSidebarContainer.appendChild(aiBadgeNode);
        }
    }

    if (aiBadgeNode) {
        const code = aiData.diagnosis.class_code;
        const rhythm = aiData.diagnosis.rhythm_classification;

        let trackingColorClass = "diag-norm";
        if (code === "MI") trackingColorClass = "diag-mi";
        else if (code === "STTC" || code === "CD") trackingColorClass = "diag-warn";

        aiBadgeNode.innerHTML = `
            <div style="font-size: 0.7rem; text-transform: uppercase; color: #8a99ad; margin-bottom: 6px; font-weight: 700; letter-spacing: 0.5px;">WETS AI Diagnostic Classification</div>
            <span class="status-badge ${trackingColorClass}" style="display: block; text-align: center; box-sizing: border-box; width: 100%;">
                ● ${rhythm} [${code}]
            </span>
        `;
    }

    // 3. Update active trace shape configuration structure instantly for the next frame
    const verifiedCode = aiData.diagnosis.class_code;
    if (CARDIO_SHAPES_REGISTRY[verifiedCode]) {
        currentActiveShape = CARDIO_SHAPES_REGISTRY[verifiedCode];
    }
}

/**
 * Controller intersection hook mapping patient click actions from directory screens
 */
function viewPatientVitalsFolder(selectedPatientName) {
    const patientField = document.getElementById('patientProfileNameField') || document.querySelector('.patient-info h2');
    if (patientField) patientField.textContent = selectedPatientName;
    
    // Kickstart tracking engine loop for the newly targeted patient profile
    initializeVitalsAIProcessing(selectedPatientName);
}