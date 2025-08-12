// Load a view fragment
function loadView(view) {
    console.log(`Loading view: ${view}`);
    
    // Update navigation highlights
    if (navItems) {
        navItems.forEach(i => i.classList.remove('active'));
        const activeNavItem = document.querySelector(`.nav-item[data-view="${view}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');
    }
    
    // Show loading state in content area
    if (contentArea) {
        contentArea.innerHTML = `
            <div class="view-placeholder">
                <div class="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p>Loading ${view} view...</p>
            </div>
        `;
    }
    
    // Load the HTML fragment
    fetch(`views/${view}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${view} view (HTTP ${response.status})`);
            }
            return response.text();
        })
        .then(html => {
            // Insert the HTML into the content area
            if (contentArea) {
                contentArea.innerHTML = html;
                
                // Store the current view
                appState.currentView = view;
                
                // Verify the HTML structure is correct
                verifyViewStructure(view);
                
                // Initialize view-specific JavaScript
                setTimeout(() => {
                    initView(view);
                }, 100);
            }
        })
        .catch(error => {
            console.error(error);
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="error-message">
                        <h3>Error Loading View</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="loadView('${appState.currentView}')">Retry</button>
                    </div>
                `;
            }
        });
}

// Verify the view structure is correct
function verifyViewStructure(view) {
    console.log(`Verifying ${view} view structure`);
    
    // Check for critical elements
    const viewElement = document.getElementById(`${view}-view`);
    if (!viewElement) {
        console.error(`CRITICAL: #${view}-view element not found in ${view} view`);
        
        // Create a visible error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.padding = '30px';
        errorDiv.style.backgroundColor = '#fff8f8';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.textAlign = 'center';
        
        errorDiv.innerHTML = `
            <h3 style="color: #e53e3e; margin-bottom: 15px;">CRITICAL VIEW ERROR</h3>
            <p style="margin-bottom: 15px; font-size: 18px;">
                The #${view}-view element is missing from the ${view} view.
            </p>
            <p style="background: white; padding: 15px; border-radius: 8px; 
                      border: 1px solid #feb2b2; margin-bottom: 20px;
                      text-align: left; font-family: monospace; font-size: 16px;">
                This usually happens when:
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>The views/${view}.html file is empty or missing</li>
                    <li>The file has incorrect HTML structure</li>
                    <li>There's a typo in the element ID</li>
                </ul>
            </p>
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button onclick="location.reload()" style="background: #e53e3e; color: white; 
                         border: none; padding: 10px 20px; border-radius: 4px; 
                         cursor: pointer; font-weight: bold;">
                    Reload Page
                </button>
                <button onclick="fix${view.charAt(0).toUpperCase() + view.slice(1)}View()" 
                        style="background: #38a169; color: white; 
                         border: none; padding: 10px 20px; border-radius: 4px; 
                         cursor: pointer; font-weight: bold;">
                    Fix View
                </button>
            </div>
        `;
        
        if (contentArea) {
            contentArea.innerHTML = '';
            contentArea.appendChild(errorDiv);
        }
        
        // Add fix function to window
        window[`fix${view.charAt(0).toUpperCase() + view.slice(1)}View`] = function() {
            if (view === 'drivers') {
                contentArea.innerHTML = `
                    <div id="drivers-view" class="view">
                        <div class="page-title">
                            <h1 class="title-text">Drivers Management</h1>
                            <div class="action-buttons">
                                <button class="btn btn-outline" id="drivers-import-btn">
                                    <i class="fas fa-file-import"></i> Import
                                </button>
                                <button class="btn btn-primary" id="add-driver-btn">
                                    <i class="fas fa-plus"></i> Add Driver
                                </button>
                            </div>
                        </div>

                        <div class="data-table-container">
                            <div class="table-header">
                                <h2 class="table-title">Driver Database</h2>
                                <div class="table-filters">
                                    <select class="form-control" id="drivers-status-filter">
                                        <option value="all">All Statuses</option>
                                        <option value="available">Available</option>
                                        <option value="on-duty">On Duty</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div id="drivers-list" class="drivers-container">
                                <div class="view-placeholder">
                                    <div class="loading-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <p>FORCED DRIVERS VIEW - LOADING DRIVERS DATA...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Initialize view
                setTimeout(() => {
                    initView('drivers');
                }, 100);
            }
        };
    }
}

// Initialize view-specific JavaScript
function initView(view) {
    console.log(`Initializing view: ${view}`);
    
    // Verify the view structure is correct
    const viewElement = document.getElementById(`${view}-view`);
    if (!viewElement) {
        console.error(`Cannot initialize ${view} view - #${view}-view element not found`);
        return;
    }
    
    switch(view) {
        case 'drivers':
            if (typeof initDrivers === 'function') {
                console.log('Initializing drivers view');
                initDrivers();
            } else {
                console.error('initDrivers function not found');
                
                // Check if drivers.js is loaded
                const scriptElements = document.getElementsByTagName('script');
                let driversScriptFound = false;
                for (let i = 0; i < scriptElements.length; i++) {
                    if (scriptElements[i].src.includes('drivers.js')) {
                        driversScriptFound = true;
                        break;
                    }
                }
                
                if (!driversScriptFound) {
                    console.error('drivers.js script not found');
                    
                    // Create a visible error message
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.style.padding = '30px';
                    errorDiv.style.backgroundColor = '#fff8f8';
                    errorDiv.style.borderRadius = '8px';
                    errorDiv.style.textAlign = 'center';
                    
                    errorDiv.innerHTML = `
                        <h3 style="color: #e53e3e; margin-bottom: 15px;">DRIVERS MODULE ERROR</h3>
                        <p style="margin-bottom: 15px; font-size: 18px;">
                            The drivers.js module is not loaded.
                        </p>
                        <p style="background: white; padding: 15px; border-radius: 8px; 
                                  border: 1px solid #feb2b2; margin-bottom: 20px;
                                  text-align: left; font-family: monospace; font-size: 16px;">
                            This usually happens when:
                            <ul style="margin-left: 20px; margin-top: 10px;">
                                <li>The script tag for drivers.js is missing</li>
                                <li>There's a typo in the file path</li>
                                <li>The file doesn't exist</li>
                            </ul>
                        </p>
                        <div style="display: flex; justify-content: center; gap: 10px;">
                            <button onclick="location.reload()" style="background: #e53e3e; color: white; 
                                     border: none; padding: 10px 20px; border-radius: 4px; 
                                     cursor: pointer; font-weight: bold;">
                                Reload Page
                            </button>
                            <button onclick="loadDriversModule()" 
                                    style="background: #38a169; color: white; 
                                     border: none; padding: 10px 20px; border-radius: 4px; 
                                     cursor: pointer; font-weight: bold;">
                                Load Module
                            </button>
                        </div>
                    `;
                    
                    viewElement.innerHTML = '';
                    viewElement.appendChild(errorDiv);
                    
                    // Add loadDriversModule function to window
                    window.loadDriversModule = function() {
                        const script = document.createElement('script');
                        script.src = 'js/modules/drivers.js';
                        script.onload = function() {
                            console.log('drivers.js loaded successfully');
                            if (typeof initDrivers === 'function') {
                                initDrivers();
                            }
                        };
                        script.onerror = function() {
                            console.error('Failed to load drivers.js');
                            alert('Failed to load drivers.js. Please check your file path.');
                        };
                        document.head.appendChild(script);
                    };
                }
            }
            break;
            
        // Other views...
        default:
            console.log(`No specific module for view: ${view}`);
    }
}
