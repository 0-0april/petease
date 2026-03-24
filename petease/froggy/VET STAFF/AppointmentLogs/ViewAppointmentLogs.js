// View Appointment Logs JavaScript

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
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const exportBtn = document.getElementById('export-btn');
    const logsTableBody = document.getElementById('logs-table-body');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const feedbackMessage = document.getElementById('feedback-message');

    // Mock data for appointment logs
    let appointmentLogs = [
        {
            id: 1,
            petName: 'Buddy',
            petType: 'Dog',
            petGender: 'Male',
            petColor: 'Brown',
            ownerName: 'John Doe',
            ownerNum: '09123456789',
            ownerAddress: 'MSU',
            services: 'Rabies Vaccination',
            appointmentDate: '2025-12-15',
            dateBooked: '2025-12-15',
            status: 'No-Show'
        },
        {
            id: 2,
            petName: 'Whiskers',
            petType: 'Cat',
            petGender: 'Male',
            petColor: 'Ginger',
            ownerName: 'Jane Smith',
            ownerNum: '09123456789',
            ownerAddress: 'MSU',
            services: 'Spay',
            appointmentDate: '2025-12-16',
            dateBooked: '2025-12-15',
            status: 'Completed'
        },
        {
            id: 3,
            petName: 'Max',
            petType: 'Cat',
            petGender: 'Male',
            petColor: 'Ginger',
            ownerName: 'Bob Johnson',
            ownerNum: '09123456789',
            ownerAddress: 'MSU',
            services: 'Consultation',
            appointmentDate: '2025-12-15',
            dateBooked: '2025-12-15',
            status: 'Completed'
        },
        {
            id: 4,
            petName: 'Luna',
            petType: 'Cat',
            petGender: 'Male',
            petColor: 'Ginger',
            ownerName: 'Alice Brown',
            ownerNum: '09123456789',
            ownerAddress: 'MSU',
            services: 'Rabies Vaccination',
            appointmentDate: '2025-12-15',
            dateBooked: '2025-12-15',
            status: 'Cancelled'
        },
        {
            id: 5,
            petName: 'Charlie',
            petType: 'Cat',
            petGender: 'Male',
            petColor: 'Ginger',
            ownerName: 'Tom Wilson',
            ownerNum: '09123456789',
            ownerAddress: 'MSU',
            services: 'Consultation',
            appointmentDate: '2025-12-15',
            dateBooked: '2025-12-15',
            status: 'No-Show'
        }
    ];

    let currentPage = 1;
    const itemsPerPage = 10;
    let filteredLogs = [...appointmentLogs];

    // Function to display feedback message
    function showFeedback(message, type = 'success') {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback ${type}`;
        feedbackMessage.classList.remove('hidden');

        setTimeout(() => {
            feedbackMessage.classList.add('hidden');
        }, 5000);
    }

    // Function to update summary stats
    function updateSummaryStats() {
        const total = filteredLogs.length;
        const completed = filteredLogs.filter(log => log.status === 'completed').length;
        const cancelled = filteredLogs.filter(log => log.status === 'cancelled').length;
        const noShow = filteredLogs.filter(log => log.status === 'no-show').length;

        document.getElementById('total-appointments').textContent = total;
        document.getElementById('completed-appointments').textContent = completed;
        document.getElementById('cancelled-appointments').textContent = cancelled;
        document.getElementById('no-show-appointments').textContent = noShow;
    }

    // Function to apply filters
    function applyFilters() {
        const dateFrom = dateFromInput.value;
        const dateTo = dateToInput.value;
        const status = statusFilter.value;
        const searchTerm = searchInput.value.toLowerCase().trim();

        filteredLogs = appointmentLogs.filter(log => {
            const logDate = new Date(log.appointmentDate);
            const fromDate = dateFrom ? new Date(dateFrom) : null;
            const toDate = dateTo ? new Date(dateTo) : null;

            const dateMatch = (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate);
            const statusMatch = status === 'all' || log.status.toLowerCase() === status;
            const searchMatch = !searchTerm ||
                log.petName.toLowerCase().includes(searchTerm) ||
                log.ownerName.toLowerCase().includes(searchTerm) ||
                log.services.toLowerCase().includes(searchTerm) ||
                log.vet.toLowerCase().includes(searchTerm);

            return dateMatch && statusMatch && searchMatch;
        });

        currentPage = 1;
        renderLogs();
        updateSummaryStats();
        showFeedback('Filters applied successfully.');
    }

    // Function to render logs
    function renderLogs() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const logsToShow = filteredLogs.slice(startIndex, endIndex);

        logsTableBody.innerHTML = '';

        if (logsToShow.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No appointment logs found.</td>';
            logsTableBody.appendChild(emptyRow);
            return;
        }

        logsToShow.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.appointmentDate}</td>
                <td>${log.petName}</td>
                <td>${log.petType}</td>
                <td>${log.petColor}</td>
                <td>${log.petGender}</td>
                <td>${log.ownerName}</td>
                <td>${log.ownerAddress}</td>
                <td>${log.services}</td>
                <td><span class="status-${log.status.toLowerCase().replace(' ', '-')}">${log.status}</span></td>
            `;
            logsTableBody.appendChild(row);
        });

        updatePagination();
    }

    // Function to update pagination
    function updatePagination() {
        const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // Function to export to CSV
    function exportToCSV() {
        const headers = ['Date', 'Time', 'Pet Name', 'Owner', 'Service', 'Status', 'Vet', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                log.appointmentDate,
                log.time,
                `"${log.petName}"`,
                `"${log.ownerName}"`,
                `"${log.services}"`,
                log.status,
                `"${log.vet}"`,
                `"${log.notes}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'appointment_logs.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showFeedback('Appointment logs exported successfully.');
    }

    // Function to view log details
    window.viewLogDetails = function(id) {
        const log = appointmentLogs.find(l => l.id === id);
        if (log) {
            alert(`Appointment Log Details:\n\nDate: ${log.appointmentDate}\nTime: ${log.time}\nPet: ${log.petName}\nOwner: ${log.ownerName}\nService: ${log.services}\nStatus: ${log.status}\nVet: ${log.vet}\nNotes: ${log.notes}`);
        }
    };

    // Function to edit log
    window.editLog = function(id) {
        const log = appointmentLogs.find(l => l.id === id);
        if (log) {
            // In a real application, this would open an edit modal or redirect to edit page
            alert(`Edit functionality for log ${id} would be implemented here.`);
        }
    };

    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    dateFromInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    dateToInput.value = today.toISOString().split('T')[0];

    // Event listeners
    applyFiltersBtn.addEventListener('click', applyFilters);
    exportBtn.addEventListener('click', exportToCSV);
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderLogs();
        }
    });
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderLogs();
        }
    });

    // Logout functionality
    // document.getElementById('logout-btn').addEventListener('click', function(e) {
    //     e.preventDefault();
    //     if (confirm('Are you sure you want to logout?')) {
    //         window.location.href = '../VetStaff.html';
    //     }
    // });

    // Initial render
    applyFilters();

    console.log('View Appointment Logs page loaded successfully');
});
