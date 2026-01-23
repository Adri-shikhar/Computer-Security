/**
 * ============================================
 * DASHBOARD.JS - Admin Dashboard Rendering
 * ============================================
 * Purpose: Render user table and dashboard stats
 * Contains: Table rendering, stats updates
 */

// Render user table in dashboard
async function renderUserTable() {
    const users = await getAllUsers();
    const tbody = document.getElementById('userTableBody');
    
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = `<tr>
            <td colspan="6" class="text-center text-muted">
                No users registered yet. Create your first user above.
            </td>
        </tr>`;
        return;
    }
    
    tbody.innerHTML = users.map((user, index) => {
        const saltInfo = user.salt === 'NONE' ? 
            '' : 
            user.salt === 'EMBEDDED' ? 
            '<br><small class="text-success">Embedded in Hash</small>' :
            `<br><small class="text-muted">Salted</small>`;
            
        return `
        <tr class="${user.upgraded ? 'table-success' : ''}" style="color: white;">
            <td style="color: white;"><strong>${index + 1}</strong></td>
            <td style="color: white;"><strong>${user.username}</strong>${user.upgraded ? ' <span class="badge bg-success">UPGRADED</span>' : ''}</td>
            <td style="color: white;"><strong>${getAlgorithmName(user.algorithm)}</strong></td>
            <td>${getSecurityBadge(user.algorithm, user.upgraded)}</td>
            <td>
                <div class="hash-display" title="${user.hash}">
                    <code style="font-size: 0.85em; color: #00f3ff;">${user.hash.substring(0, 50)}${user.hash.length > 50 ? '...' : ''}</code>
                </div>
                <small class="text-muted">Length: ${user.hash.length} chars${saltInfo}</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="copyHash('${user.hash.replace(/'/g, "\\'")}')" title="Copy hash">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="openEditModal(${user.id}, '${user.username}', '${user.algorithm}')" title="Edit user">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="confirmDeleteUser(${user.id}, '${user.username}')" title="Delete user">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

// Load dashboard
async function loadDashboard() {
    await renderUserTable();
    
    if (typeof updateStats === 'function') {
        await updateStats();
    }
}

console.log('✅ dashboard.js loaded');
