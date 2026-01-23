/**
 * ============================================
 * LEGACY-MIGRATION.JS - Hash Migration System
 * ============================================
 * Purpose: Migrate legacy MD5 hashes to Argon2
 * Contains: Auto-upgrade on login, migration notifications
 */

// Attempt to migrate legacy MD5 hash to Argon2
async function attemptLegacyMigration(user, password) {
    if (user.algorithm === 'md5') {
        console.log('Legacy MD5 account detected, initiating migration...');
        
        // Re-hash with Argon2id
        const { hash, salt } = await generateHash(password, 'argon2');
        
        // Update user record
        await updateUser(user.username, {
            algorithm: 'argon2',
            hash: hash,
            salt: salt,
            upgraded: true,
            upgradedAt: new Date().toISOString()
        });
        
        // Show migration notification
        showMigrationToast(user.username);
        
        return true;
    }
    return false;
}

// Show migration success notification
function showMigrationToast(username) {
    const toast = document.createElement('div');
    toast.className = 'toast migration-toast show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-header bg-success text-white">
            <i class="fas fa-shield-alt me-2"></i>
            <strong class="me-auto">Security Upgraded!</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            <strong>${username}</strong>'s password has been automatically upgraded from MD5 to Argon2id!
            <hr class="my-2">
            <small class="text-muted">Your account is now protected with state-of-the-art encryption.</small>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 8000);
}

console.log('✅ legacy-migration.js loaded');
