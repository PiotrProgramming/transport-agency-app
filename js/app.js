// Drivers Module - Standalone module for drivers management
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DRIVERS MODULE] DOM fully loaded, initializing module');
    
    // Initialize drivers view
    window.initDrivers = function() {
        console.log('[DRIVERS MODULE] initDrivers called');
        
        // Force content area to be visible
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            // Make sure content area is visible and has dimensions
            contentArea.style.display = 'block';
            contentArea.style.height = '100%';
            contentArea.style.minHeight = '500px';
            contentArea.style.backgroundColor = '#ffffff';
            contentArea.style.padding = '20px';
            contentArea.style.boxSizing = 'border-box';
            
            // Clear any existing content
            contentArea.innerHTML = '';
            
            // Create a highly visible container
            const container = document.createElement('div');
            container.style.border = '3px solid #e53e3e';
            container.style.padding = '25px';
            container.style.borderRadius = '10px';
            container.style.backgroundColor = '#fff';
            container.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            container.style.fontFamily = 'Arial, sans-serif';
            
            // Add a very visible title
            const title = document.createElement('h1');
            title.textContent = 'DRIVERS MANAGEMENT';
            title.style.color = '#e53e3e';
            title.style.fontSize = '28px';
            title.style.fontWeight = 'bold';
            title.style.marginBottom = '20px';
            title.style.textAlign = 'center';
            title.style.textShadow = '1px 1px 2px rgba(0,0,0,0.1)';
            
            // Add action buttons with guaranteed visibility
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '15px';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.marginBottom = '25px';
            
            const addDriverBtn = document.createElement('button');
            addDriverBtn.id = 'add-driver-btn';
            addDriverBtn.textContent = 'ADD DRIVER';
            addDriverBtn.style.backgroundColor = '#e53e3e';
            addDriverBtn.style.color = 'white';
            addDriverBtn.style.border = 'none';
            addDriverBtn.style.padding = '12px 25px';
            addDriverBtn.style.borderRadius = '6px';
            addDriverBtn.style.fontSize = '16px';
            addDriverBtn.style.fontWeight = 'bold';
            addDriverBtn.style.cursor = 'pointer';
            addDriverBtn.style.boxShadow = '0 3px 6px rgba(229, 62, 62, 0.3)';
            addDriverBtn.style.transition = 'all 0.2s ease';
            
            addDriverBtn.onmouseover = function() {
                this.style.backgroundColor = '#c53030';
                this.style.transform = 'translateY(-2px)';
            };
            
            addDriverBtn.onmouseout = function() {
                this.style.backgroundColor = '#e53e3e';
                this.style.transform = '';
            };
            
            const importBtn = document.createElement('button');
            importBtn.id = 'drivers-import-btn';
            importBtn.textContent = 'IMPORT';
            importBtn.style.backgroundColor = '#4299e1';
            importBtn.style.color = 'white';
            importBtn.style.border = 'none';
            importBtn.style.padding = '12px 25px';
            importBtn.style.borderRadius = '6px';
            importBtn.style.fontSize = '16px';
            importBtn.style.fontWeight = 'bold';
            importBtn.style.cursor = 'pointer';
            importBtn.style.boxShadow = '0 3px 6px rgba(66, 153, 225, 0.3)';
            importBtn.style.transition = 'all 0.2s ease';
            
            importBtn.onmouseover = function() {
                this.style.backgroundColor = '#3182ce';
                this.style.transform = 'translateY(-2px)';
            };
            
            importBtn.onmouseout = function() {
                this.style.backgroundColor = '#4299e1';
                this.style.transform = '';
            };
            
            buttonContainer.appendChild(addDriverBtn);
            buttonContainer.appendChild(importBtn);
            
            // Add status filter
            const filterContainer = document.createElement('div');
            filterContainer.style.display = 'flex';
            filterContainer.style.justifyContent = 'flex-end';
            filterContainer.style.marginBottom = '20px';
            
            const filterLabel = document.createElement('label');
            filterLabel.textContent = 'Filter by status: ';
            filterLabel.style.fontWeight = 'bold';
            filterLabel.style.marginRight = '10px';
            filterLabel.style.color = '#2d3748';
            
            const statusFilter = document.createElement('select');
            statusFilter.id = 'drivers-status-filter';
            statusFilter.style.padding = '10px 15px';
            statusFilter.style.border = '2px solid #e2e8f0';
            statusFilter.style.borderRadius = '6px';
            statusFilter.style.fontSize = '16px';
            statusFilter.style.minWidth = '250px';
            statusFilter.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            
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
            
            filterContainer.appendChild(filterLabel);
            filterContainer.appendChild(statusFilter);
            
            // Add driver list with guaranteed visibility
            const driversList = document.createElement('div');
            driversList.id = 'drivers-list';
            driversList.style.minHeight = '300px';
            driversList.style.backgroundColor = '#f7fafc';
            driversList.style.borderRadius = '8px';
            driversList.style.padding = '20px';
            driversList.style.marginTop = '15px';
            
            // Add loading state with high visibility
            driversList.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; 
                          height: 250px; color: #4a5568;">
                    <div style="display: flex; justify-content: center; align-items: center; 
                              height: 50px; margin-bottom: 20px;">
                        <span style="display: inline-block; width: 18px; height: 18px; border-radius: 50%; 
                                  background-color: #e53e3e; margin: 0 6px; 
                                  animation: loading 1.4s infinite ease-in-out both;"></span>
                        <span style="display: inline-block; width: 18px; height: 18px; border-radius: 50%; 
                                  background-color: #e53e3e; margin: 0 6px; 
                                  animation: loading 1.4s infinite ease-in-out both; animation-delay: 0.2s;"></span>
                        <span style="display: inline-block; width: 18px; height: 18px; border-radius: 50%; 
                                  background-color: #e53e3e; margin: 0 6px; 
                                  animation: loading 1.4s infinite ease-in-out both; animation-delay: 0.4s;"></span>
                    </div>
                    <p style="font-size: 18px; font-weight: bold; color: #2d3748;">
                        FORCING UI TO BE VISIBLE - LOADING DRIVERS DATA...
                    </p>
                    <p style="font-size: 16px; color: #4a5568; margin-top: 10px;">
                        If you see this message but no drivers, there's an issue with GitHub data loading
                    </p>
                </div>
            `;
            
            // Add animation keyframes
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
            
            // Add all elements to container
            container.appendChild(title);
            container.appendChild(buttonContainer);
            container.appendChild(filterContainer);
            container.appendChild(driversList);
            contentArea.appendChild(container);
            
            // Set up event listeners
            setupEventListeners();
            
            // Load drivers data
            loadDriversData();
        } else {
            console.error('[DRIVERS MODULE] CRITICAL: content-area element not found');
            // Create a visible error message on the page
            const errorDiv = document.createElement('div');
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '20px';
            errorDiv.style.left = '20px';
            errorDiv.style.right = '20px';
            errorDiv.style.padding = '20px';
            errorDiv.style.backgroundColor = '#fff8f8';
            errorDiv.style.border = '3px solid #e53e3e';
            errorDiv.style.borderRadius = '10px';
            errorDiv.style.zIndex = '9999';
            errorDiv.style.fontFamily = 'Arial, sans-serif';
            
            errorDiv.innerHTML = `
                <h2 style="color: #e53e3e; margin-top: 0;">CRITICAL ERROR</h2>
                <p style="font-size: 18px; margin: 15px 0;">
                    The #content-area element is missing from the DOM.
                </p>
                <p style="background: #fff; padding: 15px; border-radius: 8px; 
                          border-left: 4px solid #e53e3e; margin: 20px 0;">
                    This usually happens when:
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>The main app layout is broken</li>
                        <li>There's a JavaScript error preventing DOM initialization</li>
                        <li>The app-view element is not properly structured</li>
                    </ul>
                </p>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="location.reload()" style="background: #e53e3e; color: white; 
                             border: none; padding: 12px 24px; border-radius: 6px; 
                             cursor: pointer; font-weight: bold; font-size: 16px;">
                        Reload Page
                    </button>
                    <button onclick="fixLayout()" style="background: #38a169; color: white; 
                             border: none; padding: 12px 24px; border-radius: 6px; 
                             cursor: pointer; font-weight: bold; font-size: 16px;">
                        Fix Layout
                    </button>
                </div>
            `;
            
            document.body.appendChild(errorDiv);
            
            // Add fixLayout function to window
            window.fixLayout = function() {
                // Attempt to recreate the main layout
                document.body.innerHTML = `
                    <div id="app-view" style="display: block; height: 100vh;">
                        <header style="background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
                                      padding: 15px 0; margin-bottom: 20px;">
                            <div style="max-width: 1400px; margin: 0 auto; padding: 0 20px; 
                                      display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 20px; font-weight: bold;">Transport & Forwarding Agency</div>
                                <div style="display: flex; gap: 15px;">
                                    <div style="position: relative; cursor: pointer;">
                                        <i class="fas fa-bell" style="font-size: 20px;"></i>
                                        <span style="position: absolute; top: -6px; right: -6px; 
                                                  background: #e53e3e; color: white; 
                                                  border-radius: 50%; width: 20px; height: 20px; 
                                                  display: flex; justify-content: center; align-items: center;
                                                  font-size: 12px;">0</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <i class="fas fa-user" style="font-size: 20px;"></i>
                                        <span>John Doe</span>
                                    </div>
                                </div>
                            </div>
                        </header>
                        
                        <div style="max-width: 1400px; margin: 0 auto; padding: 0 20px; 
                                  display: flex; height: calc(100vh - 100px);">
                            <aside style="width: 280px; background: white; border-right: 1px solid #e2e8f0; 
                                        padding: 20px 0; margin-right: 20px;">
                                <nav>
                                    <ul style="list-style: none; padding: 0;">
                                        <li style="padding: 12px 20px; cursor: pointer; 
                                                  font-weight: bold; color: #e53e3e;">Dashboard</li>
                                        <li style="padding: 12px 20px; cursor: pointer;">Drivers</li>
                                        <li style="padding: 12px 20px; cursor: pointer;">Cars</li>
                                        <li style="padding: 12px 20px; cursor: pointer;">Cards</li>
                                        <li style="padding: 12px 20px; cursor: pointer;">Tenders</li>
                                        <li style="padding: 12px 20px; cursor: pointer;">Invoices</li>
                                        <li style="padding: 12px 20px; cursor: pointer;">Reports</li>
                                        <li style="padding: 12px 20px; cursor: pointer;">Admin</li>
                                        <li style="padding: 12px 20px; cursor: pointer;">Chat</li>
                                    </ul>
                                </nav>
                            </aside>
                            
                            <main id="content-area" style="flex: 1; background: white; 
                                     border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                <!-- Content will be loaded here -->
                            </main>
                        </div>
                    </div>
                `;
                
                // Initialize the drivers module again
                setTimeout(() => {
                    if (typeof initDrivers === 'function') {
                        initDrivers();
                    }
                }, 100);
            };
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
        }
        
        // Status filter
        const statusFilter = document.getElementById('drivers-status-filter');
        if (statusFilter) {
            console.log('[DRIVERS MODULE] Setting up status filter');
            
            // Remove any existing listeners to avoid duplicates
            const newFilter = statusFilter.cloneNode(true);
            statusFilter.parentNode.replaceChild(newFilter, statusFilter);
            
            newFilter.addEventListener('change', filterDrivers);
        }
    }
    
    // Load drivers data from GitHub
    async function loadDriversData() {
        console.log('[DRIVERS MODULE] Loading drivers data');
        
        const driversList = document.getElementById('drivers-list');
        if (!driversList) return;
        
        try {
            // Verify GitHub credentials
            if (!appState.repo || !appState.token) {
                console.warn('[DRIVERS MODULE] GitHub credentials not set');
                driversList.innerHTML = `
                    <div style="padding: 30px; background: #fff8f8; border-radius: 8px; 
                              text-align: center;">
                        <h3 style="color: #e53e3e; margin-bottom: 15px;">GITHUB CREDENTIALS MISSING</h3>
                        <p style="margin-bottom: 20px; font-size: 18px; font-weight: bold;">
                            Your GitHub token or repository name is not set correctly.
                        </p>
                        <p style="background: #fff; padding: 15px; border-radius: 8px; 
                                  border: 1px solid #feb2b2; margin-bottom: 20px;
                                  text-align: left; font-family: monospace; font-size: 16px;">
                            Token: ${appState.token ? 'Set' : 'Not set'}<br>
                            Repository: ${appState.repo || 'Not set'}
                        </p>
                        <button onclick="location.reload()" style="background: #e53e3e; color: white; 
                                 border: none; padding: 12px 25px; border-radius: 6px; 
                                 cursor: pointer; font-weight: bold; font-size: 16px;">
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
            
            const driversList = document.getElementById('drivers-list');
            if (driversList) {
                driversList.innerHTML = `
                    <div style="padding: 30px; background: #fff8f8; border-radius: 8px; 
                              text-align: center;">
                        <h3 style="color: #e53e3e; margin-bottom: 15px; font-size: 24px;">ERROR LOADING DRIVERS</h3>
                        <p style="margin-bottom: 15px; font-size: 18px; max-width: 600px; 
                                  margin-left: auto; margin-right: auto;">
                            ${error.message}
                        </p>
                        <p style="background: #fff; padding: 15px; border-radius: 8px; 
                                  border: 1px solid #feb2b2; margin-bottom: 20px;
                                  text-align: left; font-family: monospace; 
                                  max-width: 600px; margin-left: auto; margin-right: auto; font-size: 16px;">
                            ${error.stack ? error.stack.split('\n')[0] : ''}
                        </p>
                        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
                            <button onclick="loadDriversData()" style="background: #4299e1; color: white; 
                                     border: none; padding: 12px 25px; border-radius: 6px; 
                                     cursor: pointer; font-weight: bold; font-size: 16px;">
                                RETRY
                            </button>
                            <button onclick="showSampleData()" style="background: #38a169; color: white; 
                                     border: none; padding: 12px 25px; border-radius: 6px; 
                                     cursor: pointer; font-weight: bold; font-size: 16px;">
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
    }
    
    // Render drivers
    function renderDrivers(drivers) {
        console.log('[DRIVERS MODULE] Rendering drivers');
        
        const driversList = document.getElementById('drivers-list');
        if (!driversList) return;
        
        if (drivers.length === 0) {
            driversList.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; 
                          justify-content: center; height: 300px; color: #4a5568;">
                    <i class="fas fa-user-friends" style="font-size: 64px; margin-bottom: 20px; color: #e53e3e;"></i>
                    <h3 style="font-size: 24px; color: #2d3748; margin-bottom: 15px;">NO DRIVERS FOUND</h3>
                    <p style="font-size: 18px; margin-bottom: 25px; max-width: 500px; text-align: center;">
                        Get started by adding your first driver
                    </p>
                    <button id="first-driver-btn" style="background: #e53e3e; color: white; 
                             border: none; padding: 14px 28px; border-radius: 8px; 
                             cursor: pointer; font-weight: bold; font-size: 18px;
                             display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 8px rgba(229, 62, 62, 0.3);">
                        <i class="fas fa-plus" style="font-size: 20px;"></i> ADD FIRST DRIVER
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
        
        // Create a grid for drivers
        const driversGrid = document.createElement('div');
        driversGrid.style.display = 'grid';
        driversGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
        driversGrid.style.gap = '20px';
        
        // Render each driver
        drivers.forEach(driver => {
            const driverSlip = document.createElement('div');
            driverSlip.className = 'driver-slip';
            driverSlip.dataset.id = driver.id;
            driverSlip.style.backgroundColor = 'white';
            driverSlip.style.border = '1px solid #e2e8f0';
            driverSlip.style.borderRadius = '10px';
            driverSlip.style.padding = '20px';
            driverSlip.style.cursor = 'pointer';
            driverSlip.style.transition = 'all 0.3s ease';
            driverSlip.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
            driverSlip.style.height = 'auto';
            
            // Add hover effect
            driverSlip.onmouseover = function() {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                this.style.borderColor = '#e53e3e';
            };
            
            driverSlip.onmouseout = function() {
                this.style.transform = '';
                this.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
                this.style.borderColor = '#e2e8f0';
            };
            
            // Determine status style
            let statusBg, statusColor, statusText;
            switch(driver.status) {
                case 'available':
                    statusBg = 'rgba(56, 161, 105, 0.15)';
                    statusColor = '#38a169';
                    statusText = 'AVAILABLE';
                    break;
                case 'on-duty':
                    statusBg = 'rgba(221, 107, 32, 0.15)';
                    statusColor = '#dd6b20';
                    statusText = 'ON DUTY';
                    break;
                case 'maintenance':
                    statusBg = 'rgba(197, 48, 48, 0.15)';
                    statusColor = '#c53030';
                    statusText = 'MAINTENANCE';
                    break;
                default:
                    statusBg = 'rgba(56, 161, 105, 0.15)';
                    statusColor = '#38a169';
                    statusText = 'AVAILABLE';
            }
            
            // Create driver slip content
            driverSlip.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; 
                          margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-weight: bold; font-size: 20px; color: #2d3748;">
                        ${driver.firstName} ${driver.lastName}
                    </div>
                    <div style="padding: 5px 15px; border-radius: 20px; font-size: 13px; 
                              font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">
                        ${statusText}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
                        <div style="font-weight: bold; color: #4a5568; margin-bottom: 5px;">LICENSE</div>
                        <div style="font-size: 16px; color: #2d3748;">${driver.license}</div>
                    </div>
                    
                    <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
                        <div style="font-weight: bold; color: #4a5568; margin-bottom: 5px;">EXPERIENCE</div>
                        <div style="font-size: 16px; color: #2d3748;">${driver.experience || 'N/A'}</div>
                    </div>
                    
                    <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
                        <div style="font-weight: bold; color: #4a5568; margin-bottom: 5px;">ASSIGNED CAR</div>
                        <div style="font-size: 16px; color: #2d3748;">${driver.car || 'Unassigned'}</div>
                    </div>
                    
                    <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
                        <div style="font-weight: bold; color: #4a5568; margin-bottom: 5px;">ASSIGNED CARD</div>
                        <div style="font-size: 16px; color: #2d3748;">${driver.card || 'Unassigned'}</div>
                    </div>
                    
                    <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
                        <div style="font-weight: bold; color: #4a5568; margin-bottom: 5px;">TENDERS</div>
                        <div style="font-size: 16px; color: #2d3748;">${driver.tenders || '0 (0 active)'}</div>
                    </div>
                    
                    <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
                        <div style="font-weight: bold; color: #4a5568; margin-bottom: 5px;">LAST DELIVERY</div>
                        <div style="font-size: 16px; color: #2d3748;">${driver.lastDelivery || 'Never'}</div>
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
        
        driversList.appendChild(driversGrid);
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
});
