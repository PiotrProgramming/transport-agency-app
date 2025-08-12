// Drivers Module - Standalone module for drivers management
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DRIVERS MODULE] DOM fully loaded, initializing module');
    
    // Initialize drivers view
    window.initDrivers = function() {
        console.log('[DRIVERS MODULE] initDrivers called');
        
        // Verify the view structure is correct
        const driversView = document.getElementById('drivers-view');
        if (!driversView) {
            console.error('[DRIVERS MODULE] CRITICAL ERROR: #drivers-view element not found');
            return;
        }
        
        // Verify critical elements exist
        const addDriverBtn = document.getElementById('add-driver-btn');
        const driversStatusFilter = document.getElementById('drivers-status-filter');
        const driversList = document.getElementById('drivers-list');
        
        // Check for missing elements and create them if necessary
        const missingElements = [];
        
        if (!addDriverBtn) {
            missingElements.push('add-driver-btn');
            
            // Create the button if it's missing
            const actionButtons = driversView.querySelector('.action-buttons');
            if (actionButtons) {
                const newBtn = document.createElement('button');
                newBtn.id = 'add-driver-btn';
                newBtn.className = 'btn btn-primary';
                newBtn.innerHTML = '<i class="fas fa-plus"></i> Add Driver';
                actionButtons.appendChild(newBtn);
            }
        }
        
        if (!driversStatusFilter) {
            missingElements.push('drivers-status-filter');
            
            // Create the filter if it's missing
            const tableFilters = driversView.querySelector('.table-filters');
            if (tableFilters) {
                const newFilter = document.createElement('select');
                newFilter.id = 'drivers-status-filter';
                newFilter.className = 'form-control';
                
                const statuses = [
                    { value: 'all', text: 'All Statuses' },
                    { value: 'available', text: 'Available' },
                    { value: 'on-duty', text: 'On Duty' },
                    { value: 'maintenance', text: 'Maintenance' }
                ];
                
                statuses.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status.value;
                    option.textContent = status.text;
                    newFilter.appendChild(option);
                });
                
                tableFilters.appendChild(newFilter);
            }
        }
        
        if (!driversList) {
            missingElements.push('drivers-list');
            
            // Create the drivers list if it's missing
            const dataTableContainer = driversView.querySelector('.data-table-container');
            if (dataTableContainer) {
                const newContainer = document.createElement('div');
                newContainer.id = 'drivers-list';
                newContainer.className = 'drivers-container';
                newContainer.innerHTML = `
                    <div class="view-placeholder">
                        <div class="loading-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <p>FORCED DRIVERS LIST - LOADING DRIVERS DATA...</p>
                    </div>
                `;
                dataTableContainer.appendChild(newContainer);
            }
        }
        
        // Log missing elements
        if (missingElements.length > 0) {
            console.warn('[DRIVERS MODULE] Created missing elements:', missingElements);
        }
        
        // Re-get elements after potentially creating them
        const finalAddDriverBtn = document.getElementById('add-driver-btn');
        const finalDriversStatusFilter = document.getElementById('drivers-status-filter');
        const finalDriversList = document.getElementById('drivers-list');
        
        // Verify all critical elements now exist
        if (!finalAddDriverBtn || !finalDriversStatusFilter || !finalDriversList) {
            console.error('[DRIVERS MODULE] CRITICAL ERROR: Still missing critical elements');
            
            // Show error in drivers list
            if (finalDriversList) {
                finalDriversList.innerHTML = `
                    <div class="error-message">
                        <h3>CRITICAL ERROR</h3>
                        <p>Missing critical elements in drivers view</p>
                        <p>Missing elements: ${missingElements.join(', ')}</p>
                        <button class="btn btn-primary" onclick="location.reload()">Reload Page</button>
                    </div>
                `;
            }
            return;
        }
        
        console.log('[DRIVERS MODULE] All critical elements found. Proceeding with initialization.');
        
        // Initialize event listeners
        initEventListeners();
        
        // Load drivers data
        loadDriversData();
        
        function initEventListeners() {
            console.log('[DRIVERS MODULE] Setting up event listeners');
            
            // Add driver button
            if (finalAddDriverBtn) {
                console.log('[DRIVERS MODULE] Setting up add driver button');
                
                // Remove any existing listeners to avoid duplicates
                const newBtn = finalAddDriverBtn.cloneNode(true);
                finalAddDriverBtn.parentNode.replaceChild(newBtn, finalAddDriverBtn);
                
                newBtn.addEventListener('click', () => {
                    console.log('[DRIVERS MODULE] Add driver button clicked');
                    alert('Add driver functionality would appear here. In a real implementation, this would save to your GitHub repository.');
                });
            } else {
                console.error('[DRIVERS MODULE] Add driver button not found after creation');
            }
            
            // Status filter
            if (finalDriversStatusFilter) {
                console.log('[DRIVERS MODULE] Setting up status filter');
                
                // Remove any existing listeners to avoid duplicates
                const newFilter = finalDriversStatusFilter.cloneNode(true);
                finalDriversStatusFilter.parentNode.replaceChild(newFilter, finalDriversStatusFilter);
                
                newFilter.addEventListener('change', filterDrivers);
            } else {
                console.error('[DRIVERS MODULE] Status filter not found after creation');
            }
        }
        
        // Load drivers data from GitHub
        async function loadDriversData() {
            console.log('[DRIVERS MODULE] Loading drivers data');
            
            try {
                // Show loading state
                finalDriversList.innerHTML = `
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
                
                console.log('[DRIVERS MODULE] GitHub credentials verified. Repo:', appState.repo);
                
                // Fetch data from GitHub
                console.log('[DRIVERS MODULE] Attempting to fetch drivers.json from GitHub');
                const drivers = await githubService.getFileContent('drivers.json');
                
                console.log(`[DRIVERS MODULE] Successfully loaded ${drivers.length} drivers from GitHub`);
                
                // Render data
                renderDrivers(drivers);
            } catch (error) {
                console.error('[DRIVERS MODULE] Error loading drivers:', error);
                showErrorMessage(error);
            }
        }
        
        // Render drivers
        function renderDrivers(drivers) {
            console.log('[DRIVERS MODULE] Rendering drivers');
            
            if (drivers.length === 0) {
                finalDriversList.innerHTML = `
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
            finalDriversList.innerHTML = '';
            
            // Render each driver
            drivers.forEach(driver => {
                renderDriver(driver, finalDriversList);
            });
        }
        
        // Render a single driver
        function renderDriver(driver, container) {
            console.log('[DRIVERS MODULE] Rendering driver:', driver.id, driver.firstName, driver.lastName);
            
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
                console.log('[DRIVERS MODULE] Driver clicked:', driver.id, driver.firstName, driver.lastName);
                alert(`Driver Details:\n\nName: ${driver.firstName} ${driver.lastName}\nLicense: ${driver.license}\nStatus: ${driver.status}\n\nIn a real implementation, this would show a detailed view with all driver information.`);
            });
            
            container.appendChild(driverSlip);
        }
        
        // Filter drivers by status
        function filterDrivers() {
            console.log('[DRIVERS MODULE] Filtering drivers by status');
            
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
            console.log('[DRIVERS MODULE] Showing error message:', error.message);
            
            finalDriversList.innerHTML = `
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
