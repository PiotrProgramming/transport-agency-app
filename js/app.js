// Application State
const appState = {
    currentView: 'dashboard',
    isAuthenticated: false,
    currentUser: null,
    token: null,
    repo: null,
    githubUsername: null,
    githubApi: {
        baseUrl: 'https://api.github.com',
        headers: {
            'Authorization': '',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    }
};

// DOM Elements
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const navItems = document.querySelectorAll('.nav-item');
const notificationBell = document.getElementById('notification-bell');
const notificationDropdown = document.getElementById('notification-dropdown');
const userProfile = document.getElementById('user-profile');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// Initialize the application
function initApp() {
    // Check if user is already authenticated
    checkAuthStatus();
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const view = item.getAttribute('data-view');
            appState.currentView = view;
            
            // Hide all views
            document.querySelectorAll('.view').forEach(v => {
                v.classList.remove('active');
            });
            
            // Show selected view
            document.getElementById(`${view}-view`).classList.add('active');
            
            // Dispatch event for view change
            const event = new CustomEvent('viewchange', { detail: view });
            document.dispatchEvent(event);
        });
    });

    // Notification dropdown
    notificationBell.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
    });

    // User dropdown
    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBell.contains(e.target)) {
            notificationDropdown.style.display = 'none';
        }
        if (!userProfile.contains(e.target)) {
            userDropdown.style.display = 'none';
        }
    });
}

// Check authentication status
function checkAuthStatus() {
    // In a real implementation, we would check for stored credentials
    // For now, we'll just check if the user has logged in during this session
    if (appState.isAuthenticated) {
        authView.classList.remove('active');
        appView.classList.add('active');
        loadInitialData();
    } else {
        authView.classList.add('active');
        appView.classList.remove('active');
    }
}

// Load initial data after login
function loadInitialData() {
    // Set current repository in admin view
    if (appState.repo) {
        const repoInput = document.getElementById('current-repo');
        if (repoInput) repoInput.value = appState.repo;
    }
    
    // Load notifications
    loadNotifications();
    
    // Load initial view data
    loadViewData(appState.currentView);
}

// Load data for the current view
function loadViewData(view) {
    switch(view) {
        case 'dashboard':
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
            break;
        case 'drivers':
            if (typeof loadDriversData === 'function') {
                loadDriversData();
            }
            break;
        case 'cars':
            if (typeof loadCarsData === 'function') {
                loadCarsData();
            }
            break;
        case 'cards':
            if (typeof loadCardsData === 'function') {
                loadCardsData();
            }
            break;
        case 'tenders':
            if (typeof loadTendersData === 'function') {
                loadTendersData();
            }
            break;
        case 'invoices':
            if (typeof loadInvoicesData === 'function') {
                loadInvoicesData();
            }
            break;
        case 'reports':
            if (typeof loadReportsData === 'function') {
                loadReportsData();
            }
            break;
        case 'admin':
            if (typeof loadAdminData === 'function') {
                loadAdminData();
            }
            break;
        case 'chat':
            if (typeof loadChatData === 'function') {
                loadChatData();
            }
            break;
    }
}

// Load notifications
function loadNotifications() {
    const notificationList = document.getElementById('notification-dropdown');
    if (!notificationList) return;
    
    // Clear existing notifications
    while (notificationList.children.length > 1) {
        notificationList.removeChild(notificationList.lastChild);
    }
    
    // Add sample notifications (in a real app, these would come from GitHub)
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
        notificationList.appendChild(notificationItem);
    });
}

// Mark notification as read
function markNotificationAsRead(id) {
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
