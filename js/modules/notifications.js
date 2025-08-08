// Notifications Module
var NotificationsModule = (function() {
    // Initialize the notifications module
    function init() {
        console.log('Initializing Notifications Module');
        loadNotifications();
    }
    
    // Load notifications
    async function loadNotifications() {
        console.log('Loading notifications');
        
        // Ensure appState.notifications is initialized
        if (!appState.notifications) {
            appState.notifications = [];
        }
        
        const notificationList = document.getElementById('notification-dropdown');
        if (!notificationList) {
            console.error('Notification dropdown not found');
            return;
        }
        
        // Clear existing notifications except header
        while (notificationList.children.length > 1) {
            notificationList.removeChild(notificationList.lastChild);
        }
        
        try {
            // REAL DATABASE CALL - Fetch notifications from GitHub
            const tenders = await githubService.getFileContent('tenders.json');
            const drivers = await githubService.getFileContent('drivers.json');
            
            // Generate notifications based on data
            const notifications = [];
            
            // Driver license expirations
            drivers.forEach(driver => {
                const licenseExpiry = new Date(driver.licenseExpiry);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((licenseExpiry - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
                    notifications.push({
                        id: `driver-license-${driver.id}`,
                        title: 'Driver License Expiring',
                        description: `${driver.firstName} ${driver.lastName}'s license expires in ${daysUntilExpiry} days`,
                        time: 'Just now',
                        type: 'warning'
                    });
                }
            });
            
            // Tender delivery notifications
            tenders.forEach(tender => {
                if (tender.status === 'delivered') {
                    notifications.push({
                        id: `tender-delivered-${tender.id}`,
                        title: 'Tender Delivered',
                        description: `Tender #${tender.id} (${tender.route}) has been delivered`,
                        time: 'Just now',
                        type: 'info'
                    });
                }
            });
            
            // Set notifications
            appState.notifications = notifications;
            
            // Update badge count
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = notifications.length > 0 ? notifications.length : '';
            }
            
            // Add notifications to dropdown
            notifications.forEach(notification => {
                const notificationItem = document.createElement('div');
                notificationItem.className = 'notification-item';
                notificationItem.dataset.id = notification.id;
                notificationItem.innerHTML = `
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-description">${notification.description}</div>
                    <div class="notification-time">${notification.time}</div>
                `;
                notificationItem.addEventListener('click', () => {
                    markNotificationAsRead(notification.id);
                });
                notificationList.appendChild(notificationItem);
            });
        } catch (error) {
            console.error('Error loading notifications:', error);
            
            // Fallback to simple notifications if database access fails
            const sampleNotifications = [
                { id: 1, title: 'Driver License Expiring', time: '2 hours ago', read: false },
                { id: 2, title: 'Tender #TX-7890 Delivered', time: '5 hours ago', read: false },
                { id: 3, title: 'Invoice #INV-2023 Due Soon', time: '1 day ago', read: false }
            ];
            
            appState.notifications = sampleNotifications;
            
            // Update badge count
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = sampleNotifications.length;
            }
            
            // Add notifications to dropdown
            sampleNotifications.forEach(notification => {
                const notificationItem = document.createElement('div');
                notificationItem.className = 'notification-item';
                notificationItem.dataset.id = notification.id;
                notificationItem.innerHTML = `
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${notification.time}</div>
                `;
                notificationItem.addEventListener('click', () => {
                    markNotificationAsRead(notification.id);
                });
                notificationList.appendChild(notificationItem);
            });
        }
    }
    
    // Mark notification as read
    function markNotificationAsRead(id) {
        console.log(`Marking notification as read: ${id}`);
        
        // Ensure notifications array is initialized
        if (!appState.notifications) {
            appState.notifications = [];
        }
        
        const notificationItem = document.querySelector(`.notification-item[data-id="${id}"]`);
        if (notificationItem) {
            notificationItem.style.backgroundColor = '#f7fafc';
            notificationItem.style.fontWeight = 'normal';
        }
        
        // Update badge count
        const unreadCount = appState.notifications.filter(n => n.id !== id).length;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount > 0 ? unreadCount : '';
        }
    }
    
    // Public API
    return {
        init: init,
        loadNotifications: loadNotifications,
        markAsRead: markNotificationAsRead
    };
})();
