// Application State
const appState = {
    currentView: 'dashboard',
    isAuthenticated: false,
    currentUser: null,
    token: null,
    repo: null,
    githubUsername: null,
    notifications: [],
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
let authView, appView, contentArea, navItems, notificationBell, notificationDropdown, 
    userProfile, userDropdown, logoutBtn;

// Initialize the application
function initApp() {
    // Initialize DOM elements
    authView = document.getElementById('auth-view');
    appView = document.getElementById('app-view');
    contentArea = document.getElementById('content-area');
    navItems = document.querySelectorAll('.nav-item');
    notificationBell = document.getElementById('notification-bell');
    notificationDropdown = document.getElementById('notification-dropdown');
    userProfile = document.getElementById('user-profile');
    userDropdown = document.getElementById('user-dropdown');
    logoutBtn = document.getElementById('logout-btn');
    
    // Make sure notifications array is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    // Check if user is already authenticated
    checkAuthStatus();
    
    // Navigation
    if (navItems) {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.getAttribute('data-view');
                loadView(view);
            });
        });
    }

    // Notification dropdown
    if (notificationBell && notificationDropdown) {
        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }

    // User dropdown
    if (userProfile && userDropdown) {
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationBell && !notificationBell.contains(e.target)) {
            notificationDropdown.style.display = 'none';
        }
        if (userProfile && !userProfile.contains(e.target)) {
            userDropdown.style.display = 'none';
        }
    });
}

// Load a view fragment
function loadView(view) {
    console.log(`Loading view: ${view}`);
    
    // Update navigation highlights
    if (navItems) {
        navItems.forEach(i => i.classList.remove('active'));
        const activeNavItem = document.querySelector(`.nav-item[data-view="${view}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');
    }
    
    // Load the HTML fragment
    fetch(`views/${view}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${view} view (HTTP ${response.status})`);
            }
            return response.text();
        })
        .then(html => {
            // Insert the HTML into the content area
            if (contentArea) {
                contentArea.innerHTML = html;
                
                // Store the current view
                appState.currentView = view;
                
                // Initialize view-specific module AFTER the HTML is rendered
                setTimeout(() => {
                    initViewModule(view);
                }, 100);
            }
        })
        .catch(error => {
            console.error(error);
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="error-message">
                        <h3>Error Loading View</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadView('${appState.currentView}')">Retry</button>
                    </div>
                `;
            }
        });
}

// Initialize view-specific module
function initViewModule(view) {
    console.log(`Initializing module for view: ${view}`);
    
    // This is where we initialize our view-specific modules
    switch(view) {
        case 'drivers':
            // Check if DriversModule is defined
            if (typeof window.DriversModule !== 'undefined') {
                DriversModule.init();
            } else {
                console.error('DriversModule is not defined');
                
                // Wait a bit longer and try again (sometimes needed for module loading)
                setTimeout(() => {
                    if (typeof window.DriversModule !== 'undefined') {
                        DriversModule.init();
                    } else {
                        if (contentArea) {
                            contentArea.innerHTML = `
                                <div class="error-message">
                                    <h3>Module Error</h3>
                                    <p>Drivers module is not loaded. Please check your JavaScript files.</p>
                                    <div style="margin-top: 15px;">
                                        <button class="btn btn-primary" onclick="location.reload()">Reload Page</button>
                                    </div>
                                </div>
                            `;
                        }
                    }
                }, 300);
            }
            break;
        // Other views will be implemented similarly
        default:
            console.log(`No specific module for view: ${view}`);
    }
}

// Check authentication status
function checkAuthStatus() {
    console.log('Checking authentication status');
    
    // Make sure notifications array is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    // In a real implementation, we would check for stored credentials
    if (appState.isAuthenticated) {
        console.log('User is authenticated');
        if (authView) authView.classList.remove('active');
        if (appView) appView.classList.add('active');
        
        // Load the dashboard view
        loadView(appState.currentView || 'dashboard');
    } else {
        console.log('User is not authenticated');
        if (authView) authView.classList.add('active');
        if (appView) appView.classList.remove('active');
    }
}

// Load initial data after login
function loadInitialData() {
    console.log('Loading initial data');
    
    // Set current repository in admin view
    if (appState.repo) {
        const repoInput = document.getElementById('current-repo');
        if (repoInput) repoInput.value = appState.repo;
    }
    
    // Load notifications
    loadNotifications();
    
    // Activate the current view (which will load its data)
    loadView(appState.currentView);
}

// Load notifications (simplified for this example)
function loadNotifications() {
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
    
    // Add sample notifications
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

// Logout functionality
function handleLogout() {
    appState.isAuthenticated = false;
    appState.currentUser = null;
    appState.token = null;
    appState.repo = null;
    appState.githubUsername = null;
    
    // Clear GitHub API headers
    appState.githubApi.headers.Authorization = '';
    
    // CRITICAL FIX: Properly switch views
    if (authView) authView.classList.add('active');
    if (appView) appView.classList.remove('active');
    
    // Clear content area
    if (contentArea) contentArea.innerHTML = '';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    initAuth();
    
    // Initialize app
    initApp();
    
    // If we're already authenticated, load initial data
    if (appState.isAuthenticated) {
        loadInitialData();
    }
});
