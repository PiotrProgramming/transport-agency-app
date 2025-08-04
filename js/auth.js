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
    
    // In a real implementation, we would verify with GitHub API
    // For now, we'll simulate a successful login
    
    // Set application state
    appState.isAuthenticated = true;
    appState.currentUser = { 
        name: email.split('@')[0].replace('.', ' ').replace(/^\w/, c => c.toUpperCase()),
        email: email 
    };
    appState.token = token;
    appState.repo = repo;
    
    // Set GitHub API headers
    appState.githubApi.headers.Authorization = `token ${token}`;
    
    // Show the main application
    document.getElementById('auth-view').classList.remove('active');
    document.getElementById('app-view').classList.add('active');
    
    // Load initial data
    loadInitialData();
}

// Handle registration
function handleRegistration() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const token = document.getElementById('register-token').value;
    const repo = document.getElementById('register-repo').value;
    
    // Basic validation
    if (!email || !password || !token || !repo) {
        alert('Please fill in all fields');
        return;
    }
    
    // In a real implementation, we would:
    // 1. Verify GitHub token
    // 2. Create repository via GitHub API
    // 3. Initialize data structure in the repository
    
    // For demo purposes, we'll simulate repository creation
    const owner = email.split('@')[0];
    const repoName = repo;
    
    // Set application state
    appState.isAuthenticated = true;
    appState.currentUser = { 
        name: email.split('@')[0].replace('.', ' ').replace(/^\w/, c => c.toUpperCase()),
        email: email 
    };
    appState.token = token;
    appState.repo = `${owner}/${repoName}`;
    
    // Set GitHub API headers
    appState.githubApi.headers.Authorization = `token ${token}`;
    
    // Show success message
    alert(`Repository created: ${owner}/${repoName}\nData structure initialized.`);
    
    // Show the main application
    document.getElementById('auth-view').classList.remove('active');
    document.getElementById('app-view').classList.add('active');
    
    // Load initial data
    loadInitialData();
    
    // Initialize repository data
    initializeRepositoryData();
}

// Initialize repository data structure
function initializeRepositoryData() {
    // In a real implementation, we would create these files via GitHub API
    const dataStructure = [
        'drivers.json',
        'cars.json',
        'cards.json',
        'tenders.json',
        'invoices.json',
        'users.json',
        'statuses.json',
        'chat/',
        'chat/messages.json'
    ];
    
    console.log('Initializing repository data structure:', dataStructure);
    
    // Create initial data files
    createInitialDataFiles();
}

// Create initial data files
function createInitialDataFiles() {
    // In a real implementation, we would use GitHub API to create these files
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
    
    console.log('Created initial data files with sample structure');
}

// Logout functionality
function handleLogout() {
    appState.isAuthenticated = false;
    appState.currentUser = null;
    appState.token = null;
    appState.repo = null;
    
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
