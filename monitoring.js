/**
 * WETS - Live Monitoring Processing Engine
 * Synchronized Look-Up Table (LUT) Waveform Stream Framework
 * Fully Integrated with FastAPI Triage Machine Learning Core
 */

// Dynamic heartbeat shapes based on real-world conditions
const CARDIAC_SHAPES = {
    "NORM": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05, 0.1, 0.15, 0.1, 0.05, 0, 0, 0, 0, 0, -0.1, 0.2, 1.2, -0.4, 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.25, 0.2, 0.1, 0, 0, 0, 0, 0], 
    "STACH": [0, 0, 0.1, 1.3, -0.5, 0, 0.3, 0, 0], // Fast pacing
    "SBRAD": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05, 0.1, 1.1, -0.3, 0, 0.2, 0, 0, 0, 0, 0, 0, 0, 0], // Slow pacing
    "MI": [0, 0, 0, 0.05, 0.1, 1.0, 0.6, 0.5, 0.4, 0.2, 0, 0, 0], // Elevated ST Segment
    "CD": [0, 0, 0.05, 0.05, 0.0, 1.1, -0.4, 0, 0, 0.1, 0, 0, 0] // Wide QRS Complex
};

// Application Global State Registers
let ecgCanvas;
let ecgCtx;
let ecgAnimationId;
let ecgData = [];
let shapeIndex = 0;
let ecgRunning = true;
let ecgPaused = false;
let currentActiveShape = CARDIAC_SHAPES["NORM"];
let aiIntervalId = null; // Holds our AI fetching loop ticker

// Core Synchronization Initializer
document.addEventListener('DOMContentLoaded', function() {
    ecgCanvas = document.getElementById('ecgMonitoringWaveform');
    if (ecgCanvas) {
        ecgCtx = ecgCanvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        startECGMonitoring();
    }
});

function resizeCanvas() {
    if (!ecgCanvas) return;
    const container = ecgCanvas.parentElement;
    ecgCanvas.width = container.clientWidth;
    ecgCanvas.height = 350;
}

// Generates and pushes coordinate tracks onto our time-domain array
function generateNextGraphPoint() {
    if (!ecgCanvas) return;

    let nextValue = currentActiveShape[shapeIndex];
    
    shapeIndex++;
    if (shapeIndex >= currentActiveShape.length) {
        shapeIndex = 0; 
    }
    
    const midPoint = ecgCanvas.height / 2;
    const amplitudeScale = ecgCanvas.height * 0.35; // Standard 35% scaling factor
    let yPixelCoordinate = midPoint - (nextValue * amplitudeScale);
    
    ecgData.push(yPixelCoordinate);
    if (ecgData.length > ecgCanvas.width) {
        ecgData.shift(); 
    }
}

// Main Hardware-Accelerated Animation Loop
function animateECG() {
    if (!ecgRunning || ecgPaused) return;
    
    generateNextGraphPoint(); // FIX #1: Dynamically add points using active AI shapes
    drawECGWaveform();
    
    ecgAnimationId = requestAnimationFrame(animateECG);
}

function drawECGGrid() {
    ecgCtx.strokeStyle = 'rgba(16, 37, 64, 0.5)';
    ecgCtx.lineWidth = 1;
    const gridSpacing = 20;
    
    for (let x = 0; x < ecgCanvas.width; x += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(x, 0); ecgCtx.lineTo(x, ecgCanvas.height); ecgCtx.stroke();
    }
    for (let y = 0; y < ecgCanvas.height; y += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(0, y); ecgCtx.lineTo(ecgCanvas.width, y); ecgCtx.stroke();
    }
}

function drawECGWaveform() {
    ecgCtx.fillStyle = '#040d1a';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    
    drawECGGrid();
    
    ecgCtx.strokeStyle = '#10b981'; 
    ecgCtx.lineWidth = 2.5;
    ecgCtx.lineJoin = 'round'; 
    ecgCtx.beginPath();
    
    for (let i = 0; i < ecgData.length; i++) {
        if (i === 0) ecgCtx.moveTo(i, ecgData[i]);
        else ecgCtx.lineTo(i, ecgData[i]);
    }
    ecgCtx.stroke();
}

function startECGMonitoring() {
    ecgRunning = true;
    ecgPaused = false;
    ecgData = [];
    shapeIndex = 0;
    
    if (ecgCanvas) {
        const midPoint = ecgCanvas.height / 2;
        for (let i = 0; i < ecgCanvas.width; i++) {
            ecgData.push(midPoint);
        }
    }
    animateECG();
}

function stopECGMonitoring() {
    ecgRunning = false;
    if (ecgAnimationId) cancelAnimationFrame(ecgAnimationId);
    if (aiIntervalId) clearInterval(aiIntervalId); // Kill the background AI data tracking routine
    
    ecgCtx.fillStyle = '#040d1a';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    drawECGGrid();
    ecgData = [];
}

/* ==========================================================================
   Telemetry UI Interfaces & Form Actions Intersections
   ========================================================================== */

function plotECG() { if (!ecgRunning) startECGMonitoring(); showNotification('ECG live plotting sequence initialized', 'success'); }
function toggleUDP() { showNotification('UDP peripheral data communications connection verified', 'info'); }
function turnOn() { if (!ecgRunning) startECGMonitoring(); showNotification('Monitoring systems fully active', 'success'); }
function turnOff() { stopECGMonitoring(); showNotification('Monitoring channels deactivated', 'warning'); }

function saveConnection() { showNotification('Patient link tracking configurations saved', 'success'); }
function stopConnection() {
    stopECGMonitoring();
    const connectBtn = document.querySelector('.connect-btn');
    if (connectBtn) {
        connectBtn.textContent = 'Connect';
        connectBtn.style.backgroundColor = '#10559d';
    }
    showNotification('Active data session link broken', 'warning');
}

// FIX #4: Pass 'event' element explicitly into click target functions
function pauseConnection(event) {
    if (!ecgRunning) return;
    ecgPaused = !ecgPaused;
    const btn = event.target;
    
    if (ecgPaused) {
        btn.textContent = 'Resume';
        showNotification('Live telemetry visualization pipeline paused', 'info');
    } else {
        btn.textContent = 'Pause';
        animateECG();
        showNotification('Live telemetry visualization pipeline resumed', 'info');
    }
}

// Connected Target Ingestion Stream Loop Mock setup
function connectToPatient() {
    const patientName = document.getElementById('patientName').value;
    if (!patientName.trim()) {
        showNotification('Invalid operation: Enter patient target parameter info', 'error');
        return;
    }
    
    const connectBtn = document.querySelector('.connect-btn');
    connectBtn.textContent = 'Linking Pipeline...';
    connectBtn.disabled = true;
    
    setTimeout(() => {
        connectBtn.textContent = 'Linked ✓';
        connectBtn.style.backgroundColor = '#10b981';
        showNotification(`Telemetry connection channel linked: ${patientName}`, 'success');
        
        startECGMonitoring();
        
        // Simulating text array block ingestion matching your data configuration rules
        const mockTextSignalFile = "0.0, 0.05, 0.1, 1.2, -0.4, 0.0, 0.2, 0.0";
        
        // Kill any existing fetch requests before starting a new one
        if (aiIntervalId) clearInterval(aiIntervalId);
        
        // Query the FastAPI endpoint every 3 seconds
        aiIntervalId = setInterval(() => {
            if (ecgRunning && !ecgPaused) {
                streamingAIMediator(patientName, mockTextSignalFile);
            }
        }, 3000);
        
        setTimeout(() => {
            connectBtn.textContent = 'Connect';
            connectBtn.style.backgroundColor = '#10559d';
            connectBtn.disabled = false;
        }, 2000);
    }, 1200);
}

/* ==========================================================================
   WETS Interface Pipeline Extensions - FastAPI Core Connections
   ========================================================================== */

async function streamingAIMediator(patientId, rawTextData) {
    const apiEndpoint = "http://127.0.0.1:8000/api/telemetry/analyze";
    
    try {
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patient_id: patientId, signal_string: rawTextData })
        });

        const aiResult = await response.json();
        
        if (aiResult.status === "success") {
            updateDashboardMetrics(aiResult); // FIX #2: Evaluated safely via DOM modifier maps below
            
            const diseaseCode = aiResult.diagnosis.class_code; 
            
            if (CARDIAC_SHAPES[diseaseCode]) {
                currentActiveShape = CARDIAC_SHAPES[diseaseCode];
            } else if (aiResult.diagnosis.rhythm_classification === "Sinus Tachycardia (STACH)") {
                currentActiveShape = CARDIAC_SHAPES["STACH"];
            } else if (aiResult.diagnosis.rhythm_classification === "Sinus Bradycardia (SBRAD)") {
                currentActiveShape = CARDIAC_SHAPES["SBRAD"];
            }
        }
    } catch (error) {
        console.error("Graph adjustment matrix engine failed:", error);
    }
}

// FIX #2: Added the dynamic web page text elements writer
function updateDashboardMetrics(aiData) {
    // 1. Overrides vital text numbers (assumes classes are in your HTML structure)
    const heartRateBlock = document.querySelector('.vital-card-heartrate .vital-value') || document.querySelector('.vital-card:nth-child(2) .vital-value');
    const spo2Block = document.querySelector('.vital-card-spo2 .vital-value') || document.querySelector('.vital-card:nth-child(3) .vital-value');
    
    if (heartRateBlock) heartRateBlock.textContent = aiData.metrics.heart_rate;
    if (spo2Block) spo2Block.textContent = Math.round(aiData.metrics.spo2) + "%";

    // 2. Overrides the flashing Live diagnostic indicator layout frame
    const liveIndicator = document.querySelector('.live-indicator');
    if (liveIndicator) {
        const classCode = aiData.diagnosis.class_code;
        const rhythmLabel = aiData.diagnosis.rhythm_classification;
        
        let alertStyleClass = "diag-norm";
        if (classCode === "MI") alertStyleClass = "diag-mi";
        else if (classCode === "STTC" || classCode === "CD") alertStyleClass = "diag-warn";

        liveIndicator.innerHTML = `
            <span class="status-badge ${alertStyleClass}">
                ● DIAGNOSIS: ${rhythmLabel} [${classCode}]
            </span>
        `;
    }
    
    // 3. Trigger emergency banner modal popups if condition score passes threshold
    if (aiData.metrics.severity_score > 0.72) {
        showNotification(`CRITICAL SEVERITY WARNING: ${aiData.diagnosis.class_name}`, 'error');
    }
}

/* ==========================================================================
   Integrated Dynamic Notification Toast Array System Engine
   ========================================================================== */
function showNotification(message, type = 'info') {
    const currentToast = document.querySelector('.wets-toast-message');
    if (currentToast) currentToast.remove();

    const toast = document.createElement('div');
    toast.className = `wets-toast-message wits-toast-${type}`;
    toast.textContent = message;
    
    const tokenColors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    
    toast.style.cssText = `
        position: fixed; top: 24px; right: 24px; padding: 0.85rem 1.5rem;
        background: ${tokenColors[type] || tokenColors.info}; color: white;
        border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1500; font-size: 0.875rem; font-weight: 600; pointer-events: none;
        animation: toastEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1); max-width: 320px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.2s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
    }, 2500);
}

const animationInject = document.createElement('style');
animationInject.textContent = `
    @keyframes toastEnter {
        from { transform: translateY(12px) scale(0.98); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
    }
`;
document.head.appendChild(animationInject);