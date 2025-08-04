// DOM Elements
let chatUsersList;
let chatMessages;
let chatInput;
let chatSendBtn;
let chatCurrentUser;
let chatCurrentRole;

// Chat state
const chatState = {
    currentUserId: 1,
    currentChatUserId: 2,
    messages: []
};

// Initialize chat
function initChat() {
    chatUsersList = document.getElementById('chat-users-list');
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    chatSendBtn = document.getElementById('chat-send-btn');
    chatCurrentUser = document.getElementById('chat-current-user');
    chatCurrentRole = document.getElementById('chat-current-role');
    
    // Set up event listeners
    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Load initial chat data
    loadChatData();
}

// Load chat data
function loadChatData() {
    if (!chatUsersList) return;
    
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
    if (chatCurrentUser && chatCurrentRole) {
        const currentUser = sampleUsers.find(u => u.id === chatState.currentUserId);
        if (currentUser) {
            chatCurrentUser.textContent = currentUser.name;
            chatCurrentRole.textContent = currentUser.role;
        }
    }
    
    // Load messages for the first user
    if (sampleUsers.length > 1) {
        loadMessagesForUser(sampleUsers[1]);
    }
}

// Render a single chat user
function renderChatUser(user) {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.dataset.id = user.id;
    
    if (user.id === chatState.currentChatUserId) {
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
    
    chatUsersList.appendChild(userItem);
}

// Load messages for a user
function loadMessagesForUser(user) {
    // Update active state
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.user-item[data-id="${user.id}"]`).classList.add('active');
    
    // Update current chat user info
    chatState.currentChatUserId = user.id;
    chatCurrentUser.textContent = user.name;
    chatCurrentRole.textContent = user.role;
    
    // Clear existing messages
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
    
    // Save messages to state
    chatState.messages = sampleMessages;
    
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
    const content = chatInput.value.trim();
    if (!content) return;
    
    // Create new message
    const newMessage = {
        id: Date.now(),
        senderId: chatState.currentUserId,
        content: content,
        timestamp: formatTime(new Date()),
        type: 'sent'
    };
    
    // Add to state
    chatState.messages.push(newMessage);
    
    // Render message
    renderMessage(newMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // In a real implementation, we would save this to GitHub
    console.log('Message saved to GitHub:', newMessage);
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
