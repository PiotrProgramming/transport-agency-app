// Drivers Module - Standalone module for drivers management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize drivers view
    window.initDrivers = function() {
        console.log('Initializing drivers view');
        
        // Check if content area exists
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }
        
        // Get DOM elements with error checking
        const addDriverBtn = document.getElementById('add-driver-btn');
        const driversStatusFilter = document.getElementById('drivers-status-filter');
        const driversList = document.getElementById('drivers-list');
        
        // Verify critical elements exist
        if (!driversList) {
            console.error('Drivers list container not found');
            contentArea.innerHTML = `
                <div class="error-message">
                    <h3>View Error</h3>
                    <p>Drivers list container not found. Check your HTML structure.</p>
                    <p>Make sure you have a div with id="drivers-list"</p>
                </div>
            `;
            return;
        }
        
        console.log('All critical elements found. Proceeding with initialization.');
        
        // Initialize event listeners with error checking
        initEventListeners();
        
        // Load drivers data
        loadDriversData();
        
        function initEventListeners() {
            // Add driver button
            if (addDriverBtn) {
                console.log('Setting up add driver button');
                addDriverBtn.addEventListener('click', () => {
                    console.log('Add driver button clicked');
                    alert('Add driver functionality would appear here. In a real implementation, this would save to your GitHub repository.');
                });
            } else {
                console.warn('Add driver button not found');
            }
            
            // Status filter
            if (driversStatusFilter) {
                console.log('Setting up status filter');
                driversStatusFilter.addEventListener('change', filterDrivers);
            } else {
                console.warn('Status filter not found');
            }
        }
        
        // Load drivers data from GitHub
        async function loadDriversData() {
            console.log('Loading drivers data');
            
            try {
                // Show loading state
                driversList.innerHTML = `
                    <div class="view-placeholder">
                        <div class="loading-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <p>Checking for drivers data...</p>
                    </div>
                `;
                
                // Verify GitHub credentials
                if (!appState.repo || !appState.token) {
                    throw new Error('GitHub credentials not set. Please check your login.');
                }
                
                console.log('GitHub credentials verified. Repo:', appState.repo);
                
                // Fetch data from GitHub
                console.log('Attempting to fetch drivers.json from GitHub');
                const drivers = await githubService.getFileContent('drivers.json');
                
                console.log(`Successfully loaded ${drivers.length} drivers from GitHub`);
                
                // Render data
                renderDrivers(drivers);
            } catch (error) {
                console.error('Error loading drivers:', error);
                showErrorMessage(error);
            }
        }
        
        // Render drivers
        function renderDrivers(drivers) {
            console.log('Rendering drivers');
            
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
                    firstDriverBtn.addEventListener('click', () => {
                        alert('Add driver functionality would appear here. In a real implementation, this would save to your GitHub repository.');
                    });
                }
                
                return;
            }
            
            // Clear container
            driversList.innerHTML = '';
            
            // Render each driver
            drivers.forEach(driver => {
                renderDriver(driver, driversList);
            });
        }
        
        // Render a single driver
        function renderDriver(driver, container) {
            console.log('Rendering driver:', driver.id, driver.firstName, driver.lastName);
            
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
                        <span class="detail-label">Experience:</span> ${driver.experience || 'N/A'}
                    </div>
                    <div>
                        <span class="detail-label">Assigned Car:</span> ${driver.car || 'Unassigned'}
                    </div>
                    <div>
                        <span class="detail-label">Assigned Card:</span> ${driver.card || 'Unassigned'}
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
                console.log('Driver clicked:', driver.id, driver.firstName, driver.lastName);
                alert(`Driver Details:\n\nName: ${driver.firstName} ${driver.lastName}\nLicense: ${driver.license}\nStatus: ${driver.status}\n\nIn a real implementation, this would show a detailed view with all driver information.`);
            });
            
            container.appendChild(driverSlip);
        }
        
        // Filter drivers by status
        function filterDrivers() {
            console.log('Filtering drivers by status');
            
            const statusFilter = document.getElementById('drivers-status-filter');
            const filterValue = statusFilter ? statusFilter.value : 'all';
            
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
        
        // Show error message
        function showErrorMessage(error) {
            console.log('Showing error message:', error.message);
            
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
    };
});
