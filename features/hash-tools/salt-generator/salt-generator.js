// Salt Generator JavaScript

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

function updateLengthDisplay(value) {
    document.getElementById('lengthValue').textContent = value;
}

// Generate cryptographically secure salt
function generateSalt(length, format) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    switch (format) {
        case 'hex':
            return Array.from(array)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        
        case 'base64':
            return btoa(String.fromCharCode(...array));
        
        case 'base64url':
            const base64 = btoa(String.fromCharCode(...array));
            return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        
        case 'alphanumeric':
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length * 2; i++) {
                result += charset[array[i % array.length] % charset.length];
            }
            return result;
        
        default:
            return btoa(String.fromCharCode(...array));
    }
}

// Generate multiple salts
function generateSalts() {
    const length = parseInt(document.getElementById('saltLength').value);
    const format = document.getElementById('saltFormat').value;
    const count = parseInt(document.getElementById('batchCount').value);
    const resultsDiv = document.getElementById('saltResults');
    
    let html = `
        <div style="margin-top: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border-left: 4px solid #10b981;">
            <h5 style="margin-bottom: 0.5rem; color: #047857;">
                <i class="fas fa-check-circle"></i> Generated ${count} Salt${count > 1 ? 's' : ''}
            </h5>
            <p style="margin: 0; font-size: 0.875rem; color: #065f46;">
                <strong>Length:</strong> ${length} bytes | 
                <strong>Format:</strong> ${format.toUpperCase()} | 
                <strong>Cryptographically Secure:</strong> Yes
            </p>
        </div>
        <div style="margin-top: 1rem;">
    `;
    
    const salts = [];
    
    for (let i = 0; i < count; i++) {
        const salt = generateSalt(length, format);
        salts.push(salt);
        
        const outputLength = salt.length;
        
        html += `
            <div class="salt-item">
                <span class="salt-text">${salt}</span>
                <div class="salt-info">
                    <span class="salt-badge format">${format.toUpperCase()}</span>
                    <span class="salt-badge length">${outputLength} chars</span>
                    <button class="btn-copy-salt" onclick="copySingleSalt('${salt}', ${i})">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    resultsDiv.innerHTML = html;
    
    // Store for later use
    window.generatedSalts = salts;
    
    if (typeof showToast === 'function') {
        showToast(`✅ Generated ${count} secure salt${count > 1 ? 's' : ''}!`, 'success');
    }
}

// Copy single salt
function copySingleSalt(salt, index) {
    copyToClipboard(salt);
    if (typeof showToast === 'function') {
        showToast('✅ Salt copied to clipboard!', 'success');
    }
}

// Copy all salts
function copyAllSalts() {
    if (!window.generatedSalts || window.generatedSalts.length === 0) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Generate salts first!', 'warning');
        } else {
            alert('Please generate salts first');
        }
        return;
    }
    
    const allSalts = window.generatedSalts.join('\n');
    copyToClipboard(allSalts);
    if (typeof showToast === 'function') {
        showToast(`✅ ${window.generatedSalts.length} salts copied to clipboard!`, 'success');
    }
}

// Download salts as file
function downloadSalts() {
    if (!window.generatedSalts || window.generatedSalts.length === 0) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Generate salts first!', 'warning');
        } else {
            alert('Please generate salts first');
        }
        return;
    }
    
    const format = document.getElementById('saltFormat').value;
    const length = document.getElementById('saltLength').value;
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    let content = `# Generated Salts\n`;
    content += `# Timestamp: ${new Date().toLocaleString()}\n`;
    content += `# Format: ${format.toUpperCase()}\n`;
    content += `# Length: ${length} bytes\n`;
    content += `# Count: ${window.generatedSalts.length}\n`;
    content += `# Cryptographically Secure: Yes\n\n`;
    content += window.generatedSalts.join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salts-${format}-${length}bytes-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
        showToast('✅ Salts downloaded successfully!', 'success');
    }
}

// Copy to clipboard fallback function
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Salt Generator loaded ✓');
    // Generate one salt by default
    generateSalts();
});
