// Hash Algorithm Comparison JavaScript

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

// Generate hash using Web Crypto API
async function generateHash(algorithm, text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    try {
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error('Hash generation error:', error);
        return null;
    }
}

// Compare Hash Algorithms
async function compareHashAlgorithms() {
    const input = document.getElementById('compareInput');
    const saltInput = document.getElementById('compareSalt');
    const results = document.getElementById('comparisonResults');
    
    if (!input || !input.value.trim()) {
        alert('Please enter text to hash');
        return;
    }
    
    const text = input.value;
    const salt = saltInput ? saltInput.value : '';
    const combinedText = salt + text;
    
    // Show loading
    results.innerHTML = `
        <div class="text-center" style="padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i>
            <p style="margin-top: 1rem;">Generating hashes...</p>
        </div>
    `;
    
    const algorithms = [];
    
    if (document.getElementById('checkMD5')?.checked) {
        algorithms.push({ name: 'MD5', func: () => CryptoJS.MD5(combinedText).toString(), bits: 128, security: 'Insecure' });
    }
    if (document.getElementById('checkSHA1')?.checked) {
        algorithms.push({ name: 'SHA-1', algo: 'SHA-1', bits: 160, security: 'Deprecated' });
    }
    if (document.getElementById('checkSHA256')?.checked) {
        algorithms.push({ name: 'SHA-256', algo: 'SHA-256', bits: 256, security: 'Recommended' });
    }
    if (document.getElementById('checkSHA512')?.checked) {
        algorithms.push({ name: 'SHA-512', algo: 'SHA-512', bits: 512, security: 'Strong' });
    }
    
    if (algorithms.length === 0) {
        results.innerHTML = '<div class="alert" style="background: #fef3c7; padding: 1rem; border-radius: 8px;">Please select at least one algorithm</div>';
        return;
    }
    
    let html = '<div class="comparison-grid">';
    
    for (const alg of algorithms) {
        const startTime = performance.now();
        let hash;
        
        if (alg.func) {
            hash = alg.func();
        } else {
            hash = await generateHash(alg.algo, combinedText);
        }
        
        const endTime = performance.now();
        const speed = (endTime - startTime).toFixed(3);
        
        const securityColor = 
            alg.security === 'Insecure' ? '#dc2626' :
            alg.security === 'Deprecated' ? '#d97706' :
            '#059669';
        
        html += `
            <div class="algorithm-card">
                <h5>
                    <i class="fas fa-hashtag"></i> ${alg.name}
                </h5>
                <div class="hash-metric">
                    <span class="metric-label">Output Size:</span>
                    <span class="metric-value">${alg.bits} bits (${alg.bits / 8} bytes)</span>
                </div>
                <div class="hash-metric">
                    <span class="metric-label">Hash Length:</span>
                    <span class="metric-value">${hash.length} characters</span>
                </div>
                <div class="hash-metric">
                    <span class="metric-label">Speed:</span>
                    <span class="metric-value">${speed} ms</span>
                </div>
                <div class="hash-metric">
                    <span class="metric-label">Security:</span>
                    <span class="metric-value" style="color: ${securityColor};">${alg.security}</span>
                </div>
                <div class="hash-output">
                    <div style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: #94a3b8;">Hash Output:</strong>
                        <button class="btn-copy-mini" onclick="copyToClipboard('${hash}')" title="Copy hash">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    ${hash || 'Error'}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    // Add summary
    html += `
        <div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; border-left: 4px solid var(--primary);">
            <h5 style="margin-bottom: 1rem; color: var(--primary);">
                <i class="fas fa-info-circle"></i> Comparison Summary
            </h5>
            <p><strong>Input Text:</strong> "${text}"</p>
            ${salt ? `<p><strong>Salt Applied:</strong> "${salt}" (prepended)</p>` : '<p><em>No salt used</em></p>'}
            <p><strong>Algorithms Compared:</strong> ${algorithms.length}</p>
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.5); border-radius: 8px;">
                <strong>Security Recommendations:</strong><br>
                • Avoid MD5 and SHA-1 for new applications<br>
                • Use SHA-256 for general purpose hashing<br>
                • Use SHA-512 for maximum security<br>
                • Always add a salt when hashing passwords
            </div>
        </div>
    `;
    
    results.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Algorithm Comparison tool loaded ✓');
});
