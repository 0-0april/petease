// Vet Staff Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mock data for appointment logs (same as in AppointmentLogs)
    const appointmentLogs = [
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

    // Calculate stats
    const total = appointmentLogs.length;
    const completed = appointmentLogs.filter(log => log.status.toLowerCase() == 'completed').length;
    const cancelled = appointmentLogs.filter(log => log.status.toLowerCase() == 'cancelled').length;
    const noShow = appointmentLogs.filter(log => log.status.toLowerCase() == 'no-show').length;

    // Update dashboard stats
    document.getElementById('total-appointments').textContent = total;
    document.getElementById('completed-appointments').textContent = completed;
    document.getElementById('cancelled-appointments').textContent = cancelled;
    document.getElementById('no-show-appointments').textContent = noShow;

    // Highlight active sidebar link based on current page
    const currentFile = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li a');

    sidebarLinks.forEach(link => {
        const linkFile = link.getAttribute('href').split('/').pop();
        if (currentFile === linkFile) {
            link.classList.add('active');
        }
    });

    // // Logout functionality
    // document.getElementById('logout-btn').addEventListener('click', function(e) {
    //     e.preventDefault();
    //     if (confirm('Are you sure you want to logout?')) {
    //         // In a real application, this would redirect to login page
    //         alert('Logged out successfully!');
    //         // window.location.href = '../Login/Login.html';
    //     }
    // });

    console.log('Vet Staff Panel loaded successfully');
});
