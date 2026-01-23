/**
 * ============================================
 * API-CLIENT.JS - Backend API Integration
 * ============================================
 * Purpose: Connect frontend to Flask backend API
 * Contains: API requests, health check, user management
 */

// API Helper - make requests to backend
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

// Register user via API
async function registerUserAPI(username, password, algorithm) {
    return await apiRequest('/register', 'POST', {
        username: username,
        password: password,
        algorithm: algorithm
    });
}

// Login user via API
async function loginUserAPI(username, password) {
    console.warn('⚠️ Login API not implemented in backend yet');
    return { success: false, message: 'Login not implemented' };
}

// Get all users via API
async function getAllUsersAPI() {
    if (USE_DEMO_MODE) {
        if (window.liveDemoService) {
            return window.liveDemoService.getMockUsers();
        } else {
            const result = await apiRequest('/demo-users', 'GET');
            return result.users || [];
        }
    } else {
        const result = await apiRequest('/users', 'GET');
        return result.users || [];
    }
}

// Delete user via API
async function deleteUserAPI(userId) {
    console.warn('⚠️ Individual user delete not implemented. Use clearAllDataAPI().');
    return { success: false, message: 'Individual delete not implemented' };
}

// Clear all data via API
async function clearAllDataAPI() {
    return await apiRequest('/users/clear', 'DELETE');
}

// Get stats via API
async function getStatsAPI() {
    return await apiRequest('/stats', 'GET');
}

// Health check
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

// Auto-check backend on load
checkBackendHealth().then(available => {
    backendAvailable = available;
});

console.log('✅ api-client.js loaded');
