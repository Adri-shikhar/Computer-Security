// Hash Identifier JavaScript

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

// Hash patterns database
const hashPatterns = {
    md5: {
        name: 'MD5',
        length: 32,
        pattern: /^[a-fA-F0-9]{32}$/,
        bits: 128,
        security: 'deprecated',
        description: 'Legacy 128-bit hash. Vulnerable to collisions. Not recommended for security purposes.',
        color: '#f59e0b'
    },
    sha1: {
        name: 'SHA-1',
        length: 40,
        pattern: /^[a-fA-F0-9]{40}$/,
        bits: 160,
        security: 'deprecated',
        description: 'Broken since 2017. Vulnerable to collision attacks. Use SHA-256 or SHA-512 instead.',
        color: '#3b82f6'
    },
    sha256: {
        name: 'SHA-256',
        length: 64,
        pattern: /^[a-fA-F0-9]{64}$/,
        bits: 256,
        security: 'recommended',
        description: 'Industry standard cryptographic hash. Secure and widely used in blockchain, certificates, and security applications.',
        color: '#10b981'
    },
    sha512: {
        name: 'SHA-512',
        length: 128,
        pattern: /^[a-fA-F0-9]{128}$/,
        bits: 512,
        security: 'recommended',
        description: 'Strongest SHA-2 variant. Maximum security for critical applications requiring highest cryptographic strength.',
        color: '#8b5cf6'
    },
    sha224: {
        name: 'SHA-224',
        length: 56,
        pattern: /^[a-fA-F0-9]{56}$/,
        bits: 224,
        security: 'acceptable',
        description: 'Truncated SHA-256 variant. Used in specific protocols requiring 224-bit output.',
        color: '#06b6d4'
    },
    sha384: {
        name: 'SHA-384',
        length: 96,
        pattern: /^[a-fA-F0-9]{96}$/,
        bits: 384,
        security: 'recommended',
        description: 'Truncated SHA-512 variant. Strong security for applications requiring 384-bit output.',
        color: '#a855f7'
    },
    bcrypt: {
        name: 'bcrypt',
        pattern: /^\$2[abxy]\$\d{2}\$.{53}$/,
        security: 'recommended',
        description: 'Adaptive password hashing function. Includes built-in salt and adjustable cost factor for future-proof security.',
        color: '#ef4444'
    },
    argon2: {
        name: 'Argon2',
        pattern: /^\$argon2(i|d|id)\$/,
        security: 'best',
        description: 'Winner of Password Hashing Competition 2015. Most secure password hashing. Resistant to GPU and ASIC attacks.',
        color: '#ec4899'
    },
    ntlm: {
        name: 'NTLM',
        length: 32,
        pattern: /^[a-fA-F0-9]{32}$/,
        bits: 128,
        security: 'weak',
        description: 'Windows NT LAN Manager hash. Very weak, easily cracked. Replace with modern alternatives immediately.',
        color: '#dc2626'
    },
    mysql: {
        name: 'MySQL (old)',
        pattern: /^[a-fA-F0-9]{16}$/,
        bits: 64,
        security: 'weak',
        description: 'Old MySQL password hash. Extremely weak. Update to MySQL 5.x+ password hashing.',
        color: '#dc2626'
    },
    mysql5: {
        name: 'MySQL5+',
        pattern: /^\*[a-fA-F0-9]{40}$/,
        bits: 160,
        security: 'acceptable',
        description: 'MySQL 5.x+ password hash (SHA-1 based). Better than old MySQL but still uses deprecated SHA-1.',
        color: '#f59e0b'
    }
};

// Identify hash type
function identifyHash() {
    const input = document.getElementById('hashInput').value.trim();
    const resultsDiv = document.getElementById('identificationResults');
    
    if (!input) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Please enter a hash value', 'warning');
        } else {
            alert('Please enter a hash value');
        }
        document.getElementById('hashInput').focus();
        return;
    }
    
    // Split by lines for multiple hashes
    const hashes = input.split('\n').map(h => h.trim()).filter(h => h.length > 0);
    
    if (hashes.length === 1) {
        // Single hash
        const matches = analyzeHash(hashes[0]);
        displaySingleResult(hashes[0], matches);
    } else {
        // Multiple hashes
        displayMultipleResults(hashes);
    }
}

// Analyze single hash
function analyzeHash(hash) {
    const cleaned = hash.trim();
    const matches = [];
    
    // Check against all patterns
    for (const [key, pattern] of Object.entries(hashPatterns)) {
        let confidence = 0;
        
        // Pattern match
        if (pattern.pattern && pattern.pattern.test(cleaned)) {
            confidence = 80;
            
            // Length match adds confidence
            if (pattern.length && cleaned.length === pattern.length) {
                confidence = 95;
            }
            
            // Special cases
            if (key === 'md5' || key === 'ntlm') {
                // MD5 and NTLM have same format, reduce confidence
                if (cleaned.length === 32) {
                    confidence = 70;
                }
            }
            
            matches.push({
                type: pattern.name,
                confidence: confidence,
                ...pattern
            });
        }
    }
    
    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    
    return matches;
}

// Display single hash result
function displaySingleResult(hash, matches) {
    const resultsDiv = document.getElementById('identificationResults');
    
    if (matches.length === 0) {
        resultsDiv.innerHTML = `
            <div class="result-card" style="border-color: #fbbf24;">
                <div class="result-header">
                    <div class="result-icon" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #d97706;">
                        <i class="fas fa-question"></i>
                    </div>
                    <div class="result-title">
                        <h4>Unknown Hash Type</h4>
                        <p>Could not identify this hash format</p>
                    </div>
                </div>
                
                <div class="result-section">
                    <h5><i class="fas fa-hashtag"></i> Hash Value</h5>
                    <div class="hash-display">${hash}</div>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-item-label">Length</div>
                            <div class="info-item-value">${hash.length} chars</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">Characters</div>
                            <div class="info-item-value">${detectCharacterSet(hash)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="alert" style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <i class="fas fa-lightbulb"></i> This hash format is not in our database. It may be a custom hash, encoded string, or unsupported algorithm.
                </div>
            </div>
        `;
        return;
    }
    
    const topMatch = matches[0];
    const securityBadge = getSecurityBadge(topMatch.security);
    
    resultsDiv.innerHTML = `
        <div class="result-card" style="border-color: ${topMatch.color};">
            <div class="result-header">
                <div class="result-icon" style="background: ${topMatch.color}20; color: ${topMatch.color};">
                    <i class="fas fa-fingerprint"></i>
                </div>
                <div class="result-title">
                    <h4>${topMatch.type}</h4>
                    <p>${topMatch.bits ? topMatch.bits + '-bit hash' : 'Password hash'}</p>
                </div>
            </div>
            
            <div class="result-section">
                <h5><i class="fas fa-hashtag"></i> Hash Value</h5>
                <div class="hash-display">${hash}</div>
            </div>
            
            <div class="result-section">
                <h5><i class="fas fa-info-circle"></i> Hash Information</h5>
                <div class="info-grid">
                    ${topMatch.length ? `
                        <div class="info-item">
                            <div class="info-item-label">Length</div>
                            <div class="info-item-value">${topMatch.length} hex</div>
                        </div>
                    ` : ''}
                    ${topMatch.bits ? `
                        <div class="info-item">
                            <div class="info-item-label">Output Size</div>
                            <div class="info-item-value">${topMatch.bits} bits</div>
                        </div>
                    ` : ''}
                    <div class="info-item">
                        <div class="info-item-label">Security Status</div>
                        <div class="info-item-value">${securityBadge}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">Confidence</div>
                        <div class="info-item-value">${topMatch.confidence}%</div>
                    </div>
                </div>
            </div>
            
            <div class="result-section">
                <h5><i class="fas fa-lightbulb"></i> Description</h5>
                <p style="margin: 0; color: var(--text-secondary); line-height: 1.6;">${topMatch.description}</p>
            </div>
            
            ${matches.length > 1 ? `
                <div class="result-section">
                    <h5><i class="fas fa-list"></i> Other Possible Matches</h5>
                    <ul class="matches-list">
                        ${matches.slice(1, 4).map(match => `
                            <li class="match-item">
                                <span class="match-name">${match.type}</span>
                                <div class="match-confidence">
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width: ${match.confidence}%;"></div>
                                    </div>
                                    <span style="font-size: 0.875rem; color: var(--text-muted);">${match.confidence}%</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${topMatch.security === 'deprecated' || topMatch.security === 'weak' ? `
                <div class="security-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="security-warning-content">
                        <strong>⚠️ Security Warning</strong>
                        <p>This hash algorithm is ${topMatch.security}. ${topMatch.security === 'weak' ? 'It can be easily cracked and should not be used.' : 'Consider migrating to SHA-256, SHA-512, or Argon2 for better security.'}</p>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Display multiple hash results
function displayMultipleResults(hashes) {
    const resultsDiv = document.getElementById('identificationResults');
    
    let html = `
        <div class="multi-hash-results">
            <h4><i class="fas fa-list"></i> Identified ${hashes.length} Hash${hashes.length > 1 ? 'es' : ''}</h4>
    `;
    
    hashes.forEach((hash, index) => {
        const matches = analyzeHash(hash);
        const topMatch = matches[0];
        
        if (topMatch) {
            const securityBadge = getSecurityBadge(topMatch.security);
            html += `
                <div class="hash-result-item">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <h5 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="background: ${topMatch.color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem;">${index + 1}</span>
                            ${topMatch.type}
                        </h5>
                        ${securityBadge}
                    </div>
                    <div class="hash-display">${hash}</div>
                    <div style="display: flex; gap: 1rem; margin-top: 0.75rem; font-size: 0.875rem; color: var(--text-muted);">
                        ${topMatch.length ? `<span><i class="fas fa-ruler"></i> ${topMatch.length} chars</span>` : ''}
                        ${topMatch.bits ? `<span><i class="fas fa-microchip"></i> ${topMatch.bits} bits</span>` : ''}
                        <span><i class="fas fa-chart-line"></i> ${topMatch.confidence}% confidence</span>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="hash-result-item" style="border-color: #fbbf24;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <h5 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="background: #fbbf24; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem;">${index + 1}</span>
                            Unknown
                        </h5>
                        <span class="badge badge-warning">Unknown</span>
                    </div>
                    <div class="hash-display">${hash}</div>
                </div>
            `;
        }
    });
    
    html += `</div>`;
    resultsDiv.innerHTML = html;
}

// Get security badge HTML
function getSecurityBadge(security) {
    const badges = {
        'best': '<span class="badge badge-success"><i class="fas fa-star"></i> Best Choice</span>',
        'recommended': '<span class="badge badge-success"><i class="fas fa-check"></i> Recommended</span>',
        'acceptable': '<span class="badge badge-info"><i class="fas fa-info"></i> Acceptable</span>',
        'deprecated': '<span class="badge badge-warning"><i class="fas fa-exclamation"></i> Deprecated</span>',
        'weak': '<span class="badge" style="background: #fee2e2; color: #991b1b;"><i class="fas fa-times"></i> Weak</span>'
    };
    return badges[security] || '<span class="badge badge-info">Unknown</span>';
}

// Detect character set
function detectCharacterSet(str) {
    if (/^[a-fA-F0-9]+$/.test(str)) return 'Hexadecimal';
    if (/^[a-zA-Z0-9+/]+=*$/.test(str)) return 'Base64';
    if (/^[a-zA-Z0-9._$-]+$/.test(str)) return 'Alphanumeric+';
    return 'Mixed';
}

// Load examples
function loadExample(type) {
    const examples = {
        md5: '5d41402abc4b2a76b9719d911017c592',
        sha1: 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
        sha256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
        sha512: '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f',
        bcrypt: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
    };
    
    const hash = examples[type];
    if (hash) {
        document.getElementById('hashInput').value = hash;
        if (typeof showToast === 'function') {
            showToast(`✨ Loaded ${type.toUpperCase()} example`, 'info');
        }
    }
}

// Clear all
function clearAll() {
    document.getElementById('hashInput').value = '';
    document.getElementById('identificationResults').innerHTML = '';
    if (typeof showToast === 'function') {
        showToast('🗑️ Cleared', 'info');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Hash Identifier loaded ✓');
    console.log(`Supporting ${Object.keys(hashPatterns).length} hash types`);
});
