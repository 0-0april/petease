// Message JavaScript for managing messages list

document.addEventListener('DOMContentLoaded', function() {
    const messagesList = document.querySelector('.messages-list');
    const feedbackMessage = document.getElementById('feedback-message');

    // Mock data for messages
    let messages = [
        {
            id: 1,
            sender: 'Notification',
            preview: 'Good news, users! The system\'s update churva',
            time: '2 hours ago',
            unread: true
        },
        {
            id: 2,
            sender: 'John Doe',
            preview: 'We can schedule on monday.',
            time: '1 day ago',
            unread: false
        },
        {
            id: 3,
            sender: 'Sarah Smith',
            preview: 'Thanks for the information about Whiskers!',
            time: '3 days ago',
            unread: false
        }
    ];

    // Function to display feedback message
    function showFeedback(message, type = 'success') {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback ${type}`;
        feedbackMessage.classList.remove('hidden');

        // Hide the message after 5 seconds
        setTimeout(() => {
            feedbackMessage.classList.add('hidden');
        }, 5000);
    }

    // Function to render messages
    function renderMessages() {
        messagesList.innerHTML = '';

        if (messages.length === 0) {
            // Show system announcement when no messages
            const systemAnnouncement = document.createElement('div');
            systemAnnouncement.className = 'system-announcement';
            systemAnnouncement.innerHTML = `
                <h3>Welcome to PetEase Messages!</h3>
                <p>You don't have any messages yet. Start connecting with pet owners and adopters by browsing available pets or checking out adoption requests. Your conversations will appear here once you start messaging!</p>
            `;
            messagesList.appendChild(systemAnnouncement);
            return;
        }

        messages.forEach(message => {
            const messageItem = document.createElement('div');
            messageItem.className = `message-item ${message.unread ? 'message-unread' : ''}`;
            messageItem.dataset.id = message.id;
            messageItem.innerHTML = `
                <div class="message-avatar">${message.sender.charAt(0).toUpperCase()}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">${message.sender}</span>
                        <span class="message-time">${message.time}</span>
                    </div>
                    <div class="message-preview">${message.preview}</div>
                </div>
            `;
            messagesList.appendChild(messageItem);
        });

        // Add event listeners to message items
        const messageItems = document.querySelectorAll('.message-item');
        messageItems.forEach(item => {
            item.addEventListener('click', function() {
                const messageId = parseInt(this.dataset.id);
                openMessage(messageId);
            });
        });
    }

    // Function to open a message (navigate to MessageUser page)
    function openMessage(messageId) {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            // Mark as read
            message.unread = false;
            renderMessages();

            // Navigate to MessageUser page with message ID
            showFeedback(`Opening conversation with ${message.sender}...`);
            window.location.href = `../MessageUser/MessageUser.html`;
        }
    }

    function messageOwner() {
        window.location.href = '../MessageUser/MessageUser.html';
    }

    // Initial render
    renderMessages();

    console.log('Messages page loaded successfully');
});
