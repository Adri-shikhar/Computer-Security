/**
 * ============================================
 * EXPORT-HASHCAT.JS - Database Export for Hashcat
 * ============================================
 * Purpose: Export password hashes for security testing
 * Contains: Hashcat format export, download functionality
 */

// Export database for Hashcat security testing
async function exportDatabaseForHashcat() {
    const users = await getAllUsers();
    
    if (users.length === 0) {
        alert('No users in database to export!');
        return;
    }
    
    let content = '# Authentication Security Lab - Hash Export\n';
    content += '# Generated: ' + new Date().toLocaleString() + '\n';
    content += '# Format: username:hash\n';
    content += '#\n';
    content += '# Hashcat Examples:\n';
    content += '# MD5:    hashcat -m 0 hashes.txt wordlist.txt\n';
    content += '# SHA-1:  hashcat -m 100 hashes.txt wordlist.txt\n';
    content += '# BCrypt: hashcat -m 3200 hashes.txt wordlist.txt\n';
    content += '# Argon2: hashcat -m 10900 hashes.txt wordlist.txt (may not be supported)\n';
    content += '#\n';
    content += '# WARNING: Argon2 is extremely difficult to crack!\n';
    content += '# ========================================\n\n';
    
    users.forEach(user => {
        content += `# ${user.username} - ${user.algorithm.toUpperCase()}\n`;
        content += `${user.username}:${user.hash}\n\n`;
    });
    
    // Create download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_lab_hashes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Database exported for Hashcat analysis');
}

console.log('✅ export-hashcat.js loaded');
