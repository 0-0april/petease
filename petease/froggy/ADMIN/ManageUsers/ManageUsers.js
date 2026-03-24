// Disable/Enable User JavaScript for interactive functionality

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
    // Search functionality
    const searchInput = document.getElementById('user-search');
    const yearFilter = document.getElementById('year-filter');
    const searchBtn = document.getElementById('search-user-btn');
    const userCards = document.querySelectorAll('.user-card');

    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedYear = yearFilter.value;
        userCards.forEach(card => {
            const username = card.querySelector('h4').textContent.toLowerCase();
            const email = card.querySelector('p').textContent.toLowerCase();
            const lastLogin = card.querySelectorAll('p')[3].textContent.split(': ')[1];
            const loginYear = lastLogin.split('-')[0];

            const matchesSearch = username.includes(searchTerm) || email.includes(searchTerm);
            const matchesYear = !selectedYear || loginYear === selectedYear;

            if (matchesSearch && matchesYear) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchBtn.addEventListener('click', filterUsers);
    yearFilter.addEventListener('change', filterUsers);

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // View details buttons
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    const userDetails = document.getElementById('user-details');
    const detailUsername = document.getElementById('detail-username');
    const detailEmail = document.getElementById('detail-email');
    const detailFullname = document.getElementById('detail-fullname');
    const detailStatus = document.getElementById('detail-status');
    const detailRegdate = document.getElementById('detail-regdate');
    const detailLastlogin = document.getElementById('detail-lastlogin');

    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.user-card');
            const username = card.querySelector('h4').textContent;
            const email = card.querySelector('p').textContent;
            const status = card.querySelector('.status').textContent;

            detailUsername.textContent = username;
            detailEmail.textContent = email;
            detailFullname.textContent = 'John Doe'; // Placeholder
            detailStatus.textContent = status;
            detailRegdate.textContent = '2023-01-15'; // Placeholder
            detailLastlogin.textContent = card.querySelectorAll('p')[3].textContent.split(': ')[1];

            userDetails.style.display = 'block';
            userDetails.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Disable/Enable buttons
    const disableButtons = document.querySelectorAll('.disable-btn');
    const enableButtons = document.querySelectorAll('.enable-btn');
    const disableReason = document.getElementById('disable-reason');

    disableButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.user-card');
            const username = card.querySelector('h4').textContent;

            // Show disable reason form
            disableReason.style.display = 'block';
            disableReason.scrollIntoView({ behavior: 'smooth' });

            // Store reference to the card for later
            disableReason.dataset.targetCard = username;
        });
    });

    enableButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.user-card');
            const statusSpan = card.querySelector('.status');

            statusSpan.textContent = 'Active';
            statusSpan.className = 'status active';

            this.textContent = 'Disable Account';
            this.className = 'disable-btn';

            alert('User account enabled successfully!');
        });
    });

    // Disable form
    const disableForm = document.getElementById('disable-form');
    const cancelDisable = document.getElementById('cancel-disable');

    disableForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const reason = document.getElementById('reason-text').value;
        const targetUsername = disableReason.dataset.targetCard;

        // Find the target card
        const targetCard = Array.from(userCards).find(card =>
            card.querySelector('h4').textContent === targetUsername
        );

        if (targetCard) {
            const statusSpan = targetCard.querySelector('.status');
            statusSpan.textContent = 'Disabled';
            statusSpan.className = 'status disabled';

            const enableBtn = targetCard.querySelector('.disable-btn');
            enableBtn.textContent = 'Enable Account';
            enableBtn.className = 'enable-btn';
        }

        alert(`User account disabled. Reason: ${reason}`);
        disableReason.style.display = 'none';
        document.getElementById('reason-text').value = '';
    });

    cancelDisable.addEventListener('click', function() {
        disableReason.style.display = 'none';
        document.getElementById('reason-text').value = '';
    });

    // Details actions
    const toggleStatus = document.getElementById('toggle-status');
    const closeDetails = document.getElementById('close-details');

    toggleStatus.addEventListener('click', function() {
        const username = detailUsername.textContent;
        const targetCard = Array.from(userCards).find(card =>
            card.querySelector('h4').textContent === username
        );

        if (targetCard) {
            const statusSpan = targetCard.querySelector('.status');
            const currentStatus = statusSpan.textContent;

            if (currentStatus === 'Active') {
                statusSpan.textContent = 'Disabled';
                statusSpan.className = 'status disabled';
                targetCard.querySelector('.disable-btn').textContent = 'Enable Account';
                targetCard.querySelector('.disable-btn').className = 'enable-btn';
                detailStatus.textContent = 'Disabled';
                alert('User account disabled!');
            } else {
                statusSpan.textContent = 'Active';
                statusSpan.className = 'status active';
                targetCard.querySelector('.enable-btn').textContent = 'Disable Account';
                targetCard.querySelector('.enable-btn').className = 'disable-btn';
                detailStatus.textContent = 'Active';
                alert('User account enabled!');
            }
        }
    });

    closeDetails.addEventListener('click', function() {
        userDetails.style.display = 'none';
    });

    console.log('Disable/Enable User page loaded successfully');
});
