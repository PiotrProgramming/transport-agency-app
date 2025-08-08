// Initialize admin
function initAdmin() {
    console.log('Initializing admin view');
    
    // Register this view's initializer with the app state
    appState.registerViewInitializer('admin', function() {
        console.log('Admin view initialized');
    });
    
    // Register this view's data loader with the app state
    appState.registerViewLoader('admin', function() {
        console.log('Admin view data loader called');
        loadAdminData();
    });
    
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
    console.log('Loading admin data');
    
    // Load user management data
    loadUsersData();
    
    // Load status management data
    loadStatusesData();
}

// Load users data
function loadUsersData() {
    const usersList = document.getElementById('users-list');
    if (!usersList) {
        console.error('Users list element not found');
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
    
    console.log(`Successfully loaded ${sampleUsers.length} users`);
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
    
    console.log(`Successfully loaded ${sampleStatuses.length} statuses`);
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

// Initialize admin when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdmin);
