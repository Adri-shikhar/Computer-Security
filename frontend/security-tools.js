/**
 * Security Tools JavaScript
 * Advanced security features and demonstrations
 */

// Global variables for cracking simulator
let crackingActive = false;
let crackAttempts = 0;
let crackStartTime = 0;
let commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'monkey', '1234567', 
    'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
    'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
    'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
    'password1', 'password123', 'admin', 'root', 'toor', 'test', 'guest'
];

/**
 * Hash Comparison Tool
 */
const compareBtn = document.getElementById('compareBtn');
if (compareBtn) {
    compareBtn.addEventListener('click', async () => {
        const password = document.getElementById('comparePassword').value;
        const resultsDiv = document.getElementById('comparisonResults');
        
        if (!password) {
            resultsDiv.innerHTML = '<div class="alert alert-warning">Please enter a password</div>';
            return;
        }
        
        resultsDiv.innerHTML = '<div class="text-center"><div class="spinner-border text-primary"></div><p class="mt-2">Computing hashes...</p></div>';
        
        try {
            // Call backend API if available
            if (typeof backendAvailable !== 'undefined' && backendAvailable) {
                const response = await fetch(`${API_BASE_URL}/compare-hashes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await response.json();
                
                let html = '<div class="row">';
                for (const [algo, info] of Object.entries(data.comparison)) {
                    html += `
                        <div class="col-md-4 mb-3">
                            <div class="card bg-dark border-primary">
                                <div class="card-header">${algo.toUpperCase()}</div>
                                <div class="card-body">
                                    <div class="hash-output">${info.hash}</div>
                                    <p class="mb-1"><strong>Length:</strong> ${info.length} chars</p>
                                    <p class="mb-1"><strong>Time:</strong> ${info.time_ms} ms</p>
                                    <p class="mb-1"><strong>Salt:</strong> ${info.salt}</p>
                                    <p class="mb-0"><strong>Security:</strong> ${info.security}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
                html += '</div>';
                resultsDiv.innerHTML = html;
            } else {
                // Fallback to frontend hashing
                const results = {};
                
                // MD5
                const startMD5 = performance.now();
                const md5Hash = CryptoJS.MD5(password).toString();
                results.md5 = {
                    hash: md5Hash,
                    length: md5Hash.length,
                    time_ms: (performance.now() - startMD5).toFixed(3),
                    salt: 'None',
                    security: '⚠️ BROKEN'
                };
                
                // PBKDF2
                const startPBKDF2 = performance.now();
                const pbkdf2Hash = CryptoJS.PBKDF2(password, 'salt123', { keySize: 256/32, iterations: 10000 }).toString();
                results.pbkdf2 = {
                    hash: pbkdf2Hash,
                    length: pbkdf2Hash.length,
                    time_ms: (performance.now() - startPBKDF2).toFixed(3),
                    salt: 'salt123',
                    security: '✅ SECURE'
                };
                
                let html = '<div class="row">';
                for (const [algo, info] of Object.entries(results)) {
                    html += `
                        <div class="col-md-6 mb-3">
                            <div class="card bg-dark border-primary">
                                <div class="card-header">${algo.toUpperCase()}</div>
                                <div class="card-body">
                                    <div class="hash-output">${info.hash}</div>
                                    <p class="mb-1"><strong>Length:</strong> ${info.length} chars</p>
                                    <p class="mb-1"><strong>Time:</strong> ${info.time_ms} ms</p>
                                    <p class="mb-1"><strong>Salt:</strong> ${info.salt}</p>
                                    <p class="mb-0"><strong>Security:</strong> ${info.security}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
                html += '</div>';
                resultsDiv.innerHTML = html;
            }
        } catch (error) {
            resultsDiv.innerHTML = '<div class="alert alert-danger">Error: ' + error.message + '</div>';
        }
    });
}

/**
 * Hash Analyzer
 */
const analyzeBtn = document.getElementById('analyzeBtn');
if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
        const hash = document.getElementById('hashToAnalyze').value.trim();
        const resultsDiv = document.getElementById('analysisResults');
        
        if (!hash) {
            resultsDiv.innerHTML = '<div class="alert alert-warning">Please enter a hash</div>';
            return;
        }
        
        try {
            if (typeof backendAvailable !== 'undefined' && backendAvailable) {
                const response = await fetch(`${API_BASE_URL}/analyze-hash`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hash })
                });
                const data = await response.json();
                const analysis = data.analysis;
                
                let html = `
                    <div class="card bg-dark border-info">
                        <div class="card-header bg-info text-white">
                            <strong>Identified Algorithm: ${analysis.identified_algorithm}</strong>
                        </div>
                        <div class="card-body">
                            <p><strong>Hash:</strong> <code style="color: #4299e1;">${analysis.hash}</code></p>
                            <p><strong>Length:</strong> ${analysis.length} characters</p>
                            <h6 class="mt-3">Details:</h6>
                `;
                
                for (const [key, value] of Object.entries(analysis.details)) {
                    html += `<p class="mb-1"><strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> ${value}</p>`;
                }
                
                html += '</div></div>';
                resultsDiv.innerHTML = html;
            }
        } catch (error) {
            resultsDiv.innerHTML = '<div class="alert alert-danger">Error: ' + error.message + '</div>';
        }
    });
}

/**
 * Live Hash Cracking Simulator
 */
const startCrackBtn = document.getElementById('startCrackBtn');
const stopCrackBtn = document.getElementById('stopCrackBtn');
const resetCrackBtn = document.getElementById('resetCrackBtn');

if (startCrackBtn) {
    startCrackBtn.addEventListener('click', async () => {
        const password = document.getElementById('crackTargetPassword').value;
        const algorithm = document.getElementById('crackAlgorithm').value;
        
        if (!password) {
            alert('Please enter a target password');
            return;
        }
        
        crackingActive = true;
        crackAttempts = 0;
        crackStartTime = Date.now();
        
        startCrackBtn.disabled = true;
        stopCrackBtn.disabled = false;
        
        // Generate target hash
        let targetHash;
        if (algorithm === 'md5') {
            targetHash = CryptoJS.MD5(password).toString();
        } else if (algorithm === 'pbkdf2') {
            targetHash = CryptoJS.PBKDF2(password, 'salt123', { keySize: 256/32, iterations: 10000 }).toString();
        }
        
        const logDiv = document.getElementById('crackLog');
        logDiv.innerHTML = '';
        
        // Simulate cracking
        for (let word of commonPasswords) {
            if (!crackingActive) break;
            
            crackAttempts++;
            
            // Generate test hash
            let testHash;
            if (algorithm === 'md5') {
                testHash = CryptoJS.MD5(word).toString();
            } else if (algorithm === 'pbkdf2') {
                testHash = CryptoJS.PBKDF2(word, 'salt123', { keySize: 256/32, iterations: 10000 }).toString();
            }
            
            const elapsed = (Date.now() - crackStartTime) / 1000;
            const rate = (crackAttempts / elapsed).toFixed(2);
            
            document.getElementById('crackAttempts').textContent = crackAttempts;
            document.getElementById('crackRate').textContent = rate;
            document.getElementById('crackTime').textContent = elapsed.toFixed(2);
            
            const attemptDiv = document.createElement('div');
            attemptDiv.className = 'crack-attempt';
            
            if (testHash === targetHash) {
                attemptDiv.className += ' success';
                attemptDiv.innerHTML = `✅ CRACKED! Password is: <strong>${word}</strong> (${crackAttempts} attempts in ${elapsed.toFixed(2)}s)`;
                logDiv.prepend(attemptDiv);
                
                document.getElementById('crackProgressBar').style.width = '100%';
                document.getElementById('crackProgressBar').className = 'progress-bar bg-success';
                document.getElementById('crackProgressText').textContent = 'CRACKED!';
                
                crackingActive = false;
                startCrackBtn.disabled = false;
                stopCrackBtn.disabled = true;
                break;
            } else {
                attemptDiv.textContent = `Attempt ${crackAttempts}: ${word} ❌`;
                logDiv.prepend(attemptDiv);
            }
            
            const progress = (crackAttempts / commonPasswords.length * 100).toFixed(0);
            document.getElementById('crackProgressBar').style.width = progress + '%';
            document.getElementById('crackProgressText').textContent = `${progress}%`;
            
            // Keep only last 10 attempts visible
            while (logDiv.children.length > 10) {
                logDiv.removeChild(logDiv.lastChild);
            }
            
            // Delay based on algorithm (simulate speed difference)
            const delay = algorithm === 'md5' ? 50 : algorithm === 'pbkdf2' ? 200 : 500;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        if (crackingActive) {
            const attemptDiv = document.createElement('div');
            attemptDiv.className = 'crack-attempt';
            attemptDiv.innerHTML = `⚠️ Password not found in wordlist (tested ${crackAttempts} passwords)`;
            logDiv.prepend(attemptDiv);
            
            document.getElementById('crackProgressText').textContent = 'Not Found';
        }
        
        crackingActive = false;
        startCrackBtn.disabled = false;
        stopCrackBtn.disabled = true;
    });
}

if (stopCrackBtn) {
    stopCrackBtn.addEventListener('click', () => {
        crackingActive = false;
        startCrackBtn.disabled = false;
        stopCrackBtn.disabled = true;
    });
}

if (resetCrackBtn) {
    resetCrackBtn.addEventListener('click', () => {
        crackingActive = false;
        crackAttempts = 0;
        document.getElementById('crackAttempts').textContent = '0';
        document.getElementById('crackRate').textContent = '0';
        document.getElementById('crackTime').textContent = '0.00';
        document.getElementById('crackLog').innerHTML = '';
        document.getElementById('crackProgressBar').style.width = '0%';
        document.getElementById('crackProgressBar').className = 'progress-bar progress-bar-striped progress-bar-animated';
        document.getElementById('crackProgressText').textContent = 'Ready';
        startCrackBtn.disabled = false;
        stopCrackBtn.disabled = true;
    });
}

/**
 * Entropy Visualizer
 */
const entropyPasswordInput = document.getElementById('entropyPassword');
if (entropyPasswordInput) {
    entropyPasswordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        
        if (!password) {
            document.getElementById('entropyFill').style.width = '0%';
            document.getElementById('entropyFill').textContent = '0 bits';
            document.getElementById('entropyDetails').innerHTML = '';
            return;
        }
        
        // Calculate entropy
        let charsetSize = 0;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);
        
        if (hasLower) charsetSize += 26;
        if (hasUpper) charsetSize += 26;
        if (hasDigit) charsetSize += 10;
        if (hasSymbol) charsetSize += 32;
        
        const entropy = password.length * Math.log2(charsetSize || 1);
        const maxEntropy = 150; // Visual maximum
        const percentage = Math.min((entropy / maxEntropy) * 100, 100);
        
        // Update bar
        const fill = document.getElementById('entropyFill');
        fill.style.width = percentage + '%';
        fill.textContent = entropy.toFixed(1) + ' bits';
        
        // Color based on strength
        if (entropy < 30) {
            fill.style.background = 'linear-gradient(90deg, #ff006e, #ff4500)';
        } else if (entropy < 60) {
            fill.style.background = 'linear-gradient(90deg, #ffcc00, #ff9900)';
        } else if (entropy < 90) {
            fill.style.background = 'linear-gradient(90deg, #4299e1, #0066cc)';
        } else {
            fill.style.background = 'linear-gradient(90deg, #00ff88, #00aa55)';
        }
        
        // Details
        const detailsDiv = document.getElementById('entropyDetails');
        detailsDiv.innerHTML = `
            <div class="row text-white-50">
                <div class="col-md-3">
                    <p class="mb-1"><strong>Length:</strong> ${password.length}</p>
                </div>
                <div class="col-md-3">
                    <p class="mb-1"><strong>Charset Size:</strong> ${charsetSize}</p>
                </div>
                <div class="col-md-3">
                    <p class="mb-1"><strong>Lowercase:</strong> ${hasLower ? '✓' : '✗'}</p>
                </div>
                <div class="col-md-3">
                    <p class="mb-1"><strong>Uppercase:</strong> ${hasUpper ? '✓' : '✗'}</p>
                </div>
                <div class="col-md-3">
                    <p class="mb-1"><strong>Digits:</strong> ${hasDigit ? '✓' : '✗'}</p>
                </div>
                <div class="col-md-3">
                    <p class="mb-1"><strong>Symbols:</strong> ${hasSymbol ? '✓' : '✗'}</p>
                </div>
                <div class="col-md-6">
                    <p class="mb-1"><strong>Strength:</strong> ${
                        entropy < 30 ? '❌ Weak' : 
                        entropy < 60 ? '⚠️ Moderate' : 
                        entropy < 90 ? '✅ Strong' : 
                        '🔒 Excellent'
                    }</p>
                </div>
            </div>
        `;
    });
}

/**
 * Timing Attack Demo
 */
const runTimingBtn = document.getElementById('runTimingBtn');
if (runTimingBtn) {
    runTimingBtn.addEventListener('click', () => {
        runTimingBtn.disabled = true;
        runTimingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
        
        setTimeout(() => {
            // Vulnerable comparison (early exit)
            const testHash1 = 'abcdefghijklmnopqrstuvwxyz123456';
            const testHash2a = 'abcdefghijklmnopqrstuvwxyz123456'; // Match
            const testHash2b = 'zbcdefghijklmnopqrstuvwxyz123456'; // Fail at first char
            const testHash2c = 'abcdefghijklmnopqrstuvwxyz123457'; // Fail at last char
            
            // Vulnerable comparison
            let vulnerableTimeFast = 0;
            let vulnerableTimeSlow = 0;
            
            for (let i = 0; i < 1000; i++) {
                const start = performance.now();
                let result = true;
                for (let j = 0; j < testHash1.length; j++) {
                    if (testHash1[j] !== testHash2b[j]) {
                        result = false;
                        break; // EARLY EXIT
                    }
                }
                vulnerableTimeFast += performance.now() - start;
            }
            
            for (let i = 0; i < 1000; i++) {
                const start = performance.now();
                let result = true;
                for (let j = 0; j < testHash1.length; j++) {
                    if (testHash1[j] !== testHash2c[j]) {
                        result = false;
                        break; // EARLY EXIT
                    }
                }
                vulnerableTimeSlow += performance.now() - start;
            }
            
            // Secure comparison
            let secureTimeFast = 0;
            let secureTimeSlow = 0;
            
            for (let i = 0; i < 1000; i++) {
                const start = performance.now();
                let diff = testHash1.length ^ testHash2b.length;
                for (let j = 0; j < testHash1.length; j++) {
                    diff |= testHash1.charCodeAt(j) ^ testHash2b.charCodeAt(j || 0);
                }
                const result = diff === 0;
                secureTimeFast += performance.now() - start;
            }
            
            for (let i = 0; i < 1000; i++) {
                const start = performance.now();
                let diff = testHash1.length ^ testHash2c.length;
                for (let j = 0; j < testHash1.length; j++) {
                    diff |= testHash1.charCodeAt(j) ^ testHash2c.charCodeAt(j || 0);
                }
                const result = diff === 0;
                secureTimeSlow += performance.now() - start;
            }
            
            const avgVulnerableFast = (vulnerableTimeFast / 1000).toFixed(6);
            const avgVulnerableSlow = (vulnerableTimeSlow / 1000).toFixed(6);
            const avgSecureFast = (secureTimeFast / 1000).toFixed(6);
            const avgSecureSlow = (secureTimeSlow / 1000).toFixed(6);
            
            document.getElementById('vulnerableTime').innerHTML = `
                Fast fail: ${avgVulnerableFast} ms<br>
                Slow fail: ${avgVulnerableSlow} ms<br>
                <small class="text-warning">⚠️ ${((avgVulnerableSlow - avgVulnerableFast) / avgVulnerableFast * 100).toFixed(1)}% timing difference</small>
            `;
            
            document.getElementById('secureTime').innerHTML = `
                Fast fail: ${avgSecureFast} ms<br>
                Slow fail: ${avgSecureSlow} ms<br>
                <small class="text-success">✅ ${Math.abs((avgSecureSlow - avgSecureFast) / avgSecureFast * 100).toFixed(1)}% timing difference</small>
            `;
            
            runTimingBtn.disabled = false;
            runTimingBtn.innerHTML = '<i class="fas fa-stopwatch"></i> Run Timing Test (1000 iterations)';
        }, 100);
    });
}

/**
 * Wordlist File Upload
 */
const wordlistFile = document.getElementById('wordlistFile');
if (wordlistFile) {
    wordlistFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('customWordlist').value = event.target.result;
            };
            reader.readAsText(file);
        }
    });
}

console.log('Security tools loaded ✓');
