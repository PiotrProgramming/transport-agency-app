// Initialize view-specific JavaScript
function initView(view) {
    console.log(`Initializing view: ${view}`);
    
    // Wait for the DOM to be fully updated
    setTimeout(() => {
        switch(view) {
            case 'drivers':
                if (typeof initDrivers === 'function') {
                    console.log('DRIVERS MODULE: Calling initDrivers()');
                    initDrivers();
                } else {
                    console.error('DRIVERS MODULE: initDrivers function not found');
                    
                    // Show error in content area
                    const contentArea = document.getElementById('content-area');
                    if (contentArea) {
                        contentArea.innerHTML = `
                            <div class="error-message" style="padding: 30px; background: #fff8f8; border-radius: 8px; text-align: center;">
                                <h3 style="color: #e53e3e; margin-bottom: 15px;">DRIVERS MODULE ERROR</h3>
                                <p style="margin-bottom: 15px; font-size: 18px;">initDrivers function not found</p>
                                <p style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #feb2b2; margin-bottom: 20px; text-align: left; font-family: monospace; font-size: 16px;">
                                    This usually happens when:<br>
                                    - drivers.js is not properly loaded<br>
                                    - There's a syntax error in drivers.js<br>
                                    - The file path is incorrect
                                </p>
                                <div style="display: flex; justify-content: center; gap: 10px;">
                                    <button onclick="location.reload()" style="background: #e53e3e; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                                        Reload Page
                                    </button>
                                    <button onclick="checkDriversModule()" style="background: #38a169; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                                        Check Module
                                    </button>
                                </div>
                            </div>
                        `;
                        
                        window.checkDriversModule = function() {
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
                                alert('drivers.js is not loaded. Check your index.html file for the script tag.');
                            } else {
                                alert('drivers.js is loaded but has an error. Check the console for errors.');
                            }
                        };
                    }
                }
                break;
                
            // Other views...
            default:
                console.log(`DRIVERS MODULE: No specific module for view: ${view}`);
        }
    }, 50); // Small delay to ensure DOM is fully updated
}
