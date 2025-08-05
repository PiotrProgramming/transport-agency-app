// Initialize notifications
function initNotifications() {
    console.log('Initializing notifications');
    
    // Ensure appState.notifications is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    // In a real implementation, we would set up event listeners for notification actions
    setupNotificationActions();
    
    // Check for notifications periodically
    setInterval(checkForNotifications, 60000); // Every minute
}

// Setup notification actions
function setupNotificationActions() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.notification-item')) {
            const notificationId = e.target.closest('.notification-item').dataset.id;
            if (notificationId) {
                markNotificationAsRead(notificationId);
            }
        }
    });
}

// Check for new notifications
function checkForNotifications() {
    console.log('Checking for notifications');
    
    // Ensure appState.notifications is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    // In a real implementation, we would check GitHub for new notifications
    // For demo purposes, we'll simulate some notifications
    
    // Simulate a driver license expiring soon
    const today = new Date();
    const licenseExpiry = new Date();
    licenseExpiry.setDate(today.getDate() + 7); // 7 days from now
    
    // Add notification if within 7 days
    if (Math.floor((licenseExpiry - today) / (1000 * 60 * 60 * 24)) <= 7) {
        addNotification({
            id: Date.now(),
            title: 'Driver License Expiring',
            description: 'Michael Johnson\'s license expires in 7 days',
            time: 'Just now',
            type: 'warning'
        });
    }
    
    // Simulate an upcoming insurance expiry
    const insuranceExpiry = new Date();
    insuranceExpiry.setDate(today.getDate() + 10); // 10 days from now
    
    // Add notification if within 14 days
    if (Math.floor((insuranceExpiry - today) / (1000 * 60 * 60 * 24)) <= 14) {
        addNotification({
            id: Date.now() + 1,
            title: 'Insurance Expiring',
            description: 'Tractor TR-102-AB insurance expires in 10 days',
            time: 'Just now',
            type: 'warning'
        });
    }
}

// Add a new notification
function addNotification(notification) {
    console.log('Adding notification:', notification);
    
    // Ensure appState.notifications is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    // Don't add duplicate notifications
    const exists = appState.notifications.some(n => 
        n.title === notification.title && n.description === notification.description);
    
    if (exists) return;
    
    // Add to state
    appState.notifications.unshift({
        ...notification,
        read: false
    });
    
    // Update UI
    updateNotificationUI();
}

// Update notification UI
function updateNotificationUI() {
    console.log('Updating notification UI');
    
    // Ensure appState.notifications is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    const notificationDropdown = document.getElementById('notification-dropdown');
    if (!notificationDropdown) return;
    
    // Clear existing notifications except header
    while (notificationDropdown.children.length > 1) {
        notificationDropdown.removeChild(notificationDropdown.lastChild);
    }
    
    // Add notifications
    appState.notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.dataset.id = notification.id;
        if (notification.read) {
            notificationItem.style.fontWeight = 'normal';
        }
        notificationItem.innerHTML = `
            <div class="notification-title">${notification.title}</div>
            <div class="notification-time">${notification.time}</div>
        `;
        notificationItem.addEventListener('click', () => {
            markNotificationAsRead(notification.id);
        });
        notificationDropdown.appendChild(notificationItem);
    });
    
    // Update badge count
    const unreadCount = appState.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount > 0 ? unreadCount : '';
    }
}

// Mark notification as read
function markNotificationAsRead(id) {
    console.log(`Marking notification as read: ${id}`);
    
    // Ensure notifications array is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    const notificationItem = document.querySelector(`.notification-item:nth-child(${id + 1})`);
    if (notificationItem) {
        notificationItem.style.backgroundColor = '#f7fafc';
        notificationItem.style.fontWeight = 'normal';
    }
    
    // Update badge count
    const unreadCount = appState.notifications.filter(n => !n.read).length - 1;
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount > 0 ? unreadCount : '';
    }
}

// Initialize notifications when DOM is loaded
document.addEventListener('DOMContentLoaded', initNotifications);
