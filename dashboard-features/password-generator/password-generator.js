// Advanced Password Generator JavaScript

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

// Quick Generate - One click with best defaults
function quickGenerate() {
    // Set optimal defaults
    document.getElementById('passwordLength').value = 16;
    document.getElementById('lengthValue').textContent = '16';
    document.getElementById('includeUppercase').checked = true;
    document.getElementById('includeLowercase').checked = true;
    document.getElementById('includeNumbers').checked = true;
    document.getElementById('includeSymbols').checked = true;
    document.getElementById('excludeSimilar').checked = false;
    document.getElementById('excludeAmbiguous').checked = false;
    document.getElementById('pronounceable').checked = false;
    document.getElementById('batchCount').value = '1';
    
    // Generate immediately
    generatePasswords();
}

// Character sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR = '0O1lI';
const AMBIGUOUS = '{}[]()/\\\'"`~,;:.<>';
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
const VOWELS = 'aeiou';

// Calculate password entropy
function calculateEntropy(password, charsetSize) {
    return password.length * Math.log2(charsetSize);
}

// Get strength rating
function getStrengthRating(entropy) {
    if (entropy < 50) return { level: 'weak', label: 'Weak' };
    if (entropy < 70) return { level: 'medium', label: 'Medium' };
    if (entropy < 100) return { level: 'strong', label: 'Strong' };
    return { level: 'very-strong', label: 'Very Strong' };
}

// Build character set based on options
function buildCharset() {
    let charset = '';
    let charsetSize = 0;
    
    const includeUpper = document.getElementById('includeUppercase').checked;
    const includeLower = document.getElementById('includeLowercase').checked;
    const includeNums = document.getElementById('includeNumbers').checked;
    const includeSyms = document.getElementById('includeSymbols').checked;
    const excludeSimilar = document.getElementById('excludeSimilar').checked;
    const excludeAmbiguous = document.getElementById('excludeAmbiguous').checked;
    
    if (includeUpper) {
        charset += UPPERCASE;
        charsetSize += 26;
    }
    if (includeLower) {
        charset += LOWERCASE;
        charsetSize += 26;
    }
    if (includeNums) {
        charset += NUMBERS;
        charsetSize += 10;
    }
    if (includeSyms) {
        charset += SYMBOLS;
        charsetSize += 32;
    }
    
    // Remove similar characters
    if (excludeSimilar) {
        charset = charset.split('').filter(char => !SIMILAR.includes(char)).join('');
    }
    
    // Remove ambiguous symbols
    if (excludeAmbiguous) {
        charset = charset.split('').filter(char => !AMBIGUOUS.includes(char)).join('');
    }
    
    return { charset, charsetSize };
}

// Generate a single password
function generateSinglePassword(length, charset) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }
    
    return password;
}

// Generate pronounceable password
function generatePronounceablePassword(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    let password = '';
    for (let i = 0; i < length; i++) {
        if (i % 2 === 0) {
            // Consonant
            password += CONSONANTS[array[i] % CONSONANTS.length];
        } else {
            // Vowel
            password += VOWELS[array[i] % VOWELS.length];
        }
    }
    
    // Capitalize first letter
    password = password.charAt(0).toUpperCase() + password.slice(1);
    
    // Add number at end if numbers are enabled
    if (document.getElementById('includeNumbers').checked) {
        const numArray = new Uint8Array(2);
        crypto.getRandomValues(numArray);
        password += (numArray[0] % 10).toString() + (numArray[1] % 10).toString();
    }
    
    // Add symbol if symbols are enabled
    if (document.getElementById('includeSymbols').checked) {
        const symArray = new Uint8Array(1);
        crypto.getRandomValues(symArray);
        const cleanSymbols = '!@#$%&*';
        password += cleanSymbols[symArray[0] % cleanSymbols.length];
    }
    
    return password;
}

// Main generate function
function generatePasswords() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const count = parseInt(document.getElementById('batchCount').value);
    const pronounceable = document.getElementById('pronounceable').checked;
    const resultsDiv = document.getElementById('passwordResults');
    
    // Build charset
    const { charset, charsetSize } = buildCharset();
    
    if (charset.length === 0) {
        resultsDiv.innerHTML = `
            <div class="alert" style="background: #fee2e2; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <strong>Error:</strong> Please select at least one character set!
            </div>
        `;
        return;
    }
    
    // Generate passwords
    let html = `
        <div style="margin-top: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; border-left: 4px solid var(--primary);">
            <h5 style="margin-bottom: 0.5rem; color: var(--primary);">
                <i class="fas fa-check-circle"></i> Generated ${count} Password${count > 1 ? 's' : ''}
            </h5>
            <p style="margin: 0; font-size: 0.875rem;">
                <strong>Length:</strong> ${length} characters | 
                <strong>Charset Size:</strong> ${charsetSize} possible characters |
                <strong>Method:</strong> ${pronounceable ? 'Pronounceable' : 'Random'}
            </p>
        </div>
        <div style="margin-top: 1rem;">
    `;
    
    const passwords = [];
    
    for (let i = 0; i < count; i++) {
        let password;
        
        if (pronounceable) {
            password = generatePronounceablePassword(length);
        } else {
            password = generateSinglePassword(length, charset);
        }
        
        passwords.push(password);
        
        const entropy = calculateEntropy(password, charsetSize);
        const strength = getStrengthRating(entropy);
        
        html += `
            <div class="password-item">
                <span class="password-text">${password}</span>
                <span class="password-strength strength-${strength.level}">${strength.label}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap;">${entropy.toFixed(1)} bits</span>
                <button class="btn-copy" onclick="copyToClipboard('${password}', 'copy-${i}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        `;
    }
    
    html += '</div>';
    
    resultsDiv.innerHTML = html;
    
    // Store passwords for batch operations
    window.generatedPasswords = passwords;
}

// Copy all passwords
function copyAllPasswords() {
    if (!window.generatedPasswords || window.generatedPasswords.length === 0) {
        alert('Generate passwords first!');
        return;
    }
    
    const text = window.generatedPasswords.join('\n');
    copyToClipboard(text);
    
    if (typeof showToast === 'function') {
        showToast(`✅ Copied ${window.generatedPasswords.length} passwords to clipboard!`, 'success');
    }
}

// Download passwords as TXT
function downloadPasswords() {
    if (!window.generatedPasswords || window.generatedPasswords.length === 0) {
        alert('Generate passwords first!');
        return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `passwords_${timestamp}.txt`;
    const content = window.generatedPasswords.join('\n');
    
    if (typeof downloadResult === 'function') {
        downloadResult(content, filename);
    } else {
        // Fallback download method
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Copy to clipboard helper
function copyToClipboard(text, buttonId = null) {
    if (!navigator.clipboard) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
            showToast('✅ Copied to clipboard!', 'success');
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Password Generator loaded ✓');
    
    // Generate initial password on load
    setTimeout(() => {
        generatePasswords();
    }, 500);
});
