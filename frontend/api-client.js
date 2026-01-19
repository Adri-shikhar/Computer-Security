/**
 * API Client for Flask Backend Integration
 * Connects frontend to Python/Flask backend API
 */

// Backend API configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';
const USE_BACKEND = true; // Toggle between backend API and localStorage

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
    const result = await apiRequest('/users', 'GET');
    return result.users || [];
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
 * Health Check
 */

async function checkBackendHealth() {
    try {
        const result = await apiRequest('/health', 'GET');
        console.log('✅ Backend connected:', result);
        return true;
    } catch (error) {
        console.warn('⚠️ Backend not available, using localStorage fallback');
        return false;
    }
}

// Auto-check backend connection on load
let backendAvailable = false;
checkBackendHealth().then(available => {
    backendAvailable = available;
    if (available) {
        showBackendStatus(true);
    } else {
        showBackendStatus(false);
    }
});

function showBackendStatus(connected) {
    // Create status indicator
    const statusDiv = document.createElement('div');
    statusDiv.id = 'backend-status';
    statusDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 15px;
        border-radius: 5px;
        font-size: 12px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    
    if (connected) {
        statusDiv.innerHTML = '🟢 Backend Connected';
        statusDiv.style.background = 'linear-gradient(135deg, #00b09b, #96c93d)';
        statusDiv.style.color = 'white';
    } else {
        statusDiv.innerHTML = '🟡 Using LocalStorage';
        statusDiv.style.background = 'linear-gradient(135deg, #f2994a, #f2c94c)';
        statusDiv.style.color = 'white';
    }
    
    document.body.appendChild(statusDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusDiv.style.transition = 'opacity 0.5s';
        statusDiv.style.opacity = '0';
        setTimeout(() => statusDiv.remove(), 500);
    }, 5000);
}
