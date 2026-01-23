/**
 * ============================================
 * PASSWORD-GENERATOR.JS - Password Generation
 * ============================================
 * Purpose: Generate secure random passwords
 * Contains: Character sets, entropy calculation, batch generation
 */

// Sidebar toggle
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

// Quick Generate with optimal defaults
function quickGenerate() {
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

// Calculate entropy
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

// Build character set
function buildCharset() {
    let charset = '';
    let charsetSize = 0;
    
    if (document.getElementById('includeUppercase').checked) {
        charset += UPPERCASE;
        charsetSize += 26;
    }
    if (document.getElementById('includeLowercase').checked) {
        charset += LOWERCASE;
        charsetSize += 26;
    }
    if (document.getElementById('includeNumbers').checked) {
        charset += NUMBERS;
        charsetSize += 10;
    }
    if (document.getElementById('includeSymbols').checked) {
        charset += SYMBOLS;
        charsetSize += 32;
    }
    
    if (document.getElementById('excludeSimilar').checked) {
        charset = charset.split('').filter(char => !SIMILAR.includes(char)).join('');
    }
    
    if (document.getElementById('excludeAmbiguous').checked) {
        charset = charset.split('').filter(char => !AMBIGUOUS.includes(char)).join('');
    }
    
    return { charset, charsetSize };
}

// Generate single password
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
            password += CONSONANTS[array[i] % CONSONANTS.length];
        } else {
            password += VOWELS[array[i] % VOWELS.length];
        }
    }
    
    password = password.charAt(0).toUpperCase() + password.slice(1);
    
    if (document.getElementById('includeNumbers').checked) {
        const numArray = new Uint8Array(2);
        crypto.getRandomValues(numArray);
        password += (numArray[0] % 10).toString() + (numArray[1] % 10).toString();
    }
    
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
    
    const { charset, charsetSize } = buildCharset();
    
    if (charset.length === 0) {
        resultsDiv.innerHTML = `
            <div class="alert" style="background: #fee2e2; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <strong>Error:</strong> Please select at least one character set!
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="margin-top: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; border-left: 4px solid var(--primary);">
            <h5 style="margin-bottom: 0.5rem; color: var(--primary);">
                <i class="fas fa-check-circle"></i> Generated ${count} Password${count > 1 ? 's' : ''}
            </h5>
            <p style="margin: 0; font-size: 0.875rem;">
                <strong>Length:</strong> ${length} | 
                <strong>Charset:</strong> ${charsetSize} chars |
                <strong>Method:</strong> ${pronounceable ? 'Pronounceable' : 'Random'}
            </p>
        </div>
        <div style="margin-top: 1rem;">
    `;
    
    const passwords = [];
    
    for (let i = 0; i < count; i++) {
        let password = pronounceable ? generatePronounceablePassword(length) : generateSinglePassword(length, charset);
        passwords.push(password);
        
        const entropy = calculateEntropy(password, charsetSize);
        const strength = getStrengthRating(entropy);
        
        html += `
            <div class="password-item">
                <span class="password-text">${password}</span>
                <span class="password-strength strength-${strength.level}">${strength.label}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${entropy.toFixed(1)} bits</span>
                <button class="btn-copy" onclick="copyToClipboard('${password}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        `;
    }
    
    html += '</div>';
    resultsDiv.innerHTML = html;
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
        showToast(`✅ Copied ${window.generatedPasswords.length} passwords!`, 'success');
    }
}

// Download passwords
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

// Copy to clipboard (fallback if ux-helper not loaded)
if (typeof copyToClipboard === 'undefined') {
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            if (typeof showToast === 'function') {
                showToast('✅ Copied!', 'success');
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Password Generator loaded ✓');
    setTimeout(() => generatePasswords(), 500);
});

console.log('✅ password-generator.js loaded');
