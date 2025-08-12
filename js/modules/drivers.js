// Drivers Module - Simple initialization that works with existing HTML
document.addEventListener('DOMContentLoaded', function() {
    // This function will be called when the drivers view is loaded
    window.initDrivers = function() {
        console.log('DRIVERS MODULE: initDrivers called');
        
        // Wait for the DOM to be fully updated with the new content
        setTimeout(function() {
            console.log('DRIVERS MODULE: Initializing after DOM update');
            
            // Get all required elements
            const addDriverBtn = document.getElementById('add-driver-btn');
            const driversStatusFilter = document.getElementById('drivers-status-filter');
            const driversList = document.getElementById('drivers-list');
            
            console.log('DRIVERS MODULE: Elements status:');
            console.log('- addDriverBtn:', addDriverBtn ? 'FOUND' : 'MISSING');
            console.log('- driversStatusFilter:', driversStatusFilter ? 'FOUND' : 'MISSING');
            console.log('- driversList:', driversList ? 'FOUND' : 'MISSING');
            
            // Check if critical elements exist
            if (!addDriverBtn || !driversStatusFilter || !driversList) {
                console.error('DRIVERS MODULE: Critical elements missing!');
                
                // Show error in drivers list
                if (driversList) {
                    driversList.innerHTML = `
                        <div class="error-message" style="padding: 30px; background: #fff8f8; border-radius: 8px; text-align: center;">
                            <h3 style="color: #e53e3e; margin-bottom: 15px;">CRITICAL ERROR</h3>
                            <p style="margin-bottom: 15px; font-size: 18px;">Critical elements missing in drivers view</p>
                            <p style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #feb2b2; margin-bottom: 20px; text-align: left; font-family: monospace; font-size: 16px;">
                                addDriverBtn: ${addDriverBtn ? 'FOUND' : 'MISSING'}<br>
                                driversStatusFilter: ${driversStatusFilter ? 'FOUND' : 'MISSING'}<br>
                                driversList: ${driversList ? 'FOUND' : 'MISSING'}
                            </p>
                            <button onclick="location.reload()" style="background: #e53e3e; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                                Reload Page
                            </button>
                        </div>
                    `;
                }
                return;
            }
            
            console.log('DRIVERS MODULE: All critical elements found. Initializing functionality...');
            
            // Add driver button functionality
            addDriverBtn.addEventListener('click', function() {
                console.log('DRIVERS MODULE: Add driver button clicked');
                alert('Add driver functionality would appear here. In a real implementation, this would save to your GitHub repository.');
            });
            
            // Status filter functionality
            driversStatusFilter.addEventListener('change', function() {
                console.log('DRIVERS MODULE: Filtering drivers by status:', this.value);
                
                const filterValue = this.value;
                const driverSlips = document.querySelectorAll('.driver-slip');
                
                driverSlips.forEach(slip => {
                    const statusText = slip.querySelector('.driver-status')?.textContent.toLowerCase() || '';
                    
                    if (filterValue === 'all' || statusText.includes(filterValue)) {
                        slip.style.display = 'block';
                    } else {
                        slip.style.display = 'none';
                    }
                });
            });
            
            // Load drivers data
            loadDriversData();
        }, 100); // Small delay to ensure DOM is fully updated
    };
    
    // Load drivers data from GitHub
    async function loadDriversData() {
        console.log('DRIVERS MODULE: Loading drivers data');
        
        const driversList = document.getElementById('drivers-list');
        if (!driversList) return;
        
        try {
            // Show loading state
            driversList.innerHTML = `
                <div class="view-placeholder">
                    <div class="loading-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <p>Checking GitHub for drivers data...</p>
                </div>
            `;
            
            // Verify GitHub credentials
            if (!appState.repo || !appState.token) {
                throw new Error('GitHub credentials not set. Please check your login.');
            }
            
            console.log('DRIVERS MODULE: GitHub credentials verified. Repo:', appState.repo);
            
            // Fetch data from GitHub
            console.log('DRIVERS MODULE: Attempting to fetch drivers.json from GitHub');
            const drivers = await githubService.getFileContent('drivers.json');
            
            console.log(`DRIVERS MODULE: Successfully loaded ${drivers.length} drivers from GitHub`);
            
            // Render data
            renderDrivers(drivers);
        } catch (error) {
            console.error('DRIVERS MODULE: Error loading drivers:', error);
            showErrorMessage(error);
        }
    }
    
    // Render drivers
    function renderDrivers(drivers) {
        console.log('DRIVERS MODULE: Rendering drivers');
        
        const driversList = document.getElementById('drivers-list');
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
                firstDriverBtn.addEventListener('click', function() {
                    console.log('DRIVERS MODULE: First driver button clicked');
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
        console.log('DRIVERS MODULE: Rendering driver:', driver.id, driver.firstName, driver.lastName);
        
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
        driverSlip.addEventListener('click', function() {
            console.log('DRIVERS MODULE: Driver clicked:', driver.id, driver.firstName, driver.lastName);
            alert(`Driver Details:\\n\\nName: ${driver.firstName} ${driver.lastName}\\nLicense: ${driver.license}\\nStatus: ${driver.status}\\n\\nIn a real implementation, this would show a detailed view with all driver information.`);
        });
        
        container.appendChild(driverSlip);
    }
    
    // Show error message
    function showErrorMessage(error) {
        console.log('DRIVERS MODULE: Showing error message:', error.message);
        
        const driversList = document.getElementById('drivers-list');
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
});
