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
    
    // Verify GitHub token and repository access
    verifyGitHubToken(token)
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
            
            // Show the main application
            document.getElementById('auth-view').classList.remove('active');
            document.getElementById('app-view').classList.add('active');
            
            // Load initial data
            loadInitialData();
        })
        .catch(error => {
            console.error('Login error:', error);
            alert(`Login failed: ${error.message}`);
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
    
    // Get GitHub username from token
    getGitHubUsername(token)
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
            alert(`Registration failed: ${error.message}`);
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
            throw new Error('Invalid GitHub token');
        }
        return response.json();
    })
    .then(data => {
        appState.githubUsername = data.login;
        return data.login;
    });
}

// Verify GitHub token
function verifyGitHubToken(token) {
    return fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid GitHub token');
        }
        return response.json();
    })
    .then(data => {
        appState.githubUsername = data.login;
    });
}

// Verify repository access
function verifyRepositoryAccess(repo) {
    const [owner, repoName] = repo.split('/');
    
    return fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
            'Authorization': `token ${appState.token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Repository not found or access denied');
        }
        return response.json();
    });
}

// Create repository
function createRepository(username, repoName) {
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
            if (response.status === 422) {
                throw new Error(`Repository "${repoName}" already exists`);
            }
            return response.json().then(data => {
                throw new Error(data.message || 'Failed to create repository');
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
            console.error('Failed to initialize repository data:', error);
            throw new Error('Failed to initialize repository data structure');
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
            return response.json().then(data => {
                throw new Error(data.message || `Failed to create ${filePath}`);
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
