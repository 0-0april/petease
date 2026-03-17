// MessageUser JavaScript for individual chat functionality

document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const blockBtn = document.getElementById('block-btn');
    const reportBtn = document.getElementById('report-btn');
    const feedbackMessage = document.getElementById('feedback-message');
    const chatUserName = document.getElementById('chat-user-name');

    // Mock chat data for different users
    const chatDataMap = {
        'John Doe': [
            {
                id: 1,
                sender: 'John Doe',
                content: 'Hi! I\'m interested in adopting Buddy. Is he still available?',
                timestamp: '2023-12-15 10:30 AM',
                type: 'received'
            },
            {
                id: 2,
                sender: 'You',
                content: 'Hi John! Yes, Buddy is still available. He\'s a very friendly dog and great with kids.',
                timestamp: '2023-12-15 10:35 AM',
                type: 'sent'
            },
            {
                id: 3,
                sender: 'John Doe',
                content: 'That sounds perfect! Can we schedule a meet and greet?',
                timestamp: '2023-12-15 10:40 AM',
                type: 'received'
            }
        ],
        'Bob Smith': [
            {
                id: 1,
                sender: 'Bob Smith',
                content: 'Thanks for the information. I\'ll be in touch soon.',
                timestamp: '2023-12-15 11:00 AM',
                type: 'received'
            },
            {
                id: 2,
                sender: 'You',
                content: 'No problem, Bob. Let me know if you need anything else.',
                timestamp: '2023-12-15 11:05 AM',
                type: 'sent'
            }
        ],
        'Charlie Brown': [
            {
                id: 1,
                sender: 'Charlie Brown',
                content: 'Can we schedule a meeting for tomorrow?',
                timestamp: '2023-12-15 12:00 PM',
                type: 'received'
            },
            {
                id: 2,
                sender: 'You',
                content: 'Sure, Charlie. What time works for you?',
                timestamp: '2023-12-15 12:10 PM',
                type: 'sent'
            }
        ],
        'Diana Prince': [
            {
                id: 1,
                sender: 'Diana Prince',
                content: 'The adoption process was smooth. Thank you!',
                timestamp: '2023-12-15 1:00 PM',
                type: 'received'
            },
            {
                id: 2,
                sender: 'You',
                content: 'You\'re welcome, Diana. Glad everything went well.',
                timestamp: '2023-12-15 1:05 PM',
                type: 'sent'
            }
        ],
        'Ethan Hunt': [
            {
                id: 1,
                sender: 'Ethan Hunt',
                content: 'Please send more details about the pet\'s health.',
                timestamp: '2023-12-15 2:00 PM',
                type: 'received'
            },
            {
                id: 2,
                sender: 'You',
                content: 'Sure, Ethan. I\'ll send the vet records shortly.',
                timestamp: '2023-12-15 2:10 PM',
                type: 'sent'
            }
        ],
        'Fiona Green': [
            {
                id: 1,
                sender: 'Fiona Green',
                content: 'Looking forward to meeting the new family member!',
                timestamp: '2023-12-15 3:00 PM',
                type: 'received'
            },
            {
                id: 2,
                sender: 'You',
                content: 'Me too, Fiona. It\'s going to be a great match.',
                timestamp: '2023-12-15 3:05 PM',
                type: 'sent'
            }
        ],
        'George Lucas': [
            {
                id: 1,
                sender: 'George Lucas',
                content: 'All documents have been submitted successfully.',
                timestamp: '2023-12-15 4:00 PM',
                type: 'received'
            },
            { 
                id: 2,
                sender: 'You',
                content: 'Great, George. We\'ll review them soon.',
                timestamp: '2023-12-15 4:05 PM',
                type: 'sent'
            }
        ],
        'Notification': [
            {
                id: 1,
                sender: 'Notification',
                content: 'Good news, users! The system update is complete.',
                timestamp: '2023-12-15 9:00 AM',
                type: 'received'
            }
        ]
    };

    // Get user from URL parameters (for demo purposes)
    const urlParams = new URLSearchParams(window.location.search);
    let currentUser = urlParams.get('user') || 'John Doe';
    let chatMessagesData = chatDataMap[currentUser] || chatDataMap['John Doe'];

    // Function to switch user
    function switchUser(userName) {
        currentUser = userName;
        chatUserName.textContent = userName;
        const chatAvatar = document.querySelector('.chat-avatar');
        chatAvatar.textContent = userName.charAt(0).toUpperCase();
        chatMessagesData = chatDataMap[userName] || chatDataMap['John Doe'];
        renderMessages();
        // Reset input and buttons
        messageInput.value = '';
        sendBtn.disabled = true;
        isBlocked = false;
        isReported = false;
        blockBtn.textContent = 'Block User';
        blockBtn.style.backgroundColor = '#dc3545';
        reportBtn.disabled = false;
        reportBtn.textContent = 'Report Chat';
        messageInput.disabled = false;
        sendBtn.disabled = false;
    }

    // Add click event listeners to message items
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach(item => {
        item.addEventListener('click', function() {
            const sender = this.querySelector('.message-sender').textContent;
            switchUser(sender);
        });
    });

    let isBlocked = false;
    let isReported = false;

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

    // Function to render chat messages
    function renderMessages() {
        chatMessages.innerHTML = '';

        chatMessagesData.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.type}`;
            messageElement.innerHTML = `
                <div class="message-content">${message.content}</div>
                <div class="message-time">${message.timestamp}</div>
            `;
            chatMessages.appendChild(messageElement);
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to send message
    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content) return;

        if (isBlocked) {
            showFeedback('You cannot send messages to blocked users.', 'error');
            return;
        }

        const newMessage = {
            id: chatMessagesData.length + 1,
            sender: 'You',
            content: content,
            timestamp: new Date().toLocaleString(),
            type: 'sent'
        };

        chatMessagesData.push(newMessage);
        renderMessages();
        messageInput.value = '';
        sendBtn.disabled = true;

        showFeedback('Message sent successfully.');

        // Simulate receiving a response after 2 seconds
        setTimeout(() => {
            const responseMessage = {
                id: chatMessagesData.length + 1,
                sender: currentUser,
                content: 'Thanks for your message! I\'ll get back to you soon.',
                timestamp: new Date().toLocaleString(),
                type: 'received'
            };
            chatMessagesData.push(responseMessage);
            renderMessages();
        }, 2000);
    }

    // Function to block user
    function blockUser() {
        if (isBlocked) {
            showFeedback('User is already blocked.', 'error');
            return;
        }

        const confirmBlock = confirm(`Are you sure you want to block ${userName}? You won't be able to send or receive messages from this user.`);
        if (!confirmBlock) return;

        isBlocked = true;
        blockBtn.textContent = 'Unblock User';
        blockBtn.style.backgroundColor = '#28a745';
        messageInput.disabled = true;
        sendBtn.disabled = true;

        showFeedback(`${userName} has been blocked. You can no longer communicate with this user.`);
    }

    // Function to unblock user
    function unblockUser() {
        isBlocked = false;
        blockBtn.textContent = 'Block User';
        blockBtn.style.backgroundColor = '#dc3545';
        messageInput.disabled = false;
        sendBtn.disabled = false;

        showFeedback(`${userName} has been unblocked. You can now communicate with this user again.`);
    }

    // Function to report chat
    function reportChat() {
        if (isReported) {
            showFeedback('This chat has already been reported.', 'error');
            return;
        }

        const confirmReport = confirm(`Are you sure you want to report this chat with ${userName}? Our team will review the conversation.`);
        if (!confirmReport) return;

        isReported = true;
        reportBtn.disabled = true;
        reportBtn.textContent = 'Reported';

        showFeedback('Chat reported successfully. Our team will review this conversation.');
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    messageInput.addEventListener('input', function() {
        sendBtn.disabled = this.value.trim() === '' || isBlocked;
    });

    blockBtn.addEventListener('click', function() {
        if (isBlocked) {
            unblockUser();
        } else {
            blockUser();
        }
    });

    reportBtn.addEventListener('click', reportChat);

    // Initial render
    renderMessages();
    sendBtn.disabled = true; // Initially disabled since input is empty

    console.log('MessageUser chat page loaded successfully');
});
