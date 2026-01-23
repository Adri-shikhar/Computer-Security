// Base64 Encoder/Decoder JavaScript

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

// Encode text to Base64
function encodeText() {
    const plainText = document.getElementById('plainText').value;
    const encodedText = document.getElementById('encodedText');
    const format = document.getElementById('encodingFormat')?.value || 'base64';
    
    if (!plainText) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Please enter text to encode', 'warning');
        } else {
            alert('Please enter text to encode');
        }
        document.getElementById('plainText').focus();
        return;
    }
    
    try {
        let result;
        
        if (format === 'base64' || format === 'base64url') {
            // Standard Base64
            result = btoa(unescape(encodeURIComponent(plainText)));
            
            // Convert to Base64URL if needed
            if (format === 'base64url') {
                result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            }
        } else if (format === 'hex') {
            // Hexadecimal encoding
            result = Array.from(plainText)
                .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('');
        }
        
        encodedText.value = result;
        
        if (typeof showToast === 'function') {
            showToast('✅ Text encoded successfully!', 'success');
        }
    } catch (error) {
        encodedText.value = 'Error: ' + error.message;
        console.error('Encoding error:', error);
        if (typeof showToast === 'function') {
            showToast('❌ Encoding failed: ' + error.message, 'danger');
        }
    }
}

// Decode Base64 to text
function decodeText() {
    const encodedInput = document.getElementById('encodedInput').value;
    const decodedText = document.getElementById('decodedText');
    const format = document.getElementById('encodingFormat')?.value || 'base64';
    
    if (!encodedInput) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Please enter encoded text to decode', 'warning');
        } else {
            alert('Please enter encoded text to decode');
        }
        document.getElementById('encodedInput').focus();
        return;
    }
    
    try {
        let result;
        
        if (format === 'base64' || format === 'base64url') {
            let base64 = encodedInput;
            
            // Convert from Base64URL if needed
            if (format === 'base64url') {
                base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
                // Add padding
                while (base64.length % 4) {
                    base64 += '=';
                }
            }
            
            result = decodeURIComponent(escape(atob(base64)));
        } else if (format === 'hex') {
            // Hexadecimal decoding
            const hexPairs = encodedInput.match(/.{1,2}/g) || [];
            result = hexPairs
                .map(hex => String.fromCharCode(parseInt(hex, 16)))
                .join('');
        }
        
        decodedText.value = result;
        
        if (typeof showToast === 'function') {
            showToast('✅ Text decoded successfully!', 'success');
        }
    } catch (error) {
        decodedText.value = 'Error: Invalid encoded data or wrong format selected';
        console.error('Decoding error:', error);
        if (typeof showToast === 'function') {
            showToast('❌ Decoding failed. Check format and input.', 'danger');
        }
    }
}

// Handle file upload and encode
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileInfo = document.getElementById('fileInfo');
    const encodedFile = document.getElementById('encodedFile');
    
    // Show file info
    fileInfo.innerHTML = `
        <p style="margin: 0;">
            <strong><i class="fas fa-file"></i> ${file.name}</strong><br>
            <small>Size: ${formatFileSize(file.size)} | Type: ${file.type || 'Unknown'}</small>
        </p>
    `;
    
    // Read and encode file
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        const bytes = new Uint8Array(arrayBuffer);
        
        // Convert to Base64
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        
        const base64 = btoa(binary);
        encodedFile.value = base64;
        
        // Add data URI example if it's an image
        if (file.type.startsWith('image/')) {
            fileInfo.innerHTML += `
                <div style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                    <strong>Data URI (for HTML/CSS):</strong>
                    <code style="display: block; margin-top: 0.5rem; font-size: 0.75rem; word-break: break-all;">
                        data:${file.type};base64,${base64.substring(0, 50)}...
                    </code>
                    <button class="btn btn-secondary btn-sm mt-2" onclick="copyDataURI('${file.type}', '${base64}')">
                        <i class="fas fa-copy"></i> Copy Data URI
                    </button>
                </div>
            `;
        }
        
        if (typeof showToast === 'function') {
            showToast('✅ File encoded successfully!', 'success');
        }
    };
    
    reader.onerror = function() {
        encodedFile.value = 'Error reading file';
        console.error('File read error');
    };
    
    reader.readAsArrayBuffer(file);
}

// Copy Data URI
function copyDataURI(mimeType, base64) {
    const dataURI = `data:${mimeType};base64,${base64}`;
    copyToClipboard(dataURI);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Clear input
function clearInput(id) {
    document.getElementById(id).value = '';
}

// Download text as file
function downloadText(content, filename) {
    if (!content) {
        alert('No content to download');
        return;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
        showToast('💾 Downloaded successfully!', 'success');
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    if (!text) {
        alert('Nothing to copy');
        return;
    }
    
    if (!navigator.clipboard) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (typeof showToast === 'function') {
            showToast('✅ Copied to clipboard!', 'success');
        }
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
            showToast('✅ Copied to clipboard!', 'success');
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

// Load examples
function loadExample(type) {
    const plainText = document.getElementById('plainText');
    const encodedInput = document.getElementById('encodedInput');
    
    const examples = {
        text: {
            plain: 'Hello, World! This is a Base64 encoding example.\nIt supports multiple lines and special characters: !@#$%^&*()',
            encoded: 'SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgQmFzZTY0IGVuY29kaW5nIGV4YW1wbGUuCkl0IHN1cHBvcnRzIG11bHRpcGxlIGxpbmVzIGFuZCBzcGVjaWFsIGNoYXJhY3RlcnM6ICFAIyQlXiYqKCk='
        },
        json: {
            plain: '{\n  "username": "admin",\n  "password": "P@ssw0rd123",\n  "role": "administrator",\n  "timestamp": "2026-01-23T10:30:00Z"\n}',
            encoded: 'ewogICJ1c2VybmFtZSI6ICJhZG1pbiIsCiAgInBhc3N3b3JkIjogIlBAc3N3MHJkMTIzIiwKICAicm9sZSI6ICJhZG1pbmlzdHJhdG9yIiwKICAidGltZXN0YW1wIjogIjIwMjYtMDEtMjNUMTA6MzA6MDBaIgp9'
        },
        url: {
            plain: 'https://api.example.com/auth?token=abc123&redirect=https://example.com/dashboard',
            encoded: 'aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20vYXV0aD90b2tlbj1hYmMxMjMmcmVkaXJlY3Q9aHR0cHM6Ly9leGFtcGxlLmNvbS9kYXNoYm9hcmQ='
        },
        jwt: {
            plain: 'Example JWT Header:\n{"alg": "HS256", "typ": "JWT"}',
            encoded: 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9'
        }
    };
    
    const example = examples[type];
    if (example) {
        plainText.value = example.plain;
        encodedInput.value = example.encoded;
        if (typeof showToast === 'function') {
            showToast(`✨ ${type.toUpperCase()} example loaded!`, 'info');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Base64 Tool loaded ✓');
});
