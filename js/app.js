// DOM Elements
let authView, appView, contentArea, navItems, notificationBell, notificationDropdown, 
    userProfile, userDropdown, logoutBtn;

// GitHub Service - Handles all GitHub API interactions
const githubService = {
    // Get file content from GitHub repository
    async getFileContent(path) {
        if (!appState.repo || !appState.token) {
            throw new Error('Repository and token must be set');
        }
        
        // Parse repository name with validation
        const repoParts = appState.repo.split('/');
        if (repoParts.length < 2) {
            throw new Error('Repository name must be in "owner/repo" format');
        }
        
        const owner = repoParts[0];
        const repo = repoParts.slice(1).join('/');
        
        try {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                { headers: this.getHeaders() }
            );
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `Failed to fetch ${path}`);
            }
            
            const data = await response.json();
            return JSON.parse(atob(data.content));
        } catch (error) {
            console.error(`GitHub API error (getFileContent ${path}):`, error);
            throw error;
        }
    },
    
    // Update file content in GitHub repository
    async updateFileContent(path, content, message = `Update ${path}`) {
        if (!appState.repo || !appState.token) {
            throw new Error('Repository and token must be set');
        }
        
        // Parse repository name with validation
        const repoParts = appState.repo.split('/');
        if (repoParts.length < 2) {
            throw new Error('Repository name must be in "owner/repo" format');
        }
        
        const owner = repoParts[0];
        const repo = repoParts.slice(1).join('/');
        
        try {
            // First get the current file info to get the SHA
            let sha = null;
            const fileInfoResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                { headers: this.getHeaders() }
            );
            
            if (fileInfoResponse.ok) {
                const fileInfo = await fileInfoResponse.json();
                sha = fileInfo.sha;
            }
            
            // Update the file
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                {
                    method: 'PUT',
                    headers: {
                        ...this.getHeaders(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
                        sha: sha
                    })
                }
            );
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `Failed to update ${path}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`GitHub API error (updateFileContent ${path}):`, error);
            throw error;
        }
    },
    
    // Get headers for GitHub API requests
    getHeaders() {
        return {
            'Authorization': `token ${appState.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }
};

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
                    initView(view);
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

// Initialize view-specific JavaScript
function initView(view) {
    console.log(`Initializing view: ${view}`);
    
    // This is where you would initialize view-specific JavaScript
    // For now, we'll just handle a few special cases
    
    switch(view) {
        case 'dashboard':
            if (typeof initDashboard === 'function') {
                initDashboard();
            }
            break;
        case 'drivers':
            if (typeof initDrivers === 'function') {
                initDrivers();
            }
            break;
        case 'cars':
            if (typeof initCars === 'function') {
                initCars();
            }
            break;
        case 'cards':
            if (typeof initCards === 'function') {
                initCards();
            }
            break;
        case 'tenders':
            if (typeof initTenders === 'function') {
                initTenders();
            }
            break;
        case 'invoices':
            if (typeof initInvoices === 'function') {
                initInvoices();
            }
            break;
        case 'reports':
            if (typeof initReports === 'function') {
                initReports();
            }
            break;
        case 'admin':
            if (typeof initAdmin === 'function') {
                initAdmin();
            }
            break;
        case 'chat':
            if (typeof initChat === 'function') {
                initChat();
            }
            break;
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
    if (typeof loadNotifications === 'function') {
        loadNotifications();
    }
    
    // Activate the current view (which will load its data)
    loadView(appState.currentView);
}

// Logout functionality
function handleLogout() {
    appState.isAuthenticated = false;
    appState.currentUser = null;
    appState.token = null;
    appState.repo = null;
    appState.githubUsername = null;
    
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
