// Hash Generator JavaScript

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

let selectedAlgorithm = 'all';
let generatedHashes = {};

// Update character count
function updateCharCount() {
    const input = document.getElementById('inputText');
    const count = document.getElementById('charCount');
    count.textContent = `${input.value.length} characters`;
}

// Clear input
function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('hashResults').innerHTML = '';
    updateCharCount();
    if (typeof showToast === 'function') {
        showToast('🗑️ Cleared', 'info');
    }
}

// Select algorithm
function selectAlgorithm(algo) {
    selectedAlgorithm = algo;
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.algo === algo) {
            btn.classList.add('active');
        }
    });
}

// Generate hash
function generateHash() {
    const input = document.getElementById('inputText').value;
    const resultsDiv = document.getElementById('hashResults');
    
    if (!input) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Please enter text to hash', 'warning');
        } else {
            alert('Please enter text to hash');
        }
        document.getElementById('inputText').focus();
        return;
    }
    
    generatedHashes = {};
    
    const algorithms = [
        { key: 'MD5', name: 'MD5', func: () => CryptoJS.MD5(input).toString(), bits: 128, security: 'Insecure', secClass: 'insecure' },
        { key: 'SHA1', name: 'SHA-1', func: () => CryptoJS.SHA1(input).toString(), bits: 160, security: 'Deprecated', secClass: 'deprecated' },
        { key: 'SHA256', name: 'SHA-256', func: () => CryptoJS.SHA256(input).toString(), bits: 256, security: 'Recommended', secClass: '' },
        { key: 'SHA512', name: 'SHA-512', func: () => CryptoJS.SHA512(input).toString(), bits: 512, security: 'Strong', secClass: '' }
    ];
    
    // Filter by selected algorithm
    const algosToRun = selectedAlgorithm === 'all' 
        ? algorithms 
        : algorithms.filter(a => a.key === selectedAlgorithm);
    
    let html = `
        <div class="results-header">
            <h5><i class="fas fa-check-circle"></i> Hash Generation Complete</h5>
            <p>Input: <strong>${input.length} characters</strong> | Algorithm${algosToRun.length > 1 ? 's' : ''}: <strong>${algosToRun.length}</strong></p>
        </div>
    `;
    
    algosToRun.forEach(alg => {
        const startTime = performance.now();
        const hash = alg.func();
        const endTime = performance.now();
        const time = (endTime - startTime).toFixed(2);
        
        generatedHashes[alg.key] = hash;
        
        html += `
            <div class="hash-result-card">
                <div class="hash-header">
                    <div class="hash-algorithm">
                        <i class="fas fa-hashtag"></i> ${alg.name}
                    </div>
                    <button class="btn-copy-hash" onclick="copyHash('${alg.key}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <div class="hash-value" id="hash-${alg.key}">${hash}</div>
                <div class="hash-meta">
                    <span class="hash-badge bits">${alg.bits} bits</span>
                    <span class="hash-badge time">${time} ms</span>
                    <span class="hash-badge security ${alg.secClass}">${alg.security}</span>
                    <span>${hash.length} characters</span>
                </div>
            </div>
        `;
    });
    
    // Add action buttons
    html += `
        <div class="action-buttons">
            <button class="btn btn-success" onclick="copyAllHashes()">
                <i class="fas fa-copy"></i> Copy All
            </button>
            <button class="btn btn-outline-primary" onclick="downloadHashes()">
                <i class="fas fa-download"></i> Download
            </button>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
    
    if (typeof showToast === 'function') {
        showToast('✅ Hash generated successfully!', 'success');
    }
}

// Copy single hash
function copyHash(algo) {
    const hash = generatedHashes[algo];
    if (!hash) return;
    
    navigator.clipboard.writeText(hash).then(() => {
        if (typeof showToast === 'function') {
            showToast(`✅ ${algo} hash copied!`, 'success');
        }
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = hash;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        if (typeof showToast === 'function') {
            showToast(`✅ ${algo} hash copied!`, 'success');
        }
    });
}

// Copy all hashes
function copyAllHashes() {
    if (Object.keys(generatedHashes).length === 0) {
        if (typeof showToast === 'function') {
            showToast('⚠️ No hashes to copy', 'warning');
        }
        return;
    }
    
    let text = 'Hash Generator Results\n';
    text += '='.repeat(50) + '\n\n';
    text += `Input: ${document.getElementById('inputText').value}\n\n`;
    
    for (const [algo, hash] of Object.entries(generatedHashes)) {
        text += `${algo}: ${hash}\n`;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
            showToast('✅ All hashes copied!', 'success');
        }
    });
}

// Download hashes
function downloadHashes() {
    if (Object.keys(generatedHashes).length === 0) {
        if (typeof showToast === 'function') {
            showToast('⚠️ No hashes to download', 'warning');
        }
        return;
    }
    
    const input = document.getElementById('inputText').value;
    
    let content = 'Hash Generator Report\n';
    content += '='.repeat(50) + '\n\n';
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `Input Length: ${input.length} characters\n`;
    content += `Input: ${input.substring(0, 100)}${input.length > 100 ? '...' : ''}\n\n`;
    content += 'Hashes:\n';
    content += '-'.repeat(50) + '\n\n';
    
    for (const [algo, hash] of Object.entries(generatedHashes)) {
        content += `${algo}:\n${hash}\n\n`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hashes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
        showToast('💾 Downloaded!', 'success');
    }
}

// Load examples
function loadExample(type) {
    const examples = {
        password: 'MySecurePassword123!',
        text: 'Hello, World! This is a sample text for hashing.',
        json: '{"username": "admin", "role": "administrator"}',
        api: 'sk-live-abc123xyz789def456'
    };
    
    if (examples[type]) {
        document.getElementById('inputText').value = examples[type];
        updateCharCount();
        if (typeof showToast === 'function') {
            showToast(`✨ ${type.charAt(0).toUpperCase() + type.slice(1)} example loaded!`, 'info');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCharCount();
    console.log('Hash Generator loaded ✓');
});
