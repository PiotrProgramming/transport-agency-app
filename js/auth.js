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
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const token = document.getElementById('login-token').value;
    const repo = document.getElementById('login-repo').value;
    
    // Basic validation
    if (!email || !password || !token || !repo) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        // Verify token and repository access
        await verifyTokenAndRepoAccess(token, repo);
        
        // Set application state
        appState.isAuthenticated = true;
        appState.currentUser = { 
            name: email.split('@')[0].replace('.', ' ').replace(/^\w/, c => c.toUpperCase()),
            email: email 
        };
        appState.token = token;
        appState.repo = repo;
        
        // Initialize notifications array
        if (!appState.notifications) {
            appState.notifications = [];
        }
        
        // CRITICAL FIX: Properly switch views
        document.getElementById('auth-view').classList.remove('active');
        document.getElementById('app-view').classList.add('active');
        
        // Load initial data
        loadInitialData();
    } catch (error) {
        console.error('Login error:', error);
        alert(`Login failed: ${error.message}\n\nCheck your GitHub token and repository name.`);
    }
}

// Handle registration
async function handleRegistration() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const token = document.getElementById('register-token').value;
    const repoName = document.getElementById('register-repo').value;
    
    // Basic validation
    if (!email || !password || !token || !repoName) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        // Create repository and initialize data
        await createRepoAndFiles(token, repoName, { email, password });
        
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
        
        // CRITICAL FIX: Properly switch views
        document.getElementById('auth-view').classList.remove('active');
        document.getElementById('app-view').classList.add('active');
        
        // Load initial data
        loadInitialData();
    } catch (error) {
        console.error('Registration error:', error);
        alert(`Registration failed: ${error.message}\n\nCheck your GitHub token and repository name.`);
    }
}

// Verify token and repository access
async function verifyTokenAndRepoAccess(token, repo) {
    // Get user info to verify token
    const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` }
    });
    
    if (!userResponse.ok) {
        const error = await userResponse.json().catch(() => ({}));
        throw new Error(error.message || 'Invalid GitHub token');
    }
    
    const user = await userResponse.json();
    appState.githubUsername = user.login;
    
    // Parse repository name
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
        throw new Error('Repository name must be in "owner/repo" format');
    }
    
    // Check if repository exists
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: { Authorization: `token ${token}` }
    });
    
    if (!repoResponse.ok) {
        const error = await repoResponse.json().catch(() => ({}));
        throw new Error(error.message || 'Repository not found or access denied');
    }
}

// Create repository and initialize files
async function createRepoAndFiles(token, repoName, userData) {
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` }
    });
    
    if (!userResponse.ok) {
        const error = await userResponse.json().catch(() => ({}));
        throw new Error(error.message || 'Invalid GitHub token');
    }
    
    const user = await userResponse.json();
    appState.githubUsername = user.login;
    const owner = user.login;
    
    // Check if repository exists
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: { Authorization: `token ${token}` }
    });
    
    if (!repoResponse.ok) {
        // Create repository if it doesn't exist
        const createResponse = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: repoName,
                description: 'Transport and Forwarding Agency Data Repository',
                private: true,
                auto_init: true
            })
        });
        
        if (!createResponse.ok) {
            const error = await createResponse.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to create repository');
        }
        
        // Wait for GitHub to initialize the repository
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Initialize data files
    await initializeDataFiles(owner, repoName, token, userData);
}

// Initialize data files
async function initializeDataFiles(owner, repo, token, userData) {
    // Initial data structure
    const initialData = {
        drivers: [],
        cars: [],
        cards: [],
        tenders: [],
        invoices: [],
        users: [{
            id: 1,
            name: userData.email.split('@')[0].replace('.', ' ').replace(/^\w/, c => c.toUpperCase()),
            email: userData.email,
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
    await updateGitHubFile(owner, repo, token, 'drivers.json', initialData.drivers);
    await updateGitHubFile(owner, repo, token, 'cars.json', initialData.cars);
    await updateGitHubFile(owner, repo, token, 'cards.json', initialData.cards);
    await updateGitHubFile(owner, repo, token, 'tenders.json', initialData.tenders);
    await updateGitHubFile(owner, repo, token, 'invoices.json', initialData.invoices);
    await updateGitHubFile(owner, repo, token, 'users.json', initialData.users);
    await updateGitHubFile(owner, repo, token, 'statuses.json', initialData.statuses);
    await updateGitHubFile(owner, repo, token, 'chat/messages.json', []);
}

// Update GitHub file
async function updateGitHubFile(owner, repo, token, path, content) {
    try {
        // Get current file info if it exists
        let sha = null;
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: { Authorization: `token ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            sha = data.sha;
        }
        
        // Update file
        const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Initialize ${path}`,
                content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
                sha: sha
            })
        });
        
        if (!updateResponse.ok) {
            const error = await updateResponse.json().catch(() => ({}));
            throw new Error(error.message || `Failed to update ${path}`);
        }
    } catch (error) {
        throw new Error(`File update failed: ${error.message}`);
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
    document.getElementById('auth-view').classList.add('active');
    document.getElementById('app-view').classList.remove('active');
    
    // Clear content area
    document.getElementById('content-area').innerHTML = '';
}
