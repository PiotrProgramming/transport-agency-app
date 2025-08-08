// Drivers Module - Standalone module for drivers management
var DriversModule = (function() {
    // Private variables
    let driversList;
    let statusFilter;
    let addDriverBtn;
    let importBtn;
    let viewInitialized = false;
    
    // Initialize the drivers module
    function init() {
        console.log('Initializing Drivers Module');
        
        // Get DOM elements
        driversList = document.getElementById('drivers-list');
        statusFilter = document.getElementById('drivers-status-filter');
        addDriverBtn = document.getElementById('add-driver-btn');
        importBtn = document.getElementById('drivers-import-btn');
        
        if (!driversList) {
            console.error('Drivers list container not found');
            return;
        }
        
        // Clear placeholder
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
        
        // Set up event listeners
        if (addDriverBtn) {
            addDriverBtn.addEventListener('click', showAddDriverForm);
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', filterDrivers);
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', handleImport);
        }
        
        // Load data
        loadDriversData();
        
        viewInitialized = true;
        appState.modules.drivers = this;
    }
    
    // Load drivers data from GitHub
    async function loadDriversData() {
        console.log('Loading drivers data');
        
        if (!driversList) {
            console.error('Drivers list container not found');
            return;
        }
        
        try {
            // Show loading state
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
            
            // Fetch data from GitHub
            const drivers = await githubService.getFileContent('drivers.json');
            
            // Render data
            renderDrivers(drivers);
            
            console.log(`Successfully loaded ${drivers.length} drivers from GitHub`);
        } catch (error) {
            console.error('Error loading drivers:', error);
            showErrorMessage(error);
        }
    }
    
    // Render drivers
    function renderDrivers(drivers) {
        if (!driversList) return;
        
        if (drivers.length === 0) {
            driversList.innerHTML = `
                <div class="view-placeholder">
                    <i class="fas fa-user-friends" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                    <h3>No Drivers Found</h3>
                    <p>Get started by adding your first driver</p>
                    <button class="btn btn-primary" id="first-driver-btn" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Add First Driver
                    </button>
                </div>
            `;
            
            // Add event listener for the first driver button
            const firstDriverBtn = document.getElementById('first-driver-btn');
            if (firstDriverBtn) {
                firstDriverBtn.addEventListener('click', showAddDriverForm);
            }
            
            return;
        }
        
        // Clear container
        driversList.innerHTML = '';
        
        // Render each driver
        drivers.forEach(driver => {
            renderDriver(driver);
        });
    }
    
    // Render a single driver
    function renderDriver(driver) {
        if (!driversList) return;
        
        const driverSlip = document.createElement('div');
        driverSlip.className = 'driver-slip';
        driverSlip.dataset.id = driver.id;
        
        // Determine status class
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
                    <span class="detail-label">Tenders:</span> ${driver.tenders || '0 (0 active)'}
                </div>
                <div>
                    <span class="detail-label">Last Delivery:</span> ${driver.lastDelivery || 'Never'}
                </div>
            </div>
        `;
        
        // Add click handler
        driverSlip.addEventListener('click', () => {
            showDriverDetails(driver);
        });
        
        driversList.appendChild(driverSlip);
    }
    
    // Show driver details
    function showDriverDetails(driver) {
        // In a real implementation, this would show a detailed view
        alert(`Driver Details:\n\nName: ${driver.firstName} ${driver.lastName}\nLicense: ${driver.license}\nStatus: ${driver.status}\nExperience: ${driver.experience}\n\nIn a real implementation, this would show a detailed view with all driver information.`);
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
            // Fetch existing drivers
            const drivers = await githubService.getFileContent('drivers.json');
            
            // Generate new ID
            const newId = drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1;
            
            // Create new driver
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
            
            // Add to drivers array
            drivers.push(newDriver);
            
            // Save to GitHub
            await githubService.updateFileContent('drivers.json', drivers, 'Add new driver');
            
            // Show success message
            alert(`Driver ${name} ${lastName} added successfully!`);
            
            // Refresh data
            loadDriversData();
        } catch (error) {
            console.error('Error adding driver:', error);
            alert(`Failed to add driver: ${error.message}`);
        }
    }
    
    // Filter drivers by status
    function filterDrivers() {
        if (!statusFilter || !driversList) return;
        
        const filterValue = statusFilter.value;
        const driverSlips = document.querySelectorAll('.driver-slip');
        
        driverSlips.forEach(slip => {
            const statusText = slip.querySelector('.driver-status').textContent.toLowerCase();
            
            if (filterValue === 'all' || statusText.includes(filterValue)) {
                slip.style.display = 'block';
            } else {
                slip.style.display = 'none';
            }
        });
    }
    
    // Handle import
    function handleImport() {
        alert('Import functionality would open a file picker to import drivers from a CSV or Excel file.\n\nIn a real implementation, this data would be saved to your GitHub repository.');
    }
    
    // Show error message
    function showErrorMessage(error) {
        if (!driversList) return;
        
        driversList.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Drivers</h3>
                <p>${error.message}</p>
                <div style="margin-top: 15px;">
                    <button class="btn btn-primary" id="retry-drivers-btn">Retry</button>
                </div>
            </div>
        `;
        
        // Add retry button handler
        const retryBtn = document.getElementById('retry-drivers-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', loadDriversData);
        }
    }
    
    // Public API
    return {
        init: init,
        load: loadDriversData,
        filter: filterDrivers
    };
})();
