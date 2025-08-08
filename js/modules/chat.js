// Initialize chat
function initChat() {
    console.log('Initializing chat view');
    
    // Register this view's initializer with the app state
    appState.registerViewInitializer('chat', function() {
        console.log('Chat view initialized');
    });
    
    // Register this view's data loader with the app state
    appState.registerViewLoader('chat', function() {
        console.log('Chat view data loader called');
        loadChatData();
    });
    
    // Set up event listeners for the send button
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    
    if (chatSendBtn && chatInput && !chatSendBtn.dataset.initialized) {
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        chatSendBtn.dataset.initialized = 'true';
    }
}

// Load chat data
function loadChatData() {
    console.log('Loading chat data');
    
    const chatUsersList = document.getElementById('chat-users-list');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatUsersList || !chatMessages) {
        console.error('Chat elements not found');
        return;
    }
    
    // Clear existing content
    chatUsersList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleUsers = [
        { id: 1, name: 'John Doe', role: 'Administrator', status: 'online', supervisor: null },
        { id: 2, name: 'Sarah Williams', role: 'Manager', status: 'online', supervisor: 'John Doe' },
        { id: 3, name: 'Robert Chen', role: 'Dispatcher', status: 'away', supervisor: 'Sarah Williams' },
        { id: 4, name: 'Michael Johnson', role: 'Driver', status: 'online', supervisor: 'Robert Chen' },
        { id: 5, name: 'Anna Schmidt', role: 'Driver', status: 'online', supervisor: 'Robert Chen' }
    ];
    
    // Render users
    sampleUsers.forEach(user => {
        renderChatUser(user);
    });
    
    // Set current user info
    const chatCurrentUser = document.getElementById('chat-current-user');
    const chatCurrentRole = document.getElementById('chat-current-role');
    
    if (chatCurrentUser && chatCurrentRole) {
        const currentUser = sampleUsers.find(u => u.id === 1);
        if (currentUser) {
            chatCurrentUser.textContent = currentUser.name;
            chatCurrentRole.textContent = currentUser.role;
        }
    }
    
    // Load messages for the first user
    if (sampleUsers.length > 0) {
        loadMessagesForUser(sampleUsers[0]);
    }
    
    console.log(`Successfully loaded ${sampleUsers.length} chat users`);
}

// Render a single chat user
function renderChatUser(user) {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.dataset.id = user.id;
    
    if (user.id === 1) {
        userItem.classList.add('active');
    }
    
    // Determine status color
    let statusColor;
    switch(user.status) {
        case 'online':
            statusColor = 'var(--success)';
            break;
        case 'away':
            statusColor = '#dd6b20';
            break;
        default:
            statusColor = '#718096';
    }
    
    userItem.innerHTML = `
        <div class="user-info">
            <div class="user-status" style="background-color: ${statusColor};"></div>
            <div class="user-details">
                <div class="user-name">${user.name}</div>
                <div class="user-role">${user.role}${user.supervisor ? ` (Reports to ${user.supervisor})` : ''}</div>
            </div>
        </div>
    `;
    
    userItem.addEventListener('click', () => {
        loadMessagesForUser(user);
    });
    
    document.getElementById('chat-users-list').appendChild(userItem);
}

// Load messages for a user
function loadMessagesForUser(user) {
    // Update active state
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.user-item[data-id="${user.id}"]`).classList.add('active');
    
    // Update current chat user info
    const chatCurrentUser = document.getElementById('chat-current-user');
    const chatCurrentRole = document.getElementById('chat-current-role');
    
    if (chatCurrentUser && chatCurrentRole) {
        chatCurrentUser.textContent = user.name;
        chatCurrentRole.textContent = user.role;
    }
    
    // Clear existing messages
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    
    // In a real implementation, we would fetch messages from GitHub
    const sampleMessages = [
        {
            id: 1,
            senderId: 2,
            content: 'Hi John, I\'ve assigned Michael to tender #TX-7892 for Berlin to Paris route.',
            timestamp: '10:23 AM',
            type: 'received'
        },
        {
            id: 2,
            senderId: 1,
            content: 'Great! Please make sure he has the updated route documentation. Also, check if the trailer inspection is up to date.',
            timestamp: '10:25 AM',
            type: 'sent'
        },
        {
            id: 3,
            senderId: 2,
            content: 'Will do. The trailer inspection is valid until Nov 30. I\'ve sent all documents to Michael.',
            timestamp: '10:27 AM',
            type: 'received'
        },
        {
            id: 4,
            senderId: 1,
            content: 'Perfect. Let me know when he departs.',
            timestamp: '10:28 AM',
            type: 'sent'
        }
    ];
    
    // Render messages
    sampleMessages.forEach(message => {
        renderMessage(message);
    });
    
    // Scroll to bottom
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Render a single message
function renderMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${message.content}</div>
        <div class="message-time">${message.timestamp}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
}

// Send a message
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages) {
        console.error('Chat input or messages element not found');
        return;
    }
    
    const content = chatInput.value.trim();
    if (!content) return;
    
    // Create new message
    const newMessage = {
        id: Date.now(),
        senderId: 1,
        content: content,
        timestamp: formatTime(new Date()),
        type: 'sent'
    };
    
    // Render message
    renderMessage(newMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    console.log('Message sent:', newMessage);
}

// Format time as HH:MM AM/PM
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${hours}:${minutes} ${ampm}`;
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', initChat);
