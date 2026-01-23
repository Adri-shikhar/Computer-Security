/**
 * ============================================
 * DATABASE.JS - LocalStorage Database Manager
 * ============================================
 * Purpose: Manage user data in localStorage
 * Contains: CRUD operations for users
 */

// Initialize the database (localStorage)
function initDatabase() {
    if (!localStorage.getItem(DB_KEY)) {
        localStorage.setItem(DB_KEY, JSON.stringify([]));
    }
}

// Check if backend is available
function isBackendAvailable() {
    return typeof backendAvailable !== 'undefined' && backendAvailable === true;
}

// Retrieve all users from the database (Hybrid)
async function getAllUsers() {
    if (isBackendAvailable()) {
        try {
            return await getAllUsersAPI();
        } catch (error) {
            console.warn('Backend failed, using localStorage:', error);
        }
    }
    // Fallback to localStorage
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
}

// Save all users to the database
function saveAllUsers(users) {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
}

// Add a new user to the database
async function addUser(username, algorithm, hash, salt) {
    const users = await getAllUsers();
    
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'Username already exists!' };
    }
    
    users.push({
        username: username,
        algorithm: algorithm,
        hash: hash,
        salt: salt,
        timestamp: new Date().toISOString(),
        upgraded: false
    });
    
    saveAllUsers(users);
    return { success: true, message: 'User registered successfully!' };
}

// Find a user by username
async function findUser(username) {
    const users = await getAllUsers();
    return users.find(u => u.username === username);
}

// Update user (for legacy migration)
async function updateUser(username, newData) {
    const users = await getAllUsers();
    const index = users.findIndex(u => u.username === username);
    
    if (index !== -1) {
        users[index] = { ...users[index], ...newData };
        saveAllUsers(users);
        return true;
    }
    return false;
}

// Clear the entire database
function clearDatabase() {
    localStorage.removeItem(DB_KEY);
    initDatabase();
}

console.log('✅ database.js loaded');
