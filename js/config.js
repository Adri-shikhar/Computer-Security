/**
 * ============================================
 * CONFIG.JS - Application Configuration
 * ============================================
 * Purpose: Global configuration settings
 * Contains: Database keys, algorithm settings, defaults
 */

const DB_KEY = 'authSecurityLab_users';

// Hash algorithm configuration
let currentConfig = {
    bcryptRounds: 10,
    argon2Memory: 64,
    argon2Time: 2,
    argon2Parallelism: 1
};

// Backend API configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';
let USE_DEMO_MODE = false;
let backendAvailable = false;

// Hash rates per second on RTX 4090 GPU (for breach time calculation)
const HASH_RATES = {
    md5: 200_000_000_000,      // 200 billion/sec
    sha1: 100_000_000_000,     // 100 billion/sec
    bcrypt: 20_000,             // 20K/sec (rounds=10)
    argon2: 1_000               // 1K/sec (64MB memory)
};

console.log('✅ config.js loaded');
