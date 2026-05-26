/**
 * WETS - Vital Signs Monitoring Dashboard
 * Real-time vitals display and ECG waveform simulation
 */

// ECG Canvas Setup
let ecgCanvas;
let ecgCtx;
let ecgAnimationId;
let ecgData = [];
let ecgRunning = false;
let ecgPaused = false;

// Initialize ECG Canvas
document.addEventListener('DOMContentLoaded', function() {
    ecgCanvas = document.getElementById('ecgWaveform');
    ecgCtx = ecgCanvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start ECG animation by default
    startECG();
    
    // Simulate real-time vital signs updates
    startVitalsUpdate();
});

function resizeCanvas() {
    const container = ecgCanvas.parentElement;
    ecgCanvas.width = container.offsetWidth - 32; // Account for padding
    ecgCanvas.height = 400;
}

// ECG Wave Generation
function generateECGPoint(x) {
    // Simulate realistic ECG waveform (simplified)
    const frequency = 0.015;
    const amplitude = 60;
    const baseline = ecgCanvas.height / 2;
    
    // P wave
    let y = baseline;
    const phase = (x * frequency) % 1;
    
    if (phase < 0.1) {
        y -= amplitude * 0.3 * Math.sin(phase * Math.PI * 10);
    }
    // QRS complex
    else if (phase >= 0.15 && phase < 0.25) {
        const qrsPhase = (phase - 0.15) * 10;
        if (qrsPhase < 0.3) {
            y += amplitude * 0.4 * Math.sin(qrsPhase * Math.PI * 3.33);
        } else if (qrsPhase < 0.5) {
            y -= amplitude * 1.5 * Math.sin((qrsPhase - 0.3) * Math.PI * 5);
        } else if (qrsPhase < 0.7) {
            y += amplitude * 0.8 * Math.sin((qrsPhase - 0.5) * Math.PI * 5);
        }
    }
    // T wave
    else if (phase >= 0.35 && phase < 0.55) {
        y -= amplitude * 0.4 * Math.sin((phase - 0.35) * Math.PI * 5);
    }
    
    return y;
}

function drawECGGrid() {
    ecgCtx.strokeStyle = '#0a2540';
    ecgCtx.lineWidth = 1;
    
    // Vertical lines
    const gridSpacing = 20;
    for (let x = 0; x < ecgCanvas.width; x += gridSpacing) {
        ecgCtx.beginPath();
        ecgCtx.moveTo(x, 0);
        ecgCtx.lineTo(x, ecgCanvas.height);
        ecgCtx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < ecgCanvas.height; y += gridSpacing) {
        ecgCtx.beginPath();
        ecgCtx.moveTo(0, y);
        ecgCtx.lineTo(ecgCanvas.width, y);
        ecgCtx.stroke();
    }
}

function drawECGWaveform() {
    // Clear canvas
    ecgCtx.fillStyle = '#040d1a';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    
    // Draw grid
    drawECGGrid();
    
    // Draw ECG line
    ecgCtx.strokeStyle = '#10b981';
    ecgCtx.lineWidth = 2;
    ecgCtx.beginPath();
    
    for (let i = 0; i < ecgData.length - 1; i++) {
        const x1 = i;
        const y1 = ecgData[i];
        const x2 = i + 1;
        const y2 = ecgData[i + 1];
        
        if (i === 0) {
            ecgCtx.moveTo(x1, y1);
        }
        ecgCtx.lineTo(x2, y2);
    }
    
    ecgCtx.stroke();
}

function animateECG() {
    if (!ecgRunning || ecgPaused) return;
    
    // Add new point
    ecgData.push(generateECGPoint(ecgData.length));
    
    // Remove old points if too many
    if (ecgData.length > ecgCanvas.width) {
        ecgData.shift();
    }
    
    drawECGWaveform();
    
    ecgAnimationId = requestAnimationFrame(animateECG);
}

function startECG() {
    ecgRunning = true;
    ecgPaused = false;
    ecgData = [];
    
    // Initialize with some data
    for (let i = 0; i < ecgCanvas.width; i++) {
        ecgData.push(generateECGPoint(i));
    }
    
    animateECG();
}

function stopECGAnimation() {
    ecgRunning = false;
    if (ecgAnimationId) {
        cancelAnimationFrame(ecgAnimationId);
    }
    
    // Clear canvas
    ecgCtx.fillStyle = '#040d1a';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    drawECGGrid();
    ecgData = [];
}

// Button Functions
function loadECG() {
    console.log('Loading ECG data...');
    startECG();
    showNotification('ECG data loaded successfully', 'success');
}

function saveECG() {
    console.log('Saving ECG data...');
    showNotification('ECG data saved successfully', 'success');
}

function pauseECG() {
    ecgPaused = !ecgPaused;
    const btn = event.target;
    
    if (ecgPaused) {
        btn.textContent = 'Resume';
        showNotification('ECG monitoring paused', 'info');
    } else {
        btn.textContent = 'Pause';
        animateECG();
        showNotification('ECG monitoring resumed', 'info');
    }
}

function stopECG() {
    stopECGAnimation();
    const pauseBtn = document.querySelector('.ecg-btn-pause');
    pauseBtn.textContent = 'Pause';
    showNotification('ECG monitoring stopped', 'warning');
}

function toggleUDP() {
    console.log('Toggling UDP connection...');
    showNotification('UDP connection toggled', 'info');
}

// Sidebar Action Functions
function addConsultation() {
    showNotification('Add Consultation feature coming soon', 'info');
}

function addDrugPrescription() {
    showNotification('Add Drug Prescription feature coming soon', 'info');
}

function showPersonalInfo() {
    showNotification('Personal Info feature coming soon', 'info');
}

// Simulate real-time vitals updates
function startVitalsUpdate() {
    setInterval(() => {
        if (ecgRunning && !ecgPaused) {
            updateVitalSigns();
        }
    }, 5000); // Update every 5 seconds
}

function updateVitalSigns() {
    // Simulate slight variations in vital signs
    const heartRate = document.querySelector('.vital-card:nth-child(1) .vital-value');
    const currentHR = parseInt(heartRate.textContent);
    const newHR = currentHR + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
    heartRate.textContent = Math.max(55, Math.min(85, newHR));
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);