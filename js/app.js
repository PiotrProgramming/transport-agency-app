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
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const contentArea = document.getElementById('content-area');
const navItems = document.querySelectorAll('.nav-item');
const notificationBell = document.getElementById('notification-bell');
const notificationDropdown = document.getElementById('notification-dropdown');
const userProfile = document.getElementById('user-profile');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// Initialize the application
function initApp() {
    // Make sure notifications array is initialized
    if (!appState.notifications) {
        appState.notifications = [];
    }
    
    // Check if user is already authenticated
    checkAuthStatus();
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            loadView(view);
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

// Load a view fragment
function loadView(view) {
    console.log(`Loading view: ${view}`);
    
    // Update navigation highlights
    navItems.forEach(i => i.classList.remove('active'));
    const activeNavItem = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (activeNavItem) activeNavItem.classList.add('active');
    
    // Load the HTML fragment
    fetch(`views/${view}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${view} view`);
            }
            return response.text();
        })
        .then(html => {
            // Insert the HTML into the content area
            contentArea.innerHTML = html;
            
            // Store the current view
            appState.currentView = view;
            
            // Initialize view-specific JavaScript
            initView(view);
            
            // Load data for the view
            loadData(view);
        })
        .catch(error => {
            console.error(error);
            contentArea.innerHTML = `
                <div class="error-message" style="padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: var(--dark-red); margin-bottom: 10px;">Error Loading View</h3>
                    <p style="color: var(--secondary);">${error.message}</p>
                </div>
            `;
        });
}

// Initialize view-specific JavaScript
function initView(view) {
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
        authView.classList.remove('active');
        appView.classList.add('active');
        
        // Load the dashboard view
        loadView(appState.currentView || 'dashboard');
    } else {
        console.log('User is not authenticated');
        authView.classList.add('active');
        appView.classList.remove('active');
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

// Initialize dashboard view
function initDashboard() {
    // View is already loaded, just need to set up event listeners if needed
    console.log('Dashboard view initialized');
}

// Load dashboard data
function loadDashboardData() {
    // Get the tenders table body
    const tendersTable = document.getElementById('dashboard-tenders');
    if (!tendersTable) {
        return;
    }
    
    // Clear existing content
    tendersTable.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleTenders = [
        {
            id: 'TX-7890',
            route: 'Berlin (10115) → Paris (75001)',
            loadingDate: 'Oct 15, 2023',
            unloadingDate: 'Oct 17, 2023',
            price: '$4,250',
            status: 'delivered',
            driver: 'Michael Johnson'
        },
        {
            id: 'TX-7891',
            route: 'Munich (80331) → Vienna (1010)',
            loadingDate: 'Oct 18, 2023',
            unloadingDate: 'Oct 20, 2023',
            price: '$2,850',
            status: 'pending',
            driver: 'Anna Schmidt'
        },
        {
            id: 'TX-7892',
            route: 'Hamburg (20095) → Copenhagen (1050)',
            loadingDate: 'Oct 22, 2023',
            unloadingDate: 'Oct 24, 2023',
            price: '$3,150',
            status: 'available',
            driver: 'Unassigned'
        },
        {
            id: 'TX-7893',
            route: 'Frankfurt (60311) → Amsterdam (1012)',
            loadingDate: 'Oct 25, 2023',
            unloadingDate: 'Oct 27, 2023',
            price: '$3,750',
            status: 'available',
            driver: 'Unassigned'
        }
    ];
    
    // Render tenders
    sampleTenders.forEach(tender => {
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
            <td>${tender.driver}</td>
        `;
        tendersTable.appendChild(row);
    });
}

// Initialize drivers view
function initDrivers() {
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
function loadDriversData() {
    const driversList = document.getElementById('drivers-list');
    if (!driversList) {
        return;
    }
    
    // Clear existing content
    driversList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleDrivers = [
        {
            id: 1,
            firstName: 'Michael',
            lastName: 'Johnson',
            license: 'DL-789456',
            experience: '8 years',
            car: 'TR-204-BC',
            card: '**** 5678',
            tenders: '12 (3 active)',
            lastDelivery: 'Oct 17, 2023',
            status: 'available'
        },
        {
            id: 2,
            firstName: 'Anna',
            lastName: 'Schmidt',
            license: 'DL-123789',
            experience: '5 years',
            car: 'TR-307-XY',
            card: '**** 1234',
            tenders: '9 (2 active)',
            lastDelivery: 'Oct 20, 2023',
            status: 'on-duty'
        },
        {
            id: 3,
            firstName: 'David',
            lastName: 'Müller',
            license: 'DL-456123',
            experience: '12 years',
            car: 'TR-102-AB',
            card: '**** 9012',
            tenders: '18 (0 active)',
            lastDelivery: 'Oct 10, 2023',
            status: 'maintenance'
        }
    ];
    
    // Render drivers
    sampleDrivers.forEach(driver => {
        renderDriver(driver);
    });
}

// Render a single driver
function renderDriver(driver) {
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
                <span class="detail-label">Assigned Car:</span> ${driver.car}
            </div>
            <div>
                <span class="detail-label">Assigned Card:</span> ${driver.card}
            </div>
            <div>
                <span class="detail-label">Tenders:</span> ${driver.tenders}
            </div>
            <div>
                <span class="detail-label">Last Delivery:</span> ${driver.lastDelivery}
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
function showAddDriverForm() {
    const name = prompt('Enter driver first name:');
    if (!name) return;
    
    const lastName = prompt('Enter driver last name:');
    if (!lastName) return;
    
    // In a real implementation, we would save this to GitHub
    const newDriver = {
        id: Date.now(),
        firstName: name,
        lastName: lastName,
        license: 'DL-' + Math.floor(100000 + Math.random() * 900000),
        experience: '0 years',
        car: 'Unassigned',
        card: 'Unassigned',
        tenders: '0 (0 active)',
        lastDelivery: 'Never',
        status: 'available'
    };
    
    // Add to UI
    renderDriver(newDriver);
    
    alert(`Driver ${name} ${lastName} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
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
function loadCarsData() {
    const carsList = document.getElementById('cars-list');
    if (!carsList) {
        return;
    }
    
    // Clear existing content
    carsList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleCars = [
        {
            id: 1,
            tractorPlate: 'TR-102-AB',
            trailerPlate: 'TL-205-XY',
            maxWeight: '24,000 kg',
            loadingSpace: '13.6m x 2.45m x 2.7m (90.8 m³)',
            insurance: 'Dec 15, 2023',
            inspection: 'Nov 30, 2023',
            status: 'maintenance',
            driver: 'David Müller'
        },
        {
            id: 2,
            tractorPlate: 'TR-204-BC',
            trailerPlate: 'TL-307-AB',
            maxWeight: '24,000 kg',
            loadingSpace: '13.6m x 2.45m x 2.7m (90.8 m³)',
            insurance: 'Jan 22, 2024',
            inspection: 'Dec 10, 2023',
            status: 'available',
            driver: 'Michael Johnson'
        },
        {
            id: 3,
            tractorPlate: 'TR-307-XY',
            trailerPlate: 'TL-102-BC',
            maxWeight: '22,000 kg',
            loadingSpace: '13.6m x 2.45m x 2.7m (90.8 m³)',
            insurance: 'Feb 5, 2024',
            inspection: 'Jan 15, 2024',
            status: 'in-use',
            driver: 'Anna Schmidt'
        }
    ];
    
    // Render cars
    sampleCars.forEach(car => {
        renderCar(car);
    });
}

// Render a single car
function renderCar(car) {
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
        <td>${car.driver}</td>
    `;
    
    carsList.appendChild(row);
}

// Show add car form
function showAddCarForm() {
    const tractorPlate = prompt('Enter tractor plate number:');
    if (!tractorPlate) return;
    
    const trailerPlate = prompt('Enter trailer plate number:');
    if (!trailerPlate) return;
    
    // In a real implementation, we would calculate these based on inputs
    const maxWeight = '24,000 kg';
    const loadingSpace = '13.6m x 2.45m x 2.7m (90.8 m³)';
    const insurance = 'Jan 1, 2024';
    const inspection = 'Dec 1, 2023';
    
    // In a real implementation, we would save this to GitHub
    const newCar = {
        id: Date.now(),
        tractorPlate: tractorPlate,
        trailerPlate: trailerPlate,
        maxWeight: maxWeight,
        loadingSpace: loadingSpace,
        insurance: insurance,
        inspection: inspection,
        status: 'available',
        driver: 'Unassigned'
    };
    
    // Add to UI
    renderCar(newCar);
    
    alert(`Car ${tractorPlate} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Filter cars by status
function filterCars() {
    const statusFilter = document.getElementById('cars-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const carRows = document.querySelectorAll('#cars-list tr');
    carRows.forEach(row => {
        const statusText = row.querySelector('.status-badge').textContent.toLowerCase();
        if (filterValue === 'all' || statusText.includes(filterValue)) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize cards view
function initCards() {
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
function loadCardsData() {
    const cardsList = document.getElementById('cards-list');
    if (!cardsList) {
        return;
    }
    
    // Clear existing content
    cardsList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleCards = [
        {
            id: 1,
            number: '**** 1234',
            pin: '••••',
            expiry: '08/25',
            assignedTo: 'Anna Schmidt',
            vehicle: 'TR-307-XY',
            status: 'active'
        },
        {
            id: 2,
            number: '**** 5678',
            pin: '••••',
            expiry: '11/24',
            assignedTo: 'Michael Johnson',
            vehicle: 'TR-204-BC',
            status: 'active'
        },
        {
            id: 3,
            number: '**** 9012',
            pin: '••••',
            expiry: '05/24',
            assignedTo: 'David Müller',
            vehicle: 'TR-102-AB',
            status: 'expired'
        }
    ];
    
    // Render cards
    sampleCards.forEach(card => {
        renderCard(card);
    });
    
    // Initialize drag and drop areas
    initAssignmentAreas();
}

// Render a single card
function renderCard(card) {
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
        <td>${card.assignedTo}</td>
        <td>${card.vehicle}</td>
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
function showAddCardForm() {
    const number = prompt('Enter card number (last 4 digits):');
    if (!number) return;
    
    const pin = prompt('Enter card PIN:');
    if (!pin) return;
    
    const expiry = prompt('Enter card expiry date (MM/YY):');
    if (!expiry) return;
    
    // In a real implementation, we would save this to GitHub
    const newCard = {
        id: Date.now(),
        number: '**** ' + number,
        pin: '••••',
        expiry: expiry,
        assignedTo: 'Unassigned',
        vehicle: 'Unassigned',
        status: 'active'
    };
    
    // Add to UI
    renderCard(newCard);
    
    alert(`Card **** ${number} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Edit card
function editCard(card) {
    const newExpiry = prompt('Enter new expiry date (MM/YY):', card.expiry);
    if (!newExpiry) return;
    
    // Update UI
    const row = document.querySelector(`#cards-list tr[data-id="${card.id}"]`);
    if (row) {
        const cells = row.querySelectorAll('td');
        cells[2].textContent = newExpiry;
    }
    
    alert(`Card updated!\nIn a real implementation, this change would be saved to your GitHub repository.`);
}

// Initialize drag and drop areas
function initAssignmentAreas() {
    const assignmentContainer = document.getElementById('assignment-container');
    if (!assignmentContainer) return;
    
    // Clear existing content
    assignmentContainer.innerHTML = '';
    
    // In a real implementation, we would fetch drivers and cards from GitHub
    const sampleDrivers = [
        { id: 1, name: 'Michael Johnson', status: 'available' },
        { id: 2, name: 'Anna Schmidt', status: 'on-duty' },
        { id: 3, name: 'David Müller', status: 'maintenance' }
    ];
    
    const sampleCards = [
        { id: 1, number: '**** 1234', status: 'active' },
        { id: 2, number: '**** 5678', status: 'active' },
        { id: 3, number: '**** 9012', status: 'expired' }
    ];
    
    // Create drivers area
    const driversArea = document.createElement('div');
    driversArea.style.flex = '1';
    driversArea.style.background = 'var(--light-gray)';
    driversArea.style.padding = '20px';
    driversArea.style.borderRadius = 'var(--border-radius)';
    driversArea.innerHTML = '<h3 style="margin-bottom: 15px;">Available Drivers</h3>';
    
    // Add drivers
    sampleDrivers.forEach(driver => {
        const driverElement = document.createElement('div');
        driverElement.className = 'driver-slip';
        driverElement.draggable = true;
        driverElement.dataset.type = 'driver';
        driverElement.dataset.id = driver.id;
        driverElement.innerHTML = `
            <div class="driver-name">${driver.name}</div>
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
    sampleCards.forEach(card => {
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
    
    document.addEventListener('drop', (e) => {
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
                
                // In a real implementation, we would update the assignment in GitHub
                alert(`Assignment created!\nIn a real implementation, this assignment would be saved to your GitHub repository.`);
                
                // Visual feedback
                if (draggedType === 'driver') {
                    target.innerHTML += `<div style="margin-top: 5px; color: var(--accent);">Assigned: ${draggable.querySelector('.driver-name').textContent}</div>`;
                } else {
                    target.innerHTML += `<div style="margin-top: 5px; color: var(--accent);">Assigned Card: ${draggable.querySelector('.driver-name').textContent}</div>`;
                }
            }
        }
    });
}

// Initialize tenders view
function initTenders() {
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
function loadTendersData() {
    const tendersList = document.getElementById('tenders-list');
    if (!tendersList) {
        return;
    }
    
    // Clear existing content
    tendersList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleTenders = [
        {
            id: 'TX-7890',
            route: 'Berlin (10115) → Paris (75001)',
            loadingDate: 'Oct 15, 2023',
            unloadingDate: 'Oct 17, 2023',
            price: '$4,250',
            status: 'delivered',
            driver: 'Michael Johnson'
        },
        {
            id: 'TX-7891',
            route: 'Munich (80331) → Vienna (1010)',
            loadingDate: 'Oct 18, 2023',
            unloadingDate: 'Oct 20, 2023',
            price: '$2,850',
            status: 'pending',
            driver: 'Anna Schmidt'
        },
        {
            id: 'TX-7892',
            route: 'Hamburg (20095) → Copenhagen (1050)',
            loadingDate: 'Oct 22, 2023',
            unloadingDate: 'Oct 24, 2023',
            price: '$3,150',
            status: 'available',
            driver: 'Unassigned'
        },
        {
            id: 'TX-7893',
            route: 'Frankfurt (60311) → Amsterdam (1012)',
            loadingDate: 'Oct 25, 2023',
            unloadingDate: 'Oct 27, 2023',
            price: '$3,750',
            status: 'available',
            driver: 'Unassigned'
        }
    ];
    
    // Render tenders
    sampleTenders.forEach(tender => {
        renderTender(tender);
    });
}

// Render a single tender
function renderTender(tender) {
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
        <td>${tender.driver}</td>
        <td>
            <button class="btn btn-outline ${tender.status === 'available' ? 'assign-tender' : 'tender-details'}" 
                data-id="${tender.id}" style="padding:5px 10px; font-size:14px;">
                ${tender.status === 'available' ? 'Assign' : 'Details'}
            </button>
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
function showAddTenderForm() {
    const route = prompt('Enter route (e.g., Berlin → Paris):');
    if (!route) return;
    
    const loadingDate = prompt('Enter loading date (e.g., Oct 25, 2023):');
    if (!loadingDate) return;
    
    const unloadingDate = prompt('Enter unloading date (e.g., Oct 27, 2023):');
    if (!unloadingDate) return;
    
    const price = prompt('Enter price (e.g., $3,750):');
    if (!price) return;
    
    // In a real implementation, we would save this to GitHub
    const newTender = {
        id: 'TX-' + Math.floor(10000 + Math.random() * 90000),
        route: route,
        loadingDate: loadingDate,
        unloadingDate: unloadingDate,
        price: price,
        status: 'available',
        driver: 'Unassigned'
    };
    
    // Add to UI
    renderTender(newTender);
    
    alert(`Tender #${newTender.id} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Assign tender to driver
function assignTender(tender) {
    const driver = prompt('Enter driver name to assign this tender to:');
    if (!driver) return;
    
    // Update UI
    const row = document.querySelector(`#tenders-list tr[data-id="${tender.id}"]`);
    if (row) {
        const cells = row.querySelectorAll('td');
        cells[6].textContent = driver;
        cells[5].innerHTML = '<span class="status-badge status-pending">Pending</span>';
        cells[7].innerHTML = '<button class="btn btn-outline tender-details" style="padding:5px 10px; font-size:14px;">Details</button>';
        
        // Update button handler
        const actionBtn = row.querySelector('button');
        if (actionBtn) {
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showTenderDetails({...tender, driver: driver, status: 'pending'});
            });
        }
    }
    
    alert(`Tender #${tender.id} assigned to ${driver}!\nIn a real implementation, this assignment would be saved to your GitHub repository.`);
}

// Show tender details
function showTenderDetails(tender) {
    let additionalInfo = '';
    
    if (tender.status === 'sold') {
        additionalInfo = `\nSold for: ${tender.soldPrice}\nPayment terms: ${tender.paymentTerms} days`;
    }
    
    alert(`Tender #${tender.id} Details:\nRoute: ${tender.route}\nLoading: ${tender.loadingDate}\nUnloading: ${tender.unloadingDate}\nPrice: ${tender.price}\nStatus: ${tender.status}\nDriver: ${tender.driver}${additionalInfo}\n\nIn a real implementation, this would show a detailed view with all tender information.`);
}

// Filter tenders by status
function filterTenders() {
    const statusFilter = document.getElementById('tenders-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const tenderRows = document.querySelectorAll('#tenders-list tr');
    tenderRows.forEach(row => {
        const statusText = row.querySelector('.status-badge').textContent.toLowerCase();
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
function loadInvoicesData() {
    const invoicesList = document.getElementById('invoices-list');
    if (!invoicesList) {
        return;
    }
    
    // Clear existing content
    invoicesList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleInvoices = [
        {
            id: 'INV-2023',
            client: 'Global Logistics Inc.',
            issueDate: 'Sep 25, 2023',
            dueDate: 'Oct 25, 2023',
            amount: '$12,450',
            status: 'pending',
            paymentTerms: 'Net 30'
        },
        {
            id: 'INV-2022',
            client: 'European Freight Co.',
            issueDate: 'Sep 18, 2023',
            dueDate: 'Oct 18, 2023',
            amount: '$8,750',
            status: 'paid',
            paymentTerms: 'Net 15'
        },
        {
            id: 'INV-2021',
            client: 'Transcontinental Ltd.',
            issueDate: 'Sep 10, 2023',
            dueDate: 'Oct 10, 2023',
            amount: '$15,200',
            status: 'overdue',
            paymentTerms: 'Net 20'
        }
    ];
    
    // Render invoices
    sampleInvoices.forEach(invoice => {
        renderInvoice(invoice);
    });
}

// Render a single invoice
function renderInvoice(invoice) {
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
function showAddInvoiceForm() {
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
    
    // In a real implementation, we would save this to GitHub
    const newInvoice = {
        id: 'INV-' + new Date().getFullYear(),
        client: client,
        issueDate: issueDate,
        dueDate: dueDate,
        amount: amount,
        status: 'pending',
        paymentTerms: paymentTerms
    };
    
    // Add to UI
    renderInvoice(newInvoice);
    
    alert(`Invoice #${newInvoice.id} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Filter invoices by status
function filterInvoices() {
    const statusFilter = document.getElementById('invoices-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const invoiceRows = document.querySelectorAll('#invoices-list tr');
    invoiceRows.forEach(row => {
        const statusText = row.querySelector('.status-badge').textContent.toLowerCase();
        if (filterValue === 'all' || statusText.includes(filterValue)) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize reports view
function initReports() {
    // Set up event listeners for the generate report button
    const generateReportBtn = document.getElementById('generate-report-btn');
    if (generateReportBtn && !generateReportBtn.dataset.initialized) {
        generateReportBtn.addEventListener('click', generateReport);
        generateReportBtn.dataset.initialized = 'true';
    }
}

// Load reports data
function loadReportsData() {
    // Update dashboard metrics
    updateDashboardMetrics();
    
    // Load driver performance data
    loadDriverPerformance();
}

// Update dashboard metrics
function updateDashboardMetrics() {
    // In a real implementation, these values would be calculated from GitHub data
    const metrics = {
        revenue: {
            value: '$142,850',
            change: '↑ 12.4% from last month',
            positive: true
        },
        loadCapacity: {
            value: '86.7%',
            change: '↑ 3.2% from last month',
            positive: true
        },
        deliveryRate: {
            value: '92%',
            change: '↑ 3% from last month',
            positive: true
        },
        utilization: {
            value: '78%',
            change: '↓ 2% from last month',
            positive: false
        }
    };
    
    // Update UI
    const revenueValue = document.getElementById('revenue-value');
    const revenueChange = document.getElementById('revenue-change');
    const loadCapacityValue = document.getElementById('load-capacity-value');
    const loadCapacityChange = document.getElementById('load-capacity-change');
    const deliveryRateValue = document.getElementById('delivery-rate-value');
    const deliveryRateChange = document.getElementById('delivery-rate-change');
    const utilizationValue = document.getElementById('utilization-value');
    const utilizationChange = document.getElementById('utilization-change');
    
    if (revenueValue) revenueValue.textContent = metrics.revenue.value;
    if (revenueChange) {
        revenueChange.textContent = metrics.revenue.change;
        revenueChange.className = metrics.revenue.positive ? 'card-change positive' : 'card-change negative';
    }
    
    if (loadCapacityValue) loadCapacityValue.textContent = metrics.loadCapacity.value;
    if (loadCapacityChange) {
        loadCapacityChange.textContent = metrics.loadCapacity.change;
        loadCapacityChange.className = metrics.loadCapacity.positive ? 'card-change positive' : 'card-change negative';
    }
    
    if (deliveryRateValue) deliveryRateValue.textContent = metrics.deliveryRate.value;
    if (deliveryRateChange) {
        deliveryRateChange.textContent = metrics.deliveryRate.change;
        deliveryRateChange.className = metrics.deliveryRate.positive ? 'card-change positive' : 'card-change negative';
    }
    
    if (utilizationValue) utilizationValue.textContent = metrics.utilization.value;
    if (utilizationChange) {
        utilizationChange.textContent = metrics.utilization.change;
        utilizationChange.className = metrics.utilization.positive ? 'card-change positive' : 'card-change negative';
    }
}

// Load driver performance data
function loadDriverPerformance() {
    const performanceTable = document.getElementById('drivers-performance');
    if (!performanceTable) return;
    
    // Clear existing content
    performanceTable.innerHTML = '';
    
    // In a real implementation, this data would be calculated from GitHub data
    const performanceData = [
        {
            name: 'Michael Johnson',
            tenders: 12,
            onTimeRate: '95%',
            avgRevenue: '$4,250',
            capacityUtilization: '88.2%'
        },
        {
            name: 'Anna Schmidt',
            tenders: 9,
            onTimeRate: '92%',
            avgRevenue: '$3,167',
            capacityUtilization: '85.7%'
        },
        {
            name: 'David Müller',
            tenders: 18,
            onTimeRate: '88%',
            avgRevenue: '$3,722',
            capacityUtilization: '82.4%'
        }
    ];
    
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
}

// Generate report
function generateReport() {
    const reportPeriod = document.getElementById('report-period').value;
    const periodText = reportPeriod === 'weekly' ? 'Weekly' : reportPeriod === 'monthly' ? 'Monthly' : 'Quarterly';
    
    // In a real implementation, this would generate a PDF report
    alert(`${periodText} report generated successfully!\nIn a real implementation, this would generate a detailed PDF report based on your data from GitHub.`);
    
    // Update metrics to simulate new data
    updateDashboardMetrics();
}

// Initialize admin view
function initAdmin() {
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
function loadAdminData() {
    // Load user management data
    loadUsersData();
    
    // Load status management data
    loadStatusesData();
}

// Load users data
function loadUsersData() {
    const usersList = document.getElementById('users-list');
    if (!usersList) {
        return;
    }
    
    // Clear existing content
    usersList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleUsers = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@company.com',
            role: 'Administrator',
            supervisor: null,
            status: 'active'
        },
        {
            id: 2,
            name: 'Sarah Williams',
            email: 'sarah@company.com',
            role: 'Manager',
            supervisor: 'John Doe',
            status: 'active'
        },
        {
            id: 3,
            name: 'Robert Chen',
            email: 'robert@company.com',
            role: 'Dispatcher',
            supervisor: 'Sarah Williams',
            status: 'active'
        }
    ];
    
    // Render users
    sampleUsers.forEach(user => {
        renderUser(user);
    });
}

// Render a single user
function renderUser(user) {
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
function showAddUserForm() {
    const name = prompt('Enter user name:');
    if (!name) return;
    
    const email = prompt('Enter user email:');
    if (!email) return;
    
    const role = prompt('Enter user role (Administrator, Manager, Dispatcher, etc.):', 'Dispatcher');
    if (!role) return;
    
    const supervisor = prompt('Enter supervisor name (or leave blank for none):', '');
    
    // In a real implementation, we would save this to GitHub
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        role: role,
        supervisor: supervisor || null,
        status: 'active'
    };
    
    // Add to UI
    renderUser(newUser);
    
    alert(`User ${name} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Edit user
function editUser(user) {
    const newRole = prompt('Enter new role:', user.role);
    if (!newRole) return;
    
    const newSupervisor = prompt('Enter new supervisor (or leave blank for none):', user.supervisor || '');
    
    // Update UI
    const row = document.querySelector(`#users-list tr[data-id="${user.id}"]`);
    if (row) {
        const cells = row.querySelectorAll('td');
        cells[2].textContent = newRole;
        cells[3].textContent = newSupervisor || '-';
    }
    
    alert(`User updated!\nIn a real implementation, this change would be saved to your GitHub repository.`);
}

// Load statuses data
function loadStatusesData() {
    const statusesList = document.getElementById('statuses-list');
    if (!statusesList) return;
    
    // Clear existing content
    statusesList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleStatuses = [
        { module: 'drivers', name: 'Available', color: '#38a169' },
        { module: 'drivers', name: 'On Duty', color: '#dd6b20' },
        { module: 'drivers', name: 'Maintenance', color: '#c53030' },
        { module: 'tenders', name: 'Delivered', color: '#3182ce' },
        { module: 'invoices', name: 'Overdue', color: '#c53030' }
    ];
    
    // Render statuses
    sampleStatuses.forEach(status => {
        renderStatus(status);
    });
}

// Render a single status
function renderStatus(status) {
    const statusesList = document.getElementById('statuses-list');
    if (!statusesList) return;
    
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
function showAddStatusForm() {
    const module = prompt('Enter module (drivers, tenders, invoices, etc.):', 'drivers');
    if (!module) return;
    
    const name = prompt('Enter status name:', 'Available');
    if (!name) return;
    
    const color = prompt('Enter status color (hex code):', '#38a169');
    if (!color) return;
    
    // In a real implementation, we would save this to GitHub
    const newStatus = {
        module: module,
        name: name,
        color: color
    };
    
    // Add to UI
    renderStatus(newStatus);
    
    alert(`Status "${name}" added to ${module} module successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Edit status
function editStatus(status) {
    const newColor = prompt('Enter new color (hex code):', status.color);
    if (!newColor) return;
    
    // Update UI
    const rows = document.querySelectorAll('#statuses-list tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells[0].textContent.toLowerCase() === status.module && cells[1].textContent === status.name) {
            cells[2].innerHTML = `<span style="display:inline-block; width:20px; height:20px; border-radius:50%; background-color:${newColor};"></span>`;
        }
    });
    
    alert(`Status updated!\nIn a real implementation, this change would be saved to your GitHub repository.`);
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
    
    alert(`Repository migrated to ${newRepo}!\nIn a real implementation, all data would be copied to the new repository.`);
}

// Initialize chat view
function initChat() {
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
function loadChatData() {
    const chatUsersList = document.getElementById('chat-users-list');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatUsersList || !chatMessages) {
        return;
    }
    
    // Clear existing content
    chatUsersList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleUsers = [
        { id: 1, name: 'John Doe', role: 'Administrator', status: 'online', supervisor: null },
        { id: 2, name: 'Sarah Williams', role: 'Manager', status: 'online', supervisor: 'John Doe' },
        { id: 3, name: 'Robert Chen', role: 'Dispatcher', status: 'away', supervisor: 'Sarah Williams' },
        { id: 4, name: 'Michael Johnson', role: 'Driver', status: 'online', supervisor: 'Robert Chen' },
        { id: 5, name: 'Anna Schmidt', role: 'Driver', status: 'online', supervisor: 'Robert Chen' }
    ];
    
    // Render users
    sampleUsers.forEach(user => {
        renderChatUser(user);
    });
    
    // Set current user info
    const chatCurrentUser = document.getElementById('chat-current-user');
    const chatCurrentRole = document.getElementById('chat-current-role');
    
    if (chatCurrentUser && chatCurrentRole) {
        const currentUser = sampleUsers.find(u => u.id === 1);
        if (currentUser) {
            chatCurrentUser.textContent = currentUser.name;
            chatCurrentRole.textContent = currentUser.role;
        }
    }
    
    // Load messages for the first user
    if (sampleUsers.length > 0) {
        loadMessagesForUser(sampleUsers[0]);
    }
}

// Render a single chat user
function renderChatUser(user) {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.dataset.id = user.id;
    
    if (user.id === 1) {
        userItem.classList.add('active');
    }
    
    // Determine status color
    let statusColor;
    switch(user.status) {
        case 'online':
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
    
    document.getElementById('chat-users-list').appendChild(userItem);
}

// Load messages for a user
function loadMessagesForUser(user) {
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
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    
    // In a real implementation, we would fetch messages from GitHub
    const sampleMessages = [
        {
            id: 1,
            senderId: 2,
            content: 'Hi John, I\'ve assigned Michael to tender #TX-7892 for Berlin to Paris route.',
            timestamp: '10:23 AM',
            type: 'received'
        },
        {
            id: 2,
            senderId: 1,
            content: 'Great! Please make sure he has the updated route documentation. Also, check if the trailer inspection is up to date.',
            timestamp: '10:25 AM',
            type: 'sent'
        },
        {
            id: 3,
            senderId: 2,
            content: 'Will do. The trailer inspection is valid until Nov 30. I\'ve sent all documents to Michael.',
            timestamp: '10:27 AM',
            type: 'received'
        },
        {
            id: 4,
            senderId: 1,
            content: 'Perfect. Let me know when he departs.',
            timestamp: '10:28 AM',
            type: 'sent'
        }
    ];
    
    // Render messages
    sampleMessages.forEach(message => {
        renderMessage(message);
    });
    
    // Scroll to bottom
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Render a single message
function renderMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${message.content}</div>
        <div class="message-time">${message.timestamp}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
}

// Send a message
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages) {
        return;
    }
    
    const content = chatInput.value.trim();
    if (!content) return;
    
    // Create new message
    const newMessage = {
        id: Date.now(),
        senderId: 1,
        content: content,
        timestamp: formatTime(new Date()),
        type: 'sent'
    };
    
    // Render message
    renderMessage(newMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    
    // Show login view
    authView.classList.add('active');
    appView.classList.remove('active');
    
    // Clear content area
    contentArea.innerHTML = '';
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
