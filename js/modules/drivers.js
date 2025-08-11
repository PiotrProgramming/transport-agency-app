// Define the initDrivers function globally
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
    
    // Load drivers data
    loadDriversData();
}

// Load drivers data
async function loadDriversData() {
    const driversList = document.getElementById('drivers-list');
    if (!driversList) {
        console.error('Drivers list container not found');
        return;
    }
    
    // Clear existing content
    driversList.innerHTML = `
        <div class="view-placeholder">
            <div class="loading-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p>Loading drivers data...</p>
        </div>
    `;
    
    try {
        // REAL DATABASE CALL - Fetch drivers from GitHub
        const drivers = await githubService.getFileContent('drivers.json');
        
        // Clear loading indicator
        driversList.innerHTML = '';
        
        // Render drivers
        drivers.forEach(driver => {
            renderDriver(driver, driversList);
        });
        
        console.log(`Successfully loaded ${drivers.length} drivers from database`);
    } catch (error) {
        console.error('Error loading drivers:', error);
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
