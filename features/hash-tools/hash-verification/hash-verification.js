// Hash Verification JavaScript

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

// Verify text against hash
function verifyTextHash() {
    const text = document.getElementById('originalText').value.trim();
    const expectedHash = document.getElementById('expectedHash').value.trim().toLowerCase().replace(/[^a-f0-9]/g, '');
    const algorithmSelect = document.getElementById('hashAlgorithm');
    const resultDiv = document.getElementById('textVerifyResult');
    
    if (!text) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Please enter the original text', 'warning');
        }
        document.getElementById('originalText').focus();
        return;
    }
    
    if (!expectedHash) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Please enter the expected hash', 'warning');
        }
        document.getElementById('expectedHash').focus();
        return;
    }
    
    let algorithm = algorithmSelect.value;
    
    // Auto-detect algorithm by hash length
    if (algorithm === 'auto') {
        switch (expectedHash.length) {
            case 32: algorithm = 'MD5'; break;
            case 40: algorithm = 'SHA1'; break;
            case 64: algorithm = 'SHA256'; break;
            case 128: algorithm = 'SHA512'; break;
            default:
                resultDiv.innerHTML = `
                    <div class="verification-result mismatch">
                        <h3><i class="fas fa-question-circle"></i> Unknown Hash Length</h3>
                        <p>Hash length: ${expectedHash.length} characters. Cannot auto-detect algorithm.</p>
                        <p>Please select the algorithm manually.</p>
                    </div>
                `;
                return;
        }
        algorithmSelect.value = algorithm;
    }
    
    // Calculate hash
    let calculatedHash;
    switch (algorithm) {
        case 'MD5':
            calculatedHash = CryptoJS.MD5(text).toString();
            break;
        case 'SHA1':
            calculatedHash = CryptoJS.SHA1(text).toString();
            break;
        case 'SHA256':
            calculatedHash = CryptoJS.SHA256(text).toString();
            break;
        case 'SHA512':
            calculatedHash = CryptoJS.SHA512(text).toString();
            break;
    }
    
    const isMatch = calculatedHash === expectedHash;
    
    if (isMatch) {
        resultDiv.innerHTML = `
            <div class="verification-result match">
                <h3><i class="fas fa-check-circle"></i> VERIFICATION SUCCESSFUL</h3>
                <p style="font-size: 1.125rem; margin-bottom: 1rem;">
                    <strong>✅ The text matches the expected hash!</strong>
                </p>
                <div class="hash-comparison">
                    <div class="hash-row">
                        <div class="hash-label">Algorithm:</div>
                        <div><strong>${algorithm}</strong></div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">Expected:</div>
                        <div class="hash-value match">${expectedHash}</div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">Calculated:</div>
                        <div class="hash-value match">${calculatedHash}</div>
                    </div>
                </div>
            </div>
        `;
        if (typeof showToast === 'function') {
            showToast('✅ Hash verification successful!', 'success');
        }
    } else {
        resultDiv.innerHTML = `
            <div class="verification-result mismatch">
                <h3><i class="fas fa-times-circle"></i> VERIFICATION FAILED</h3>
                <p style="font-size: 1.125rem; margin-bottom: 1rem;">
                    <strong>❌ The text does NOT match the expected hash!</strong>
                </p>
                <div class="hash-comparison">
                    <div class="hash-row">
                        <div class="hash-label">Algorithm:</div>
                        <div><strong>${algorithm}</strong></div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">Expected:</div>
                        <div class="hash-value mismatch">${expectedHash}</div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">Calculated:</div>
                        <div class="hash-value mismatch">${calculatedHash}</div>
                    </div>
                </div>
            </div>
        `;
        if (typeof showToast === 'function') {
            showToast('❌ Hash verification failed!', 'danger');
        }
    }
}

// Compare two hashes
function compareHashes() {
    const hash1 = document.getElementById('hash1').value.trim().toLowerCase().replace(/[^a-f0-9]/g, '');
    const hash2 = document.getElementById('hash2').value.trim().toLowerCase().replace(/[^a-f0-9]/g, '');
    const resultDiv = document.getElementById('compareResult');
    
    if (!hash1) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Please enter Hash 1', 'warning');
        }
        document.getElementById('hash1').focus();
        return;
    }
    
    if (!hash2) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Please enter Hash 2', 'warning');
        }
        document.getElementById('hash2').focus();
        return;
    }
    
    const isMatch = hash1 === hash2;
    
    // Generate character-by-character comparison
    let charDiff = '<div class="char-diff">';
    const maxLen = Math.max(hash1.length, hash2.length);
    for (let i = 0; i < maxLen; i++) {
        const c1 = hash1[i] || '';
        const c2 = hash2[i] || '';
        const matches = c1 === c2 && c1 !== '';
        charDiff += `<span class="char ${matches ? 'match' : 'diff'}">${c1 || '·'}</span>`;
    }
    charDiff += '</div>';
    
    if (isMatch) {
        resultDiv.innerHTML = `
            <div class="verification-result match">
                <h3><i class="fas fa-check-circle"></i> HASHES MATCH</h3>
                <p style="font-size: 1.125rem; margin-bottom: 1rem;">
                    <strong>✅ Both hash values are identical!</strong>
                </p>
                <div class="hash-comparison">
                    <div class="hash-row">
                        <div class="hash-label">Length:</div>
                        <div><strong>${hash1.length} characters</strong></div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">Hash 1:</div>
                        <div class="hash-value match">${hash1}</div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">Hash 2:</div>
                        <div class="hash-value match">${hash2}</div>
                    </div>
                </div>
            </div>
        `;
        if (typeof showToast === 'function') {
            showToast('✅ Hashes match!', 'success');
        }
    } else {
        // Count differences
        let diffCount = 0;
        for (let i = 0; i < maxLen; i++) {
            if (hash1[i] !== hash2[i]) diffCount++;
        }
        
        resultDiv.innerHTML = `
            <div class="verification-result mismatch">
                <h3><i class="fas fa-times-circle"></i> HASHES DO NOT MATCH</h3>
                <p style="font-size: 1.125rem; margin-bottom: 1rem;">
                    <strong>❌ The hash values are different!</strong>
                </p>
                <p style="margin-bottom: 1rem;">
                    Found <strong>${diffCount} difference${diffCount > 1 ? 's' : ''}</strong> between the hashes.
                </p>
                <div class="hash-comparison">
                    <div class="hash-row">
                        <div class="hash-label">Hash 1:</div>
                        <div>
                            <div class="hash-value mismatch">${hash1}</div>
                            <small style="color: var(--text-muted);">${hash1.length} characters</small>
                        </div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">Hash 2:</div>
                        <div>
                            <div class="hash-value mismatch">${hash2}</div>
                            <small style="color: var(--text-muted);">${hash2.length} characters</small>
                        </div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">Diff View:</div>
                        <div>${charDiff}</div>
                    </div>
                </div>
            </div>
        `;
        if (typeof showToast === 'function') {
            showToast('❌ Hashes do not match!', 'danger');
        }
    }
}

// Load examples
function loadExample(type) {
    const examples = {
        password: {
            text: 'MySecurePassword123!',
            hash: '7c6a180b36896a65c3ada8ba9a1b7b8e',
            algo: 'MD5'
        },
        match: {
            hash1: '5d41402abc4b2a76b9719d911017c592',
            hash2: '5d41402abc4b2a76b9719d911017c592'
        },
        mismatch: {
            hash1: '5d41402abc4b2a76b9719d911017c592',
            hash2: '098f6bcd4621d373cade4e832627b4f6'
        }
    };
    
    const example = examples[type];
    if (!example) return;
    
    if (type === 'password') {
        document.getElementById('originalText').value = example.text;
        document.getElementById('expectedHash').value = example.hash;
        document.getElementById('hashAlgorithm').value = example.algo;
    } else {
        document.getElementById('hash1').value = example.hash1;
        document.getElementById('hash2').value = example.hash2;
    }
    
    if (typeof showToast === 'function') {
        showToast(`✨ ${type.charAt(0).toUpperCase() + type.slice(1)} example loaded!`, 'info');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Hash Verification loaded ✓');
});
