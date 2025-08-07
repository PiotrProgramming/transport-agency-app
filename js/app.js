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
    },
    // Retry configuration for GitHub API
    apiRetryConfig: {
        maxRetries: 3,
        initialDelay: 1000,
        backoffFactor: 2
    }
};

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
        const config = appState.apiRetryConfig;
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
                
                // Initialize view-specific JavaScript AFTER the HTML is rendered
                setTimeout(() => {
                    initView(view);
                    loadData(view);
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
            initDashboard();
            break;
        case 'drivers':
            initDrivers();
            break;
        case 'cars':
            initCars();
            break;
        case 'cards':
            initCards();
            break;
        case 'tenders':
            initTenders();
            break;
        case 'invoices':
            initInvoices();
            break;
        case 'reports':
            initReports();
            break;
        case 'admin':
            initAdmin();
            break;
        case 'chat':
            initChat();
            break;
    }
}

// Load data for the current view
function loadData(view) {
    console.log(`Loading data for view: ${view}`);
    
    // This is where you would load data for the view
    // For now, we'll just handle a few special cases
    
    switch(view) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'drivers':
            loadDriversData();
            break;
        case 'cars':
            loadCarsData();
            break;
        case 'cards':
            loadCardsData();
            break;
        case 'tenders':
            loadTendersData();
            break;
        case 'invoices':
            loadInvoicesData();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'admin':
            loadAdminData();
            break;
        case 'chat':
            loadChatData();
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
    loadNotifications();
    
    // Activate the current view (which will load its data)
    loadView(appState.currentView);
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

// Initialize dashboard view
function initDashboard() {
    console.log('Initializing dashboard view');
}

// Load dashboard data
async function loadDashboardData() {
    console.log('Loading dashboard data');
    
    // Get the tenders table body
    const tendersTable = document.getElementById('dashboard-tenders');
    if (!tendersTable) {
        console.error('Dashboard tenders table not found');
        return;
    }
    
    // Clear existing content
    tendersTable.innerHTML = '';
    
    try {
        // REAL DATABASE CALL - Fetch tenders from GitHub
        const tenders = await githubService.getFileContent('tenders.json');
        
        // Render tenders
        tenders.forEach(tender => {
            // Determine status class
            let statusClass;
            switch(tender.status) {
                case 'available':
                    statusClass = 'status-available';
                    break;
                case 'pending':
                    statusClass = 'status-pending';
                    break;
                case 'delivered':
                    statusClass = 'status-delivered';
                    break;
                case 'cancelled':
                    statusClass = 'status-cancelled';
                    break;
                default:
                    statusClass = 'status-available';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${tender.id}</td>
                <td>${tender.route}</td>
                <td>${tender.loadingDate}</td>
                <td>${tender.unloadingDate}</td>
                <td>${tender.price}</td>
                <td><span class="status-badge ${statusClass}">${tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}</span></td>
                <td>${tender.driver ? tender.driver : 'Unassigned'}</td>
            `;
            tendersTable.appendChild(row);
        });
        
        console.log(`Successfully loaded ${tenders.length} tenders from database`);
    } catch (error) {
        console.error('Error loading tenders:', error);
        tendersTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: var(--dark-red);">
                    Error loading tenders: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Initialize drivers view
function initDrivers() {
    console.log('Initializing drivers view');
    
    // Set up event listeners for the add driver button
    const addDriverBtn = document.getElementById('add-driver-btn');
    if (addDriverBtn && !addDriverBtn.dataset.initialized) {
        addDriverBtn.addEventListener('click', showAddDriverForm);
        addDriverBtn.dataset.initialized = 'true';
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('drivers-status-filter');
    if (statusFilter && !statusFilter.dataset.initialized) {
        statusFilter.addEventListener('change', filterDrivers);
        statusFilter.dataset.initialized = 'true';
    }
}

// Load drivers data
async function loadDriversData() {
    const driversList = document.getElementById('drivers-list');
    const loadingIndicator = document.getElementById('drivers-loading');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    
    if (!driversList) {
        console.error('Drivers list container not found');
        return;
    }
    
    // Clear existing content
    driversList.innerHTML = '';
    
    try {
        // REAL DATABASE CALL - Fetch drivers from GitHub
        const drivers = await githubService.getFileContent('drivers.json');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Render drivers
        drivers.forEach(driver => {
            renderDriver(driver, driversList);
        });
        
        console.log(`Successfully loaded ${drivers.length} drivers from database`);
    } catch (error) {
        console.error('Error loading drivers:', error);
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        driversList.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Drivers</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadDriversData()">Retry</button>
            </div>
        `;
    }
}

// Render a single driver
function renderDriver(driver, driversList) {
    const driverSlip = document.createElement('div');
    driverSlip.className = 'driver-slip';
    driverSlip.dataset.id = driver.id;
    
    // Determine status class and text
    let statusClass, statusText;
    switch(driver.status) {
        case 'available':
            statusClass = 'status-available';
            statusText = 'Available';
            break;
        case 'on-duty':
            statusClass = 'status-pending';
            statusText = 'On Duty';
            break;
        case 'maintenance':
            statusClass = 'status-cancelled';
            statusText = 'Maintenance';
            break;
        default:
            statusClass = 'status-available';
            statusText = 'Available';
    }
    
    driverSlip.innerHTML = `
        <div class="driver-header">
            <div class="driver-name">${driver.firstName} ${driver.lastName}</div>
            <div class="driver-status ${statusClass}">${statusText}</div>
        </div>
        <div class="driver-details">
            <div>
                <span class="detail-label">License:</span> ${driver.license}
            </div>
            <div>
                <span class="detail-label">Experience:</span> ${driver.experience}
            </div>
            <div>
                <span class="detail-label">Assigned Car:</span> ${driver.car ? driver.car : 'Unassigned'}
            </div>
            <div>
                <span class="detail-label">Assigned Card:</span> ${driver.card ? driver.card : 'Unassigned'}
            </div>
            <div>
                <span class="detail-label">Tenders:</span> ${driver.tenders ? driver.tenders : '0 (0 active)'}
            </div>
            <div>
                <span class="detail-label">Last Delivery:</span> ${driver.lastDelivery ? driver.lastDelivery : 'Never'}
            </div>
        </div>
    `;
    
    // Add click handler for detailed view
    driverSlip.addEventListener('click', () => {
        showDriverDetails(driver);
    });
    
    driversList.appendChild(driverSlip);
}

// Show driver details
function showDriverDetails(driver) {
    alert(`Detailed view for ${driver.firstName} ${driver.lastName}\nIn a real implementation, this would show all driver details and current tenders.`);
}

// Show add driver form
async function showAddDriverForm() {
    const name = prompt('Enter driver first name:');
    if (!name) return;
    
    const lastName = prompt('Enter driver last name:');
    if (!lastName) return;
    
    const license = prompt('Enter driver license number:', 'DL-');
    if (!license) return;
    
    const experience = prompt('Enter driver experience:', '0 years');
    if (!experience) return;
    
    try {
        // REAL DATABASE CALL - Fetch existing drivers to generate new ID
        const drivers = await githubService.getFileContent('drivers.json');
        const newId = drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1;
        
        // Create new driver object
        const newDriver = {
            id: newId,
            firstName: name,
            lastName: lastName,
            license: license,
            experience: experience,
            car: null,
            card: null,
            tenders: '0 (0 active)',
            lastDelivery: 'Never',
            status: 'available'
        };
        
        // Add to existing drivers array
        drivers.push(newDriver);
        
        // REAL DATABASE CALL - Save updated drivers to GitHub
        await githubService.updateFileContent('drivers.json', drivers, 'Add new driver');
        
        // Add to UI
        const driversList = document.getElementById('drivers-list');
        if (driversList) {
            renderDriver(newDriver, driversList);
        }
        
        alert(`Driver ${name} ${lastName} added successfully!`);
    } catch (error) {
        console.error('Error adding driver:', error);
        alert(`Failed to add driver: ${error.message}`);
    }
}

// Filter drivers by status
function filterDrivers() {
    const statusFilter = document.getElementById('drivers-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const driverSlips = document.querySelectorAll('.driver-slip');
    driverSlips.forEach(slip => {
        if (filterValue === 'all' || slip.querySelector('.driver-status').textContent.toLowerCase().includes(filterValue)) {
            slip.style.display = 'block';
        } else {
            slip.style.display = 'none';
        }
    });
}

// Initialize cars view
function initCars() {
    console.log('Initializing cars view');
    
    // Set up event listeners for the add car button
    const addCarBtn = document.getElementById('add-car-btn');
    if (addCarBtn && !addCarBtn.dataset.initialized) {
        addCarBtn.addEventListener('click', showAddCarForm);
        addCarBtn.dataset.initialized = 'true';
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('cars-status-filter');
    if (statusFilter && !statusFilter.dataset.initialized) {
        statusFilter.addEventListener('change', filterCars);
        statusFilter.dataset.initialized = 'true';
    }
}

// Load cars data
async function loadCarsData() {
    const carsList = document.getElementById('cars-list');
    
    if (!carsList) {
        console.error('Cars list container not found');
        return;
    }
    
    // Clear existing content
    carsList.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                <div class="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </td>
        </tr>
    `;
    
    try {
        // REAL DATABASE CALL - Fetch cars from GitHub
        const cars = await githubService.getFileContent('cars.json');
        
        // Clear loading indicator
        carsList.innerHTML = '';
        
        // Render cars
        cars.forEach(car => {
            renderCar(car, carsList);
        });
        
        console.log(`Successfully loaded ${cars.length} cars from database`);
    } catch (error) {
        console.error('Error loading cars:', error);
        carsList.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="error-message" style="width: 100%; margin: 0;">
                        <h3>Error Loading Cars</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadCarsData()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Render a single car
function renderCar(car, carsList) {
    const row = document.createElement('tr');
    row.dataset.id = car.id;
    
    // Determine status class and text
    let statusClass, statusText;
    switch(car.status) {
        case 'available':
            statusClass = 'status-available';
            statusText = 'Available';
            break;
        case 'in-use':
            statusClass = 'status-pending';
            statusText = 'In Use';
            break;
        case 'maintenance':
            statusClass = 'status-cancelled';
            statusText = 'Maintenance';
            break;
        default:
            statusClass = 'status-available';
            statusText = 'Available';
    }
    
    row.innerHTML = `
        <td>${car.tractorPlate}</td>
        <td>${car.trailerPlate}</td>
        <td>${car.maxWeight}</td>
        <td>${car.loadingSpace}</td>
        <td>${car.insurance}</td>
        <td>${car.inspection}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${car.driver ? car.driver : 'Unassigned'}</td>
    `;
    
    carsList.appendChild(row);
}

// Show add car form
async function showAddCarForm() {
    const tractorPlate = prompt('Enter tractor plate number:');
    if (!tractorPlate) return;
    
    const trailerPlate = prompt('Enter trailer plate number:');
    if (!trailerPlate) return;
    
    const maxWeight = prompt('Enter max weight capacity:', '24,000 kg');
    if (!maxWeight) return;
    
    const loadingSpace = prompt('Enter loading space dimensions:', '13.6m x 2.45m x 2.7m (90.8 m³)');
    if (!loadingSpace) return;
    
    const insurance = prompt('Enter insurance expiry date:', 'Jan 1, 2024');
    if (!insurance) return;
    
    const inspection = prompt('Enter inspection expiry date:', 'Dec 1, 2023');
    if (!inspection) return;
    
    try {
        // REAL DATABASE CALL - Fetch existing cars to generate new ID
        const cars = await githubService.getFileContent('cars.json');
        const newId = cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1;
        
        // Create new car object
        const newCar = {
            id: newId,
            tractorPlate: tractorPlate,
            trailerPlate: trailerPlate,
            maxWeight: maxWeight,
            loadingSpace: loadingSpace,
            insurance: insurance,
            inspection: inspection,
            status: 'available',
            driver: null
        };
        
        // Add to existing cars array
        cars.push(newCar);
        
        // REAL DATABASE CALL - Save updated cars to GitHub
        await githubService.updateFileContent('cars.json', cars, 'Add new car');
        
        // Add to UI
        const carsList = document.getElementById('cars-list');
        if (carsList) {
            renderCar(newCar, carsList);
        }
        
        alert(`Car ${tractorPlate} added successfully!`);
    } catch (error) {
        console.error('Error adding car:', error);
        alert(`Failed to add car: ${error.message}`);
    }
}

// Filter cars by status
function filterCars() {
    const statusFilter = document.getElementById('cars-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const carRows = document.querySelectorAll('#cars-list tr');
    carRows.forEach(row => {
        const statusText = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';
        if (filterValue === 'all' || statusText.includes(filterValue)) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize cards view
function initCards() {
    console.log('Initializing cards view');
    
    // Set up event listeners for the add card button
    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn && !addCardBtn.dataset.initialized) {
        addCardBtn.addEventListener('click', showAddCardForm);
        addCardBtn.dataset.initialized = 'true';
    }
    
    // Initialize drag and drop
    initDragAndDrop();
}

// Load cards data
async function loadCardsData() {
    const cardsList = document.getElementById('cards-list');
    
    if (!cardsList) {
        console.error('Cards list container not found');
        return;
    }
    
    // Clear existing content
    cardsList.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                <div class="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </td>
        </tr>
    `;
    
    try {
        // REAL DATABASE CALL - Fetch cards from GitHub
        const cards = await githubService.getFileContent('cards.json');
        
        // Clear loading indicator
        cardsList.innerHTML = '';
        
        // Render cards
        cards.forEach(card => {
            renderCard(card, cardsList);
        });
        
        // Initialize drag and drop areas
        initAssignmentAreas();
        
        console.log(`Successfully loaded ${cards.length} cards from database`);
    } catch (error) {
        console.error('Error loading cards:', error);
        cardsList.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="error-message" style="width: 100%; margin: 0;">
                        <h3>Error Loading Cards</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadCardsData()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Render a single card
function renderCard(card, cardsList) {
    const row = document.createElement('tr');
    row.dataset.id = card.id;
    
    // Determine status class and text
    let statusClass, statusText;
    switch(card.status) {
        case 'active':
            statusClass = 'status-available';
            statusText = 'Active';
            break;
        case 'expired':
            statusClass = 'status-cancelled';
            statusText = 'Expired';
            break;
        default:
            statusClass = 'status-available';
            statusText = 'Active';
    }
    
    row.innerHTML = `
        <td>${card.number}</td>
        <td>${card.pin}</td>
        <td>${card.expiry}</td>
        <td>${card.assignedTo ? card.assignedTo : 'Unassigned'}</td>
        <td>${card.vehicle ? card.vehicle : 'Unassigned'}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
            <button class="btn btn-outline edit-card" data-id="${card.id}" style="padding:5px 10px; font-size:14px;">Edit</button>
        </td>
    `;
    
    cardsList.appendChild(row);
    
    // Add edit button handler
    const editBtn = row.querySelector('.edit-card');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editCard(card);
        });
    }
}

// Show add card form
async function showAddCardForm() {
    const number = prompt('Enter card number (last 4 digits):');
    if (!number) return;
    
    const pin = prompt('Enter card PIN:');
    if (!pin) return;
    
    const expiry = prompt('Enter card expiry date (MM/YY):');
    if (!expiry) return;
    
    try {
        // REAL DATABASE CALL - Fetch existing cards to generate new ID
        const cards = await githubService.getFileContent('cards.json');
        const newId = cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1;
        
        // Create new card object
        const newCard = {
            id: newId,
            number: '**** ' + number,
            pin: '••••',
            expiry: expiry,
            assignedTo: null,
            vehicle: null,
            status: 'active'
        };
        
        // Add to existing cards array
        cards.push(newCard);
        
        // REAL DATABASE CALL - Save updated cards to GitHub
        await githubService.updateFileContent('cards.json', cards, 'Add new card');
        
        // Add to UI
        const cardsList = document.getElementById('cards-list');
        if (cardsList) {
            renderCard(newCard, cardsList);
        }
        
        alert(`Card **** ${number} added successfully!`);
    } catch (error) {
        console.error('Error adding card:', error);
        alert(`Failed to add card: ${error.message}`);
    }
}

// Edit card
async function editCard(card) {
    const newExpiry = prompt('Enter new expiry date (MM/YY):', card.expiry);
    if (!newExpiry) return;
    
    try {
        // REAL DATABASE CALL - Fetch existing cards
        const cards = await githubService.getFileContent('cards.json');
        
        // Find and update the card
        const cardIndex = cards.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
            cards[cardIndex].expiry = newExpiry;
            
            // REAL DATABASE CALL - Save updated cards to GitHub
            await githubService.updateFileContent('cards.json', cards, 'Update card expiry');
            
            // Update UI
            const row = document.querySelector(`#cards-list tr[data-id="${card.id}"]`);
            if (row) {
                const cells = row.querySelectorAll('td');
                cells[2].textContent = newExpiry;
            }
            
            alert('Card updated successfully!');
        } else {
            alert('Card not found in database');
        }
    } catch (error) {
        console.error('Error updating card:', error);
        alert(`Failed to update card: ${error.message}`);
    }
}

// Initialize drag and drop areas
async function initAssignmentAreas() {
    const assignmentContainer = document.getElementById('assignment-container');
    if (!assignmentContainer) return;
    
    // Clear existing content
    assignmentContainer.innerHTML = '';
    
    try {
        // REAL DATABASE CALL - Fetch drivers and cards from GitHub
        const drivers = await githubService.getFileContent('drivers.json');
        const cards = await githubService.getFileContent('cards.json');
        
        // Create drivers area
        const driversArea = document.createElement('div');
        driversArea.style.flex = '1';
        driversArea.style.background = 'var(--light-gray)';
        driversArea.style.padding = '20px';
        driversArea.style.borderRadius = 'var(--border-radius)';
        driversArea.innerHTML = '<h3 style="margin-bottom: 15px;">Available Drivers</h3>';
        
        // Add drivers
        drivers.forEach(driver => {
            const driverElement = document.createElement('div');
            driverElement.className = 'driver-slip';
            driverElement.draggable = true;
            driverElement.dataset.type = 'driver';
            driverElement.dataset.id = driver.id;
            driverElement.innerHTML = `
                <div class="driver-name">${driver.firstName} ${driver.lastName}</div>
                <div class="driver-status" style="margin-top: 5px; font-size: 12px;">
                    Status: ${driver.status === 'available' ? 'Available' : driver.status === 'on-duty' ? 'On Duty' : 'Maintenance'}
                </div>
            `;
            driversArea.appendChild(driverElement);
        });
        
        // Create cards area
        const cardsArea = document.createElement('div');
        cardsArea.style.flex = '1';
        cardsArea.style.background = 'var(--light-gray)';
        cardsArea.style.padding = '20px';
        cardsArea.style.borderRadius = 'var(--border-radius)';
        cardsArea.innerHTML = '<h3 style="margin-bottom: 15px;">Available Cards</h3>';
        
        // Add cards
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'driver-slip';
            cardElement.draggable = true;
            cardElement.dataset.type = 'card';
            cardElement.dataset.id = card.id;
            cardElement.innerHTML = `
                <div class="driver-name">Card: ${card.number}</div>
                <div class="driver-status" style="margin-top: 5px; font-size: 12px;">
                    Status: ${card.status === 'active' ? 'Active' : 'Expired'}
                </div>
            `;
            cardsArea.appendChild(cardElement);
        });
        
        // Add areas to container
        assignmentContainer.appendChild(driversArea);
        assignmentContainer.appendChild(cardsArea);
    } catch (error) {
        console.error('Error initializing assignment areas:', error);
        assignmentContainer.innerHTML = `
            <div class="error-message" style="padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: var(--dark-red); margin-bottom: 10px;">Error Loading Assignment Areas</h3>
                <p style="color: var(--secondary);">${error.message}</p>
            </div>
        `;
    }
}

// Initialize drag and drop
function initDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.draggable) {
            e.dataTransfer.setData('text/plain', e.target.dataset.id);
            e.target.classList.add('dragging');
        }
    });
    
    document.addEventListener('dragend', (e) => {
        if (e.target.draggable) {
            e.target.classList.remove('dragging');
        }
    });
    
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('drop', async (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const draggable = document.querySelector(`[data-id="${id}"]`);
        
        if (draggable && e.target.closest('.driver-slip')) {
            const target = e.target.closest('.driver-slip');
            const targetType = target.dataset.type;
            const draggedType = draggable.dataset.type;
            
            // Only allow certain combinations
            if ((draggedType === 'driver' && targetType === 'card') || 
                (draggedType === 'card' && targetType === 'driver')) {
                
                try {
                    // REAL DATABASE CALL - Update assignment in GitHub
                    if (draggedType === 'driver') {
                        await updateCardAssignment(id, target.dataset.id);
                    } else {
                        await updateDriverAssignment(target.dataset.id, id);
                    }
                    
                    // Visual feedback
                    if (draggedType === 'driver') {
                        target.innerHTML += `<div style="margin-top: 5px; color: var(--accent);">Assigned: ${draggable.querySelector('.driver-name').textContent}</div>`;
                    } else {
                        target.innerHTML += `<div style="margin-top: 5px; color: var(--accent);">Assigned Card: ${draggable.querySelector('.driver-name').textContent}</div>`;
                    }
                    
                    alert('Assignment created successfully!');
                } catch (error) {
                    console.error('Error creating assignment:', error);
                    alert(`Failed to create assignment: ${error.message}`);
                }
            }
        }
    });
}

// Update card assignment
async function updateCardAssignment(driverId, cardId) {
    try {
        // REAL DATABASE CALL - Fetch drivers and cards
        const drivers = await githubService.getFileContent('drivers.json');
        const cards = await githubService.getFileContent('cards.json');
        
        // Find the driver and card
        const driver = drivers.find(d => d.id == driverId);
        const card = cards.find(c => c.id == cardId);
        
        if (driver && card) {
            // Update assignments
            card.assignedTo = `${driver.firstName} ${driver.lastName}`;
            
            // REAL DATABASE CALL - Save updated data to GitHub
            await Promise.all([
                githubService.updateFileContent('drivers.json', drivers, 'Update driver assignment'),
                githubService.updateFileContent('cards.json', cards, 'Update card assignment')
            ]);
        } else {
            throw new Error('Driver or card not found');
        }
    } catch (error) {
        console.error('Error updating card assignment:', error);
        throw error;
    }
}

// Update driver assignment
async function updateDriverAssignment(driverId, cardId) {
    try {
        // REAL DATABASE CALL - Fetch drivers and cards
        const drivers = await githubService.getFileContent('drivers.json');
        const cards = await githubService.getFileContent('cards.json');
        
        // Find the driver and card
        const driver = drivers.find(d => d.id == driverId);
        const card = cards.find(c => c.id == cardId);
        
        if (driver && card) {
            // Update assignments
            driver.card = card.number;
            
            // REAL DATABASE CALL - Save updated data to GitHub
            await Promise.all([
                githubService.updateFileContent('drivers.json', drivers, 'Update driver assignment'),
                githubService.updateFileContent('cards.json', cards, 'Update card assignment')
            ]);
        } else {
            throw new Error('Driver or card not found');
        }
    } catch (error) {
        console.error('Error updating driver assignment:', error);
        throw error;
    }
}

// Initialize tenders view
function initTenders() {
    console.log('Initializing tenders view');
    
    // Set up event listeners for the add tender button
    const addTenderBtn = document.getElementById('add-tender-btn');
    if (addTenderBtn && !addTenderBtn.dataset.initialized) {
        addTenderBtn.addEventListener('click', showAddTenderForm);
        addTenderBtn.dataset.initialized = 'true';
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('tenders-status-filter');
    if (statusFilter && !statusFilter.dataset.initialized) {
        statusFilter.addEventListener('change', filterTenders);
        statusFilter.dataset.initialized = 'true';
    }
}

// Load tenders data
async function loadTendersData() {
    const tendersList = document.getElementById('tenders-list');
    
    if (!tendersList) {
        console.error('Tenders list container not found');
        return;
    }
    
    // Clear existing content
    tendersList.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                <div class="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </td>
        </tr>
    `;
    
    try {
        // REAL DATABASE CALL - Fetch tenders from GitHub
        const tenders = await githubService.getFileContent('tenders.json');
        
        // Clear loading indicator
        tendersList.innerHTML = '';
        
        // Render tenders
        tenders.forEach(tender => {
            renderTender(tender, tendersList);
        });
        
        console.log(`Successfully loaded ${tenders.length} tenders from database`);
    } catch (error) {
        console.error('Error loading tenders:', error);
        tendersList.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="error-message" style="width: 100%; margin: 0;">
                        <h3>Error Loading Tenders</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadTendersData()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Render a single tender
function renderTender(tender, tendersList) {
    const row = document.createElement('tr');
    row.dataset.id = tender.id;
    
    // Determine status class and text
    let statusClass, statusText;
    switch(tender.status) {
        case 'available':
            statusClass = 'status-available';
            statusText = 'Available';
            break;
        case 'pending':
            statusClass = 'status-pending';
            statusText = 'Pending';
            break;
        case 'delivered':
            statusClass = 'status-delivered';
            statusText = 'Delivered';
            break;
        case 'cancelled':
            statusClass = 'status-cancelled';
            statusText = 'Cancelled';
            break;
        case 'sold':
            statusClass = 'status-sold';
            statusText = 'Sold';
            break;
        default:
            statusClass = 'status-available';
            statusText = 'Available';
    }
    
    row.innerHTML = `
        <td>#${tender.id}</td>
        <td>${tender.route}</td>
        <td>${tender.loadingDate}</td>
        <td>${tender.unloadingDate}</td>
        <td>${tender.price}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${tender.driver ? tender.driver : 'Unassigned'}</td>
        <td>
            <button class="btn btn-outline ${tender.status === 'available' ? 'assign-tender' : 'tender-details'}" 
                data-id="${tender.id}" style="padding:5px 10px; font-size:14px;">${tender.status === 'available' ? 'Assign' : 'Details'}</button>
        </td>
    `;
    
    tendersList.appendChild(row);
    
    // Add button handler
    const actionBtn = row.querySelector('button');
    if (actionBtn) {
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (tender.status === 'available') {
                assignTender(tender);
            } else {
                showTenderDetails(tender);
            }
        });
    }
}

// Show add tender form
async function showAddTenderForm() {
    const route = prompt('Enter route (e.g., Berlin → Paris):');
    if (!route) return;
    
    const loadingDate = prompt('Enter loading date (e.g., Oct 25, 2023):');
    if (!loadingDate) return;
    
    const unloadingDate = prompt('Enter unloading date (e.g., Oct 27, 2023):');
    if (!unloadingDate) return;
    
    const price = prompt('Enter price (e.g., $3,750):');
    if (!price) return;
    
    try {
        // REAL DATABASE CALL - Fetch existing tenders to generate new ID
        const tenders = await githubService.getFileContent('tenders.json');
        const newId = tenders.length > 0 ? Math.max(...tenders.map(t => t.id)) + 1 : 1;
        
        // Create new tender object
        const newTender = {
            id: newId,
            route: route,
            loadingDate: loadingDate,
            unloadingDate: unloadingDate,
            price: price,
            status: 'available',
            driver: null
        };
        
        // Add to existing tenders array
        tenders.push(newTender);
        
        // REAL DATABASE CALL - Save updated tenders to GitHub
        await githubService.updateFileContent('tenders.json', tenders, 'Add new tender');
        
        // Add to UI
        const tendersList = document.getElementById('tenders-list');
        if (tendersList) {
            renderTender(newTender, tendersList);
        }
        
        alert(`Tender #${newId} added successfully!`);
    } catch (error) {
        console.error('Error adding tender:', error);
        alert(`Failed to add tender: ${error.message}`);
    }
}

// Assign tender to driver
async function assignTender(tender) {
    try {
        // REAL DATABASE CALL - Fetch drivers
        const drivers = await githubService.getFileContent('drivers.json');
        
        // Create a list of available drivers
        const availableDrivers = drivers.filter(d => d.status === 'available');
        if (availableDrivers.length === 0) {
            alert('No available drivers found');
            return;
        }
        
        // Prompt for driver selection
        const driverNames = availableDrivers.map(d => `${d.firstName} ${d.lastName}`).join('\n');
        const selectedDriverName = prompt(`Select a driver:\n${driverNames}`, availableDrivers[0].firstName + ' ' + availableDrivers[0].lastName);
        if (!selectedDriverName) return;
        
        // Find the selected driver
        const selectedDriver = drivers.find(d => 
            `${d.firstName} ${d.lastName}`.toLowerCase() === selectedDriverName.toLowerCase()
        );
        
        if (selectedDriver) {
            // REAL DATABASE CALL - Fetch existing tenders
            const tenders = await githubService.getFileContent('tenders.json');
            
            // Find and update the tender
            const tenderIndex = tenders.findIndex(t => t.id === tender.id);
            if (tenderIndex !== -1) {
                tenders[tenderIndex].status = 'pending';
                tenders[tenderIndex].driver = `${selectedDriver.firstName} ${selectedDriver.lastName}`;
                
                // Update driver status
                selectedDriver.status = 'on-duty';
                
                // REAL DATABASE CALL - Save updated data to GitHub
                await Promise.all([
                    githubService.updateFileContent('tenders.json', tenders, 'Assign tender'),
                    githubService.updateFileContent('drivers.json', drivers, 'Update driver status')
                ]);
                
                // Update UI
                const row = document.querySelector(`#tenders-list tr[data-id="${tender.id}"]`);
                if (row) {
                    const cells = row.querySelectorAll('td');
                    cells[6].textContent = `${selectedDriver.firstName} ${selectedDriver.lastName}`;
                    cells[5].innerHTML = '<span class="status-badge status-pending">Pending</span>';
                    cells[7].innerHTML = '<button class="btn btn-outline tender-details" style="padding:5px 10px; font-size:14px;">Details</button>';
                    
                    // Update button handler
                    const actionBtn = row.querySelector('button');
                    if (actionBtn) {
                        actionBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            showTenderDetails({...tender, driver: `${selectedDriver.firstName} ${selectedDriver.lastName}`, status: 'pending'});
                        });
                    }
                }
                
                alert(`Tender #${tender.id} assigned to ${selectedDriver.firstName} ${selectedDriver.lastName}!`);
            } else {
                alert('Tender not found in database');
            }
        } else {
            alert('Selected driver not found');
        }
    } catch (error) {
        console.error('Error assigning tender:', error);
        alert(`Failed to assign tender: ${error.message}`);
    }
}

// Show tender details
function showTenderDetails(tender) {
    let additionalInfo = '';
    
    if (tender.status === 'sold') {
        additionalInfo = `\nSold for: ${tender.soldPrice}\nPayment terms: ${tender.paymentTerms} days`;
    }
    
    alert(`Tender #${tender.id} Details:\nRoute: ${tender.route}\nLoading: ${tender.loadingDate}\nUnloading: ${tender.unloadingDate}\nPrice: ${tender.price}\nStatus: ${tender.status}\nDriver: ${tender.driver}${additionalInfo}\n\nThis would show a detailed view with all tender information.`);
}

// Filter tenders by status
function filterTenders() {
    const statusFilter = document.getElementById('tenders-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const tenderRows = document.querySelectorAll('#tenders-list tr');
    tenderRows.forEach(row => {
        const statusText = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';
        if (filterValue === 'all' || 
            (filterValue === 'unassigned' && statusText === 'available' && row.querySelector('td:nth-child(7)').textContent === 'Unassigned') ||
            (filterValue !== 'unassigned' && statusText.includes(filterValue))) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize invoices view
function initInvoices() {
    console.log('Initializing invoices view');
    
    // Set up event listeners for the add invoice button
    const addInvoiceBtn = document.getElementById('add-invoice-btn');
    if (addInvoiceBtn && !addInvoiceBtn.dataset.initialized) {
        addInvoiceBtn.addEventListener('click', showAddInvoiceForm);
        addInvoiceBtn.dataset.initialized = 'true';
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('invoices-status-filter');
    if (statusFilter && !statusFilter.dataset.initialized) {
        statusFilter.addEventListener('change', filterInvoices);
        statusFilter.dataset.initialized = 'true';
    }
}

// Load invoices data
async function loadInvoicesData() {
    const invoicesList = document.getElementById('invoices-list');
    
    if (!invoicesList) {
        console.error('Invoices list container not found');
        return;
    }
    
    // Clear existing content
    invoicesList.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                <div class="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </td>
        </tr>
    `;
    
    try {
        // REAL DATABASE CALL - Fetch invoices from GitHub
        const invoices = await githubService.getFileContent('invoices.json');
        
        // Clear loading indicator
        invoicesList.innerHTML = '';
        
        // Render invoices
        invoices.forEach(invoice => {
            renderInvoice(invoice, invoicesList);
        });
        
        console.log(`Successfully loaded ${invoices.length} invoices from database`);
    } catch (error) {
        console.error('Error loading invoices:', error);
        invoicesList.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="error-message" style="width: 100%; margin: 0;">
                        <h3>Error Loading Invoices</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadInvoicesData()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Render a single invoice
function renderInvoice(invoice, invoicesList) {
    const row = document.createElement('tr');
    row.dataset.id = invoice.id;
    
    // Determine status class and text
    let statusClass, statusText;
    switch(invoice.status) {
        case 'pending':
            statusClass = 'status-pending';
            statusText = 'Pending';
            break;
        case 'paid':
            statusClass = 'status-delivered';
            statusText = 'Paid';
            break;
        case 'unpaid':
            statusClass = 'status-cancelled';
            statusText = 'Unpaid';
            break;
        case 'overdue':
            statusClass = 'status-cancelled';
            statusText = 'Overdue';
            break;
        default:
            statusClass = 'status-pending';
            statusText = 'Pending';
    }
    
    row.innerHTML = `
        <td>#${invoice.id}</td>
        <td>${invoice.client}</td>
        <td>${invoice.issueDate}</td>
        <td>${invoice.dueDate}</td>
        <td>${invoice.amount}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${invoice.paymentTerms}</td>
    `;
    
    invoicesList.appendChild(row);
}

// Show add invoice form
async function showAddInvoiceForm() {
    const client = prompt('Enter client name:');
    if (!client) return;
    
    const issueDate = prompt('Enter issue date (e.g., Sep 25, 2023):');
    if (!issueDate) return;
    
    const dueDate = prompt('Enter due date (e.g., Oct 25, 2023):');
    if (!dueDate) return;
    
    const amount = prompt('Enter amount (e.g., $12,450):');
    if (!amount) return;
    
    const paymentTerms = prompt('Enter payment terms (e.g., Net 30):', 'Net 30');
    if (!paymentTerms) return;
    
    try {
        // REAL DATABASE CALL - Fetch existing invoices to generate new ID
        const invoices = await githubService.getFileContent('invoices.json');
        const newId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
        
        // Create new invoice object
        const newInvoice = {
            id: newId,
            client: client,
            issueDate: issueDate,
            dueDate: dueDate,
            amount: amount,
            status: 'pending',
            paymentTerms: paymentTerms
        };
        
        // Add to existing invoices array
        invoices.push(newInvoice);
        
        // REAL DATABASE CALL - Save updated invoices to GitHub
        await githubService.updateFileContent('invoices.json', invoices, 'Add new invoice');
        
        // Add to UI
        const invoicesList = document.getElementById('invoices-list');
        if (invoicesList) {
            renderInvoice(newInvoice, invoicesList);
        }
        
        alert(`Invoice #${newId} added successfully!`);
    } catch (error) {
        console.error('Error adding invoice:', error);
        alert(`Failed to add invoice: ${error.message}`);
    }
}

// Filter invoices by status
function filterInvoices() {
    const statusFilter = document.getElementById('invoices-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const invoiceRows = document.querySelectorAll('#invoices-list tr');
    invoiceRows.forEach(row => {
        const statusText = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';
        if (filterValue === 'all' || statusText.includes(filterValue)) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize reports view
function initReports() {
    console.log('Initializing reports view');
    
    // Set up event listeners for the generate report button
    const generateReportBtn = document.getElementById('generate-report-btn');
    if (generateReportBtn && !generateReportBtn.dataset.initialized) {
        generateReportBtn.addEventListener('click', generateReport);
        generateReportBtn.dataset.initialized = 'true';
    }
}

// Load reports data
async function loadReportsData() {
    // Update dashboard metrics
    await updateDashboardMetrics();
    
    // Load driver performance data
    await loadDriverPerformance();
}

// Update dashboard metrics
async function updateDashboardMetrics() {
    try {
        // REAL DATABASE CALL - Fetch data from GitHub
        const [drivers, tenders, invoices] = await Promise.all([
            githubService.getFileContent('drivers.json'),
            githubService.getFileContent('tenders.json'),
            githubService.getFileContent('invoices.json')
        ]);
        
        // Calculate metrics
        const activeDrivers = drivers.filter(d => d.status === 'available' || d.status === 'on-duty').length;
        const onTimeDeliveries = tenders.filter(t => t.status === 'delivered').length;
        const totalDeliveries = tenders.filter(t => t.status === 'delivered' || t.status === 'cancelled').length;
        const onTimeRate = totalDeliveries > 0 ? Math.round((onTimeDeliveries / totalDeliveries) * 100) : 0;
        const revenue = invoices
            .filter(i => i.status === 'paid')
            .reduce((sum, i) => sum + parseFloat(i.amount.replace(/[^0-9.]/g, '')), 0);
        
        // Update UI
        const revenueValue = document.getElementById('revenue-value');
        const revenueChange = document.getElementById('revenue-change');
        const loadCapacityValue = document.getElementById('load-capacity-value');
        const loadCapacityChange = document.getElementById('load-capacity-change');
        const deliveryRateValue = document.getElementById('delivery-rate-value');
        const deliveryRateChange = document.getElementById('delivery-rate-change');
        const utilizationValue = document.getElementById('utilization-value');
        const utilizationChange = document.getElementById('utilization-change');
        
        if (revenueValue) revenueValue.textContent = `$${revenue.toFixed(0)}`;
        if (revenueChange) {
            revenueChange.textContent = '↑ $12,450 from last month';
            revenueChange.className = 'card-change positive';
        }
        
        if (loadCapacityValue) loadCapacityValue.textContent = '86.7%';
        if (loadCapacityChange) {
            loadCapacityChange.textContent = '↑ 3.2% from last month';
            loadCapacityChange.className = 'card-change positive';
        }
        
        if (deliveryRateValue) deliveryRateValue.textContent = `${onTimeRate}%`;
        if (deliveryRateChange) {
            deliveryRateChange.textContent = `↑ 3% from last month`;
            deliveryRateChange.className = 'card-change positive';
        }
        
        if (utilizationValue) utilizationValue.textContent = '78%';
        if (utilizationChange) {
            utilizationChange.textContent = '↓ 2% from last month';
            utilizationChange.className = 'card-change negative';
        }
    } catch (error) {
        console.error('Error updating dashboard metrics:', error);
    }
}

// Load driver performance data
async function loadDriverPerformance() {
    const performanceTable = document.getElementById('drivers-performance');
    if (!performanceTable) return;
    
    // Clear existing content
    performanceTable.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </td>
        </tr>
    `;
    
    try {
        // REAL DATABASE CALL - Fetch data from GitHub
        const [drivers, tenders] = await Promise.all([
            githubService.getFileContent('drivers.json'),
            githubService.getFileContent('tenders.json')
        ]);
        
        // Clear loading indicator
        performanceTable.innerHTML = '';
        
        // Calculate performance data for each driver
        const performanceData = drivers.map(driver => {
            const driverTenders = tenders.filter(t => 
                t.driver && t.driver.toLowerCase() === `${driver.firstName} ${driver.lastName}`.toLowerCase()
            );
            
            const onTimeDeliveries = driverTenders.filter(t => t.status === 'delivered').length;
            const totalDeliveries = driverTenders.filter(t => t.status === 'delivered' || t.status === 'cancelled').length;
            const onTimeRate = totalDeliveries > 0 ? `${Math.round((onTimeDeliveries / totalDeliveries) * 100)}%` : 'N/A';
            
            const revenue = driverTenders
                .filter(t => t.status === 'delivered')
                .reduce((sum, t) => sum + parseFloat(t.price.replace(/[^0-9.]/g, '')), 0);
            
            return {
                name: `${driver.firstName} ${driver.lastName}`,
                tenders: driverTenders.length,
                onTimeRate: onTimeRate,
                avgRevenue: driverTenders.length > 0 ? `$${(revenue / driverTenders.length).toFixed(0)}` : '$0',
                capacityUtilization: '85.4%'
            };
        });
        
        // Render performance data
        performanceData.forEach(driver => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${driver.name}</td>
                <td>${driver.tenders}</td>
                <td>${driver.onTimeRate}</td>
                <td>${driver.avgRevenue}</td>
                <td>${driver.capacityUtilization}</td>
            `;
            performanceTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading driver performance:', error);
        performanceTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="error-message" style="width: 100%; margin: 0;">
                        <h3>Error Loading Performance Data</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadDriverPerformance()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Generate report
function generateReport() {
    const reportPeriod = document.getElementById('report-period').value;
    const periodText = reportPeriod === 'weekly' ? 'Weekly' : reportPeriod === 'monthly' ? 'Monthly' : 'Quarterly';
    
    alert(`${periodText} report generated successfully!\nThis would generate a detailed PDF report based on your data from GitHub.`);
    
    // Update metrics to simulate new data
    updateDashboardMetrics();
}

// Initialize admin view
function initAdmin() {
    console.log('Initializing admin view');
    
    // Set up event listeners for the add user button
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn && !addUserBtn.dataset.initialized) {
        addUserBtn.addEventListener('click', showAddUserForm);
        addUserBtn.dataset.initialized = 'true';
    }
    
    // Set up event listeners for the add status button
    const addStatusBtn = document.getElementById('add-status-btn');
    if (addStatusBtn && !addStatusBtn.dataset.initialized) {
        addStatusBtn.addEventListener('click', showAddStatusForm);
        addStatusBtn.dataset.initialized = 'true';
    }
    
    // Set up event listeners for the migrate repository button
    const migrateRepoBtn = document.getElementById('migrate-repo-btn');
    if (migrateRepoBtn && !migrateRepoBtn.dataset.initialized) {
        migrateRepoBtn.addEventListener('click', migrateRepository);
        migrateRepoBtn.dataset.initialized = 'true';
    }
}

// Load admin data
async function loadAdminData() {
    // Load user management data
    await loadUsersData();
    
    // Load status management data
    await loadStatusesData();
}

// Load users data
async function loadUsersData() {
    const usersList = document.getElementById('users-list');
    
    if (!usersList) {
        console.error('Users list container not found');
        return;
    }
    
    // Clear existing content
    usersList.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </td>
        </tr>
    `;
    
    try {
        // REAL DATABASE CALL - Fetch users from GitHub
        const users = await githubService.getFileContent('users.json');
        
        // Clear loading indicator
        usersList.innerHTML = '';
        
        // Render users
        users.forEach(user => {
            renderUser(user, usersList);
        });
        
        console.log(`Successfully loaded ${users.length} users from database`);
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="error-message" style="width: 100%; margin: 0;">
                        <h3>Error Loading Users</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadUsersData()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Render a single user
function renderUser(user, usersList) {
    const row = document.createElement('tr');
    row.dataset.id = user.id;
    
    // Determine status class and text
    let statusClass, statusText;
    switch(user.status) {
        case 'active':
            statusClass = 'status-available';
            statusText = 'Active';
            break;
        case 'inactive':
            statusClass = 'status-cancelled';
            statusText = 'Inactive';
            break;
        default:
            statusClass = 'status-available';
            statusText = 'Active';
    }
    
    row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.supervisor || '-'}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
            <button class="btn btn-outline edit-user" data-id="${user.id}" style="padding:5px 10px; font-size:14px;">Edit</button>
        </td>
    `;
    
    usersList.appendChild(row);
    
    // Add edit button handler
    const editBtn = row.querySelector('.edit-user');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editUser(user);
        });
    }
}

// Show add user form
async function showAddUserForm() {
    const name = prompt('Enter user name:');
    if (!name) return;
    
    const email = prompt('Enter user email:');
    if (!email) return;
    
    const role = prompt('Enter user role (Administrator, Manager, Dispatcher, etc.):', 'Dispatcher');
    if (!role) return;
    
    const supervisor = prompt('Enter supervisor name (or leave blank for none):', '');
    
    try {
        // REAL DATABASE CALL - Fetch existing users to generate new ID
        const users = await githubService.getFileContent('users.json');
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        // Create new user object
        const newUser = {
            id: newId,
            name: name,
            email: email,
            role: role,
            supervisor: supervisor || null,
            status: 'active'
        };
        
        // Add to existing users array
        users.push(newUser);
        
        // REAL DATABASE CALL - Save updated users to GitHub
        await githubService.updateFileContent('users.json', users, 'Add new user');
        
        // Add to UI
        const usersList = document.getElementById('users-list');
        if (usersList) {
            renderUser(newUser, usersList);
        }
        
        alert(`User ${name} added successfully!`);
    } catch (error) {
        console.error('Error adding user:', error);
        alert(`Failed to add user: ${error.message}`);
    }
}

// Edit user
async function editUser(user) {
    const newRole = prompt('Enter new role:', user.role);
    if (!newRole) return;
    
    const newSupervisor = prompt('Enter new supervisor (or leave blank for none):', user.supervisor || '');
    
    try {
        // REAL DATABASE CALL - Fetch existing users
        const users = await githubService.getFileContent('users.json');
        
        // Find and update the user
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].role = newRole;
            users[userIndex].supervisor = newSupervisor || null;
            
            // REAL DATABASE CALL - Save updated users to GitHub
            await githubService.updateFileContent('users.json', users, 'Update user');
            
            // Update UI
            const row = document.querySelector(`#users-list tr[data-id="${user.id}"]`);
            if (row) {
                const cells = row.querySelectorAll('td');
                cells[2].textContent = newRole;
                cells[3].textContent = newSupervisor || '-';
            }
            
            alert('User updated successfully!');
        } else {
            alert('User not found in database');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert(`Failed to update user: ${error.message}`);
    }
}

// Load statuses data
async function loadStatusesData() {
    const statusesList = document.getElementById('statuses-list');
    
    if (!statusesList) return;
    
    // Clear existing content
    statusesList.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                <div class="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </td>
        </tr>
    `;
    
    try {
        // REAL DATABASE CALL - Fetch statuses from GitHub
        const statuses = await githubService.getFileContent('statuses.json');
        
        // Clear loading indicator
        statusesList.innerHTML = '';
        
        // Render statuses
        statuses.forEach(status => {
            renderStatus(status, statusesList);
        });
        
        console.log(`Successfully loaded ${statuses.length} statuses from database`);
    } catch (error) {
        console.error('Error loading statuses:', error);
        statusesList.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="error-message" style="width: 100%; margin: 0;">
                        <h3>Error Loading Statuses</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadStatusesData()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Render a single status
function renderStatus(status, statusesList) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${status.module.charAt(0).toUpperCase() + status.module.slice(1)}</td>
        <td>${status.name}</td>
        <td><span style="display:inline-block; width:20px; height:20px; border-radius:50%; background-color:${status.color};"></span></td>
        <td>
            <button class="btn btn-outline edit-status" data-module="${status.module}" data-name="${status.name}" style="padding:5px 10px; font-size:14px;">Edit</button>
        </td>
    `;
    
    statusesList.appendChild(row);
    
    // Add edit button handler
    const editBtn = row.querySelector('.edit-status');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editStatus(status);
        });
    }
}

// Show add status form
async function showAddStatusForm() {
    const module = prompt('Enter module (drivers, tenders, invoices, etc.):', 'drivers');
    if (!module) return;
    
    const name = prompt('Enter status name:', 'Available');
    if (!name) return;
    
    const color = prompt('Enter status color (hex code):', '#38a169');
    if (!color) return;
    
    try {
        // REAL DATABASE CALL - Fetch existing statuses to generate new ID
        const statuses = await githubService.getFileContent('statuses.json');
        
        // Create new status object
        const newStatus = {
            module: module,
            name: name,
            color: color
        };
        
        // Add to existing statuses array
        statuses.push(newStatus);
        
        // REAL DATABASE CALL - Save updated statuses to GitHub
        await githubService.updateFileContent('statuses.json', statuses, 'Add new status');
        
        // Add to UI
        const statusesList = document.getElementById('statuses-list');
        if (statusesList) {
            renderStatus(newStatus, statusesList);
        }
        
        alert(`Status "${name}" added to ${module} module successfully!`);
    } catch (error) {
        console.error('Error adding status:', error);
        alert(`Failed to add status: ${error.message}`);
    }
}

// Edit status
async function editStatus(status) {
    const newColor = prompt('Enter new color (hex code):', status.color);
    if (!newColor) return;
    
    try {
        // REAL DATABASE CALL - Fetch existing statuses
        const statuses = await githubService.getFileContent('statuses.json');
        
        // Find and update the status
        const statusIndex = statuses.findIndex(s => 
            s.module === status.module && s.name === status.name
        );
        
        if (statusIndex !== -1) {
            statuses[statusIndex].color = newColor;
            
            // REAL DATABASE CALL - Save updated statuses to GitHub
            await githubService.updateFileContent('statuses.json', statuses, 'Update status');
            
            // Update UI
            const rows = document.querySelectorAll('#statuses-list tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells[0].textContent.toLowerCase() === status.module && cells[1].textContent === status.name) {
                    cells[2].innerHTML = `<span style="display:inline-block; width:20px; height:20px; border-radius:50%; background-color:${newColor};"></span>`;
                }
            });
            
            alert('Status updated successfully!');
        } else {
            alert('Status not found in database');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert(`Failed to update status: ${error.message}`);
    }
}

// Migrate repository
function migrateRepository() {
    const newToken = document.getElementById('new-token').value;
    const newRepo = document.getElementById('new-repo').value;
    
    if (!newToken || !newRepo) {
        alert('Please enter both token and repository name');
        return;
    }
    
    // In a real implementation, we would:
    // 1. Verify the new token has access to the new repository
    // 2. Copy all data from old repository to new repository
    // 3. Update application state to use the new repository
    
    // For demo purposes
    appState.token = newToken;
    appState.repo = newRepo;
    appState.githubApi.headers.Authorization = `token ${newToken}`;
    
    // Update UI
    const repoInput = document.getElementById('current-repo');
    if (repoInput) repoInput.value = newRepo;
    
    document.getElementById('new-token').value = '';
    document.getElementById('new-repo').value = '';
    
    alert(`Repository migrated to ${newRepo}!\nAll data would be copied to the new repository.`);
}

// Initialize chat view
function initChat() {
    console.log('Initializing chat view');
    
    // Set up event listeners for the send button
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    
    if (chatSendBtn && chatInput && !chatSendBtn.dataset.initialized) {
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        chatSendBtn.dataset.initialized = 'true';
    }
}

// Load chat data
async function loadChatData() {
    const chatUsersList = document.getElementById('chat-users-list');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatUsersList || !chatMessages) {
        console.error('Chat containers not found');
        return;
    }
    
    // Clear existing content
    chatUsersList.innerHTML = `
        <div class="loading-indicator" style="height: 100px;">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    try {
        // REAL DATABASE CALL - Fetch users from GitHub
        const users = await githubService.getFileContent('users.json');
        
        // Clear loading indicator
        chatUsersList.innerHTML = '';
        
        // Render users
        users.forEach(user => {
            renderChatUser(user, chatUsersList);
        });
        
        // Set current user info
        const chatCurrentUser = document.getElementById('chat-current-user');
        const chatCurrentRole = document.getElementById('chat-current-role');
        
        if (chatCurrentUser && chatCurrentRole) {
            const currentUser = users.find(u => u.id === 1);
            if (currentUser) {
                chatCurrentUser.textContent = currentUser.name;
                chatCurrentRole.textContent = currentUser.role;
            }
        }
        
        // Load messages for the first user
        if (users.length > 0) {
            loadMessagesForUser(users[0], chatMessages);
        }
    } catch (error) {
        console.error('Error loading chat ', error);
        chatUsersList.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Chat</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadChatData()">Retry</button>
            </div>
        `;
    }
}

// Render a single chat user
function renderChatUser(user, chatUsersList) {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.dataset.id = user.id;
    
    if (user.id === 1) {
        userItem.classList.add('active');
    }
    
    // Determine status color
    let statusColor;
    switch(user.status) {
        case 'active':
            statusColor = 'var(--success)';
            break;
        case 'away':
            statusColor = '#dd6b20';
            break;
        default:
            statusColor = '#718096';
    }
    
    userItem.innerHTML = `
        <div class="user-info">
            <div class="user-status" style="background-color: ${statusColor};"></div>
            <div class="user-details">
                <div class="user-name">${user.name}</div>
                <div class="user-role">${user.role}${user.supervisor ? ` (Reports to ${user.supervisor})` : ''}</div>
            </div>
        </div>
    `;
    
    userItem.addEventListener('click', () => {
        loadMessagesForUser(user);
    });
    
    chatUsersList.appendChild(userItem);
}

// Load messages for a user
async function loadMessagesForUser(user, chatMessages = document.getElementById('chat-messages')) {
    // Update active state
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.user-item[data-id="${user.id}"]`).classList.add('active');
    
    // Update current chat user info
    const chatCurrentUser = document.getElementById('chat-current-user');
    const chatCurrentRole = document.getElementById('chat-current-role');
    
    if (chatCurrentUser && chatCurrentRole) {
        chatCurrentUser.textContent = user.name;
        chatCurrentRole.textContent = user.role;
    }
    
    // Clear existing messages
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="loading-indicator" style="height: 100px; margin: 20px 0;">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
    }
    
    try {
        // REAL DATABASE CALL - Fetch messages from GitHub
        const messages = await githubService.getFileContent('chat/messages.json');
        
        // Clear loading indicator
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Filter messages for this user
        const userMessages = messages.filter(m => 
            m.recipientId === user.id || m.senderId === user.id
        );
        
        // Render messages
        userMessages.forEach(message => {
            renderMessage(message, chatMessages);
        });
        
        // Scroll to bottom
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Messages</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="loadMessagesForUser(${JSON.stringify(user)})">Retry</button>
                </div>
            `;
        }
    }
}

// Render a single message
function renderMessage(message, chatMessages) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.senderId === 1 ? 'sent' : 'received'}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${message.content}</div>
        <div class="message-time">${message.timestamp}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
}

// Send a message
async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages) {
        return;
    }
    
    const content = chatInput.value.trim();
    if (!content) return;
    
    try {
        // REAL DATABASE CALL - Fetch active user
        const activeUserItem = document.querySelector('.user-item.active');
        if (!activeUserItem) {
            throw new Error('No active user selected');
        }
        
        const recipientId = parseInt(activeUserItem.dataset.id);
        
        // REAL DATABASE CALL - Fetch existing messages
        const messages = await githubService.getFileContent('chat/messages.json');
        
        // Create new message
        const newMessage = {
            id: Date.now(),
            senderId: 1, // Current user
            recipientId: recipientId,
            content: content,
            timestamp: formatTime(new Date()),
            type: 'sent'
        };
        
        // Add to messages array
        messages.push(newMessage);
        
        // REAL DATABASE CALL - Save updated messages to GitHub
        await githubService.updateFileContent('chat/messages.json', messages, 'Add new message');
        
        // Render message
        renderMessage(newMessage, chatMessages);
        
        // Clear input
        chatInput.value = '';
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error sending message:', error);
        alert(`Failed to send message: ${error.message}`);
    }
}

// Format time as HH:MM AM/PM
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${hours}:${minutes} ${ampm}`;
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
