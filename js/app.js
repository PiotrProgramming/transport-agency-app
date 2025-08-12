// Initialize view-specific JavaScript
function initView(view) {
    console.log(`Initializing view: ${view}`);
    
    // Debugging: Show what views we're trying to initialize
    console.log('Available init functions:');
    console.log('initDashboard:', typeof initDashboard);
    console.log('initDrivers:', typeof initDrivers);
    console.log('initCars:', typeof initCars);
    console.log('initCards:', typeof initCards);
    console.log('initTenders:', typeof initTenders);
    console.log('initInvoices:', typeof initInvoices);
    console.log('initReports:', typeof initReports);
    console.log('initAdmin:', typeof initAdmin);
    console.log('initChat:', typeof initChat);
    
    // Debugging: Check if GitHub credentials are set
    console.log('GitHub credentials:');
    console.log('Token:', appState.token ? 'Set' : 'Not set');
    console.log('Repo:', appState.repo || 'Not set');
    
    switch(view) {
        case 'dashboard':
            if (typeof initDashboard === 'function') {
                console.log('Initializing dashboard');
                initDashboard();
            } else {
                console.error('initDashboard function not found');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="error-message">
                            <h3>View Error</h3>
                            <p>Dashboard initialization function not found</p>
                            <p>Make sure js/modules/dashboard.js is properly loaded</p>
                        </div>
                    `;
                }
            }
            break;
            
        case 'drivers':
            if (typeof initDrivers === 'function') {
                console.log('Initializing drivers');
                initDrivers();
            } else {
                console.error('initDrivers function not found');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="error-message">
                            <h3>View Error</h3>
                            <p>Drivers initialization function not found</p>
                            <p>Make sure js/modules/drivers.js is properly loaded</p>
                        </div>
                    `;
                }
            }
            break;
            
        case 'cars':
            if (typeof initCars === 'function') {
                console.log('Initializing cars');
                initCars();
            } else {
                console.error('initCars function not found');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="error-message">
                            <h3>View Error</h3>
                            <p>Cars initialization function not found</p>
                            <p>Make sure js/modules/cars.js is properly loaded</p>
                        </div>
                    `;
                }
            }
            break;
            
        case 'cards':
            if (typeof initCards === 'function') {
                console.log('Initializing cards');
                initCards();
            } else {
                console.error('initCards function not found');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="error-message">
                            <h3>View Error</h3>
                            <p>Cards initialization function not found</p>
                            <p>Make sure js/modules/cards.js is properly loaded</p>
                        </div>
                    `;
                }
            }
            break;
            
        case 'tenders':
            if (typeof initTenders === 'function') {
                console.log('Initializing tenders');
                initTenders();
            } else {
                console.error('initTenders function not found');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="error-message">
                            <h3>View Error</h3>
                            <p>Tenders initialization function not found</p>
                            <p>Make sure js/modules/tenders.js is properly loaded</p>
                        </div>
                    `;
                }
            }
            break;
            
        case 'invoices':
            if (typeof initInvoices === 'function') {
                console.log('Initializing invoices');
                initInvoices();
            } else {
                console.error('initInvoices function not found');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="error-message">
                            <h3>View Error</h3>
                            <p>Invoices initialization function not found</p>
                            <p>Make sure js/modules/invoices.js is properly loaded</p>
                        </div>
                    `;
                }
            }
            break;
            
        case 'reports':
            if (typeof initReports === 'function') {
                console.log('Initializing reports');
                initReports();
            } else {
                console.error('initReports function not found');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="error-message">
                            <h3>View Error</h3>
                            <p>Reports initialization function not found</p>
                            <p>Make sure js/modules/reports.js is properly loaded</p>
                        </div>
                    `;
                }
            }
            break;
            
        case 'admin':
            if (typeof initAdmin === 'function') {
                console.log('Initializing admin');
                initAdmin();
            } else {
                console.error('initAdmin function not found');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="error-message">
                            <h3>View Error</h3>
                            <p>Admin initialization function not found</p>
                            <p>Make sure js/modules/admin.js is properly loaded</p>
                        </div>
                    `;
                }
            }
            break;
            
        case 'chat':
            if (typeof initChat === 'function') {
                console.log('Initializing chat');
                initChat();
            } else {
                console.error('initChat function not found');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="error-message">
                            <h3>View Error</h3>
                            <p>Chat initialization function not found</p>
                            <p>Make sure js/modules/chat.js is properly loaded</p>
                        </div>
                    `;
                }
            }
            break;
            
        default:
            console.log(`No specific module for view: ${view}`);
    }
}
