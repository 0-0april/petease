// Admin Panel JavaScript for interactive functionality

document.addEventListener('DOMContentLoaded', function() {
    // Highlight active sidebar link based on current page
    const currentFile = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li a');

    sidebarLinks.forEach(link => {
        const linkFile = link.getAttribute('href').split('/').pop();
        if (currentFile === linkFile) {
            link.classList.add('active');
        }
    });

    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
            // External links will navigate normally
        });
    });

    // Action buttons
    const actionButtons = document.querySelectorAll('.action-cards .card button');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.parentElement.querySelector('h3').textContent;
            console.log('Action clicked:', action);
            // Navigation is handled via onclick in HTML
        });
    });

    // Simulate dynamic stats (in a real app, this would come from an API)
    function updateStats() {
        // Placeholder for dynamic data
        console.log('Stats updated');
    }

    // Initialize
    updateStats();

    console.log('Admin Panel loaded successfully');
});
