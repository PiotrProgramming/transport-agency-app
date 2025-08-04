// DOM Elements
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

// Initialize authentication
function initAuth() {
    // Auth tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.getAttribute('data-tab');
            loginForm.style.display = tabName === 'login' ? 'block' : 'none';
            registerForm.style.display = tabName === 'register' ? 'block' : 'none';
        });
    });

    // Login functionality
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Registration functionality
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegistration);
    }
}

// Handle login
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const token = document.getElementById('login-token').value;
    const repo = document.getElementById('login-repo').value;
    
    // Basic validation
    if (!email || !password || !token || !repo) {
        alert('Please fill in all fields');
        return;
    }
    
    // Set GitHub API headers
    appState.githubApi.headers.Authorization = `token ${token}`;
    
    // First verify the token has proper permissions
    verifyGitHubTokenPermissions(token)
        .then(() => verifyRepositoryAccess(repo))
        .then(() => {
            // Set application state
            appState.isAuthenticated = true;
            appState.currentUser = { 
                name: email.split('@')[0].replace('.', ' ').replace(/^\w/, c => c.toUpperCase()),
                email: email 
            };
            appState.token = token;
            appState.repo = repo;
            
            // Initialize notifications array if not already done
            if (!appState.notifications) {
                appState.notifications = [];
            }
            
            // Show the main application
            document.getElementById('auth-view').classList.remove('active');
            document.getElementById('app-view').classList.add('active');
            
            // Load initial data
            loadInitialData();
        })
        .catch(error => {
            console.error('Login error:', error);
            let errorMessage = error.message;
            
            if (error.message.includes('Bad credentials')) {
                errorMessage = 'Invalid GitHub token. Make sure your token has "repo" permissions.';
            } else if (error.message.includes('Repository not found')) {
                errorMessage = 'Repository not found or you don\'t have access. Check the format (owner/repo).';
            }
            
            alert(`Login failed: ${errorMessage}\n\nTo fix this:\n1. Go to https://github.com/settings/tokens\n2. Create a new token with "repo" permissions\n3. Use the new token here`);
        });
}

// Handle registration
function handleRegistration() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const token = document.getElementById('register-token').value;
    const repoName = document.getElementById('register-repo').value;
    
    // Basic validation
    if (!email || !password || !token || !repoName) {
        alert('Please fill in all fields');
        return;
    }
    
    // Set GitHub API headers
    appState.githubApi.headers.Authorization = `token ${token}`;
    
    // First verify the token has proper permissions
    verifyGitHubTokenPermissions(token)
        .then(() => getGitHubUsername(token))
        .then(username => {
            // Create repository
            return createRepository(username, repoName);
        })
        .then(repo => {
            // Initialize repository data structure
            return initializeRepositoryData(repo.full_name);
        })
        .then(() => {
            // Set application state
            appState.isAuthenticated = true;
            appState.currentUser = { 
                name: email.split('@')[0].replace('.', ' ').replace(/^\w/, c => c.toUpperCase()),
                email: email 
            };
            appState.token = token;
            appState.repo = `${appState.githubUsername}/${repoName}`;
            
            // Initialize notifications array
            if (!appState.notifications) {
                appState.notifications = [];
            }
            
            // Show success message
            alert(`Repository created: ${appState.githubUsername}/${repoName}\nData structure initialized.`);
            
            // Show the main application
            document.getElementById('auth-view').classList.remove('active');
            document.getElementById('app-view').classList.add('active');
            
            // Load initial data
            loadInitialData();
        })
        .catch(error => {
            console.error('Registration error:', error);
            let errorMessage = error.message;
            
            if (error.message.includes('Bad credentials')) {
                errorMessage = 'Invalid GitHub token. Make sure your token has "repo" permissions.';
            } else if (error.message.includes('must have admin access')) {
                errorMessage = 'You need admin access to create repositories.';
            } else if (error.message.includes('Validation Failed')) {
                errorMessage = 'Repository name is invalid. Use only letters, numbers, and hyphens.';
            }
            
            alert(`Registration failed: ${errorMessage}\n\nTo fix this:\n1. Go to https://github.com/settings/tokens\n2. Create a new token with "repo" permissions\n3. Use the new token here`);
        });
}

// Verify GitHub token permissions - CORRECTED VERSION
function verifyGitHubTokenPermissions(token) {
    return fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => {
        // First check if the response is OK
        if (!response.ok) {
            return response.json()
                .then(data => {
                    throw new Error(data.message || `GitHub API error: ${response.status}`);
                })
                .catch(() => {
                    throw new Error(`GitHub API error: ${response.status}`);
                });
        }
        
        // Get the scopes from the response headers
        const scopes = response.headers.get('X-OAuth-Scopes') || '';
        
        // Check if token has repo scope
        if (!scopes.includes('repo')) {
            throw new Error('GitHub token missing "repo" permission. This is required for the application to work.');
        }
        
        // Return the user data
        return response.json();
    })
    .then(data => {
        appState.githubUsername = data.login;
        return data;
    });
}

// Get GitHub username from token
function getGitHubUsername(token) {
    return fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json()
                .then(data => {
                    throw new Error(data.message || 'Invalid GitHub token');
                })
                .catch(() => {
                    throw new Error('Invalid GitHub token');
                });
        }
        return response.json();
    })
    .then(data => {
        appState.githubUsername = data.login;
        return data.login;
    });
}

// Verify repository access
function verifyRepositoryAccess(repo) {
    const [owner, repoName] = repo.split('/');
    
    if (!owner || !repoName) {
        return Promise.reject(new Error('Repository name must be in "owner/repo" format'));
    }
    
    return fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
            'Authorization': `token ${appState.token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json()
                .then(data => {
                    if (response.status === 404) {
                        throw new Error(`Repository "${owner}/${repoName}" not found`);
                    }
                    if (response.status === 403) {
                        throw new Error(`Access denied to repository "${owner}/${repoName}"`);
                    }
                    throw new Error(data.message || 'Repository access verification failed');
                })
                .catch(() => {
                    if (response.status === 404) {
                        throw new Error(`Repository "${owner}/${repoName}" not found`);
                    }
                    if (response.status === 403) {
                        throw new Error(`Access denied to repository "${owner}/${repoName}"`);
                    }
                    throw new Error('Repository access verification failed');
                });
        }
        return response.json();
    });
}

// Create repository
function createRepository(username, repoName) {
    // Validate repository name
    if (!/^[a-zA-Z0-9][a-zA-Z0-9\-_.]*$/.test(repoName)) {
        return Promise.reject(new Error('Invalid repository name. Use only letters, numbers, hyphens, underscores, and periods.'));
    }
    
    return fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
            'Authorization': `token ${appState.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: repoName,
            description: 'Transport and Forwarding Agency Data Repository',
            private: true,
            auto_init: true
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json()
                .then(data => {
                    throw new Error(data.message || 'Failed to create repository');
                })
                .catch(() => {
                    throw new Error('Failed to create repository');
                });
        }
        return response.json();
    });
}

// Initialize repository data structure
function initializeRepositoryData(repoFullName) {
    const [owner, repo] = repoFullName.split('/');
    
    // First, create the initial data structure
    return createInitialDataFiles(owner, repo)
        .then(() => {
            console.log('Repository data structure initialized successfully');
        })
        .catch(error => {
            console.error('Failed to initialize repository data structure:', error);
            throw new Error('Failed to initialize repository data structure: ' + error.message);
        });
}

// Create initial data files
function createInitialDataFiles(owner, repo) {
    const initialData = {
        drivers: [],
        cars: [],
        cards: [],
        tenders: [],
        invoices: [],
        users: [{
            id: 1,
            name: appState.currentUser.name,
            email: appState.currentUser.email,
            role: 'Administrator',
            status: 'active',
            supervisor: null
        }],
        statuses: [
            { module: 'drivers', name: 'Available', color: '#38a169' },
            { module: 'drivers', name: 'On Duty', color: '#dd6b20' },
            { module: 'drivers', name: 'Maintenance', color: '#c53030' },
            { module: 'tenders', name: 'Unassigned', color: '#718096' },
            { module: 'tenders', name: 'Pending', color: '#dd6b20' },
            { module: 'tenders', name: 'Delivered', color: '#3182ce' },
            { module: 'tenders', name: 'Cancelled', color: '#c53030' },
            { module: 'tenders', name: 'Sold', color: '#38a169' },
            { module: 'invoices', name: 'Pending', color: '#dd6b20' },
            { module: 'invoices', name: 'Paid', color: '#38a169' },
            { module: 'invoices', name: 'Unpaid', color: '#c53030' },
            { module: 'invoices', name: 'Overdue', color: '#9f7aea' }
        ]
    };
    
    // Create each file
    return Promise.all([
        createFile(owner, repo, 'drivers.json', JSON.stringify(initialData.drivers, null, 2), 'Initial data structure'),
        createFile(owner, repo, 'cars.json', JSON.stringify(initialData.cars, null, 2), 'Initial data structure'),
        createFile(owner, repo, 'cards.json', JSON.stringify(initialData.cards, null, 2), 'Initial data structure'),
        createFile(owner, repo, 'tenders.json', JSON.stringify(initialData.tenders, null, 2), 'Initial data structure'),
        createFile(owner, repo, 'invoices.json', JSON.stringify(initialData.invoices, null, 2), 'Initial data structure'),
        createFile(owner, repo, 'users.json', JSON.stringify(initialData.users, null, 2), 'Initial data structure'),
        createFile(owner, repo, 'statuses.json', JSON.stringify(initialData.statuses, null, 2), 'Initial data structure'),
        createFile(owner, repo, 'chat/messages.json', JSON.stringify([], null, 2), 'Initial chat structure')
    ]);
}

// Create a file in the repository
function createFile(owner, repo, filePath, content, message) {
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    return fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${appState.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            content: encodedContent
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json()
                .then(data => {
                    throw new Error(`Failed to create ${filePath}: ${data.message || response.statusText}`);
                })
                .catch(() => {
                    throw new Error(`Failed to create ${filePath}: ${response.statusText}`);
                });
        }
        return response.json();
    });
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
    
    // Show login view
    document.getElementById('auth-view').classList.add('active');
    document.getElementById('app-view').classList.remove('active');
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

// Attach logout handler
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}
