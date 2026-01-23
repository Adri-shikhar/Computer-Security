/**
 * ============================================
 * UX-HELPER.JS - User Experience Utilities
 * ============================================
 * Purpose: Copy, toast, tooltips, form helpers
 * Contains: Clipboard, notifications, modals
 */

// Copy to Clipboard Function
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
        showCopyFeedback(buttonId);
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(buttonId);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showErrorToast('Failed to copy to clipboard');
    });
}

// Show Copy Feedback
function showCopyFeedback(buttonId) {
    if (!buttonId) {
        showToast('✅ Copied to clipboard!', 'success');
        return;
    }
    
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.style.background = '#10b981';
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = '';
    }, 2000);
}

// Toast Notification
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.ux-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `ux-toast ux-toast-${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Example Templates
const exampleTemplates = {
    hashPassword: 'MySecureP@ssw0rd2024',
    weakPassword: 'password123',
    salt: 'random_salt_abc123',
    text: 'Hello World',
    md5Hash: '5f4dcc3b5aa765d61d8327deb882cf99',
    sha1Hash: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
    sha256Hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'
};

// Fill Example Data
function fillExample(field, exampleKey) {
    const input = document.getElementById(field);
    if (!input) return;
    
    input.value = exampleTemplates[exampleKey];
    input.focus();
    
    input.style.borderColor = '#3b82f6';
    input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
    
    setTimeout(() => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    }, 1000);
    
    showToast('✨ Example loaded!', 'info');
}

// Clear Form
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[type="text"], input[type="password"], textarea');
    inputs.forEach(input => input.value = '');
    
    const results = form.querySelectorAll('.results-area, .breach-result');
    results.forEach(result => result.innerHTML = '');
    
    showToast('🧹 Form cleared!', 'info');
}

// Initialize tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const text = e.target.getAttribute('data-tooltip');
    if (!text) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'ux-tooltip';
    tooltip.textContent = text;
    tooltip.id = 'active-tooltip';
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) + 'px';
    tooltip.style.top = rect.bottom + 10 + 'px';
    
    setTimeout(() => tooltip.classList.add('show'), 10);
}

function hideTooltip() {
    const tooltip = document.getElementById('active-tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => tooltip.remove(), 200);
    }
}

// Show/Hide Password Toggle
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (!input || !icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Format Hash Output
function formatHashOutput(hash, algorithm) {
    if (!hash) return '';
    
    const length = hash.length;
    const chunks = hash.match(/.{1,16}/g) || [];
    
    return `
        <div class="hash-output-container">
            <div class="hash-header">
                <span class="hash-algo-badge">${algorithm}</span>
                <span class="hash-length">${length} chars</span>
                <button class="btn-copy-mini" onclick="copyToClipboard('${hash}')" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="hash-value">${chunks.join('<br>')}</div>
        </div>
    `;
}

// Download Result
function downloadResult(content, filename = 'result.txt') {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('💾 Downloaded successfully!', 'success');
}

// Help Modal
function showHelpModal(toolName) {
    const helpContent = {
        'breach-checker': {
            title: 'Password Breach Checker Help',
            content: `
                <h5>How it works:</h5>
                <ol>
                    <li><strong>Local Hashing:</strong> Your password is hashed locally</li>
                    <li><strong>Partial Send:</strong> Only first 5 chars of hash sent to API</li>
                    <li><strong>Local Match:</strong> Full hash checked locally</li>
                </ol>
                <h5>Privacy:</h5>
                <ul>
                    <li>✅ Your password NEVER leaves your device</li>
                    <li>✅ Same method used by major password managers</li>
                </ul>
            `
        }
    };
    
    const modalHTML = `
        <div class="ux-modal-overlay" onclick="closeHelpModal()">
            <div class="ux-modal" onclick="event.stopPropagation()">
                <div class="ux-modal-header">
                    <h4>${helpContent[toolName]?.title || 'Help'}</h4>
                    <button class="ux-modal-close" onclick="closeHelpModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="ux-modal-body">
                    ${helpContent[toolName]?.content || 'No help available'}
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'help-modal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

function closeHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) modal.remove();
}

// Initialize tooltips on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
});

console.log('✅ ux-helper.js loaded');
