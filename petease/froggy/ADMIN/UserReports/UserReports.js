// Review User Reports JavaScript for interactive functionality

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
    // Filter functionality
    const filterBtn = document.getElementById('filter-btn');
    const reportType = document.getElementById('report-type');
    const reportStatus = document.getElementById('report-status');
    const reportsBody = document.getElementById('reports-body');

    filterBtn.addEventListener('click', function() {
        const typeFilter = reportType.value;
        const statusFilter = reportStatus.value;

        const rows = reportsBody.querySelectorAll('tr');
        rows.forEach(row => {
            const type = row.cells[1].textContent.toLowerCase();
            const status = row.cells[4].textContent.toLowerCase();

            let show = true;
            if (typeFilter && !type.includes(typeFilter.toLowerCase())) {
                show = false;
            }
            if (statusFilter && !status.includes(statusFilter.toLowerCase())) {
                show = false;
            }

            row.style.display = show ? '' : 'none';
        });

        console.log('Filters applied:', { type: typeFilter, status: statusFilter });
    });

    // View buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    const reportDetailsModal = document.getElementById('report-details-modal');
    const detailReportedUser = document.getElementById('detail-reported-user');
    const detailReporter = document.getElementById('detail-reporter');
    const detailType = document.getElementById('detail-type');
    const detailDate = document.getElementById('detail-date');
    const detailStatus = document.getElementById('detail-status');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const cells = row.cells;

            detailReportedUser.textContent = cells[0].textContent;
            detailReporter.textContent = cells[1].textContent;
            detailType.textContent = cells[2].textContent;
            detailDate.textContent = cells[3].textContent;
            detailStatus.textContent = cells[4].textContent;

            reportDetailsModal.style.display = 'flex';
        });
    });

    // Modal actions
    const disableAccount = document.getElementById('disable-account');
    const keepAccountActive = document.getElementById('keep-account-active');
    const closeModal = document.getElementById('close-modal');

    disableAccount.addEventListener('click', function() {
        alert('Account disabled!');
        reportDetailsModal.style.display = 'none';
    });

    keepAccountActive.addEventListener('click', function() {
        alert('Account kept active!');
        reportDetailsModal.style.display = 'none';
    });

    closeModal.addEventListener('click', function() {
        reportDetailsModal.style.display = 'none';
    });

    console.log('Review User Reports page loaded successfully');
});
