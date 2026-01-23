// Password Breach Checker JavaScript

// Toggle sidebar for mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

function toggleSubNav(id, event) {
    event.preventDefault();
    event.stopPropagation();
    const subNav = document.getElementById(id);
    const toggle = event.currentTarget.querySelector('.nav-toggle');
    subNav.classList.toggle('show');
    if (toggle) toggle.classList.toggle('open');
}

// Password Breach Checker - HIBP k-Anonymity Model
async function checkPasswordBreach() {
    const input = document.getElementById('breachPassword');
    const result = document.getElementById('breachResult');
    
    if (!input || !input.value) {
        alert('Please enter a password to check');
        return;
    }
    
    const password = input.value;
    
    // Show loading state
    if (result) {
        result.innerHTML = `
            <div class="text-center" style="padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i>
                <p style="margin-top: 1rem; color: var(--text-secondary);">
                    <strong>Checking password against breach database...</strong><br>
                    <small>Analyzing 600M+ breached credentials</small>
                </p>
            </div>
        `;
    }
    
    try {
        // Hash the password with SHA-1 (HIBP standard)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        
        // k-Anonymity: Only send first 5 characters
        const prefix = hashHex.substring(0, 5);
        const suffix = hashHex.substring(5);
        
        // Query HIBP API
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const text = await response.text();
        
        // Parse response
        const hashes = text.split('\n');
        let breachCount = 0;
        
        for (const line of hashes) {
            const [hashSuffix, count] = line.split(':');
            if (hashSuffix === suffix) {
                breachCount = parseInt(count);
                break;
            }
        }
        
        // Display results
        if (breachCount > 0) {
            result.innerHTML = `
                <div class="alert" style="background: #fee2e2; border: 2px solid #dc2626; color: #991b1b;">
                    <h4>
                        <i class="fas fa-exclamation-triangle"></i> PASSWORD COMPROMISED!
                    </h4>
                    <p><strong>⚠️ This password has been seen ${breachCount.toLocaleString()} times in data breaches!</strong></p>
                    <p style="margin-top: 1rem;">
                        <strong>Immediate Actions Required:</strong><br>
                        🚨 Change this password immediately<br>
                        🔐 Never use this password again<br>
                        ✨ Generate a new secure password using our tool<br>
                        📱 Update all accounts using this password
                    </p>
                    <div style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.5); border-radius: 8px;">
                        <small><strong>Technical Details (Privacy Protected):</strong></small><br>
                        <small>• Password hashed locally (SHA-1): <code>${hashHex}</code></small><br>
                        <small>• Sent only first 5 chars to HIBP: <code>${prefix}</code></small><br>
                        <small>• Matched against ${hashes.length} possible hashes</small><br>
                        <small>• Your actual password was NEVER sent over the network</small>
                    </div>
                </div>
            `;
        } else {
            result.innerHTML = `
                <div class="alert" style="background: #d1fae5; border: 2px solid #059669; color: #047857;">
                    <h4>
                        <i class="fas fa-check-circle"></i> PASSWORD SAFE
                    </h4>
                    <p><strong>✅ This password has NOT been found in any known data breaches</strong></p>
                    <p style="margin-top: 1rem;">
                        <strong>Security Recommendations:</strong><br>
                        While not breached, ensure your password is:<br>
                        • At least 12 characters long<br>
                        • Contains uppercase, lowercase, numbers, and symbols<br>
                        • Unique to this account (not reused)<br>
                        • Not based on personal information<br>
                        • Changed every 6-12 months
                    </p>
                    <div style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.5); border-radius: 8px;">
                        <small><strong>Privacy Protected (k-Anonymity):</strong></small><br>
                        <small>• Password hashed locally: <code>${hashHex.substring(0, 20)}...</code></small><br>
                        <small>• Only 5 characters sent to HIBP: <code>${prefix}</code></small><br>
                        <small>• Checked against ${hashes.length} possible hashes</small><br>
                        <small>• Verified against 600M+ breached passwords</small>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        result.innerHTML = `
            <div class="alert" style="background: #fef3c7; border: 2px solid #d97706; color: #92400e;">
                <h4><i class="fas fa-exclamation-circle"></i> Error Checking Password</h4>
                <p>Could not connect to breach database. Please check your internet connection.</p>
                <p><small><strong>Error Details:</strong> ${error.message}</small></p>
                <p style="margin-top: 1rem;">
                    <strong>Troubleshooting:</strong><br>
                    • Check your internet connection<br>
                    • Ensure your firewall allows access to api.pwnedpasswords.com<br>
                    • Try again in a few moments
                </p>
            </div>
        `;
        console.error('Breach checker error:', error);
    }
}

// Generate a secure password suggestion
function generateSecurePassword() {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }
    
    const input = document.getElementById('breachPassword');
    if (input) {
        input.value = password;
        input.type = 'text'; // Show the generated password
        
        // Show success message
        if (typeof showToast === 'function') {
            showToast('✨ Secure password generated!', 'success');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Password Breach Checker loaded ✓');
});
