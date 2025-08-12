// Drivers Module - Standalone module for drivers management
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DRIVERS MODULE] DOM fully loaded, initializing module');
    
    // Initialize drivers view
    window.initDrivers = function() {
        console.log('[DRIVERS MODULE] initDrivers called');
        
        try {
            // Check if content area exists
            const contentArea = document.getElementById('content-area');
            if (!contentArea) {
                console.error('[DRIVERS MODULE] CRITICAL ERROR: Content area not found');
                document.body.innerHTML += `
                    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                                background: white; z-index: 9999; padding: 20px; 
                                font-family: Arial, sans-serif; color: #2d3748;">
                        <h1 style="color: #e53e3e;">CRITICAL ERROR</h1>
                        <p style="font-size: 18px; margin: 20px 0;">Content area (#content-area) not found in DOM.</p>
                        <p style="background: #f7fafc; padding: 15px; border-radius: 8px; 
                                  border-left: 4px solid #e53e3e; margin: 20px 0;">
                            This usually happens when:
                            <ul style="margin-left: 20px; margin-top: 10px;">
                                <li>The main app layout is broken</li>
                                <li>content-area element was removed from DOM</li>
                                <li>There's a JavaScript error preventing DOM initialization</li>
                            </ul>
                        </p>
                        <button onclick="location.reload()" style="background: #e53e3e; color: white; 
                                 border: none; padding: 10px 20px; border-radius: 4px; 
                                 cursor: pointer; font-weight: bold;">
                            Reload Page
                        </button>
                    </div>
                `;
                return;
            }
            
            console.log('[DRIVERS MODULE] Content area found:', contentArea);
            
            // Verify content area is visible and has dimensions
            const contentRect = contentArea.getBoundingClientRect();
            console.log('[DRIVERS MODULE] Content area dimensions:', 
                `width: ${contentRect.width}, height: ${contentRect.height}`);
            
            // If content area has zero height, try to fix it
            if (contentRect.height === 0) {
                console.warn('[DRIVERS MODULE] Content area has zero height, applying fix');
                contentArea.style.height = '100%';
                contentArea.style.minHeight = '500px';
                contentArea.style.display = 'block';
                
                // Force reflow
                void contentArea.offsetWidth;
            }
            
            // Create a minimal drivers view if it doesn't exist
            let driversView = document.getElementById('drivers-view');
            if (!driversView) {
                console.warn('[DRIVERS MODULE] Drivers view container not found, creating one');
                
                driversView = document.createElement('div');
                driversView.id = 'drivers-view';
                driversView.className = 'view active';
                driversView.style.padding = '20px';
                driversView.style.backgroundColor = 'white';
                driversView.style.borderRadius = '8px';
                driversView.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                
                contentArea.innerHTML = ''; // Clear any existing content
                contentArea.appendChild(driversView);
            } else {
                console.log('[DRIVERS MODULE] Drivers view container found:', driversView);
                driversView.className = 'view active'; // Ensure it's visible
            }
            
            // Create page title if it doesn't exist
            let pageTitle = driversView.querySelector('.page-title');
            if (!pageTitle) {
                console.warn('[DRIVERS MODULE] Page title not found, creating one');
                
                pageTitle = document.createElement('div');
                pageTitle.className = 'page-title';
                pageTitle.style.display = 'flex';
                pageTitle.style.justifyContent = 'space-between';
                pageTitle.style.alignItems = 'center';
                pageTitle.style.marginBottom = '25px';
                pageTitle.style.height = '40px';
                
                const titleText = document.createElement('h1');
                titleText.className = 'title-text';
                titleText.style.fontSize = '24px';
                titleText.style.fontWeight = '600';
                titleText.style.color = '#2d3748';
                titleText.textContent = 'Drivers Management';
                
                const actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';
                actionButtons.style.display = 'flex';
                actionButtons.style.gap = '10px';
                
                const addDriverBtn = document.createElement('button');
                addDriverBtn.id = 'add-driver-btn';
                addDriverBtn.className = 'btn btn-primary';
                addDriverBtn.style.backgroundColor = '#e53e3e';
                addDriverBtn.style.color = 'white';
                addDriverBtn.style.border = 'none';
                addDriverBtn.style.padding = '8px 16px';
                addDriverBtn.style.borderRadius = '4px';
                addDriverBtn.style.cursor = 'pointer';
                addDriverBtn.style.fontWeight = '600';
                addDriverBtn.innerHTML = '<i class="fas fa-plus"></i> Add Driver';
                
                actionButtons.appendChild(addDriverBtn);
                pageTitle.appendChild(titleText);
                pageTitle.appendChild(actionButtons);
                
                driversView.appendChild(pageTitle);
            }
            
            // Create data table container if it doesn't exist
            let dataTableContainer = driversView.querySelector('.data-table-container');
            if (!dataTableContainer) {
                console.warn('[DRIVERS MODULE] Data table container not found, creating one');
                
                dataTableContainer = document.createElement('div');
                dataTableContainer.className = 'data-table-container';
                dataTableContainer.style.backgroundColor = 'white';
                dataTableContainer.style.borderRadius = '8px';
                dataTableContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                dataTableContainer.style.overflow = 'hidden';
                dataTableContainer.style.marginBottom = '30px';
                dataTableContainer.style.height = 'calc(100% - 180px)';
                dataTableContainer.style.display = 'flex';
                dataTableContainer.style.flexDirection = 'column';
                
                const tableHeader = document.createElement('div');
                tableHeader.className = 'table-header';
                tableHeader.style.display = 'flex';
                tableHeader.style.justifyContent = 'space-between';
                tableHeader.style.alignItems = 'center';
                tableHeader.style.padding = '15px 20px';
                tableHeader.style.borderBottom = '1px solid #e2e8f0';
                tableHeader.style.backgroundColor = '#f7fafc';
                
                const tableTitle = document.createElement('h2');
                tableTitle.className = 'table-title';
                tableTitle.style.fontSize = '18px';
                tableTitle.style.fontWeight = '600';
                tableTitle.style.color = '#2d3748';
                tableTitle.textContent = 'Driver Database';
                
                const tableFilters = document.createElement('div');
                tableFilters.className = 'table-filters';
                tableFilters.style.display = 'flex';
                tableFilters.style.gap = '10px';
                
                const statusFilter = document.createElement('select');
                statusFilter.id = 'drivers-status-filter';
                statusFilter.className = 'form-control';
                statusFilter.style.padding = '6px 12px';
                statusFilter.style.border = '1px solid #e2e8f0';
                statusFilter.style.borderRadius = '4px';
                
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
                    statusFilter.appendChild(option);
                });
                
                tableFilters.appendChild(statusFilter);
                tableHeader.appendChild(tableTitle);
                tableHeader.appendChild(tableFilters);
                
                dataTableContainer.appendChild(tableHeader);
                driversView.appendChild(dataTableContainer);
            }
            
            // Create drivers list if it doesn't exist
            let driversList = document.getElementById('drivers-list');
            if (!driversList) {
                console.warn('[DRIVERS MODULE] Drivers list not found, creating one');
                
                driversList = document.createElement('div');
                driversList.id = 'drivers-list';
                driversList.className = 'drivers-container';
                driversList.style.flex = '1';
                driversList.style.overflowY = 'auto';
                driversList.style.padding = '15px';
                
                // Add placeholder content
                driversList.innerHTML = `
                    <div class="view-placeholder" style="display: flex; flex-direction: column; 
                                                      align-items: center; justify-content: center; 
                                                      height: 300px; color: #718096;">
                        <div class="loading-indicator" style="display: flex; justify-content: center; 
                                                           align-items: center; height: 40px; 
                                                           margin-bottom: 15px;">
                            <span style="display: inline-block; width: 12px; height: 12px; 
                                      border-radius: 50%; background-color: #e53e3e; 
                                      margin: 0 4px; animation: loading 1.4s infinite 
                                      ease-in-out both;"></span>
                            <span style="display: inline-block; width: 12px; height: 12px; 
                                      border-radius: 50%; background-color: #e53e3e; 
                                      margin: 0 4px; animation: loading 1.4s infinite 
                                      ease-in-out both; animation-delay: 0.2s;"></span>
                            <span style="display: inline-block; width: 12px; height: 12px; 
                                      border-radius: 50%; background-color: #e53e3e; 
                                      margin: 0 4px; animation: loading 1.4s infinite 
                                      ease-in-out both; animation-delay: 0.4s;"></span>
                        </div>
                        <p>Forcing UI to be visible - loading drivers data...</p>
                    </div>
                `;
                
                dataTableContainer.appendChild(driversList);
            }
            
            // Add animation keyframes if not already present
            if (!document.getElementById('loading-animation')) {
                const style = document.createElement('style');
                style.id = 'loading-animation';
                style.textContent = `
                    @keyframes loading {
                        0%, 80%, 100% { transform: scale(0); }
                        40% { transform: scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Set up event listeners with error checking
            setupEventListeners();
            
            // Load drivers data
            loadDriversData();
            
        } catch (error) {
            console.error('[DRIVERS MODULE] Unexpected error:', error);
            
            // Show error in content area
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div style="padding: 30px; background: white; border-radius: 8px; 
                              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #e53e3e; margin-bottom: 15px;">Drivers Module Error</h2>
                        <p style="margin-bottom: 15px; font-family: monospace; 
                                 background: #f7fafc; padding: 15px; border-radius: 4px;">
                            ${error.message}
                        </p>
                        <p style="margin-bottom: 20px;">${error.stack}</p>
                        <button onclick="initDrivers()" style="background: #e53e3e; color: white; 
                                 border: none; padding: 10px 20px; border-radius: 4px; 
                                 cursor: pointer; font-weight: bold;">
                            Retry Initialization
                        </button>
                    </div>
                `;
            }
        }
    };
    
    // Setup event listeners
    function setupEventListeners() {
        console.log('[DRIVERS MODULE] Setting up event listeners');
        
        // Add driver button
        const addDriverBtn = document.getElementById('add-driver-btn');
        if (addDriverBtn) {
            console.log('[DRIVERS MODULE] Setting up add driver button');
            
            // Remove any existing listeners to avoid duplicates
            const newBtn = addDriverBtn.cloneNode(true);
            addDriverBtn.parentNode.replaceChild(newBtn, addDriverBtn);
            
            newBtn.addEventListener('click', () => {
                console.log('[DRIVERS MODULE] Add driver button clicked');
                alert('Add driver functionality would appear here. In a real implementation, this would save to your GitHub repository.');
            });
        } else {
            console.error('[DRIVERS MODULE] Add driver button not found after creation');
        }
        
        // Status filter
        const statusFilter = document.getElementById('drivers-status-filter');
        if (statusFilter) {
            console.log('[DRIVERS MODULE] Setting up status filter');
            
            // Remove any existing listeners to avoid duplicates
            const newFilter = statusFilter.cloneNode(true);
            statusFilter.parentNode.replaceChild(newFilter, statusFilter);
            
            newFilter.addEventListener('change', filterDrivers);
        } else {
            console.error('[DRIVERS MODULE] Status filter not found after creation');
        }
    }
    
    // Load drivers data from GitHub
    async function loadDriversData() {
        console.log('[DRIVERS MODULE] Loading drivers data');
        
        const driversList = document.getElementById('drivers-list');
        if (!driversList) {
            console.error('[DRIVERS MODULE] Drivers list container not found during data load');
            return;
        }
        
        try {
            // Verify GitHub credentials
            if (!appState.repo || !appState.token) {
                console.warn('[DRIVERS MODULE] GitHub credentials not set');
                driversList.innerHTML = `
                    <div style="padding: 30px; background: #fff8f8; border-radius: 8px; 
                              text-align: center;">
                        <h3 style="color: #e53e3e; margin-bottom: 15px;">GitHub Credentials Missing</h3>
                        <p style="margin-bottom: 20px;">Your GitHub token or repository name is not set correctly.</p>
                        <p style="background: #fff; padding: 15px; border-radius: 8px; 
                                  border: 1px solid #feb2b2; margin-bottom: 20px;
                                  text-align: left; font-family: monospace;">
                            Token: ${appState.token ? 'Set' : 'Not set'}<br>
                            Repository: ${appState.repo || 'Not set'}
                        </p>
                        <button onclick="location.reload()" style="background: #e53e3e; color: white; 
                                 border: none; padding: 10px 20px; border-radius: 4px; 
                                 cursor: pointer; font-weight: bold;">
                            Reload Page
                        </button>
                    </div>
                `;
                return;
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
            
            const driversList = document.getElementById('drivers-list');
            if (driversList) {
                driversList.innerHTML = `
                    <div style="padding: 30px; background: #fff8f8; border-radius: 8px; 
                              text-align: center;">
                        <h3 style="color: #e53e3e; margin-bottom: 15px;">Error Loading Drivers</h3>
                        <p style="margin-bottom: 15px; max-width: 600px; margin-left: auto; margin-right: auto;">
                            ${error.message}
                        </p>
                        <p style="background: #fff; padding: 15px; border-radius: 8px; 
                                  border: 1px solid #feb2b2; margin-bottom: 20px;
                                  text-align: left; font-family: monospace; 
                                  max-width: 600px; margin-left: auto; margin-right: auto;">
                            ${error.stack ? error.stack.split('\n')[0] : ''}
                        </p>
                        <div style="display: flex; justify-content: center; gap: 10px;">
                            <button onclick="loadDriversData()" style="background: #4299e1; color: white; 
                                     border: none; padding: 10px 20px; border-radius: 4px; 
                                     cursor: pointer; font-weight: bold;">
                                Retry
                            </button>
                            <button onclick="showSampleData()" style="background: #38a169; color: white; 
                                     border: none; padding: 10px 20px; border-radius: 4px; 
                                     cursor: pointer; font-weight: bold;">
                                Show Sample Data
                            </button>
                        </div>
                    </div>
                `;
                
                // Add sample data function to window
                window.showSampleData = function() {
                    const sampleDrivers = [
                        {
                            id: 1,
                            firstName: 'John',
                            lastName: 'Doe',
                            license: 'DL-123456',
                            experience: '5 years',
                            status: 'available',
                            car: 'TR-789',
                            card: '**** 5678',
                            tenders: '3 (2 active)',
                            lastDelivery: '2 days ago'
                        },
                        {
                            id: 2,
                            firstName: 'Jane',
                            lastName: 'Smith',
                            license: 'DL-654321',
                            experience: '8 years',
                            status: 'on-duty',
                            car: 'TR-456',
                            card: '**** 1234',
                            tenders: '1 (1 active)',
                            lastDelivery: 'Today'
                        }
                    ];
                    
                    renderDrivers(sampleDrivers);
                };
            }
        }
    }
    
    // Render drivers
    function renderDrivers(drivers) {
        console.log('[DRIVERS MODULE] Rendering drivers');
        
        const driversList = document.getElementById('drivers-list');
        if (!driversList) {
            console.error('[DRIVERS MODULE] Drivers list container not found during render');
            return;
        }
        
        if (drivers.length === 0) {
            driversList.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; 
                          justify-content: center; height: 300px; color: #718096;">
                    <i class="fas fa-user-friends" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <h3>No Drivers Found</h3>
                    <p>Get started by adding your first driver</p>
                    <button id="first-driver-btn" style="background: #e53e3e; color: white; 
                             border: none; padding: 10px 20px; border-radius: 4px; 
                             cursor: pointer; font-weight: bold; margin-top: 15px;
                             display: flex; align-items: center; gap: 8px;">
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
        console.log('[DRIVERS MODULE] Rendering driver:', driver.id, driver.firstName, driver.lastName);
        
        const driverSlip = document.createElement('div');
        driverSlip.className = 'driver-slip';
        driverSlip.dataset.id = driver.id;
        driverSlip.style.backgroundColor = 'white';
        driverSlip.style.border = '1px solid #e2e8f0';
        driverSlip.style.borderRadius = '8px';
        driverSlip.style.padding = '15px';
        driverSlip.style.marginBottom = '15px';
        driverSlip.style.cursor = 'pointer';
        driverSlip.style.transition = 'all 0.3s ease';
        driverSlip.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        
        // Add hover effect with inline style
        driverSlip.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            this.style.borderColor = '#e53e3e';
        };
        driverSlip.onmouseout = function() {
            this.style.transform = '';
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            this.style.borderColor = '#e2e8f0';
        };
        
        // Determine status class
        let statusClass, statusText, statusBg, statusColor;
        switch(driver.status) {
            case 'available':
                statusClass = 'status-available';
                statusText = 'Available';
                statusBg = 'rgba(56, 161, 105, 0.15)';
                statusColor = '#38a169';
                break;
            case 'on-duty':
                statusClass = 'status-pending';
                statusText = 'On Duty';
                statusBg = 'rgba(221, 107, 32, 0.15)';
                statusColor = '#dd6b20';
                break;
            case 'maintenance':
                statusClass = 'status-cancelled';
                statusText = 'Maintenance';
                statusBg = 'rgba(197, 48, 48, 0.15)';
                statusColor = '#c53030';
                break;
            default:
                statusClass = 'status-available';
                statusText = 'Available';
                statusBg = 'rgba(56, 161, 105, 0.15)';
                statusColor = '#38a169';
        }
        
        // Create driver slip content
        const driverHeader = document.createElement('div');
        driverHeader.style.display = 'flex';
        driverHeader.style.justifyContent = 'space-between';
        driverHeader.style.alignItems = 'center';
        driverHeader.style.marginBottom = '10px';
        driverHeader.style.paddingBottom = '10px';
        driverHeader.style.borderBottom = '1px solid #e2e8f0';
        
        const driverName = document.createElement('div');
        driverName.style.fontWeight = '600';
        driverName.style.fontSize = '18px';
        driverName.style.color = '#2d3748';
        driverName.textContent = `${driver.firstName} ${driver.lastName}`;
        
        const driverStatus = document.createElement('div');
        driverStatus.style.padding = '3px 10px';
        driverStatus.style.borderRadius = '20px';
        driverStatus.style.fontSize = '12px';
        driverStatus.style.fontWeight = '600';
        driverStatus.style.backgroundColor = statusBg;
        driverStatus.style.color = statusColor;
        driverStatus.textContent = statusText;
        
        driverHeader.appendChild(driverName);
        driverHeader.appendChild(driverStatus);
        
        const driverDetails = document.createElement('div');
        driverDetails.style.display = 'grid';
        driverDetails.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        driverDetails.style.gap = '8px';
        
        const detailItems = [
            { label: 'License:', value: driver.license },
            { label: 'Experience:', value: driver.experience || 'N/A' },
            { label: 'Assigned Car:', value: driver.car || 'Unassigned' },
            { label: 'Assigned Card:', value: driver.card || 'Unassigned' },
            { label: 'Tenders:', value: driver.tenders || '0 (0 active)' },
            { label: 'Last Delivery:', value: driver.lastDelivery || 'Never' }
        ];
        
        detailItems.forEach(item => {
            const detailItem = document.createElement('div');
            
            const detailLabel = document.createElement('span');
            detailLabel.style.fontWeight = '600';
            detailLabel.style.color = '#2d3748';
            detailLabel.style.marginRight = '5px';
            detailLabel.textContent = item.label;
            
            const detailValue = document.createElement('span');
            detailValue.textContent = item.value;
            
            detailItem.appendChild(detailLabel);
            detailItem.appendChild(detailValue);
            driverDetails.appendChild(detailItem);
        });
        
        // Add click handler
        driverSlip.addEventListener('click', () => {
            console.log('[DRIVERS MODULE] Driver clicked:', driver.id, driver.firstName, driver.lastName);
            alert(`Driver Details:\n\nName: ${driver.firstName} ${driver.lastName}\nLicense: ${driver.license}\nStatus: ${driver.status}\n\nIn a real implementation, this would show a detailed view with all driver information.`);
        });
        
        // Assemble the driver slip
        driverSlip.appendChild(driverHeader);
        driverSlip.appendChild(driverDetails);
        container.appendChild(driverSlip);
    }
    
    // Filter drivers by status
    function filterDrivers() {
        console.log('[DRIVERS MODULE] Filtering drivers by status');
        
        const statusFilter = document.getElementById('drivers-status-filter');
        const filterValue = statusFilter ? statusFilter.value : 'all';
        
        const driverSlips = document.querySelectorAll('.driver-slip');
        driverSlips.forEach(slip => {
            const statusText = slip.querySelector('[style*="color"]')?.textContent.toLowerCase() || '';
            
            if (filterValue === 'all' || statusText.includes(filterValue)) {
                slip.style.display = 'block';
            } else {
                slip.style.display = 'none';
            }
        });
    }
});
