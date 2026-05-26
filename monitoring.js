/**
 * WETS - Live Monitoring / Patient Connection
 * Real-time ECG monitoring and patient connection management
 */

// ECG Canvas Setup
let ecgCanvas;
let ecgCtx;
let ecgAnimationId;
let ecgData = [];
let ecgRunning = true;
let ecgPaused = false;

// Initialize ECG Canvas
document.addEventListener('DOMContentLoaded', function() {
    ecgCanvas = document.getElementById('ecgMonitoringWaveform');
    ecgCtx = ecgCanvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start ECG animation automatically
    startECGMonitoring();
});

function resizeCanvas() {
    const container = ecgCanvas.parentElement;
    ecgCanvas.width = container.offsetWidth - 32;
    ecgCanvas.height = 350;
}

// ECG Wave Generation
function generateECGPoint(x) {
    const frequency = 0.015;
    const amplitude = 60;
    const baseline = ecgCanvas.height / 2;
    
    let y = baseline;
    const phase = (x * frequency) % 1;
    
    // P wave
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
    
    const gridSpacing = 20;
    
    // Vertical lines
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
    
    // Remove old points
    if (ecgData.length > ecgCanvas.width) {
        ecgData.shift();
    }
    
    drawECGWaveform();
    
    ecgAnimationId = requestAnimationFrame(animateECG);
}

function startECGMonitoring() {
    ecgRunning = true;
    ecgPaused = false;
    ecgData = [];
    
    // Initialize with data
    for (let i = 0; i < ecgCanvas.width; i++) {
        ecgData.push(generateECGPoint(i));
    }
    
    animateECG();
}

function stopECGMonitoring() {
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

// Control Button Functions
function plotECG() {
    console.log('Plotting ECG...');
    startECGMonitoring();
    showNotification('ECG plotting started', 'success');
}

function toggleUDP() {
    console.log('Toggling UDP connection...');
    showNotification('UDP connection toggled', 'info');
}

function turnOn() {
    console.log('Turning on monitoring...');
    ecgRunning = true;
    ecgPaused = false;
    if (ecgData.length === 0) {
        startECGMonitoring();
    } else {
        animateECG();
    }
    showNotification('Monitoring turned ON', 'success');
}

function turnOff() {
    console.log('Turning off monitoring...');
    stopECGMonitoring();
    showNotification('Monitoring turned OFF', 'warning');
}

// Connection Functions
function connectToPatient() {
    const connectionType = document.getElementById('connectionType').value;
    const patientName = document.getElementById('patientName').value;
    
    if (!patientName.trim()) {
        showNotification('Please enter patient information', 'error');
        return;
    }
    
    // Simulate connection
    const connectBtn = document.querySelector('.connect-btn');
    connectBtn.textContent = 'Connecting...';
    connectBtn.disabled = true;
    
    setTimeout(() => {
        connectBtn.textContent = 'Connected ✓';
        connectBtn.style.backgroundColor = '#10b981';
        showNotification(`Connected to patient: ${patientName}`, 'success');
        
        // Start monitoring
        startECGMonitoring();
        
        setTimeout(() => {
            connectBtn.textContent = 'Connect';
            connectBtn.style.backgroundColor = '#10559d';
            connectBtn.disabled = false;
        }, 2000);
    }, 1500);
}

function saveConnection() {
    console.log('Saving connection data...');
    showNotification('Connection data saved', 'success');
}

function pauseConnection() {
    ecgPaused = !ecgPaused;
    const btn = event.target;
    
    if (ecgPaused) {
        btn.textContent = 'Resume';
        showNotification('Monitoring paused', 'info');
    } else {
        btn.textContent = 'Pause';
        animateECG();
        showNotification('Monitoring resumed', 'info');
    }
}

function stopConnection() {
    stopECGMonitoring();
    const connectBtn = document.querySelector('.connect-btn');
    connectBtn.textContent = 'Connect';
    connectBtn.style.backgroundColor = '#10559d';
    showNotification('Connection stopped', 'warning');
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#10b981' : 
                    type === 'error' ? '#ef4444' : 
                    type === 'warning' ? '#f59e0b' :
                    '#3b82f6';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${bgColor};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
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