// Application State
const appState = {
    currentView: 'dashboard',
    isAuthenticated: true, // Force authenticated for testing
    currentUser: {
        name: 'John Doe',
        email: 'john@example.com'
    },
    token: 'ghp_testtoken123',
    repo: 'testuser/transport-data',
    githubUsername: 'testuser',
    notifications: [],
    githubApi: {
        baseUrl: 'https://api.github.com',
        headers: {
            'Authorization': 'token ghp_testtoken123',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    },
    viewInitializers: {}, // Store view initialization functions
    viewLoaders: {} // Store view data loading functions,
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

// Register a view initializer
appState.registerViewInitializer = function(viewName, initializer) {
    this.viewInitializers[viewName] = initializer;
};

// Register a view data loader
appState.registerViewLoader = function(viewName, loader) {
    this.viewLoaders[viewName] = loader;
};

// Initialize the application
function initApp() {
    console.log('DEBUG: initApp called');
    
    // Make sure notifications array is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    // Check if user is already authenticated
    checkAuthStatus();
    
    // Navigation
    navItems.forEach(item => {
        console.log('DEBUG: Setting up navigation for:', item);
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            console.log('DEBUG: Navigation click to view:', view);
            activateView(view);
        });
    });

    // Notification dropdown
    if (notificationBell) {
        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }

    // User dropdown
    if (userProfile) {
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
    
    // DEBUG: Force show the dashboard
    setTimeout(() => {
        console.log('DEBUG: Forcing dashboard view to be visible');
        activateView('dashboard');
    }, 500);
}

// Activate a view
function activateView(view) {
    console.log(`DEBUG: Activating view: ${view}`);
    
    // Update navigation highlights
    navItems.forEach(i => {
        i.classList.remove('active');
        if (i.getAttribute('data-view') === view) {
            i.classList.add('active');
        }
    });
    
    // Hide all views first
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    
    // Show selected view
    const viewElement = document.getElementById(`${view}-view`);
    if (viewElement) {
        appState.currentView = view;
        
        // Show the view immediately
        viewElement.classList.add('active');
        
        // Initialize the view if we have an initializer
        if (appState.viewInitializers[view]) {
            console.log(`DEBUG: Calling initializer for ${view}`);
            try {
                appState.viewInitializers[view]();
            } catch (error) {
                console.error(`DEBUG: Error in initializer for ${view}:`, error);
            }
        } else {
            console.log(`DEBUG: No initializer registered for view: ${view}`);
        }
        
        // Load data for the view
        if (appState.viewLoaders[view]) {
            console.log(`DEBUG: Calling loader for ${view}`);
            try {
                appState.viewLoaders[view]();
            } catch (error) {
                console.error(`DEBUG: Error loading data for ${view}:`, error);
            }
        } else {
            console.log(`DEBUG: No loader registered for view: ${view}`);
        }
    } else {
        console.error(`DEBUG: View element not found: ${view}-view`);
    }
}

// Check authentication status
function checkAuthStatus() {
    console.log('DEBUG: checkAuthStatus called');
    
    // Make sure notifications array is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    // DEBUG: Force authenticated state
    appState.isAuthenticated = true;
    
    if (appState.isAuthenticated) {
        console.log('DEBUG: User is authenticated');
        if (authView) authView.classList.remove('active');
        if (appView) appView.classList.add('active');
        
        // Activate the current view
        activateView(appState.currentView || 'dashboard');
    } else {
        console.log('DEBUG: User is not authenticated');
        if (authView) authView.classList.add('active');
        if (appView) appView.classList.remove('active');
    }
}

// Load initial data after login
function loadInitialData() {
    console.log('DEBUG: Loading initial data');
    
    // Set current repository in admin view
    if (appState.repo) {
        const repoInput = document.getElementById('current-repo');
        if (repoInput) repoInput.value = appState.repo;
    }
    
    // Load notifications
    loadNotifications();
    
    // Activate the current view (which will load its data)
    activateView(appState.currentView);
}

// Load notifications
function loadNotifications() {
    console.log('DEBUG: Loading notifications');
    
    // Ensure appState.notifications is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    const notificationList = document.getElementById('notification-dropdown');
    if (!notificationList) {
        console.error('DEBUG: Notification dropdown not found');
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
    console.log(`DEBUG: Marking notification as read: ${id}`);
    
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

// DEBUG: Force initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('DEBUG: DOM fully loaded and parsed');
    
    // DEBUG: Check if elements exist
    console.log('DEBUG: auth-view exists:', document.getElementById('auth-view') ? 'YES' : 'NO');
    console.log('DEBUG: app-view exists:', document.getElementById('app-view') ? 'YES' : 'NO');
    console.log('DEBUG: dashboard-view exists:', document.getElementById('dashboard-view') ? 'YES' : 'NO');
    
    // DEBUG: Force show all views
    setTimeout(() => {
        console.log('DEBUG: Forcing all views to be visible for debugging');
        document.querySelectorAll('.view').forEach(view => {
            view.style.display = 'block';
            view.style.visibility = 'visible';
            view.style.opacity = '1';
        });
    }, 1000);
    
    initApp();
    
    // If we're already authenticated, load initial data
    if (appState.isAuthenticated) {
        loadInitialData();
    }
});
