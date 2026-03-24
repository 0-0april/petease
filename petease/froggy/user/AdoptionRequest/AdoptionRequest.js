// Sample adoption request data
// In a real application, this would come from a backend API
const adoptionRequests = [
    {
        id: 1,
        petName: "Max",
        requesterName: "Sarah Johnson",
        requestDate: "2025-11-28",
        status: "pending",
        requesterEmail: "sarah.johnson@example.com",
        requesterPhone: "+1 (555) 123-4567",
        petImage: "../assets/browndog.jpg"
    },
    {
        id: 2,
        petName: "Bella",
        requesterName: "Michael Chen",
        requestDate: "2025-11-25",
        status: "pending",
        requesterEmail: "mchen@example.com",
        requesterPhone: "+1 (555) 234-5678",
        petImage: "../assets/browndog.jpg"
    },
    {
        id: 3,
        petName: "Rocky",
        requesterName: "Emily Davis",
        requestDate: "2025-11-20",
        status: "accepted",
        requesterEmail: "emily.davis@example.com",
        requesterPhone: "+1 (555) 345-6789",
        petImage: "../assets/browndog.jpg"
    },
    {
        id: 4,
        petName: "Luna",
        requesterName: "James Wilson",
        requestDate: "2025-11-15",
        status: "declined",
        requesterEmail: "james.wilson@example.com",
        requesterPhone: "+1 (555) 456-7890",
        petImage: "../assets/browndog.jpg"
    }
];

// Get DOM elements
const requestsContainer = document.getElementById('requests-container');
const emptyState = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('requestModal');
const closeBtn = document.querySelector('.close');
const modalBody = document.getElementById('modalBody');

let currentFilter = 'all';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadRequests();
    setupEventListeners();
});

// Setup event listeners for filter buttons
function setupEventListeners() {
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadRequests();
        });
    });

    // Modal close button
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });
}

// Load and display adoption requests
function loadRequests() {
    const filteredRequests = currentFilter === 'all' 
        ? adoptionRequests 
        : adoptionRequests.filter(req => req.status === currentFilter);

    if (filteredRequests.length === 0) {
        requestsContainer.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    requestsContainer.innerHTML = '';

    filteredRequests.forEach(request => {
        const card = createRequestCard(request);
        requestsContainer.appendChild(card);
    });
}

// Create a request card element
function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = `request-card ${request.status}`;

    const statusClass = `status-${request.status}`;
    const statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);

    const dateObj = new Date(request.requestDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });

    card.innerHTML = `
        <div class="request-info">
            <div class="info-item">
                <h3>Pet Name</h3>
                <p>${request.petName}</p>
            </div>
            <div class="info-item">
                <h3>Requester</h3>
                <p>${request.requesterName}</p>
            </div>
            <div class="info-item">
                <h3>Request Date</h3>
                <p>${formattedDate}</p>
            </div>
        </div>
        <div class="request-actions">
            <span class="status-badge ${statusClass}">${statusText}</span>
            ${request.status === 'pending' ? `
                <button class="btn btn-accept" onclick="acceptRequest(${request.id}, event)">
                    Accept
                </button>
                <button class="btn btn-decline" onclick="declineRequest(${request.id}, event)">
                    Decline
                </button>
            ` : ''}
        </div>
    `;

    // Add click event to view details
    card.addEventListener('click', function(e) {
        // Don't trigger if clicking on action buttons
        if (!e.target.closest('.request-actions')) {
            showRequestDetails(request);
        }
    });

    return card;
}

// Show request details in modal
function showRequestDetails(request) {
    const dateObj = new Date(request.requestDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);

    modalBody.innerHTML = `
        <p><strong>Pet Name:</strong> ${request.petName}</p>
        <p><strong>Requester Name:</strong> ${request.requesterName}</p>
        <p><strong>Email:</strong> ${request.requesterEmail}</p>
        <p><strong>Phone:</strong> ${request.requesterPhone}</p>
        <p><strong>Request Date:</strong> ${formattedDate}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${request.status}">${statusText}</span></p>
    `;

    modal.classList.add('show');
}

// Close modal
function closeModal() {
    modal.classList.remove('show');
}

// Accept request
function acceptRequest(requestId, event) {
    event.stopPropagation();
    
    const request = adoptionRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'accepted';
        loadRequests();
        showNotification(`Adoption request from ${request.requesterName} accepted!`, 'success');
    }
}

// Decline request
function declineRequest(requestId, event) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to decline this request?')) {
        const request = adoptionRequests.find(r => r.id === requestId);
        if (request) {
            request.status = 'declined';
            loadRequests();
            showNotification(`Adoption request from ${request.requesterName} declined.`, 'info');
        }
    }
}

// Show notification (simple alert-like notification)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;

    if (type === 'success') {
        notification.style.background = '#4caf50';
    } else if (type === 'info') {
        notification.style.background = '#2196F3';
    } else {
        notification.style.background = '#f44336';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
