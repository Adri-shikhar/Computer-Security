/**
 * ADVANCED AUTHENTICATION SECURITY LAB
 * Hybrid Architecture: Backend API + LocalStorage Fallback
 * - Flask Backend API Integration
 * - LocalStorage Fallback for offline mode
 * - HaveIBeenPwned API Integration
 * - Legacy Migration System (MD5 -> Argon2)
 * - Cost Factor Experimentation
 * - Hash Export for Hashcat Testing
 */

const DB_KEY = 'authSecurityLab_users';

// Configuration
let currentConfig = {
    bcryptRounds: 10,
    argon2Memory: 64,
    argon2Time: 2,
    argon2Parallelism: 1
};

/**
 * HYBRID DATABASE MANAGER
 * Uses backend API when available, falls back to localStorage
 */

// Check if backend is available (set by api-client.js)
function isBackendAvailable() {
    return typeof backendAvailable !== 'undefined' && backendAvailable === true;
}

/**
 * LOCALSTORAGE DATABASE MANAGER
 * Each user object structure:
 * {
 *   username: string,
 *   algorithm: 'md5' | 'sha1' | 'bcrypt' | 'argon2',
 *   hash: string,
 *   salt: string,
 *   timestamp: ISO string,
 *   upgraded: boolean (if migrated from legacy)
 * }
 */

// Initialize the database (localStorage)
function initDatabase() {
    if (!localStorage.getItem(DB_KEY)) {
        localStorage.setItem(DB_KEY, JSON.stringify([]));
    }
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
function addUser(username, algorithm, hash, salt) {
    const users = getAllUsers();
    
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
function findUser(username) {
    const users = getAllUsers();
    return users.find(u => u.username === username);
}

// Update user (for legacy migration)
function updateUser(username, newData) {
    const users = getAllUsers();
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

/**
 * SALT GENERATION
 */
function generateSalt(length = 16) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * HASHING FUNCTIONS WITH TIMING
 */

// Generate hash based on selected algorithm
async function generateHash(password, algorithm, salt = null) {
    const startTime = performance.now();
    let hash = '';
    let usedSalt = salt || generateSalt();
    
    switch(algorithm) {
        case 'md5':
            // MD5 - No salt (legacy simulation)
            hash = CryptoJS.MD5(password).toString();
            usedSalt = 'NONE'; // MD5 legacy doesn't use salt
            break;
            
        case 'sha1':
            // SHA-1 - With salt but still weak
            hash = CryptoJS.SHA1(password + usedSalt).toString();
            break;
            
        case 'bcrypt':
            // BCrypt with configurable rounds
            showSpinner(`Computing BCrypt hash (${currentConfig.bcryptRounds} rounds)...`);
            hash = await new Promise((resolve) => {
                setTimeout(() => {
                    const bcryptHash = bcrypt.hashSync(password, currentConfig.bcryptRounds);
                    resolve(bcryptHash);
                }, 10);
            });
            // BCrypt includes salt in hash
            usedSalt = hash.substring(0, 29); // Extract salt portion
            hideSpinner();
            break;
            
        case 'argon2':
            // Argon2id with configurable memory
            showSpinner(`Computing Argon2id hash (${currentConfig.argon2Memory}MB memory)...`);
            try {
                // Check if argon2 library is loaded
                if (typeof argon2 === 'undefined') {
                    throw new Error('Argon2 library not loaded. Please refresh the page.');
                }
                
                const saltBytes = new Uint8Array(16);
                crypto.getRandomValues(saltBytes);
                
                const result = await argon2.hash({
                    pass: password,
                    salt: saltBytes,
                    type: argon2.ArgonType.Argon2id,
                    mem: currentConfig.argon2Memory * 1024, // Convert MB to KB
                    time: currentConfig.argon2Time,
                    parallelism: currentConfig.argon2Parallelism,
                    hashLen: 32
                });
                hash = result.encoded;
                usedSalt = 'EMBEDDED'; // Argon2 embeds salt in encoded string
            } catch (error) {
                console.error('Argon2 error:', error);
                hash = 'ERROR: Argon2 hashing failed - ' + error.message;
                alert('⚠️ Argon2 Error\\n\\n' + error.message + '\\n\\nPlease try:\\n1. Refresh the page\\n2. Use BCrypt instead\\n3. Check browser console for details');
            }
            hideSpinner();
            break;
    }
    
    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    
    // Update UI with timing
    updateHashTime(timeTaken);
    
    console.log(`${algorithm.toUpperCase()} hash generated in ${timeTaken}ms`);
    
    return { hash, salt: usedSalt, time: timeTaken };
}

// Verify password against stored hash
async function verifyHash(password, algorithm, storedHash, salt = null) {
    switch(algorithm) {
        case 'md5':
            const md5Hash = CryptoJS.MD5(password).toString();
            return md5Hash === storedHash;
            
        case 'sha1':
            const sha1Hash = CryptoJS.SHA1(password + salt).toString();
            return sha1Hash === storedHash;
            
        case 'bcrypt':
            showSpinner('Verifying BCrypt hash...');
            const bcryptResult = await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(bcrypt.compareSync(password, storedHash));
                }, 10);
            });
            hideSpinner();
            return bcryptResult;
            
        case 'argon2':
            showSpinner('Verifying Argon2id hash...');
            try {
                const result = await argon2.verify({
                    pass: password,
                    encoded: storedHash
                });
                hideSpinner();
                return result;
            } catch (error) {
                hideSpinner();
                console.error('Argon2 verification error:', error);
                return false;
            }
            
        default:
            return false;
    }
}

/**
 * HAVEIBEENPWNED API INTEGRATION (K-Anonymity)
 */
async function checkPasswordPwned(password) {
    try {
        // Step 1: Hash the password with SHA-1
        const sha1Hash = CryptoJS.SHA1(password).toString().toUpperCase();
        const prefix = sha1Hash.substring(0, 5);
        const suffix = sha1Hash.substring(5);
        
        // Step 2: Query the API with first 5 characters (K-Anonymity)
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.text();
        
        // Step 3: Check if our suffix appears in the response
        const lines = data.split('\n');
        for (let line of lines) {
            const [hashSuffix, count] = line.split(':');
            if (hashSuffix === suffix) {
                return { 
                    pwned: true, 
                    count: parseInt(count.trim()),
                    message: `⚠️ This password appears in ${parseInt(count.trim()).toLocaleString()} data breaches!`
                };
            }
        }
        
        return { 
            pwned: false, 
            count: 0,
            message: '✓ This password has not been found in known data breaches.'
        };
        
    } catch (error) {
        console.error('Pwned check error:', error);
        return { 
            pwned: null, 
            count: -1,
            message: 'Could not check breaches (API error or network issue)'
        };
    }
}

/**
 * LEGACY MIGRATION SYSTEM
 */
async function attemptLegacyMigration(user, password) {
    // Check if user has legacy MD5 hash
    if (user.algorithm === 'md5') {
        console.log('Legacy MD5 account detected, initiating migration...');
        
        // Re-hash with Argon2id
        const { hash, salt } = await generateHash(password, 'argon2');
        
        // Update user record
        updateUser(user.username, {
            algorithm: 'argon2',
            hash: hash,
            salt: salt,
            upgraded: true,
            upgradedAt: new Date().toISOString()
        });
        
        // Show migration notification
        showMigrationToast(user.username);
        
        return true;
    }
    return false;
}

function showMigrationToast(username) {
    const toast = document.createElement('div');
    toast.className = 'toast migration-toast show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-header bg-success text-white">
            <i class="fas fa-shield-alt me-2"></i>
            <strong class="me-auto">Security Upgraded!</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            <strong>${username}</strong>'s password has been automatically upgraded from MD5 to Argon2id!
            <hr class="my-2">
            <small class="text-muted">Your account is now protected with state-of-the-art encryption.</small>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        toast.remove();
    }, 8000);
}

/**
 * EXPORT DATABASE FOR HASHCAT
 */
function exportDatabaseForHashcat() {
    const users = getAllUsers();
    
    if (users.length === 0) {
        alert('No users in database to export!');
        return;
    }
    
    let content = '# Authentication Security Lab - Hash Export\n';
    content += '# Generated: ' + new Date().toLocaleString() + '\n';
    content += '# Format: username:hash\n';
    content += '#\n';
    content += '# Hashcat Examples:\n';
    content += '# MD5:    hashcat -m 0 hashes.txt wordlist.txt\n';
    content += '# SHA-1:  hashcat -m 100 hashes.txt wordlist.txt\n';
    content += '# BCrypt: hashcat -m 3200 hashes.txt wordlist.txt\n';
    content += '# Argon2: hashcat -m 10900 hashes.txt wordlist.txt (may not be supported)\n';
    content += '#\n';
    content += '# WARNING: Argon2 is extremely difficult to crack!\n';
    content += '# ========================================\n\n';
    
    users.forEach(user => {
        content += `# ${user.username} - ${user.algorithm.toUpperCase()}\n`;
        content += `${user.username}:${user.hash}\n\n`;
    });
    
    // Create download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_lab_hashes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Database exported for Hashcat analysis');
}

/**
 * PASSWORD STRENGTH & BREACH TIME CALCULATOR
 */

function analyzePasswordStrength(password) {
    let charsetSize = 0;
    let hasLower = /[a-z]/.test(password);
    let hasUpper = /[A-Z]/.test(password);
    let hasDigit = /[0-9]/.test(password);
    let hasSymbol = /[^a-zA-Z0-9]/.test(password);
    
    if (hasLower) charsetSize += 26;
    if (hasUpper) charsetSize += 26;
    if (hasDigit) charsetSize += 10;
    if (hasSymbol) charsetSize += 32;
    
    const entropy = password.length * Math.log2(charsetSize);
    const totalCombinations = Math.pow(charsetSize, password.length);
    
    return {
        length: password.length,
        charsetSize: charsetSize,
        entropy: entropy,
        totalCombinations: totalCombinations,
        hasLower, hasUpper, hasDigit, hasSymbol
    };
}

function calculateBreachTime(password, algorithm) {
    const analysis = analyzePasswordStrength(password);
    
    // Hash rates per second on RTX 4090 GPU
    const hashRates = {
        md5: 200_000_000_000,      // 200 billion/sec
        sha1: 100_000_000_000,     // 100 billion/sec
        bcrypt: 20_000,             // 20K/sec (rounds=10)
        argon2: 1_000               // 1K/sec (64MB memory)
    };
    
    const hashesPerSec = hashRates[algorithm] || 1000;
    const secondsToCrack = analysis.totalCombinations / hashesPerSec / 2; // Divide by 2 for average case
    
    return {
        analysis: analysis,
        secondsToCrack: secondsToCrack,
        hashesPerSec: hashesPerSec,
        readableTime: formatTime(secondsToCrack),
        securityLevel: getSecurityLevel(secondsToCrack)
    };
}

function formatTime(seconds) {
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} days`;
    if (seconds < 3153600000) return `${(seconds / 31536000).toFixed(2)} years`;
    return `${(seconds / 31536000000).toFixed(2)} centuries`;
}

function getSecurityLevel(seconds) {
    if (seconds < 60) return { level: 'instant', color: '#ff006e', text: 'CRITICAL - Instantly Crackable' };
    if (seconds < 86400) return { level: 'fast', color: '#ff6b00', text: 'WEAK - Hours to crack' };
    if (seconds < 31536000) return { level: 'moderate', color: '#ffcc00', text: 'MODERATE - Days to crack' };
    return { level: 'secure', color: '#00ff88', text: 'SECURE - Years to crack' };
}

function displayBreachTimeAnalysis(password, algorithm) {
    const result = calculateBreachTime(password, algorithm);
    const analysis = result.analysis;
    const secLevel = result.securityLevel;
    
    // Update strength bar
    const strengthPercent = Math.min((analysis.entropy / 128) * 100, 100);
    document.getElementById('strengthBarFill').style.width = `${strengthPercent}%`;
    
    // Show password analysis
    document.getElementById('passwordAnalysis').style.display = 'block';
    document.getElementById('strengthDetails').innerHTML = `
        <strong>Length:</strong> ${analysis.length} characters | 
        <strong>Charset:</strong> ${analysis.charsetSize} | 
        <strong>Entropy:</strong> ${analysis.entropy.toFixed(1)} bits
    `;
    
    // Calculate times for all algorithms
    const md5Time = calculateBreachTime(password, 'md5');
    const sha1Time = calculateBreachTime(password, 'sha1');
    const bcryptTime = calculateBreachTime(password, 'bcrypt');
    const argon2Time = calculateBreachTime(password, 'argon2');
    
    // Generate recommendation
    let recommendation = '';
    if (analysis.length < 8) {
        recommendation = '❌ <strong>Too Short!</strong> Use at least 12 characters for better security.';
    } else if (analysis.length < 12) {
        recommendation = '⚠️ <strong>Weak Length.</strong> Increase to 12+ characters for modern security standards.';
    } else if (!analysis.hasUpper || !analysis.hasDigit || !analysis.hasSymbol) {
        recommendation = '⚠️ <strong>Limited Charset.</strong> Add uppercase, digits, and symbols for stronger protection.';
    } else if (argon2Time.secondsToCrack < 31536000 * 10) {
        recommendation = '✓ <strong>Good Password.</strong> Consider adding more characters for ultimate security.';
    } else {
        recommendation = '✅ <strong>Excellent Password!</strong> This would take centuries to crack with Argon2.';
    }
    
    const breachHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="breach-card ${md5Time.securityLevel.level}">
                    <h6 class="text-white mb-2">
                        <i class="fas fa-tachometer-alt"></i> MD5 (Legacy)
                    </h6>
                    <div class="d-flex justify-content-between">
                        <span class="text-white-50">Time to Crack:</span>
                        <strong style="color: ${md5Time.securityLevel.color}">${md5Time.readableTime}</strong>
                    </div>
                    <small class="text-white-50">200 billion hashes/sec (RTX 4090)</small>
                </div>
                
                <div class="breach-card ${bcryptTime.securityLevel.level}">
                    <h6 class="text-white mb-2">
                        <i class="fas fa-shield-alt"></i> BCrypt (Rounds: 10)
                    </h6>
                    <div class="d-flex justify-content-between">
                        <span class="text-white-50">Time to Crack:</span>
                        <strong style="color: ${bcryptTime.securityLevel.color}">${bcryptTime.readableTime}</strong>
                    </div>
                    <small class="text-white-50">20,000 hashes/sec (RTX 4090)</small>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="breach-card ${sha1Time.securityLevel.level}">
                    <h6 class="text-white mb-2">
                        <i class="fas fa-bolt"></i> SHA-1 (Deprecated)
                    </h6>
                    <div class="d-flex justify-content-between">
                        <span class="text-white-50">Time to Crack:</span>
                        <strong style="color: ${sha1Time.securityLevel.color}">${sha1Time.readableTime}</strong>
                    </div>
                    <small class="text-white-50">100 billion hashes/sec (RTX 4090)</small>
                </div>
                
                <div class="breach-card ${argon2Time.securityLevel.level}">
                    <h6 class="text-white mb-2">
                        <i class="fas fa-lock"></i> Argon2id (64MB Memory)
                    </h6>
                    <div class="d-flex justify-content-between">
                        <span class="text-white-50">Time to Crack:</span>
                        <strong style="color: ${argon2Time.securityLevel.color}">${argon2Time.readableTime}</strong>
                    </div>
                    <small class="text-white-50">~1,000 hashes/sec (RTX 4090)</small>
                </div>
            </div>
        </div>
        
        <div class="recommendation-box">
            <h6 class="text-white mb-3">
                <i class="fas fa-lightbulb"></i> Security Recommendation
            </h6>
            <p class="mb-2" style="color: #00f3ff;">${recommendation}</p>
            <hr style="border-color: rgba(0, 243, 255, 0.3);">
            <div class="small text-white-50">
                <strong>Password Characteristics:</strong><br>
                ${analysis.hasLower ? '✓ Lowercase' : '✗ No lowercase'} | 
                ${analysis.hasUpper ? '✓ Uppercase' : '✗ No uppercase'} | 
                ${analysis.hasDigit ? '✓ Numbers' : '✗ No numbers'} | 
                ${analysis.hasSymbol ? '✓ Symbols' : '✗ No symbols'}
            </div>
        </div>
        
        <div class="alert alert-warning mt-3 mb-0">
            <small>
                <i class="fas fa-info-circle"></i> 
                <strong>Note:</strong> These estimates assume an attacker with RTX 4090 GPU hardware. 
                Real-world breach times may vary. Always use Argon2 or BCrypt for production systems!
            </small>
        </div>
    `;
    
    document.getElementById('breachTimeAnalysis').innerHTML = breachHTML;
}

/**
 * UI HELPER FUNCTIONS
 */

function showSpinner(message) {
    document.getElementById('spinnerText').textContent = message;
    document.getElementById('loadingSpinner').classList.add('active');
}

function hideSpinner() {
    document.getElementById('loadingSpinner').classList.remove('active');
}

function updateHashTime(timeMs) {
    document.getElementById('hashTime').textContent = timeMs;
    
    // Add color coding based on speed
    const display = document.getElementById('hashTimeDisplay');
    if (timeMs < 10) {
        display.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'; // Red = Fast = Bad
    } else if (timeMs < 100) {
        display.style.background = 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)'; // Yellow = Moderate
    } else {
        display.style.background = 'linear-gradient(135deg, #28a745 0%, #218838 100%)'; // Green = Slow = Good
    }
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
    
    setTimeout(() => {
        element.innerHTML = '';
    }, 5000);
}

function getSecurityBadge(algorithm, upgraded = false) {
    let badge = '';
    
    // Normalize algorithm name to lowercase for comparison
    const algo = algorithm.toLowerCase();
    
    switch(algo) {
        case 'md5':
            badge = '<span class="badge badge-vulnerable">VULNERABLE</span>';
            break;
        case 'sha1':
            badge = '<span class="badge badge-weak">WEAK</span>';
            break;
        case 'bcrypt':
            badge = '<span class="badge badge-secure">SECURE</span>';
            break;
        case 'argon2':
        case 'argon2id':
            badge = '<span class="badge badge-secure">MOST SECURE</span>';
            break;
        default:
            badge = '<span class="badge bg-secondary">Unknown</span>';
    }
    
    if (upgraded) {
        badge += ' <span class="badge bg-success ms-1"><i class="fas fa-arrow-up"></i> UPGRADED</span>';
    }
    
    return badge;
}

function getAlgorithmName(algorithm) {
    const names = {
        'md5': 'MD5',
        'sha1': 'SHA-1',
        'bcrypt': 'BCrypt',
        'argon2': 'Argon2id'
    };
    return names[algorithm] || algorithm;
}

/**
 * RENDER ADMIN DASHBOARD
 */
async function renderUserTable() {
    const users = await getAllUsers();
    const tbody = document.getElementById('userTableBody');
    
    // Only render if table exists (dashboard page)
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = `<tr>
            <td colspan="6" class="text-center text-muted">
                No users registered yet. Create your first user above.
            </td>
        </tr>`;
        return;
    }
    
    tbody.innerHTML = users.map((user, index) => {
        const saltInfo = user.salt === 'NONE' ? 
            '' : 
            user.salt === 'EMBEDDED' ? 
            '<br><small class="text-success">Embedded in Hash</small>' :
            `<br><small class="text-muted">Salted</small>`;
            
        return `
        <tr class="${user.upgraded ? 'table-success' : ''}">
            <td>${index + 1}</td>
            <td><strong>${user.username}</strong>${user.upgraded ? ' <span class="badge bg-success">UPGRADED</span>' : ''}</td>
            <td>${getAlgorithmName(user.algorithm)}</td>
            <td>${getSecurityBadge(user.algorithm, user.upgraded)}</td>
            <td>
                <div class="hash-display" title="${user.hash}">
                    <code style="font-size: 0.85em; color: #00f3ff;">${user.hash.substring(0, 50)}${user.hash.length > 50 ? '...' : ''}</code>
                </div>
                <small class="text-muted">Length: ${user.hash.length} chars${saltInfo}</small>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="copyHash('${user.hash.replace(/'/g, "\\'")}')
                    title="Copy hash to clipboard">
                    <i class="fas fa-copy"></i>
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

// Copy hash to clipboard
function copyHash(hash) {
    navigator.clipboard.writeText(hash).then(() => {
        alert('Hash copied to clipboard!\nUse this in Hashcat or John the Ripper for security testing.');
    });
}

// Load dashboard (render table and update stats)
async function loadDashboard() {
    await renderUserTable();
    
    // Update stats if on dashboard page
    if (typeof updateStats === 'function') {
        await updateStats();
    }
}

/**
 * EVENT HANDLERS
 */

// Algorithm selection changes cost factor visibility (only if element exists)
const regAlgorithm = document.getElementById('regAlgorithm');
if (regAlgorithm) {
    regAlgorithm.addEventListener('change', (e) => {
        const algorithm = e.target.value;
        
        const bcryptContainer = document.getElementById('bcryptCostContainer');
        const argon2Container = document.getElementById('argon2MemContainer');
        
        if (bcryptContainer) {
            bcryptContainer.style.display = algorithm === 'bcrypt' ? 'block' : 'none';
        }
        
        if (argon2Container) {
            argon2Container.style.display = algorithm === 'argon2' ? 'block' : 'none';
        }
    });
}

// BCrypt rounds slider (only if element exists)
const bcryptRounds = document.getElementById('bcryptRounds');
if (bcryptRounds) {
    bcryptRounds.addEventListener('input', (e) => {
        const rounds = parseInt(e.target.value);
        currentConfig.bcryptRounds = rounds;
        const bcryptRoundsValue = document.getElementById('bcryptRoundsValue');
        if (bcryptRoundsValue) {
            bcryptRoundsValue.textContent = rounds;
        }
        const bcryptRoundsValue2 = document.getElementById('bcryptRoundsValue2');
        if (bcryptRoundsValue2) {
            bcryptRoundsValue2.textContent = rounds;
        }
    });
}

// Argon2 memory slider (only if element exists)
const argon2Memory = document.getElementById('argon2Memory');
if (argon2Memory) {
    argon2Memory.addEventListener('input', (e) => {
        const memory = parseInt(e.target.value);
        currentConfig.argon2Memory = memory;
        const argon2MemoryValue = document.getElementById('argon2MemoryValue');
        if (argon2MemoryValue) {
            argon2MemoryValue.textContent = memory;
        }
    });
}

// Check Pwned Button (only if element exists)
const checkPwnedBtn = document.getElementById('checkPwnedBtn');
if (checkPwnedBtn) {
    checkPwnedBtn.addEventListener('click', async () => {
        const regPassword = document.getElementById('regPassword');
        const password = regPassword ? regPassword.value : '';
        
        if (!password) {
            alert('Please enter a password first!');
            return;
        }
        
        const btn = document.getElementById('checkPwnedBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        }
        
        const result = await checkPasswordPwned(password);
        
        const resultDiv = document.getElementById('pwnedResult');
        
        if (resultDiv) {
            if (result.pwned) {
                resultDiv.innerHTML = `<div class="pwned-warning">
                    <strong>⚠️ WARNING:</strong> ${result.message}
                    <br><small>This password should NOT be used. It has appeared in data breaches.</small>
                </div>`;
            } else if (result.pwned === false) {
                resultDiv.innerHTML = `<div class="pwned-safe">
                    <strong>✓ Safe:</strong> ${result.message}
                </div>`;
            } else {
                resultDiv.innerHTML = `<div class="alert alert-warning">${result.message}</div>`;
            }
        }
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Check for Data Breaches (HaveIBeenPwned)';
        }
    });
}

// Password input - real-time analysis (only if element exists)
const regPassword = document.getElementById('regPassword');
if (regPassword) {
    regPassword.addEventListener('input', (e) => {
        const password = e.target.value;
        const regAlgorithm = document.getElementById('regAlgorithm');
        const algorithm = regAlgorithm ? regAlgorithm.value : 'bcrypt';
        
        if (password.length > 0) {
            displayBreachTimeAnalysis(password, algorithm);
        } else {
            const passwordAnalysis = document.getElementById('passwordAnalysis');
            const breachTimeAnalysis = document.getElementById('breachTimeAnalysis');
            if (passwordAnalysis) {
                passwordAnalysis.style.display = 'none';
            }
            if (breachTimeAnalysis) {
                breachTimeAnalysis.innerHTML = '<p class="text-center text-white-50">Register a user above to see breach time estimates...</p>';
            }
        }
    });
}

// Algorithm change - update breach time (only if element exists)
const regAlgorithmChange = document.getElementById('regAlgorithm');
if (regAlgorithmChange) {
    regAlgorithmChange.addEventListener('change', (e) => {
        const regPassword = document.getElementById('regPassword');
        const password = regPassword ? regPassword.value : '';
        
        if (password.length > 0) {
            displayBreachTimeAnalysis(password, e.target.value);
        }
    });
}

// Registration Form Submit (only if form exists)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const algorithm = document.getElementById('regAlgorithm').value;
    
        if (!username || !password) {
            showMessage('registerMessage', 'Please fill in all fields!', 'danger');
            return;
        }
        
        try {
            // Display final breach time analysis
            displayBreachTimeAnalysis(password, algorithm);
            
            let result;
            
            // Use backend API if available
            if (isBackendAvailable()) {
                try {
                    result = await registerUserAPI(username, password, algorithm);
                    showMessage('registerMessage', `✓ ${result.message} (Backend API)`, 'success');
                } catch (error) {
                    throw new Error(`Backend error: ${error.message}`);
                }
            } else {
                // Fallback to localStorage
                const { hash, salt } = await generateHash(password, algorithm);
                
                if (hash.startsWith('ERROR:')) {
                    showMessage('registerMessage', hash, 'danger');
                    return;
                }
                
                result = addUser(username, algorithm, hash, salt);
                if (result.success) {
                    showMessage('registerMessage', `✓ ${result.message} (LocalStorage)`, 'success');
                } else {
                    showMessage('registerMessage', result.message, 'warning');
                    return;
                }
            }
            
            // Clear form but keep algorithm selection
            const selectedAlgorithm = document.getElementById('regAlgorithm').value;
            document.getElementById('registerForm').reset();
            document.getElementById('regAlgorithm').value = selectedAlgorithm;
            document.getElementById('pwnedResult').innerHTML = '';
            
            // Reset hash time display
            const hashTimeDisplay = document.getElementById('hashTimeDisplay');
            if (hashTimeDisplay) {
                document.getElementById('hashTime').textContent = '--';
                hashTimeDisplay.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)';
            }
            
            const passwordAnalysis = document.getElementById('passwordAnalysis');
            const breachTimeAnalysis = document.getElementById('breachTimeAnalysis');
            if (passwordAnalysis) passwordAnalysis.style.display = 'none';
            if (breachTimeAnalysis) {
                breachTimeAnalysis.innerHTML = '<p class="text-center text-white-50">Enter a password below to see breach time estimates...</p>';
            }
            
            // Reset sliders to default
            currentConfig.bcryptRounds = 10;
            currentConfig.argon2Memory = 64;
            const bcryptRoundsElem = document.getElementById('bcryptRounds');
            const argon2MemoryElem = document.getElementById('argon2Memory');
            const bcryptRoundsValue = document.getElementById('bcryptRoundsValue');
            const bcryptRoundsValue2 = document.getElementById('bcryptRoundsValue2');
            const argon2MemoryValue = document.getElementById('argon2MemoryValue');
            
            if (bcryptRoundsElem) bcryptRoundsElem.value = 10;
            if (argon2MemoryElem) argon2MemoryElem.value = 64;
            if (bcryptRoundsValue) bcryptRoundsValue.textContent = 10;
            if (bcryptRoundsValue2) bcryptRoundsValue2.textContent = 10;
            if (argon2MemoryValue) argon2MemoryValue.textContent = 64;
            
            // Update dashboard
            await renderUserTable();
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('registerMessage', 'Registration failed: ' + error.message, 'danger');
        }
    });
}

// Login Form Submit with Legacy Migration (only if form exists)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
    
        if (!username || !password) {
            showMessage('loginMessage', 'Please fill in all fields!', 'danger');
            return;
        }
        
        try {
            // Use backend API if available
            if (isBackendAvailable()) {
                const result = await loginUserAPI(username, password);
                
                if (result.success) {
                    let message = `✓ Login successful! Authenticated using ${result.user.algorithm.toUpperCase()}.`;
                    
                    if (result.migrated) {
                        message = '✓ Login successful! Your password security has been automatically upgraded from MD5 to Argon2id.';
                    }
                    
                    showMessage('loginMessage', `${message} (Backend API)`, 'success');
                    document.getElementById('loginForm').reset();
                    await renderUserTable();
                } else {
                    showMessage('loginMessage', '✗ ' + result.message, 'danger');
                }
                return;
            }
            
            // Fallback to localStorage
            const user = findUser(username);
            
            if (!user) {
                showMessage('loginMessage', '✗ User not found!', 'danger');
                return;
            }
            
            // Verify password
            const isValid = await verifyHash(password, user.algorithm, user.hash, user.salt);
            
            if (isValid) {
                // Check for legacy migration
                const migrated = await attemptLegacyMigration(user, password);
                
                if (migrated) {
                    showMessage('loginMessage', 
                        `✓ Login successful! Your account has been automatically upgraded from MD5 to Argon2id for enhanced security. (LocalStorage)`, 
                        'success');
                        
                    // Update dashboard to show the upgrade
                    await renderUserTable();
                } else {
                    showMessage('loginMessage', 
                        `✓ Login successful! Authenticated using ${getAlgorithmName(user.algorithm)}. (LocalStorage)`, 
                        'success');
                }
                
                document.getElementById('loginForm').reset();
            } else {
                showMessage('loginMessage', '✗ Invalid password!', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('loginMessage', 'Login failed: ' + error.message, 'danger');
        }
    });
}

// Clear Data Button (only if button exists)
const clearDataBtn = document.getElementById('clearDataBtn');
if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all user data from Local Storage?')) {
            clearDatabase();
            renderUserTable();
            showMessage('registerMessage', 'All data cleared from Local Storage!', 'info');
        }
    });
}

// Export Database Button (only if button exists)
const exportDbBtn = document.getElementById('exportDbBtn');
if (exportDbBtn) {
    exportDbBtn.addEventListener('click', () => {
        exportDatabaseForHashcat();
        showMessage('registerMessage', 'Database exported successfully! Check your downloads folder.', 'info');
    });
}

/**
 * INITIALIZE APPLICATION
 */
function init() {
    initDatabase();
    renderUserTable();
    
    console.log('%c🔒 Advanced Authentication Security Lab Initialized', 
        'background: #667eea; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    console.log('%c Local Storage is acting as the database', 
        'background: #764ba2; color: white; padding: 5px;');
    console.log('%c Features: HaveIBeenPwned API | Legacy Migration | Cost Factor Testing', 
        'background: #28a745; color: white; padding: 5px;');
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/**
 * TAB NAVIGATION SYSTEM
 * Only runs if not in multi-page mode
 */
function initTabNavigation() {
    // Skip tab navigation in multi-page mode
    if (window.MULTI_PAGE_MODE) {
        return;
    }
    
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    const sections = document.querySelectorAll('.content-section');
    
    // Function to show specific section
    function showSection(tabName) {
        sections.forEach(section => {
            const sectionAttr = section.getAttribute('data-section');
            if (!sectionAttr) return;
            
            // Support multiple section names (space-separated)
            const sectionNames = sectionAttr.split(' ');
            
            if (sectionNames.includes(tabName)) {
                section.style.display = '';
                section.style.opacity = '1';
                // Override the CSS !important rule
                section.style.setProperty('display', 'block', 'important');
            } else {
                section.style.display = 'none';
                section.style.opacity = '0';
                section.style.setProperty('display', 'none', 'important');
            }
        });
        
        // Update active nav link
        navLinks.forEach(link => {
            const linkTab = link.getAttribute('data-tab');
            if (linkTab === tabName) {
                link.style.background = 'rgba(0, 243, 255, 0.3)';
                link.style.borderColor = '#00f3ff';
                link.style.color = '#00f3ff';
            } else {
                link.style.background = 'rgba(0, 243, 255, 0.1)';
                link.style.borderColor = 'rgba(0, 243, 255, 0.3)';
                link.style.color = '#fff';
            }
        });
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Add click handlers to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            if (tabName) {
                showSection(tabName);
            }
        });
    });
    
    // Show login section by default on page load
    setTimeout(() => {
        showSection('login');
    }, 100);
}

// Initialize tab navigation after DOM is ready (only in single-page mode)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initTabNavigation, 200);
    });
} else {
    setTimeout(initTabNavigation, 200);
}

// Expose functions to global scope
window.copyHash = copyHash;
