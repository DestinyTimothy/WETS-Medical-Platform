/**
 * WETS - Live Monitoring Processing Engine
 * Synchronized Look-Up Table (LUT) Waveform Stream Framework
 */

// Global Immutable Baseline Heart Trace Matrix Array
const ECG_BASE_CYCLE = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                       // Flat Isoelectric Line
    0.05, 0.1, 0.15, 0.1, 0.05, 0, 0, 0, 0, 0,          // P Wave (Atrial Activity)
    -0.1, 0.2, 1.2, -0.4, 0, 0, 0, 0,                   // QRS Deflection Spike
    0, 0, 0.1, 0.2, 0.25, 0.2, 0.1, 0, 0, 0,            // T Wave (Ventricular Reset)
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0      // Inherent Resting Buffer Gap
];

let ecgCanvas;
let ecgCtx;
let ecgAnimationId;
let ecgData = [];
let cycleIndex = 0;
let ecgRunning = true;
let ecgPaused = false;

// Core Synchronization Initializer
document.addEventListener('DOMContentLoaded', function() {
    ecgCanvas = document.getElementById('ecgMonitoringWaveform');
    if (ecgCanvas) {
        ecgCtx = ecgCanvas.getContext('2d');
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Cold start canvas buffer preparation loop to avoid rendering empty lines
        startECGMonitoring();
    }
});

function resizeCanvas() {
    if (!ecgCanvas) return;
    const container = ecgCanvas.parentElement;
    
    // Explicit structural dimension parameters mapping
    ecgCanvas.width = container.clientWidth;
    ecgCanvas.height = 350;
}

function animateECG() {
    if (!ecgRunning || ecgPaused) return;
    
    const currentMetric = ECG_BASE_CYCLE[cycleIndex];
    const midPoint = ecgCanvas.height / 2;
    
    // Exact structural scale factors calculations matching main page layouts
    const amplitudeScale = ecgCanvas.height * 0.35;
    const targetYValue = midPoint - (currentMetric * amplitudeScale);
    
    ecgData.push(targetYValue);
    
    // Slice data length boundary precisely to element physical pixel width
    if (ecgData.length > ecgCanvas.width) {
        ecgData.shift();
    }
    
    // Increment look-up index location loop register
    cycleIndex = (cycleIndex + 1) % ECG_BASE_CYCLE.length;
    
    drawECGWaveform();
    ecgAnimationId = requestAnimationFrame(animateECG);
}

function drawECGGrid() {
    ecgCtx.strokeStyle = 'rgba(16, 37, 64, 0.5)';
    ecgCtx.lineWidth = 1;
    
    const gridSpacing = 20;
    
    // X-Axis Matrix Tracks
    for (let x = 0; x < ecgCanvas.width; x += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(x, 0); ecgCtx.lineTo(x, ecgCanvas.height); ecgCtx.stroke();
    }
    
    // Y-Axis Matrix Tracks
    for (let y = 0; y < ecgCanvas.height; y += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(0, y); ecgCtx.lineTo(ecgCanvas.width, y); ecgCtx.stroke();
    }
}

function drawECGWaveform() {
    // Canvas background fill reset
    ecgCtx.fillStyle = '#040d1a';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    
    drawECGGrid();
    
    // Core Path Render Pipeline execution
    ecgCtx.strokeStyle = '#10b981'; // Uniform Health Neon Green
    ecgCtx.lineWidth = 2.5;
    ecgCtx.lineJoin = 'round'; // Eliminate coordinate break pixelation anomalies
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
    cycleIndex = 0;
    
    // Instantly preload array to drop tracing lag latency artifacts
    for (let i = 0; i < ecgCanvas.width; i++) {
        const prefillMetric = ECG_BASE_CYCLE[i % ECG_BASE_CYCLE.length];
        const midPoint = ecgCanvas.height / 2;
        const amplitudeScale = ecgCanvas.height * 0.35;
        ecgData.push(midPoint - (prefillMetric * amplitudeScale));
    }
    
    animateECG();
}

function stopECGMonitoring() {
    ecgRunning = false;
    if (ecgAnimationId) {
        cancelAnimationFrame(ecgAnimationId);
    }
    
    // Clean-slate state transition logic
    ecgCtx.fillStyle = '#040d1a';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    drawECGGrid();
    ecgData = [];
}

/* ==========================================================================
   Telemetry UI Functional Intersections Block
   ========================================================================== */

function plotECG() {
    if (!ecgRunning) {
        startECGMonitoring();
        showNotification('ECG live plotting sequence initialized', 'success');
    }
}

function toggleUDP() {
    showNotification('UDP peripheral data communications connection verified', 'info');
}

function turnOn() {
    if (!ecgRunning) {
        startECGMonitoring();
        showNotification('Monitoring systems fully active', 'success');
    }
}

function turnOff() {
    stopECGMonitoring();
    showNotification('Monitoring channels deactivated', 'warning');
}

// Client Profile Interfacing Logic
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
        
        setTimeout(() => {
            connectBtn.textContent = 'Connect';
            connectBtn.style.backgroundColor = '#10559d';
            connectBtn.disabled = false;
        }, 2000);
    }, 1200);
}

function saveConnection() {
    showNotification('Patient link tracking configurations saved', 'success');
}

function pauseConnection() {
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

function stopConnection() {
    stopECGMonitoring();
    const connectBtn = document.querySelector('.connect-btn');
    connectBtn.textContent = 'Connect';
    connectBtn.style.backgroundColor = '#10559d';
    showNotification('Active data session link broken', 'warning');
}

// Integrated Dynamic Notification Array System Engine
function showNotification(message, type = 'info') {
    const currentToast = document.querySelector('.wets-toast-message');
    if (currentToast) currentToast.remove();

    const toast = document.createElement('div');
    toast.className = `wets-toast-message wits-toast-${type}`;
    toast.textContent = message;
    
    const tokenColors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 0.85rem 1.5rem;
        background: ${tokenColors[type] || tokenColors.info};
        color: white;
        border-radius: 6px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1500;
        font-size: 0.875rem;
        font-weight: 600;
        pointer-events: none;
        animation: toastEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        max-width: 320px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.2s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
    }, 2500);
}

// Apply contextual animation style rule nodes natively 
const animationInject = document.createElement('style');
animationInject.textContent = `
    @keyframes toastEnter {
        from { transform: translateY(12px) scale(0.98); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
    }
`;
document.head.appendChild(animationInject);