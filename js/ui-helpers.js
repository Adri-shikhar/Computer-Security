/**
 * ============================================
 * UI-HELPERS.JS - User Interface Utilities
 * ============================================
 * Purpose: UI helper functions and display utilities
 * Contains: Spinners, messages, badges, hash time display
 */

// Show loading spinner
function showSpinner(message) {
    const spinnerText = document.getElementById('spinnerText');
    const spinner = document.getElementById('loadingSpinner');
    if (spinnerText) spinnerText.textContent = message;
    if (spinner) spinner.classList.add('active');
}

// Hide loading spinner
function hideSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.remove('active');
}

// Update hash computation time display
function updateHashTime(timeMs) {
    const hashTimeEl = document.getElementById('hashTime');
    if (hashTimeEl) hashTimeEl.textContent = timeMs;
    
    const display = document.getElementById('hashTimeDisplay');
    if (!display) return;
    
    if (timeMs < 10) {
        display.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    } else if (timeMs < 100) {
        display.style.background = 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)';
    } else {
        display.style.background = 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
    }
}

// Show message in element
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
    
    setTimeout(() => {
        if (element) element.innerHTML = '';
    }, 5000);
}

// Get security badge HTML based on algorithm
function getSecurityBadge(algorithm, upgraded = false) {
    let badge = '';
    const algo = algorithm.toLowerCase();
    
    switch(algo) {
        case 'md5':
            badge = '<span class="badge badge-vulnerable">VULNERABLE</span>';
            break;
        case 'sha1':
            badge = '<span class="badge badge-weak">WEAK</span>';
            break;
        case 'bcrypt':
            badge = '<span class="badge badge-secure">SECURE</span>';
            break;
        case 'argon2':
        case 'argon2id':
            badge = '<span class="badge badge-secure">MOST SECURE</span>';
            break;
        default:
            badge = '<span class="badge bg-secondary">Unknown</span>';
    }
    
    if (upgraded) {
        badge += ' <span class="badge bg-success ms-1"><i class="fas fa-arrow-up"></i> UPGRADED</span>';
    }
    
    return badge;
}

// Get algorithm display name
function getAlgorithmName(algorithm) {
    const names = {
        'md5': 'MD5',
        'sha1': 'SHA-1',
        'bcrypt': 'BCrypt',
        'argon2': 'Argon2id'
    };
    return names[algorithm] || algorithm;
}

// Copy hash to clipboard
function copyHash(hash) {
    navigator.clipboard.writeText(hash).then(() => {
        showSuccessToast('Hash copied to clipboard!<br><small>Use this in Hashcat or John the Ripper for security testing.</small>');
    });
}

// Expose to global scope
window.copyHash = copyHash;

console.log('✅ ui-helpers.js loaded');
