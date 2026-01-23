/**
 * ============================================
 * TOAST-NOTIFICATIONS.JS - Animated Toast System
 * ============================================
 * Purpose: Display animated toast notifications instead of browser alerts
 * Contains: Toast creation, animations, auto-dismiss, and stacking
 */

// Toast container management
let toastContainer = null;

// Initialize toast container on page load
function initToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

/**
 * Show an animated toast notification
 * @param {string} message - The message to display (supports HTML)
 * @param {string} type - Toast type: 'success', 'danger', 'warning', 'info', 'primary'
 * @param {number} duration - Duration in ms (default: 4000, use 0 for persistent)
 */
function showToast(message, type = 'info', duration = 4000) {
    initToastContainer();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type} toast-enter`;
    
    // Icon mapping
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        danger: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>',
        primary: '<i class="fas fa-bell"></i>'
    };
    
    const icon = icons[type] || icons.info;
    
    // Build toast content
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">${message}</div>
        <button class="toast-close" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Trigger enter animation
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-visible');
    }, 10);
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        dismissToast(toast);
    });
    
    // Auto-dismiss after duration (if not persistent)
    if (duration > 0) {
        setTimeout(() => {
            dismissToast(toast);
        }, duration);
    }
    
    return toast;
}

/**
 * Dismiss a toast with exit animation
 * @param {HTMLElement} toast - The toast element to dismiss
 */
function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exit');
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * Show a success toast
 * @param {string} message - Success message
 * @param {number} duration - Duration in ms
 */
function showSuccessToast(message, duration = 4000) {
    return showToast(message, 'success', duration);
}

/**
 * Show an error toast
 * @param {string} message - Error message
 * @param {number} duration - Duration in ms
 */
function showErrorToast(message, duration = 5000) {
    return showToast(message, 'danger', duration);
}

/**
 * Show a warning toast
 * @param {string} message - Warning message
 * @param {number} duration - Duration in ms
 */
function showWarningToast(message, duration = 4500) {
    return showToast(message, 'warning', duration);
}

/**
 * Show an info toast
 * @param {string} message - Info message
 * @param {number} duration - Duration in ms
 */
function showInfoToast(message, duration = 4000) {
    return showToast(message, 'info', duration);
}

/**
 * Clear all active toasts
 */
function clearAllToasts() {
    if (toastContainer) {
        const toasts = toastContainer.querySelectorAll('.toast-notification');
        toasts.forEach(toast => dismissToast(toast));
    }
}

/**
 * Show a custom confirmation dialog with animations
 * @param {string} message - The confirmation message (supports HTML)
 * @param {string} title - Dialog title (optional)
 * @param {Object} options - { confirmText, cancelText, type }
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
function showConfirm(message, title = 'Confirm Action', options = {}) {
    return new Promise((resolve) => {
        const {
            confirmText = 'OK',
            cancelText = 'Cancel',
            type = 'warning'
        } = options;
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = `confirm-modal confirm-${type}`;
        
        // Icon mapping
        const icons = {
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            danger: '<i class="fas fa-exclamation-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>',
            question: '<i class="fas fa-question-circle"></i>'
        };
        
        const icon = icons[type] || icons.warning;
        
        modal.innerHTML = `
            <div class="confirm-icon">${icon}</div>
            <h3 class="confirm-title">${title}</h3>
            <div class="confirm-message">${message}</div>
            <div class="confirm-buttons">
                <button class="confirm-btn confirm-btn-cancel">${cancelText}</button>
                <button class="confirm-btn confirm-btn-ok">${confirmText}</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        // Button handlers
        const okBtn = modal.querySelector('.confirm-btn-ok');
        const cancelBtn = modal.querySelector('.confirm-btn-cancel');
        
        const closeModal = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                resolve(result);
            }, 300);
        };
        
        okBtn.addEventListener('click', () => closeModal(true));
        cancelBtn.addEventListener('click', () => closeModal(false));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(false);
            }
        });
        
        // ESC key to cancel
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToastContainer);
} else {
    initToastContainer();
}

console.log('✅ toast-notifications.js loaded');
