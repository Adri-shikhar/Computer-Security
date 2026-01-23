// Encryption Feature JavaScript

// Toggle sidebar for mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

// Toggle sub-navigation with smooth animation
function toggleSubNav(id, event) {
    event.preventDefault();
    const subNav = document.getElementById(id);
    const allSubNavs = document.querySelectorAll('.sub-nav');
    const toggle = event.currentTarget.querySelector('.nav-toggle');
    
    allSubNavs.forEach(nav => {
        if (nav.id !== id) {
            nav.classList.remove('show');
            const navToggle = nav.previousElementSibling.querySelector('.nav-toggle');
            if (navToggle) navToggle.classList.remove('open');
        }
    });
    
    subNav.classList.toggle('show');
    if (toggle) toggle.classList.toggle('open');
}

// Encryption functionality placeholder
function encryptText() {
    const input = document.getElementById('encryptInput');
    const output = document.getElementById('encryptOutput');
    const algorithm = document.getElementById('encryptAlgorithm');
    
    if (!input || !input.value.trim()) {
        alert('Please enter text to encrypt');
        return;
    }
    
    // Simulate encryption (replace with actual encryption logic)
    const encrypted = btoa(input.value); // Base64 encoding as placeholder
    if (output) {
        output.textContent = encrypted;
        output.style.display = 'block';
    }
    
    console.log(`Encrypted using ${algorithm ? algorithm.value : 'default'} algorithm`);
}

function decryptText() {
    const input = document.getElementById('decryptInput');
    const output = document.getElementById('decryptOutput');
    
    if (!input || !input.value.trim()) {
        alert('Please enter text to decrypt');
        return;
    }
    
    try {
        // Simulate decryption (replace with actual decryption logic)
        const decrypted = atob(input.value); // Base64 decoding as placeholder
        if (output) {
            output.textContent = decrypted;
            output.style.display = 'block';
        }
    } catch (error) {
        alert('Invalid encrypted text');
    }
}

// File upload handling
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('File loaded:', file.name);
        // Process file content here
    };
    reader.readAsText(file);
}

// Drag and drop functionality
function initDragDrop() {
    const dropZone = document.querySelector('.file-upload-zone');
    if (!dropZone) return;
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            console.log('File dropped:', files[0].name);
            // Process dropped file
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initDragDrop();
});
