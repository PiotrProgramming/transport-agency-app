// Drivers Module - Standalone module for drivers management
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DRIVERS MODULE] DOM fully loaded, initializing module');
    
    // Initialize drivers view
    window.initDrivers = function() {
        console.log('[DRIVERS MODULE] initDrivers called');
        
        // Force content area to be visible and have dimensions
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.style.display = 'block';
            contentArea.style.height = '100%';
            contentArea.style.minHeight = '500px';
            contentArea.style.backgroundColor = '#ffffff';
            contentArea.style.padding = '0';
            contentArea.style.boxSizing = 'border-box';
            
            // Verify drivers view exists
            const driversView = document.getElementById('drivers-view');
            if (!driversView) {
                console.error('[DRIVERS MODULE] CRITICAL: #drivers-view element not found');
                
                // Create a highly visible error message
                contentArea.innerHTML = `
                    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                                background: white; z-index: 9999; padding: 20px; 
                                font-family: Arial, sans-serif; color: #2d3748; display: flex; 
                                flex-direction: column; align-items: center; justify-content: center;">
                        <h1 style="color: #e53e3e; font-size: 36px; margin-bottom: 20px;">CRITICAL ERROR</h1>
                        <p style="font-size: 24px; margin: 20px 0; max-width: 800px; text-align: center;">
                            The #drivers-view element is missing from the DOM.
                        </p>
                        <div style="background: #fff8f8; padding: 30px; border-radius: 10px; 
                                  border: 3px solid #e53e3e; max-width: 800px; text-align: center;">
                            <p style="font-size: 20px; margin-bottom: 20px;">
                                This usually happens when:
                            </p>
                            <ul style="text-align: left; font-size: 18px; margin: 0 50px;">
                                <li>The views/drivers.html file is empty or missing</li>
                                <li>There's a JavaScript error preventing DOM initialization</li>
                                <li>The app-view element is not properly structured</li>
                            </ul>
                        </div>
                        <button onclick="location.reload()" style="background: #e53e3e; color: white; 
                                 border: none; padding: 15px 30px; border-radius: 8px; 
                                 cursor: pointer; font-weight: bold; font-size: 20px; 
                                 margin-top: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            RELOAD PAGE
                        </button>
                    </div>
                `;
                return;
            }
        }
        
        // Get all required elements with verification
        const addDriverBtn = document.getElementById('add-driver-btn');
        const driversStatusFilter = document.getElementById('drivers-status-filter');
        const driversList = document.getElementById('drivers-list');
        
        console.log('[DRIVERS MODULE] Elements status:');
        console.log('- addDriverBtn:', addDriverBtn ? 'FOUND' : 'MISSING');
        console.log('- driversStatusFilter:', driversStatusFilter ? 'FOUND' : 'MISSING');
        console.log('- driversList:', driversList ? 'FOUND' : 'MISSING');
        
        // If any critical element is missing, create it
        if (!addDriverBtn || !driversStatusFilter || !driversList) {
            console.warn('[DRIVERS MODULE] Creating missing elements');
            
            // Create or fix the page title
            let pageTitle = document.querySelector('.page-title');
            if (!pageTitle) {
                const container = document.getElementById('drivers-view');
                pageTitle = document.createElement('div');
                pageTitle.className = 'page-title';
                pageTitle.style.display = 'flex';
                pageTitle.style.justifyContent = 'space-between';
                pageTitle.style.alignItems = 'center';
                pageTitle.style.marginBottom = '25px';
                pageTitle.style.height = '40px';
                pageTitle.style.border = '2px solid #4a5568';
                pageTitle.style.padding = '10px';
                container.insertBefore(pageTitle, container.firstChild);
            }
            
            // Create or fix action buttons
            let actionButtons = pageTitle.querySelector('.action-buttons');
            if (!actionButtons) {
                actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';
                actionButtons.style.display = 'flex';
                actionButtons.style.gap = '10px';
                pageTitle.appendChild(actionButtons);
            }
            
            // Create add driver button if missing
            if (!addDriverBtn) {
                const btn = document.createElement('button');
                btn.id = 'add-driver-btn';
                btn.className = 'btn btn-primary';
                btn.style.backgroundColor = '#e53e3e';
                btn.style.color = 'white';
                btn.style.border = 'none';
                btn.style.padding = '8px 16px';
                btn.style.borderRadius = '4px';
                btn.style.cursor = 'pointer';
                btn.style.fontWeight = '600';
                btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                btn.innerHTML = '<i class="fas fa-plus"></i> ADD DRIVER';
                actionButtons.appendChild(btn);
            }
            
            // Create status filter if missing
            if (!driversStatusFilter) {
                const tableHeader = document.querySelector('.table-header');
                let tableFilters = tableHeader.querySelector('.table-filters');
                if (!tableFilters) {
                    tableFilters = document.createElement('div');
                    tableFilters.className = 'table-filters';
                    tableFilters.style.display = 'flex';
                    tableFilters.style.gap = '10px';
                    tableHeader.appendChild(tableFilters);
                }
                
                const filter = document.createElement('select');
                filter.id = 'drivers-status-filter';
                filter.className = 'form-control';
                filter.style.padding = '6px 12px';
                filter.style.border = '1px solid #e2e8f0';
                filter.style.borderRadius = '4px';
                filter.style.minWidth = '200px';
                filter.style.fontSize = '16px';
                filter.style.border = '2px solid #4a5568';
                
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
                    filter.appendChild(option);
                });
                
                tableFilters.appendChild(filter);
            }
            
            // Create drivers list if missing
            if (!driversList) {
                const container = document.querySelector('.data-table-container');
                const list = document.createElement('div');
                list.id = 'drivers-list';
                list.className = 'drivers-container';
                list.style.flex = '1';
                list.style.overflowY = 'auto';
                list.style.padding = '15px';
                list.style.minHeight = '300px';
                list.style.border = '2px solid #e53e3e';
                container.appendChild(list);
            }
            
            // Re-get elements after creating them
            const finalAddDriverBtn = document.getElementById('add-driver-btn');
            const finalDriversStatusFilter = document.getElementById('drivers-status-filter');
            const finalDriversList = document.getElementById('drivers-list');
            
            // Verify all critical elements now exist
            if (!finalAddDriverBtn || !finalDriversStatusFilter || !finalDriversList) {
                console.error('[DRIVERS MODULE] CRITICAL ERROR: Still missing critical elements');
                
                // Show error in content area
                const contentArea = document.getElementById('content-area');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                                    background: white; z-index: 9999; padding: 20px; 
                                    font-family: Arial, sans-serif; color: #2d3748; display: flex; 
                                    flex-direction: column; align-items: center; justify-content: center;">
                            <h1 style="color: #e53e3e; font-size: 36px; margin-bottom: 20px;">CRITICAL ERROR</h1>
                            <p style="font-size: 24px; margin: 20px 0; max-width: 800px; text-align: center;">
                                Still missing critical elements after attempting to create them.
                            </p>
                            <div style="background: #fff8f8; padding: 30px; border-radius: 10px; 
                                      border: 3px solid #e53e3e; max-width: 800px; text-align: center;">
                                <p style="font-size: 20px; margin-bottom: 20px;">
                                    This is likely due to a fundamental issue with your application structure.
                                </p>
                                <p style="font-size: 18px; margin-bottom: 20px;">
                                    Please check:
                                </p>
                                <ul style="text-align: left; font-size: 16px; margin: 0 50px;">
                                    <li>That views/drivers.html exists and has content</li>
                                    <li>That js/modules/drivers.js is properly loaded</li>
                                    <li>That there are no JavaScript errors elsewhere in your app</li>
                                </ul>
                            </div>
                            <button onclick="location.reload()" style="background: #e53e3e; color: white; 
                                     border: none; padding: 15px 30px; border-radius: 8px; 
                                     cursor: pointer; font-weight: bold; font-size: 20px; 
                                     margin-top: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                                RELOAD PAGE
                            </button>
                        </div>
                    `;
                    return;
                }
            }
        }
        
        // Get elements again after potential creation
        const finalAddDriverBtn = document.getElementById('add-driver-btn');
        const finalDriversStatusFilter = document.getElementById('drivers-status-filter');
        const finalDriversList = document.getElementById('drivers-list');
        
        // Initialize event listeners
        setupEventListeners();
        
        // Load drivers data
        loadDriversData();
        
        function setupEventListeners() {
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
            }
            
            // Status filter
            if (finalDriversStatusFilter) {
                console.log('[DRIVERS MODULE] Setting up status filter');
                
                // Remove any existing listeners to avoid duplicates
                const newFilter = finalDriversStatusFilter.cloneNode(true);
                finalDriversStatusFilter.parentNode.replaceChild(newFilter, finalDriversStatusFilter);
                
                newFilter.addEventListener('change', filterDrivers);
            }
        }
        
        // Load drivers data from GitHub
        async function loadDriversData() {
            console.log('[DRIVERS MODULE] Loading drivers data');
            
            try {
                // Show loading state with guaranteed visibility
                finalDriversList.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; 
                              height: 300px; color: #718096; border: 2px dashed #e53e3e; padding: 20px;">
                        <div style="display: flex; justify-content: center; align-items: center; 
                                  height: 50px; margin-bottom: 20px;">
                            <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; 
                                      background-color: #e53e3e; margin: 0 8px; 
                                      animation: loading 1.4s infinite ease-in-out both;"></span>
                            <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; 
                                      background-color: #e53e3e; margin: 0 8px; 
                                      animation: loading 1.4s infinite ease-in-out both; animation-delay: 0.2s;"></span>
                            <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; 
                                      background-color: #e53e3e; margin: 0 8px; 
                                      animation: loading 1.4s infinite ease-in-out both; animation-delay: 0.4s;"></span>
                        </div>
                        <p style="font-size: 24px; font-weight: bold; color: #2d3748;">LOADING DRIVERS DATA...</p>
                        <p style="font-size: 20px; color: #4a5568; margin-top: 10px;">If you see this but no drivers, there's an issue with GitHub data loading</p>
                    </div>
                `;
                
                // Verify GitHub credentials
                if (!appState.repo || !appState.token) {
                    console.warn('[DRIVERS MODULE] GitHub credentials not set');
                    
                    finalDriversList.innerHTML = `
                        <div style="padding: 30px; background: #fff8f8; border-radius: 8px; 
                                  text-align: center; border: 2px solid #e53e3e;">
                            <h3 style="color: #e53e3e; margin-bottom: 15px; font-size: 28px;">GITHUB CREDENTIALS MISSING</h3>
                            <p style="margin-bottom: 20px; font-size: 22px; font-weight: bold;">
                                Your GitHub token or repository name is not set correctly.
                            </p>
                            <p style="background: #fff; padding: 25px; border-radius: 8px; 
                                      border: 3px solid #feb2b2; margin-bottom: 25px;
                                      text-align: left; font-family: monospace; font-size: 20px;">
                                Token: ${appState.token ? 'Set' : 'Not set'}<br>
                                Repository: ${appState.repo || 'Not set'}
                            </p>
                            <button onclick="location.reload()" style="background: #e53e3e; color: white; 
                                     border: none; padding: 15px 30px; border-radius: 8px; 
                                     cursor: pointer; font-weight: bold; font-size: 22px;">
                                RELOAD PAGE
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
                
                finalDriversList.innerHTML = `
                    <div style="padding: 30px; background: #fff8f8; border-radius: 8px; 
                              text-align: center; border: 2px solid #e53e3e;">
                        <h3 style="color: #e53e3e; margin-bottom: 15px; font-size: 28px;">ERROR LOADING DRIVERS</h3>
                        <p style="margin-bottom: 15px; font-size: 22px; max-width: 600px; 
                                  margin-left: auto; margin-right: auto;">
                            ${error.message}
                        </p>
                        <p style="background: #fff; padding: 25px; border-radius: 8px; 
                                  border: 3px solid #feb2b2; margin-bottom: 25px;
                                  text-align: left; font-family: monospace; 
                                  max-width: 600px; margin-left: auto; margin-right: auto; font-size: 20px;">
                            ${error.stack ? error.stack.split('\n')[0] : ''}
                        </p>
                        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 25px;">
                            <button onclick="loadDriversData()" style="background: #4299e1; color: white; 
                                     border: none; padding: 15px 30px; border-radius: 8px; 
                                     cursor: pointer; font-weight: bold; font-size: 22px;">
                                RETRY
                            </button>
                            <button onclick="showSampleData()" style="background: #38a169; color: white; 
                                     border: none; padding: 15px 30px; border-radius: 8px; 
                                     cursor: pointer; font-weight: bold; font-size: 22px;">
                                SHOW SAMPLE DATA
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
                        },
                        {
                            id: 3,
                            firstName: 'Robert',
                            lastName: 'Johnson',
                            license: 'DL-987654',
                            experience: '3 years',
                            status: 'maintenance',
                            car: 'TR-123',
                            card: '**** 9012',
                            tenders: '0',
                            lastDelivery: '1 week ago'
                        }
                    ];
                    
                    renderDrivers(sampleDrivers);
                };
            }
        }
        
        // Render drivers
        function renderDrivers(drivers) {
            console.log('[DRIVERS MODULE] Rendering drivers');
            
            if (drivers.length === 0) {
                finalDriversList.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; 
                              justify-content: center; height: 300px; color: #4a5568; border: 2px dashed #e53e3e; padding: 20px;">
                        <i class="fas fa-user-friends" style="font-size: 72px; color: #e53e3e; margin-bottom: 20px;"></i>
                        <h3 style="font-size: 28px; color: #2d3748; margin-bottom: 15px;">NO DRIVERS FOUND</h3>
                        <p style="font-size: 22px; margin-bottom: 25px; max-width: 500px; text-align: center;">
                            Get started by adding your first driver
                        </p>
                        <button id="first-driver-btn" style="background: #e53e3e; color: white; 
                                 border: none; padding: 15px 30px; border-radius: 10px; 
                                 cursor: pointer; font-weight: bold; font-size: 24px;
                                 display: flex; align-items: center; gap: 15px; box-shadow: 0 5px 15px rgba(229, 62, 62, 0.4);">
                            <i class="fas fa-plus" style="font-size: 28px;"></i> ADD FIRST DRIVER
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
            
            // Create a grid for drivers with guaranteed visibility
            const driversGrid = document.createElement('div');
            driversGrid.style.display = 'grid';
            driversGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(380px, 1fr))';
            driversGrid.style.gap = '25px';
            driversGrid.style.padding = '10px';
            
            // Render each driver
            drivers.forEach(driver => {
                const driverSlip = document.createElement('div');
                driverSlip.className = 'driver-slip';
                driverSlip.dataset.id = driver.id;
                driverSlip.style.backgroundColor = 'white';
                driverSlip.style.border = '2px solid #e2e8f0';
                driverSlip.style.borderRadius = '12px';
                driverSlip.style.padding = '25px';
                driverSlip.style.cursor = 'pointer';
                driverSlip.style.transition = 'all 0.3s ease';
                driverSlip.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
                driverSlip.style.height = 'auto';
                driverSlip.style.border = '3px solid #4a5568';
                
                // Determine status style
                let statusBg, statusColor, statusText;
                switch(driver.status) {
                    case 'available':
                        statusBg = 'rgba(56, 161, 105, 0.25)';
                        statusColor = '#276749';
                        statusText = 'AVAILABLE';
                        break;
                    case 'on-duty':
                        statusBg = 'rgba(221, 107, 32, 0.25)';
                        statusColor = '#9C4221';
                        statusText = 'ON DUTY';
                        break;
                    case 'maintenance':
                        statusBg = 'rgba(197, 48, 48, 0.25)';
                        statusColor = '#9B2C2C';
                        statusText = 'MAINTENANCE';
                        break;
                    default:
                        statusBg = 'rgba(56, 161, 105, 0.25)';
                        statusColor = '#276749';
                        statusText = 'AVAILABLE';
                }
                
                // Create driver slip content with guaranteed visibility
                driverSlip.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; 
                              margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0;">
                        <div style="font-weight: bold; font-size: 24px; color: #2d3748;">
                            ${driver.firstName} ${driver.lastName}
                        </div>
                        <div style="padding: 8px 20px; border-radius: 25px; font-size: 16px; 
                                  font-weight: bold; background-color: ${statusBg}; color: ${statusColor}; border: 2px solid ${statusColor};">
                            ${statusText}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="padding: 15px; background: #f7fafc; border-radius: 10px; border: 2px solid #e2e8f0;">
                            <div style="font-weight: bold; color: #4a5568; margin-bottom: 8px; font-size: 18px;">LICENSE</div>
                            <div style="font-size: 20px; color: #2d3748; font-weight: bold;">${driver.license}</div>
                        </div>
                        
                        <div style="padding: 15px; background: #f7fafc; border-radius: 10px; border: 2px solid #e2e8f0;">
                            <div style="font-weight: bold; color: #4a5568; margin-bottom: 8px; font-size: 18px;">EXPERIENCE</div>
                            <div style="font-size: 20px; color: #2d3748; font-weight: bold;">${driver.experience || 'N/A'}</div>
                        </div>
                        
                        <div style="padding: 15px; background: #f7fafc; border-radius: 10px; border: 2px solid #e2e8f0;">
                            <div style="font-weight: bold; color: #4a5568; margin-bottom: 8px; font-size: 18px;">ASSIGNED CAR</div>
                            <div style="font-size: 20px; color: #2d3748; font-weight: bold;">${driver.car || 'Unassigned'}</div>
                        </div>
                        
                        <div style="padding: 15px; background: #f7fafc; border-radius: 10px; border: 2px solid #e2e8f0;">
                            <div style="font-weight: bold; color: #4a5568; margin-bottom: 8px; font-size: 18px;">ASSIGNED CARD</div>
                            <div style="font-size: 20px; color: #2d3748; font-weight: bold;">${driver.card || 'Unassigned'}</div>
                        </div>
                        
                        <div style="padding: 15px; background: #f7fafc; border-radius: 10px; border: 2px solid #e2e8f0;">
                            <div style="font-weight: bold; color: #4a5568; margin-bottom: 8px; font-size: 18px;">TENDERS</div>
                            <div style="font-size: 20px; color: #2d3748; font-weight: bold;">${driver.tenders || '0 (0 active)'}</div>
                        </div>
                        
                        <div style="padding: 15px; background: #f7fafc; border-radius: 10px; border: 2px solid #e2e8f0;">
                            <div style="font-weight: bold; color: #4a5568; margin-bottom: 8px; font-size: 18px;">LAST DELIVERY</div>
                            <div style="font-size: 20px; color: #2d3748; font-weight: bold;">${driver.lastDelivery || 'Never'}</div>
                        </div>
                    </div>
                `;
                
                // Add click handler
                driverSlip.addEventListener('click', () => {
                    console.log('[DRIVERS MODULE] Driver clicked:', driver.id, driver.firstName, driver.lastName);
                    alert(`DRIVER DETAILS:\\n\\nName: ${driver.firstName} ${driver.lastName}\\nLicense: ${driver.license}\\nStatus: ${driver.status}\\n\\nIn a real implementation, this would show a detailed view with all driver information.`);
                });
                
                driversGrid.appendChild(driverSlip);
            });
            
            finalDriversList.appendChild(driversGrid);
        }
        
        // Filter drivers by status
        function filterDrivers() {
            console.log('[DRIVERS MODULE] Filtering drivers by status');
            
            const statusFilter = document.getElementById('drivers-status-filter');
            const filterValue = statusFilter ? statusFilter.value : 'all';
            
            const driverSlips = document.querySelectorAll('.driver-slip');
            driverSlips.forEach(slip => {
                const statusText = slip.querySelector('[style*="color"]')?.textContent.toLowerCase() || '';
                
                if (filterValue === 'all' || statusText.toLowerCase().includes(filterValue)) {
                    slip.style.display = 'block';
                } else {
                    slip.style.display = 'none';
                }
            });
        }
    };
});
