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
            const response = await this._makeApiRequest(
                `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`
            );
            
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
            try {
                const fileInfoResponse = await this._makeApiRequest(
                    `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`
                );
                
                if (fileInfoResponse.ok) {
                    const fileInfo = await fileInfoResponse.json();
                    sha = fileInfo.sha;
                }
            } catch (error) {
                // File might not exist yet, which is fine
                if (error.message.includes('404')) {
                    console.log(`File ${path} not found, will create new`);
                } else {
                    throw error;
                }
            }
            
            // Update the file
            const response = await this._makeApiRequest(
                `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        message: message,
                        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
                        sha: sha
                    })
                }
            );
            
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
    },
    
    // Base URL for GitHub API
    get baseUrl() {
        return 'https://api.github.com';
    },
    
    // Make API request with retry logic
    async _makeApiRequest(url, options = {}) {
        const config = {
            maxRetries: 3,
            initialDelay: 1000,
            backoffFactor: 2
        };
        
        let lastError;
        
        for (let i = 0; i <= config.maxRetries; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        ...this.getHeaders(),
                        ...(options.headers || {})
                    }
                });
                
                // Handle rate limiting
                if (response.status === 403) {
                    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
                    if (rateLimitReset) {
                        const resetTime = new Date(parseInt(rateLimitReset) * 1000);
                        const waitTime = Math.max(0, resetTime - Date.now() + 1000);
                        
                        console.log(`GitHub API rate limited. Waiting ${waitTime}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }
                }
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
                }
                
                return response;
            } catch (error) {
                lastError = error;
                
                if (i < config.maxRetries) {
                    const delay = config.initialDelay * Math.pow(config.backoffFactor, i);
                    console.log(`Retry ${i+1}/${config.maxRetries} after ${delay}ms:`, error);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw lastError;
                }
            }
        }
        
        throw lastError;
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
        case 'dashboard':
            if (typeof DashboardModule !== 'undefined' && DashboardModule) {
                DashboardModule.init();
            } else {
                console.error('DashboardModule is not defined');
                loadView('dashboard');
            }
            break;
            
        case 'drivers':
            if (typeof DriversModule !== 'undefined' && DriversModule) {
                DriversModule.init();
            } else {
                console.error('DriversModule is not defined');
                // Give it one more chance to load
                setTimeout(() => {
                    if (typeof DriversModule !== 'undefined' && DriversModule) {
                        DriversModule.init();
                    } else {
                        if (contentArea) {
                            contentArea.innerHTML = `
                                <div class="error-message">
                                    <h3>Module Error</h3>
                                    <p>Drivers module is not loaded. Please refresh the page.</p>
                                    <button class="btn btn-primary" onclick="location.reload()">Refresh</button>
                                </div>
                            `;
                        }
                    }
                }, 200);
            }
            break;
            
        case 'cars':
            if (typeof CarsModule !== 'undefined' && CarsModule) {
                CarsModule.init();
            } else {
                console.error('CarsModule is not defined');
                setTimeout(() => {
                    if (typeof CarsModule !== 'undefined' && CarsModule) {
                        CarsModule.init();
                    }
                }, 200);
            }
            break;
            
        case 'cards':
            if (typeof CardsModule !== 'undefined' && CardsModule) {
                CardsModule.init();
            } else {
                console.error('CardsModule is not defined');
                setTimeout(() => {
                    if (typeof CardsModule !== 'undefined' && CardsModule) {
                        CardsModule.init();
                    }
                }, 200);
            }
            break;
            
        case 'tenders':
            if (typeof TendersModule !== 'undefined' && TendersModule) {
                TendersModule.init();
            } else {
                console.error('TendersModule is not defined');
                setTimeout(() => {
                    if (typeof TendersModule !== 'undefined' && TendersModule) {
                        TendersModule.init();
                    }
                }, 200);
            }
            break;
            
        case 'invoices':
            if (typeof InvoicesModule !== 'undefined' && InvoicesModule) {
                InvoicesModule.init();
            } else {
                console.error('InvoicesModule is not defined');
                setTimeout(() => {
                    if (typeof InvoicesModule !== 'undefined' && InvoicesModule) {
                        InvoicesModule.init();
                    }
                }, 200);
            }
            break;
            
        case 'reports':
            if (typeof ReportsModule !== 'undefined' && ReportsModule) {
                ReportsModule.init();
            } else {
                console.error('ReportsModule is not defined');
                setTimeout(() => {
                    if (typeof ReportsModule !== 'undefined' && ReportsModule) {
                        ReportsModule.init();
                    }
                }, 200);
            }
            break;
            
        case 'admin':
            if (typeof AdminModule !== 'undefined' && AdminModule) {
                AdminModule.init();
            } else {
                console.error('AdminModule is not defined');
                setTimeout(() => {
                    if (typeof AdminModule !== 'undefined' && AdminModule) {
                        AdminModule.init();
                    }
                }, 200);
            }
            break;
            
        case 'chat':
            if (typeof ChatModule !== 'undefined' && ChatModule) {
                ChatModule.init();
            } else {
                console.error('ChatModule is not defined');
                setTimeout(() => {
                    if (typeof ChatModule !== 'undefined' && ChatModule) {
                        ChatModule.init();
                    }
                }, 200);
            }
            break;
            
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
    if (typeof NotificationsModule !== 'undefined' && NotificationsModule) {
        NotificationsModule.loadNotifications();
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
    
    // Clear GitHub API headers
    appState.githubApi.headers.Authorization = '';
    
    // CRITICAL FIX: Properly switch views
    if (authView) authView.classList.add('active');
    if (appView) appView.classList.remove('active');
    
    // Clear content area
    if (contentArea) contentArea.innerHTML = '';
    
    // Reset modules
    for (const module in appState.modules) {
        appState.modules[module] = null;
    }
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
