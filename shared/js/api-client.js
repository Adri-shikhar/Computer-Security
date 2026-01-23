/**
 * API Client for Flask Backend Integration
 * Connects frontend to Python/Flask backend API with Demo/Live toggle
 */

// Backend API configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';
let USE_DEMO_MODE = false; // Start with backend mode by default

/**
 * API Helper Functions
 */

async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * User Management API Calls
 */

async function registerUserAPI(username, password, algorithm) {
    return await apiRequest('/register', 'POST', {
        username: username,
        password: password,
        algorithm: algorithm
    });
}

async function loginUserAPI(username, password) {
    return await apiRequest('/login', 'POST', {
        username: username,
        password: password
    });
}

async function getAllUsersAPI() {
    // Use demo data or live data based on mode
    if (USE_DEMO_MODE) {
        // Use Live Demo Service for dynamic mock data
        if (window.liveDemoService) {
            const users = window.liveDemoService.getMockUsers();
            return users;
        } else {
            // Fallback to backend demo endpoint
            const result = await apiRequest('/demo-users', 'GET');
            return result.users || [];
        }
    } else {
        // Use real backend
        const result = await apiRequest('/users', 'GET');
        return result.users || [];
    }
}

async function deleteUserAPI(userId) {
    return await apiRequest(`/users/${userId}`, 'DELETE');
}

async function clearAllDataAPI() {
    return await apiRequest('/clear-all', 'POST');
}

/**
 * Statistics and Analytics
 */

async function getStatsAPI() {
    return await apiRequest('/stats', 'GET');
}

async function getBenchmarkAPI() {
    return await apiRequest('/benchmark', 'GET');
}

async function getConfigAPI() {
    return await apiRequest('/config', 'GET');
}

/**
 * Export Functions
 */

async function exportHashcatAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/export/hashcat`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hashes.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true, message: 'Hashes exported successfully' };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Health Check and Mode Toggle
 */

async function checkBackendHealth() {
    try {
        const result = await apiRequest('/health', 'GET');
        console.log('✅ Backend connected:', result);
        return true;
    } catch (error) {
        console.warn('⚠️ Backend not available');
        return false;
    }
}

// Auto-check backend connection on load
let backendAvailable = false;
checkBackendHealth().then(available => {
    backendAvailable = available;
    // Mode toggle removed - using backend by default
});

function createModeToggle(backendConnected) {
    // Mode toggle panel removed - using backend by default
    return;
    const toggleContainer = document.createElement('div');
    toggleContainer.id = 'mode-toggle-container';
    toggleContainer.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 15px 20px;
        min-width: 240px;
    `;
    
    toggleContainer.innerHTML = `
        <div style="margin-bottom: 10px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                Data Mode
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button id="mode-demo-btn" onclick="switchToDemo()" style="
                    flex: 1;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 2px solid #2563eb;
                    background: linear-gradient(135deg, #2563eb, #1e40af);
                    color: white;
                    transition: all 0.2s;
                ">
                    <i class="fas fa-vial"></i> Live Demo
                </button>
                <button id="mode-live-btn" onclick="switchToLive()" style="
                    flex: 1;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 2px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    transition: all 0.2s;
                ">
                    <i class="fas fa-server"></i> Backend
                </button>
            </div>
        </div>
        
        <!-- Simulation Controls (only visible in demo mode) -->
        <div id="simulation-controls" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: block;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 11px; color: #64748b; font-weight: 600;">SIMULATION</span>
                <button id="simulation-toggle" onclick="toggleSimulation()" style="
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid #059669;
                    background: linear-gradient(135deg, #059669, #047857);
                    color: white;
                    transition: all 0.2s;
                ">
                    <i class="fas fa-play"></i> Start
                </button>
            </div>
            <div id="simulation-status" style="
                font-size: 10px;
                padding: 6px 8px;
                border-radius: 4px;
                background: #f1f5f9;
                color: #64748b;
                text-align: center;
            ">
                <i class="fas fa-circle" style="font-size: 6px; color: #94a3b8;"></i> Idle
            </div>
            <button onclick="refreshMockData()" style="
                width: 100%;
                margin-top: 8px;
                padding: 6px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                border: 1px solid #e2e8f0;
                background: white;
                color: #64748b;
                transition: all 0.2s;
            ">
                <i class="fas fa-sync-alt"></i> Refresh Data
            </button>
        </div>
        
        <div id="backend-status" style="
            margin-top: 12px;
            font-size: 11px;
            padding: 8px 10px;
            border-radius: 6px;
            background: ${backendConnected ? '#d1fae5' : '#fee2e2'};
            color: ${backendConnected ? '#047857' : '#dc2626'};
            text-align: center;
        ">
            ${backendConnected ? '🟢 Backend Ready' : '🔴 Backend Offline'}
        </div>
    `;
    
    document.body.appendChild(toggleContainer);
    
    // Update button states
    updateToggleButtons();
}

function updateToggleButtons() {
    const demoBtn = document.getElementById('mode-demo-btn');
    const liveBtn = document.getElementById('mode-live-btn');
    const simulationControls = document.getElementById('simulation-controls');
    
    if (USE_DEMO_MODE) {
        // Demo is active
        demoBtn.style.background = 'linear-gradient(135deg, #2563eb, #1e40af)';
        demoBtn.style.color = 'white';
        demoBtn.style.borderColor = '#2563eb';
        
        liveBtn.style.background = 'white';
        liveBtn.style.color = '#64748b';
        liveBtn.style.borderColor = '#e2e8f0';
        
        // Show simulation controls
        if (simulationControls) {
            simulationControls.style.display = 'block';
        }
    } else {
        // Live is active
        demoBtn.style.background = 'white';
        demoBtn.style.color = '#64748b';
        demoBtn.style.borderColor = '#e2e8f0';
        
        liveBtn.style.background = 'linear-gradient(135deg, #059669, #047857)';
        liveBtn.style.color = 'white';
        liveBtn.style.borderColor = '#059669';
        
        // Hide simulation controls
        if (simulationControls) {
            simulationControls.style.display = 'none';
        }
    }
}

function toggleSimulation() {
    if (!window.liveDemoService) {
        console.error('Live Demo Service not loaded');
        showNotification('Error', 'Live Demo Service not available', 'error');
        return;
    }

    const toggleBtn = document.getElementById('simulation-toggle');
    const statusDiv = document.getElementById('simulation-status');
    
    if (window.liveDemoService.isActive()) {
        // Stop simulation
        window.liveDemoService.stopSimulation();
        toggleBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        toggleBtn.style.background = 'linear-gradient(135deg, #059669, #047857)';
        toggleBtn.style.borderColor = '#059669';
        statusDiv.innerHTML = '<i class="fas fa-circle" style="font-size: 6px; color: #94a3b8;"></i> Idle';
        statusDiv.style.background = '#f1f5f9';
        statusDiv.style.color = '#64748b';
    } else {
        // Start simulation
        window.liveDemoService.startSimulation();
        toggleBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        toggleBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        toggleBtn.style.borderColor = '#dc2626';
        statusDiv.innerHTML = '<i class="fas fa-circle" style="font-size: 6px; color: #22c55e; animation: pulse 2s infinite;"></i> Active';
        statusDiv.style.background = '#d1fae5';
        statusDiv.style.color = '#047857';
    }
}

function refreshMockData() {
    if (!window.liveDemoService) {
        console.error('Live Demo Service not loaded');
        return;
    }

    window.liveDemoService.refreshData();
    
    // Reload dashboard if available
    if (typeof loadDashboard === 'function') {
        loadDashboard();
    }
    
    showNotification('Data Refreshed', 'Generated 30 new mock users with varied data', 'success');
}

function switchToDemo() {
    USE_DEMO_MODE = true;
    updateToggleButtons();
    console.log('🔄 Switched to LIVE DEMO mode');
    
    // Initialize Live Demo Service if available
    if (window.liveDemoService) {
        // Generate fresh data
        window.liveDemoService.refreshData();
    }
    
    // Reload data if on dashboard
    if (typeof loadDashboard === 'function') {
        loadDashboard();
    }
    
    // Show notification
    showNotification('Live Demo Mode', 'Using dynamically generated mock data with background simulation', 'info');
}

function switchToLive() {
    if (!backendAvailable) {
        showNotification('Backend Offline', 'Please start the Flask backend to use Live mode', 'error');
        return;
    }
    
    USE_DEMO_MODE = false;
    updateToggleButtons();
    console.log('🔄 Switched to LIVE BACKEND mode');
    
    // Stop simulation if running
    if (window.liveDemoService && window.liveDemoService.isActive()) {
        window.liveDemoService.stopSimulation();
        const toggleBtn = document.getElementById('simulation-toggle');
        const statusDiv = document.getElementById('simulation-status');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            toggleBtn.style.background = 'linear-gradient(135deg, #059669, #047857)';
        }
        if (statusDiv) {
            statusDiv.innerHTML = '<i class="fas fa-circle" style="font-size: 6px; color: #94a3b8;"></i> Idle';
            statusDiv.style.background = '#f1f5f9';
        }
    }
    
    // Reload data if on dashboard
    if (typeof loadDashboard === 'function') {
        loadDashboard();
    }
    
    // Show notification
    showNotification('Live Backend Mode', 'Connected to Flask backend with real database', 'success');
}

function showNotification(title, message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: ${type === 'success' ? '#d1fae5' : type === 'error' ? '#fee2e2' : '#dbeafe'};
        color: ${type === 'success' ? '#047857' : type === 'error' ? '#dc2626' : '#1e40af'};
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        min-width: 250px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 5px;">${title}</div>
        <div style="font-size: 13px;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);

// Backend mode is default - no auto-initialization needed
