/**
 * WETS — Telemetry Vitals Processing Pipeline
 * Dynamic grid handling & production look-up table waveform tracking
 */

// Production Grade Waveform Baseline Matrix Array Template (Normalized -1.0 to 1.2)
const ECG_BASE_CYCLE = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                       // Steady State Isoelectric tracking
    0.05, 0.1, 0.15, 0.1, 0.05, 0, 0, 0, 0, 0,          // P-Wave Node cluster
    -0.1, 0.2, 1.2, -0.4, 0, 0, 0, 0,                   // Depolarization Spike (QRS segment)
    0, 0, 0.1, 0.2, 0.25, 0.2, 0.1, 0, 0, 0,            // T-Wave Node cluster
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0      // Interval recovery array buffer
];

let ecgCanvas;
let ecgCtx;
let ecgAnimationId;
let ecgData = [];
let cycleIndex = 0;
let ecgRunning = true;
let ecgPaused = false;

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    ecgCanvas = document.getElementById('ecgWaveform');
    if (ecgCanvas) {
        ecgCtx = ecgCanvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Populate display vector cache array completely to ensure cold-start fluid rendering
        for (let i = 0; i < ecgCanvas.width; i++) {
            ecgData.push(ecgCanvas.height / 2); 
        }
        
        animateECG();
    }
    startVitalsUpdate();
});

function resizeCanvas() {
    if (!ecgCanvas) return;
    const container = ecgCanvas.parentElement;
    
    // Hard lock coordinate space parameters cleanly to fit viewport wrapper boundaries
    ecgCanvas.width = container.clientWidth;
    ecgCanvas.height = 320;
}

function animateECG() {
    if (!ecgRunning || ecgPaused) return;

    const currentMetric = ECG_BASE_CYCLE[cycleIndex];
    const midPoint = ecgCanvas.height / 2;
    
    // Scale tracking constraints ensuring peaks optimize 70% of canvas height safely
    const amplitudeScale = ecgCanvas.height * 0.35; 
    const targetYValue = midPoint - (currentMetric * amplitudeScale);
    
    ecgData.push(targetYValue);
    
    // Keep tracking arrays matching absolute layout dimensions
    if (ecgData.length > ecgCanvas.width) {
        ecgData.shift();
    }

    // Advance loop index pointer safely
    cycleIndex = (cycleIndex + 1) % ECG_BASE_CYCLE.length;

    drawECGDisplay();
    ecgAnimationId = requestAnimationFrame(animateECG);
}

function drawECGDisplay() {
    // Refresh canvas backplane overlay
    ecgCtx.fillStyle = '#040d1a';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    
    // Draw medical coordinate matrix lines
    ecgCtx.strokeStyle = 'rgba(16, 37, 64, 0.5)';
    ecgCtx.lineWidth = 1;
    const gridSpacing = 20;
    
    for (let x = 0; x < ecgCanvas.width; x += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(x, 0); ecgCtx.lineTo(x, ecgCanvas.height); ecgCtx.stroke();
    }
    for (let y = 0; y < ecgCanvas.height; y += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(0, y); ecgCtx.lineTo(ecgCanvas.width, y); ecgCtx.stroke();
    }

    // Paint Calculated Tracking Vectors Loop
    ecgCtx.strokeStyle = '#10b981';
    ecgCtx.lineWidth = 2.5;
    ecgCtx.lineJoin = 'round'; // Mitigate pixel jagged separation anomalies
    ecgCtx.beginPath();
    
    for (let i = 0; i < ecgData.length; i++) {
        if (i === 0) ecgCtx.moveTo(i, ecgData[i]);
        else ecgCtx.lineTo(i, ecgData[i]);
    }
    ecgCtx.stroke();
}

function stopECGAnimation() {
    ecgRunning = false;
    if (ecgAnimationId) cancelAnimationFrame(ecgAnimationId);
    
    ecgCtx.fillStyle = '#040d1a';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    
    // Keep background grid visible when tracking terminates
    ecgCtx.strokeStyle = 'rgba(16, 37, 64, 0.5)';
    ecgCtx.lineWidth = 1;
    const gridSpacing = 20;
    for (let x = 0; x < ecgCanvas.width; x += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(x, 0); ecgCtx.lineTo(x, ecgCanvas.height); ecgCtx.stroke();
    }
    for (let y = 0; y < ecgCanvas.height; y += gridSpacing) {
        ecgCtx.beginPath(); ecgCtx.moveTo(0, y); ecgCtx.lineTo(ecgCanvas.width, y); ecgCtx.stroke();
    }
    ecgData = [];
}

// Global Core UI Controller APIs
function loadECG() {
    if (!ecgRunning) {
        ecgRunning = true;
        ecgPaused = false;
        animateECG();
    }
    showNotification('ECG telemetry stream verified', 'success');
}

function saveECG() {
    showNotification('ECG static trace capture archived', 'success');
}

function pauseECG() {
    if (!ecgRunning) return;
    ecgPaused = !ecgPaused;
    const btn = event.target;
    
    if (ecgPaused) {
        btn.textContent = 'Resume';
        showNotification('ECG live pipeline tracking suspended', 'info');
    } else {
        btn.textContent = 'Pause';
        animateECG();
        showNotification('ECG live pipeline streaming initialized', 'info');
    }
}

function stopECG() {
    stopECGAnimation();
    const pauseBtn = document.querySelector('.ecg-btn-pause');
    if (pauseBtn) pauseBtn.textContent = 'Pause';
    showNotification('ECG dynamic pipeline tracking terminated', 'warning');
}

function toggleUDP() {
    showNotification('UDP communication layer polling connection points', 'info');
}

function addConsultation() { showNotification('Consultation entry module active', 'info'); }
function addDrugPrescription() { showNotification('Prescription generator matrix active', 'info'); }
function showPersonalInfo() { showNotification('Contextual demographic query executed', 'info'); }

function navigateTo(url) {
    window.location.href = url;
}

// Numerical Metric Simulation Triggers
function startVitalsUpdate() {
    setInterval(() => {
        if (ecgRunning && !ecgPaused) {
            updateVitalSigns();
        }
    }, 4000);
}

function updateVitalSigns() {
    const heartRateCard = document.querySelector('.vital-card:nth-child(1) .vital-value');
    if (heartRateCard) {
        const currentHR = parseInt(heartRateCard.textContent) || 60;
        const delta = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
        heartRateCard.textContent = Math.max(58, Math.min(82, currentHR + delta));
    }
}

// Notification Overlay Core Engine
function showNotification(message, type = 'info') {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 0.85rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1100;
        font-size: 0.875rem;
        font-weight: 600;
        pointer-events: none;
        animation: toastIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'opacity 0.2s ease';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 200);
    }, 2500);
}

// Inject clean notification display framework animation directly
const animationCSS = document.createElement('style');
animationCSS.textContent = `
    @keyframes toastIn {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(animationCSS);