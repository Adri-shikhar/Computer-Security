/**
 * ============================================
 * BREACH-CHECKER.JS - HaveIBeenPwned Integration
 * ============================================
 * Purpose: Check passwords against known data breaches
 * Contains: HIBP API integration with K-Anonymity
 */

// Check if password appears in known data breaches (K-Anonymity)
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

console.log('✅ breach-checker.js loaded');
