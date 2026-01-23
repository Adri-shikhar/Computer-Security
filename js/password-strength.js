/**
 * ============================================
 * PASSWORD-STRENGTH.JS - Password Analysis
 * ============================================
 * Purpose: Analyze password strength and crack time
 * Contains: Entropy calculation, breach time estimation
 */

// Analyze password strength
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
    
    const entropy = password.length * Math.log2(charsetSize || 1);
    const totalCombinations = Math.pow(charsetSize || 1, password.length);
    
    return {
        length: password.length,
        charsetSize: charsetSize,
        entropy: entropy,
        totalCombinations: totalCombinations,
        hasLower, hasUpper, hasDigit, hasSymbol
    };
}

// Generate password recommendation for weak passwords
function generatePasswordRecommendation(weakPassword) {
    const analysis = analyzePasswordStrength(weakPassword);
    if (analysis.length >= 12 && analysis.hasLower && analysis.hasUpper && analysis.hasDigit && analysis.hasSymbol) {
        return null;
    }
    
    let recommendation = weakPassword;
    
    if (!analysis.hasUpper && analysis.hasLower) {
        recommendation = recommendation.charAt(0).toUpperCase() + recommendation.slice(1);
    } else if (!analysis.hasUpper && !analysis.hasLower) {
        recommendation = 'P' + recommendation;
    }
    
    const specialSuffixes = ['@2024!', '#Secure!', '$tR0ng!', '@Pass!', '#2026$', '!Sec@'];
    const randomSuffix = specialSuffixes[Math.floor(Math.random() * specialSuffixes.length)];
    recommendation += randomSuffix;
    
    while (recommendation.length < 12) {
        recommendation += Math.floor(Math.random() * 10);
    }
    
    return recommendation;
}

// Calculate time to crack password
function calculateBreachTime(password, algorithm) {
    const analysis = analyzePasswordStrength(password);
    const hashesPerSec = HASH_RATES[algorithm] || 1000;
    const secondsToCrack = analysis.totalCombinations / hashesPerSec / 2;
    
    return {
        analysis: analysis,
        secondsToCrack: secondsToCrack,
        hashesPerSec: hashesPerSec,
        readableTime: formatTime(secondsToCrack),
        securityLevel: getSecurityLevel(secondsToCrack)
    };
}

// Format seconds to human readable time
function formatTime(seconds) {
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} days`;
    if (seconds < 3153600000) return `${(seconds / 31536000).toFixed(2)} years`;
    return `${(seconds / 31536000000).toFixed(2)} centuries`;
}

// Get security level based on crack time
function getSecurityLevel(seconds) {
    if (seconds < 60) return { level: 'instant', color: '#ff006e', text: 'CRITICAL - Instantly Crackable' };
    if (seconds < 86400) return { level: 'fast', color: '#ff6b00', text: 'WEAK - Hours to crack' };
    if (seconds < 31536000) return { level: 'moderate', color: '#ffcc00', text: 'MODERATE - Days to crack' };
    return { level: 'secure', color: '#00ff88', text: 'SECURE - Years to crack' };
}

console.log('✅ password-strength.js loaded');
