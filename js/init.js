/**
 * ============================================
 * INIT.JS - Application Initialization
 * ============================================
 * Purpose: Initialize the application on page load
 * Contains: Database init, event handlers, console logging
 */

// Initialize application
function init() {
    initDatabase();
    renderUserTable();
    initFormHandlers();
    
    console.log('%c🔒 Advanced Authentication Security Lab Initialized', 
        'background: #667eea; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    console.log('%c Features: HaveIBeenPwned API | Legacy Migration | Cost Factor Testing', 
        'background: #28a745; color: white; padding: 5px;');
}

// Tab Navigation System
function initTabNavigation() {
    if (window.MULTI_PAGE_MODE) return;
    
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    const sections = document.querySelectorAll('.content-section');
    
    function showSection(tabName) {
        sections.forEach(section => {
            const sectionAttr = section.getAttribute('data-section');
            if (!sectionAttr) return;
            
            const sectionNames = sectionAttr.split(' ');
            
            if (sectionNames.includes(tabName)) {
                section.style.setProperty('display', 'block', 'important');
                section.style.opacity = '1';
            } else {
                section.style.setProperty('display', 'none', 'important');
                section.style.opacity = '0';
            }
        });
        
        navLinks.forEach(link => {
            const linkTab = link.getAttribute('data-tab');
            if (linkTab === tabName) {
                link.style.background = 'rgba(0, 243, 255, 0.3)';
                link.style.borderColor = '#00f3ff';
                link.style.color = '#00f3ff';
            } else {
                link.style.background = 'rgba(0, 243, 255, 0.1)';
                link.style.borderColor = 'rgba(0, 243, 255, 0.3)';
                link.style.color = '#fff';
            }
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            if (tabName) showSection(tabName);
        });
    });
    
    setTimeout(() => showSection('login'), 100);
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        setTimeout(initTabNavigation, 200);
    });
} else {
    init();
    setTimeout(initTabNavigation, 200);
}

console.log('✅ init.js loaded');
