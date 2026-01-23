/**
 * ============================================
 * BREACH-TIME-DISPLAY.JS - Breach Time Analysis UI
 * ============================================
 * Purpose: Display password crack time analysis
 * Contains: Visual breach time comparison across algorithms
 */

// Display breach time analysis for all algorithms
function displayBreachTimeAnalysis(password, algorithm) {
    const result = calculateBreachTime(password, algorithm);
    const analysis = result.analysis;
    
    // Update strength bar
    const strengthPercent = Math.min((analysis.entropy / 128) * 100, 100);
    const strengthBarFill = document.getElementById('strengthBarFill');
    if (strengthBarFill) strengthBarFill.style.width = `${strengthPercent}%`;
    
    // Show password analysis
    const passwordAnalysis = document.getElementById('passwordAnalysis');
    const strengthDetails = document.getElementById('strengthDetails');
    if (passwordAnalysis) passwordAnalysis.style.display = 'block';
    if (strengthDetails) {
        strengthDetails.innerHTML = `
            <strong>Length:</strong> ${analysis.length} characters | 
            <strong>Charset:</strong> ${analysis.charsetSize} | 
            <strong>Entropy:</strong> ${analysis.entropy.toFixed(1)} bits
        `;
    }
    
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
    
    const breachTimeAnalysis = document.getElementById('breachTimeAnalysis');
    if (breachTimeAnalysis) breachTimeAnalysis.innerHTML = breachHTML;
}

console.log('✅ breach-time-display.js loaded');
