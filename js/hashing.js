/**
 * ============================================
 * HASHING.JS - Password Hashing Functions
 * ============================================
 * Purpose: Generate and verify password hashes
 * Contains: Salt generation, hash algorithms (MD5, SHA1, BCrypt, PBKDF2, Argon2)
 */

// Generate cryptographically secure salt
function generateSalt(length = 16) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate hash based on selected algorithm
async function generateHash(password, algorithm, salt = null) {
    const startTime = performance.now();
    let hash = '';
    let usedSalt = salt || generateSalt();
    
    switch(algorithm) {
        case 'md5':
            // MD5 - No salt (legacy simulation)
            hash = CryptoJS.MD5(password).toString();
            usedSalt = 'NONE';
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
            usedSalt = hash.substring(0, 29);
            hideSpinner();
            break;
            
        case 'pbkdf2':
            // PBKDF2-SHA256 (NIST approved)
            showSpinner(`Computing PBKDF2-SHA256 hash (600,000 iterations)...`);
            const iterations = 600000;
            const pbkdf2Salt = generateSalt();
            
            hash = await new Promise((resolve) => {
                setTimeout(() => {
                    const pbkdf2Hash = CryptoJS.PBKDF2(password, pbkdf2Salt, {
                        keySize: 256/32,
                        iterations: iterations,
                        hasher: CryptoJS.algo.SHA256
                    }).toString();
                    const formatted = `pbkdf2:sha256:${iterations}:${pbkdf2Salt}:${pbkdf2Hash}`;
                    resolve(formatted);
                }, 10);
            });
            usedSalt = pbkdf2Salt;
            hideSpinner();
            break;
            
        case 'argon2':
            // Argon2id with configurable memory
            showSpinner(`Computing Argon2id hash (${currentConfig.argon2Memory}MB memory)...`);
            try {
                if (typeof argon2 === 'undefined') {
                    throw new Error('Argon2 library not loaded. Please refresh the page.');
                }
                
                const saltBytes = new Uint8Array(16);
                crypto.getRandomValues(saltBytes);
                
                const result = await argon2.hash({
                    pass: password,
                    salt: saltBytes,
                    type: argon2.ArgonType.Argon2id,
                    mem: currentConfig.argon2Memory * 1024,
                    time: currentConfig.argon2Time,
                    parallelism: currentConfig.argon2Parallelism,
                    hashLen: 32
                });
                hash = result.encoded;
                usedSalt = 'EMBEDDED';
            } catch (error) {
                console.error('Argon2 error:', error);
                hash = 'ERROR: Argon2 hashing failed - ' + error.message;
            }
            hideSpinner();
            break;
    }
    
    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    
    updateHashTime(timeTaken);
    console.log(`${algorithm.toUpperCase()} hash generated in ${timeTaken}ms`);
    
    return { hash, salt: usedSalt, time: timeTaken };
}

// Verify password against stored hash
async function verifyHash(password, algorithm, storedHash, salt = null) {
    switch(algorithm) {
        case 'md5':
            return CryptoJS.MD5(password).toString() === storedHash;
            
        case 'sha1':
            return CryptoJS.SHA1(password + salt).toString() === storedHash;
            
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

console.log('✅ hashing.js loaded');
