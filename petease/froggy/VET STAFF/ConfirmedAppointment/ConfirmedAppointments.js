// View Confirmed Appointments JavaScript

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
    const appointmentsList = document.querySelector('.appointments-list');
    const sortBySelect = document.getElementById('sort-by');
    const searchInput = document.getElementById('search-input');
    const refreshBtn = document.getElementById('refresh-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const confirmSelectedBtn = document.getElementById('confirm-selected-btn');
    const cancelSelectedBtn = document.getElementById('cancel-selected-btn');
    const feedbackMessage = document.getElementById('feedback-message');

    // Mock data for pending appointments
    let pendingAppointments = [
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
            date: '2025-12-15'
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
            date: '2025-12-16'
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
            date: '2025-12-17'
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
            date: '2023-12-18'
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
            date: '2025-12-19'
        }
    ];

    let filteredAppointments = [...pendingAppointments];

    // Function to display feedback message
    function showFeedback(message, type = 'success') {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback ${type}`;
        feedbackMessage.classList.remove('hidden');

        setTimeout(() => {
            feedbackMessage.classList.add('hidden');
        }, 5000);
    }

    // Function to update stats
    function updateStats() {
        const totalPending = filteredAppointments.length;
        const todayPending = filteredAppointments.filter(app => app.date === new Date().toISOString().split('T')[0]).length;
        const urgentPending = filteredAppointments.filter(app => app.priority === 'high').length;

        document.getElementById('total-pending').textContent = totalPending;
        document.getElementById('today-pending').textContent = todayPending;
        document.getElementById('urgent-pending').textContent = urgentPending;
    }

    // Function to sort appointments
    function sortAppointments(appointments, sortBy) {
        return [...appointments].sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'pet-name':
                    return a.petName.localeCompare(b.petName);
                default:
                    return 0;
            }
        });
    }

    // Function to filter appointments
    function filterAppointments(appointments, searchTerm) {
        if (!searchTerm) return appointments;
        const term = searchTerm.toLowerCase();
        return appointments.filter(app =>
            app.petName.toLowerCase().includes(term) ||
            app.ownerName.toLowerCase().includes(term)
        );
    }

    // Function to render appointments
    function renderAppointments() {
        appointmentsList.innerHTML = '';

        if (filteredAppointments.length === 0) {
            appointmentsList.innerHTML = '<p>No pending appointments found.</p>';
            return;
        }

        filteredAppointments.forEach(appointment => {
            const appointmentItem = document.createElement('div');
            appointmentItem.className = 'appointment-item';
            appointmentItem.innerHTML = `
                <input type="checkbox" class="appointment-checkbox" data-id="${appointment.id}">
                <div class="appointment-details">
                    <h3>${appointment.petName} - ${appointment.ownerName}</h3>
                    <p><strong>Services:</strong> ${appointment.services}</p>
                    <p><strong>Date:</strong> ${appointment.date}</p>
                    <div class="appointment-actions">
                        <button class="btn btn-primary" onclick="confirmAppointment(${appointment.id})">Showed-Up</button>
                        <button class="btn btn-danger" onclick="cancelAppointment(${appointment.id})">Didn't Showed-Up</button>
                        <button class="btn btn-secondary" onclick="viewDetails(${appointment.id})">Details</button>
                    </div>
                </div>
            `;
            appointmentsList.appendChild(appointmentItem);
        });

        updateStats();
    }

    // Function to handle sorting
    function handleSort() {
        const sortBy = sortBySelect.value;
        filteredAppointments = sortAppointments(filteredAppointments, sortBy);
        renderAppointments();
    }

    // Function to handle search
    function handleSearch() {
        const searchTerm = searchInput.value.trim();
        filteredAppointments = filterAppointments(pendingAppointments, searchTerm);
        filteredAppointments = sortAppointments(filteredAppointments, sortBySelect.value);
        renderAppointments();
    }

    // Function to refresh data
    function refreshData() {
        // In a real application, this would fetch fresh data from the server
        showFeedback('Data refreshed successfully.');
        renderAppointments();
    }

    // Function to select/deselect all
    function toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.appointment-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
        updateBulkActions();
    }

    // Function to update bulk actions state
    function updateBulkActions() {
        const checkedBoxes = document.querySelectorAll('.appointment-checkbox:checked');
        confirmSelectedBtn.disabled = checkedBoxes.length === 0;
        cancelSelectedBtn.disabled = checkedBoxes.length === 0;
    }

    // Function to confirm selected appointments
    function confirmSelectedAppointments() {
        const checkedBoxes = document.querySelectorAll('.appointment-checkbox:checked');
        const idsToConfirm = Array.from(checkedBoxes).map(cb => parseInt(cb.dataset.id));

        if (idsToConfirm.length === 0) {
            showFeedback('No appointments selected.', 'error');
            return;
        }

        // In a real application, this would send confirmation to the server
        idsToConfirm.forEach(id => {
            const index = pendingAppointments.findIndex(app => app.id === id);
            if (index !== -1) {
                pendingAppointments.splice(index, 1);
            }
        });

        filteredAppointments = filterAppointments(pendingAppointments, searchInput.value.trim());
        filteredAppointments = sortAppointments(filteredAppointments, sortBySelect.value);
        renderAppointments();
        showFeedback(`${idsToConfirm.length} appointment(s) confirmed successfully.`);
    }

    // Function to cancel selected appointments
    function cancelSelectedAppointments() {
        const checkedBoxes = document.querySelectorAll('.appointment-checkbox:checked');
        const idsToCancel = Array.from(checkedBoxes).map(cb => parseInt(cb.dataset.id));

        if (idsToCancel.length === 0) {
            showFeedback('No appointments selected.', 'error');
            return;
        }

        if (confirm(`Are you sure you want to cancel ${idsToCancel.length} appointment(s)?`)) {
            // In a real application, this would send cancellation to the server
            idsToCancel.forEach(id => {
                const index = pendingAppointments.findIndex(app => app.id === id);
                if (index !== -1) {
                    pendingAppointments.splice(index, 1);
                }
            });

            filteredAppointments = filterAppointments(pendingAppointments, searchInput.value.trim());
            filteredAppointments = sortAppointments(filteredAppointments, sortBySelect.value);
            renderAppointments();
            showFeedback(`${idsToCancel.length} appointment(s) cancelled successfully.`);
        }
    }

    // Function to confirm single appointment
    window.confirmAppointment = function(id) {
        const index = pendingAppointments.findIndex(app => app.id === id);
        if (index !== -1) {
            pendingAppointments.splice(index, 1);
            filteredAppointments = filterAppointments(pendingAppointments, searchInput.value.trim());
            filteredAppointments = sortAppointments(filteredAppointments, sortBySelect.value);
            renderAppointments();
            showFeedback('Appointment confirmed successfully.');
        }
    };

    // Function to cancel single appointment
    window.cancelAppointment = function(id) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            const index = pendingAppointments.findIndex(app => app.id === id);
            if (index !== -1) {
                pendingAppointments.splice(index, 1);
                filteredAppointments = filterAppointments(pendingAppointments, searchInput.value.trim());
                filteredAppointments = sortAppointments(filteredAppointments, sortBySelect.value);
                renderAppointments();
                showFeedback('Appointment cancelled successfully.');
            }
        }
    };

    // Function to view appointment details
    window.viewDetails = function(id) {
        const appointment = pendingAppointments.find(app => app.id === id);
        if (appointment) {
            const detailsSection = document.querySelector('.details-section');
            const detailsContent = document.getElementById('details-content');
            detailsContent.innerHTML = `
                <p><strong>Pet Name:</strong> ${appointment.petName}</p>
                <p><strong>Pet Type:</strong> ${appointment.petType}</p>
                <p><strong>Pet Gender:</strong> ${appointment.petGender}</p>
                <p><strong>Pet Color:</strong> ${appointment.petColor}</p>
                <p><strong>Owner Name:</strong> ${appointment.ownerName}</p>
                <p><strong>Owner Number:</strong> ${appointment.ownerNum}</p>
                <p><strong>Owner Address:</strong> ${appointment.ownerAddress}</p>
                <p><strong>Services:</strong> ${appointment.services}</p>
                <p><strong>Date:</strong> ${appointment.date}</p>
            `;
            detailsSection.style.display = 'block';
        }
    };

    // Function to close details section
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-btn')) {
            const detailsSection = document.querySelector('.details-section');
            detailsSection.style.display = 'none';
        }
    });

    // Event listeners
    sortBySelect.addEventListener('change', handleSort);
    searchInput.addEventListener('input', handleSearch);
    refreshBtn.addEventListener('click', refreshData);
    selectAllBtn.addEventListener('click', toggleSelectAll);
    confirmSelectedBtn.addEventListener('click', confirmSelectedAppointments);
    cancelSelectedBtn.addEventListener('click', cancelSelectedAppointments);

    // Add event listener for checkboxes
    appointmentsList.addEventListener('change', function(e) {
        if (e.target.classList.contains('appointment-checkbox')) {
            updateBulkActions();
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
    filteredAppointments = sortAppointments(filteredAppointments, sortBySelect.value);
    renderAppointments();

    console.log('View Pending Appointments page loaded successfully');
});
