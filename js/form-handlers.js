/**
 * ============================================
 * FORM-HANDLERS.JS - Form Event Handlers
 * ============================================
 * Purpose: Handle form submissions and input events
 * Contains: Registration, login, sliders, buttons
 */

// Initialize all form event handlers
function initFormHandlers() {
    // Algorithm selection changes cost factor visibility
    const regAlgorithm = document.getElementById('regAlgorithm');
    if (regAlgorithm) {
        regAlgorithm.addEventListener('change', (e) => {
            const algorithm = e.target.value;
            const bcryptContainer = document.getElementById('bcryptCostContainer');
            const argon2Container = document.getElementById('argon2MemContainer');
            
            if (bcryptContainer) bcryptContainer.style.display = algorithm === 'bcrypt' ? 'block' : 'none';
            if (argon2Container) argon2Container.style.display = algorithm === 'argon2' ? 'block' : 'none';
        });
    }
    
    // BCrypt rounds slider
    const bcryptRounds = document.getElementById('bcryptRounds');
    if (bcryptRounds) {
        bcryptRounds.addEventListener('input', (e) => {
            const rounds = parseInt(e.target.value);
            currentConfig.bcryptRounds = rounds;
            const bcryptRoundsValue = document.getElementById('bcryptRoundsValue');
            const bcryptRoundsValue2 = document.getElementById('bcryptRoundsValue2');
            if (bcryptRoundsValue) bcryptRoundsValue.textContent = rounds;
            if (bcryptRoundsValue2) bcryptRoundsValue2.textContent = rounds;
        });
    }
    
    // Argon2 memory slider
    const argon2Memory = document.getElementById('argon2Memory');
    if (argon2Memory) {
        argon2Memory.addEventListener('input', (e) => {
            const memory = parseInt(e.target.value);
            currentConfig.argon2Memory = memory;
            const argon2MemoryValue = document.getElementById('argon2MemoryValue');
            if (argon2MemoryValue) argon2MemoryValue.textContent = memory;
        });
    }
    
    // Check Pwned Button
    const checkPwnedBtn = document.getElementById('checkPwnedBtn');
    if (checkPwnedBtn) {
        checkPwnedBtn.addEventListener('click', async () => {
            const regPassword = document.getElementById('regPassword');
            const password = regPassword ? regPassword.value : '';
            
            if (!password) {
                showWarningToast('Please enter a password first!');
                return;
            }
            
            checkPwnedBtn.disabled = true;
            checkPwnedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
            
            const result = await checkPasswordPwned(password);
            const resultDiv = document.getElementById('pwnedResult');
            
            if (resultDiv) {
                if (result.pwned) {
                    resultDiv.innerHTML = `<div class="pwned-warning">
                        <strong>⚠️ WARNING:</strong> ${result.message}
                        <br><small>This password should NOT be used.</small>
                    </div>`;
                } else if (result.pwned === false) {
                    resultDiv.innerHTML = `<div class="pwned-safe">
                        <strong>✓ Safe:</strong> ${result.message}
                    </div>`;
                } else {
                    resultDiv.innerHTML = `<div class="alert alert-warning">${result.message}</div>`;
                }
            }
            
            checkPwnedBtn.disabled = false;
            checkPwnedBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Check for Data Breaches (HaveIBeenPwned)';
        });
    }
    
    // Password input - real-time analysis
    const regPassword = document.getElementById('regPassword');
    if (regPassword) {
        regPassword.addEventListener('input', (e) => {
            const password = e.target.value;
            const regAlgo = document.getElementById('regAlgorithm');
            const algorithm = regAlgo ? regAlgo.value : 'bcrypt';
            
            if (password.length > 0) {
                displayBreachTimeAnalysis(password, algorithm);
                
                const recommendation = generatePasswordRecommendation(password);
                const recommendationDiv = document.getElementById('passwordRecommendation');
                const recommendedPasswordSpan = document.getElementById('recommendedPassword');
                
                if (recommendation && recommendationDiv && recommendedPasswordSpan) {
                    recommendedPasswordSpan.textContent = recommendation;
                    recommendationDiv.style.display = 'block';
                } else if (recommendationDiv) {
                    recommendationDiv.style.display = 'none';
                }
            } else {
                const passwordAnalysis = document.getElementById('passwordAnalysis');
                const breachTimeAnalysis = document.getElementById('breachTimeAnalysis');
                const recommendationDiv = document.getElementById('passwordRecommendation');
                if (passwordAnalysis) passwordAnalysis.style.display = 'none';
                if (breachTimeAnalysis) breachTimeAnalysis.innerHTML = '<p class="text-center text-white-50">Enter a password to see breach time estimates...</p>';
                if (recommendationDiv) recommendationDiv.style.display = 'none';
            }
        });
    }
    
    // Password visibility toggle
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn && regPassword) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = regPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            regPassword.setAttribute('type', type);
            const togglePasswordIcon = document.getElementById('togglePasswordIcon');
            if (togglePasswordIcon) {
                togglePasswordIcon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            }
        });
    }
    
    // Copy recommendation button
    const copyRecommendationBtn = document.getElementById('copyRecommendation');
    if (copyRecommendationBtn) {
        copyRecommendationBtn.addEventListener('click', () => {
            const recommendedPassword = document.getElementById('recommendedPassword');
            if (recommendedPassword) {
                const textToCopy = recommendedPassword.textContent;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalHTML = copyRecommendationBtn.innerHTML;
                    copyRecommendationBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    copyRecommendationBtn.classList.add('btn-success');
                    copyRecommendationBtn.classList.remove('btn-primary');
                    
                    if (regPassword) {
                        regPassword.value = textToCopy;
                        regPassword.dispatchEvent(new Event('input'));
                    }
                    
                    setTimeout(() => {
                        copyRecommendationBtn.innerHTML = originalHTML;
                        copyRecommendationBtn.classList.remove('btn-success');
                        copyRecommendationBtn.classList.add('btn-primary');
                    }, 2000);
                });
            }
        });
    }
    
    // Algorithm change - update breach time
    if (regAlgorithm) {
        regAlgorithm.addEventListener('change', (e) => {
            const password = regPassword ? regPassword.value : '';
            if (password.length > 0) {
                displayBreachTimeAnalysis(password, e.target.value);
            }
        });
    }
    
    // Registration Form Submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Clear Data Button
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', async () => {
            const confirmed = await showConfirm(
                'Are you sure you want to clear all user data?',
                'Clear All Data',
                { confirmText: 'Clear All', cancelText: 'Cancel', type: 'danger' }
            );
            if (confirmed) {
                clearDatabase();
                renderUserTable();
                showMessage('registerMessage', 'All data cleared!', 'info');
            }
        });
    }
    
    // Export Database Button
    const exportDbBtn = document.getElementById('exportDbBtn');
    if (exportDbBtn) {
        exportDbBtn.addEventListener('click', () => {
            exportDatabaseForHashcat();
            showMessage('registerMessage', 'Database exported!', 'info');
        });
    }
}

// Handle registration form submission
async function handleRegistration(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const algorithm = document.getElementById('regAlgorithm').value;

    if (!username || !password) {
        showMessage('registerMessage', 'Please fill in all fields!', 'danger');
        return;
    }
    
    try {
        displayBreachTimeAnalysis(password, algorithm);
        
        let result;
        
        if (isBackendAvailable()) {
            result = await registerUserAPI(username, password, algorithm);
            showMessage('registerMessage', `✓ ${result.message} (Backend API)`, 'success');
        } else {
            const { hash, salt } = await generateHash(password, algorithm);
            
            if (hash.startsWith('ERROR:')) {
                showMessage('registerMessage', hash, 'danger');
                return;
            }
            
            result = await addUser(username, algorithm, hash, salt);
            if (result.success) {
                showMessage('registerMessage', `✓ ${result.message} (LocalStorage)`, 'success');
            } else {
                showMessage('registerMessage', result.message, 'warning');
                return;
            }
        }
        
        // Reset form
        const selectedAlgorithm = document.getElementById('regAlgorithm').value;
        document.getElementById('registerForm').reset();
        document.getElementById('regAlgorithm').value = selectedAlgorithm;
        
        const pwnedResult = document.getElementById('pwnedResult');
        if (pwnedResult) pwnedResult.innerHTML = '';
        
        await renderUserTable();
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('registerMessage', 'Registration failed: ' + error.message, 'danger');
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showMessage('loginMessage', 'Please fill in all fields!', 'danger');
        return;
    }
    
    try {
        if (isBackendAvailable()) {
            const result = await loginUserAPI(username, password);
            
            if (result.success) {
                let message = `✓ Login successful! Authenticated using ${result.user.algorithm.toUpperCase()}.`;
                if (result.migrated) {
                    message = '✓ Login successful! Your password security has been upgraded to Argon2id.';
                }
                showMessage('loginMessage', message, 'success');
                document.getElementById('loginForm').reset();
                await renderUserTable();
            } else {
                showMessage('loginMessage', '✗ ' + result.message, 'danger');
            }
            return;
        }
        
        // LocalStorage fallback
        const user = await findUser(username);
        
        if (!user) {
            showMessage('loginMessage', '✗ User not found!', 'danger');
            return;
        }
        
        const isValid = await verifyHash(password, user.algorithm, user.hash, user.salt);
        
        if (isValid) {
            const migrated = await attemptLegacyMigration(user, password);
            
            if (migrated) {
                showMessage('loginMessage', '✓ Login successful! Account upgraded to Argon2id.', 'success');
            } else {
                showMessage('loginMessage', `✓ Login successful! (${getAlgorithmName(user.algorithm)})`, 'success');
            }
            
            document.getElementById('loginForm').reset();
            await renderUserTable();
        } else {
            showMessage('loginMessage', '✗ Invalid password!', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Login failed: ' + error.message, 'danger');
    }
}

console.log('✅ form-handlers.js loaded');
