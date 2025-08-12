// Drivers Module - Standalone module for drivers management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize drivers view
    window.initDrivers = function() {
        console.log('Initializing drivers view');
        
        // Get DOM elements
        const addDriverBtn = document.getElementById('add-driver-btn');
        const driversStatusFilter = document.getElementById('drivers-status-filter');
        const driversImportBtn = document.getElementById('drivers-import-btn');
        const driverFormModal = document.getElementById('driver-form-modal');
        const driverFormTitle = document.getElementById('driver-form-title');
        const driverForm = document.getElementById('driver-form');
        const saveDriverBtn = document.querySelector('.save-driver-btn');
        const cancelDriverBtn = document.querySelector('.cancel-driver-btn');
        const closeModalBtns = document.querySelectorAll('.close-modal');
        const editDriverBtn = document.getElementById('edit-driver-btn');
        const assignResourcesBtn = document.getElementById('assign-resources-btn');
        const deleteDriverBtn = document.getElementById('delete-driver-btn');
        const resourceAssignmentModal = document.getElementById('resource-assignment-modal');
        const saveAssignmentBtn = document.querySelector('.save-assignment-btn');
        const cancelAssignmentBtn = document.querySelector('.cancel-assignment-btn');
        
        // Current driver being edited or viewed
        let currentDriver = null;
        
        // Initialize event listeners
        initEventListeners();
        
        // Load drivers data
        loadDriversData();
        
        // Load related data
        loadRelatedData();
        
        function initEventListeners() {
            // Add driver button
            if (addDriverBtn) {
                addDriverBtn.addEventListener('click', () => {
                    currentDriver = null;
                    driverFormTitle.textContent = 'Add New Driver';
                    resetDriverForm();
                    driverFormModal.style.display = 'block';
                });
            }
            
            // Status filter
            if (driversStatusFilter) {
                driversStatusFilter.addEventListener('change', filterDrivers);
            }
            
            // Import button
            if (driversImportBtn) {
                driversImportBtn.addEventListener('click', handleImport);
            }
            
            // Save driver button
            if (saveDriverBtn) {
                saveDriverBtn.addEventListener('click', saveDriver);
            }
            
            // Cancel driver button
            if (cancelDriverBtn) {
                cancelDriverBtn.addEventListener('click', () => {
                    driverFormModal.style.display = 'none';
                });
            }
            
            // Close modal buttons
            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    driverFormModal.style.display = 'none';
                    resourceAssignmentModal.style.display = 'none';
                });
            });
            
            // Edit driver button
            if (editDriverBtn) {
                editDriverBtn.addEventListener('click', () => {
                    if (currentDriver) {
                        driverFormTitle.textContent = 'Edit Driver';
                        populateDriverForm(currentDriver);
                        driverFormModal.style.display = 'block';
                    }
                });
            }
            
            // Assign resources button
            if (assignResourcesBtn) {
                assignResourcesBtn.addEventListener('click', () => {
                    if (currentDriver) {
                        loadAvailableResources();
                        resourceAssignmentModal.style.display = 'block';
                    }
                });
            }
            
            // Delete driver button
            if (deleteDriverBtn) {
                deleteDriverBtn.addEventListener('click', deleteDriver);
            }
            
            // Save assignment button
            if (saveAssignmentBtn) {
                saveAssignmentBtn.addEventListener('click', saveResourceAssignment);
            }
            
            // Cancel assignment button
            if (cancelAssignmentBtn) {
                cancelAssignmentBtn.addEventListener('click', () => {
                    resourceAssignmentModal.style.display = 'none';
                });
            }
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === driverFormModal) {
                    driverFormModal.style.display = 'none';
                }
                if (e.target === resourceAssignmentModal) {
                    resourceAssignmentModal.style.display = 'none';
                }
            });
        }
        
        // Load drivers data from GitHub
        async function loadDriversData() {
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
                    firstDriverBtn.addEventListener('click', () => {
                        currentDriver = null;
                        driverFormTitle.textContent = 'Add New Driver';
                        resetDriverForm();
                        driverFormModal.style.display = 'block';
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
                showDriverDetails(driver);
            });
            
            container.appendChild(driverSlip);
        }
        
        // Show driver details
        function showDriverDetails(driver) {
            currentDriver = driver;
            
            // Get modal elements
            const modal = document.getElementById('driver-detail-modal');
            const nameElement = document.getElementById('driver-detail-name');
            const statusElement = document.getElementById('driver-detail-status');
            const licenseElement = document.getElementById('driver-detail-license');
            const experienceElement = document.getElementById('driver-detail-experience');
            const licenseExpiryElement = document.getElementById('driver-detail-license-expiry');
            const carElement = document.getElementById('driver-detail-car');
            const cardElement = document.getElementById('driver-detail-card');
            const tendersElement = document.getElementById('driver-detail-tenders');
            
            // Set driver details
            nameElement.textContent = `${driver.firstName} ${driver.lastName}`;
            statusElement.textContent = driver.status.charAt(0).toUpperCase() + driver.status.slice(1);
            licenseElement.textContent = driver.license;
            experienceElement.textContent = driver.experience || 'N/A';
            licenseExpiryElement.textContent = driver.licenseExpiry || 'N/A';
            carElement.textContent = driver.car || 'Unassigned';
            cardElement.textContent = driver.card || 'Unassigned';
            
            // Set status class
            statusElement.className = 'driver-status';
            switch(driver.status) {
                case 'available':
                    statusElement.classList.add('status-available');
                    break;
                case 'on-duty':
                    statusElement.classList.add('status-pending');
                    break;
                case 'maintenance':
                    statusElement.classList.add('status-cancelled');
                    break;
            }
            
            // Load tenders for this driver
            loadDriverTenders(driver, tendersElement);
            
            // Show modal
            modal.style.display = 'block';
        }
        
        // Load tenders for a driver
        async function loadDriverTenders(driver, container) {
            try {
                const tenders = await githubService.getFileContent('tenders.json');
                const driverTenders = tenders.filter(t => 
                    t.driver && t.driver.toLowerCase() === `${driver.firstName} ${driver.lastName}`.toLowerCase()
                );
                
                if (driverTenders.length === 0) {
                    container.innerHTML = '<p>No tenders assigned to this driver</p>';
                    return;
                }
                
                container.innerHTML = '';
                driverTenders.forEach(tender => {
                    const tenderItem = document.createElement('div');
                    tenderItem.className = 'tender-item';
                    
                    // Determine status class
                    let statusClass, statusText;
                    switch(tender.status) {
                        case 'available':
                            statusClass = 'status-available';
                            statusText = 'Available';
                            break;
                        case 'pending':
                            statusClass = 'status-pending';
                            statusText = 'Pending';
                            break;
                        case 'delivered':
                            statusClass = 'status-delivered';
                            statusText = 'Delivered';
                            break;
                        case 'cancelled':
                            statusClass = 'status-cancelled';
                            statusText = 'Cancelled';
                            break;
                        case 'sold':
                            statusClass = 'status-sold';
                            statusText = 'Sold';
                            break;
                        default:
                            statusClass = 'status-available';
                            statusText = 'Available';
                    }
                    
                    tenderItem.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>#${tender.id}</strong> - ${tender.route}
                            </div>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div style="margin-top: 5px; font-size: 14px; color: var(--medium-gray);">
                            ${tender.loadingDate} → ${tender.unloadingDate}
                        </div>
                        <div style="margin-top: 5px; font-weight: 600;">
                            ${tender.price}
                        </div>
                    `;
                    
                    container.appendChild(tenderItem);
                });
            } catch (error) {
                console.error('Error loading driver tenders:', error);
                container.innerHTML = '<p>Error loading tenders</p>';
            }
        }
        
        // Reset driver form
        function resetDriverForm() {
            document.getElementById('driver-first-name').value = '';
            document.getElementById('driver-last-name').value = '';
            document.getElementById('driver-license').value = '';
            document.getElementById('driver-experience').value = '';
            document.getElementById('driver-license-expiry').value = '';
            document.getElementById('driver-status').value = 'available';
            document.getElementById('driver-notes').value = '';
        }
        
        // Populate driver form
        function populateDriverForm(driver) {
            document.getElementById('driver-first-name').value = driver.firstName;
            document.getElementById('driver-last-name').value = driver.lastName;
            document.getElementById('driver-license').value = driver.license;
            document.getElementById('driver-experience').value = driver.experience || '';
            document.getElementById('driver-license-expiry').value = driver.licenseExpiry || '';
            document.getElementById('driver-status').value = driver.status;
            document.getElementById('driver-notes').value = driver.notes || '';
        }
        
        // Save driver
        async function saveDriver() {
            // Validate form
            const firstName = document.getElementById('driver-first-name').value;
            const lastName = document.getElementById('driver-last-name').value;
            const license = document.getElementById('driver-license').value;
            
            if (!firstName || !lastName || !license) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                // Get existing drivers
                const drivers = await githubService.getFileContent('drivers.json');
                
                // Create or update driver
                const driverData = {
                    firstName: firstName,
                    lastName: lastName,
                    license: license,
                    experience: document.getElementById('driver-experience').value,
                    licenseExpiry: document.getElementById('driver-license-expiry').value,
                    status: document.getElementById('driver-status').value,
                    notes: document.getElementById('driver-notes').value,
                    car: currentDriver ? currentDriver.car : null,
                    card: currentDriver ? currentDriver.card : null,
                    tenders: currentDriver ? currentDriver.tenders : '0 (0 active)',
                    lastDelivery: currentDriver ? currentDriver.lastDelivery : 'Never'
                };
                
                if (currentDriver) {
                    // Update existing driver
                    driverData.id = currentDriver.id;
                    const index = drivers.findIndex(d => d.id === currentDriver.id);
                    if (index !== -1) {
                        drivers[index] = driverData;
                    }
                } else {
                    // Add new driver
                    driverData.id = drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1;
                    drivers.push(driverData);
                }
                
                // Save to GitHub
                await githubService.updateFileContent('drivers.json', drivers, currentDriver ? 'Update driver' : 'Add new driver');
                
                // Close modal
                document.getElementById('driver-form-modal').style.display = 'none';
                
                // Refresh drivers list
                loadDriversData();
                
                // Show success message
                alert(`Driver ${firstName} ${lastName} ${currentDriver ? 'updated' : 'added'} successfully!`);
            } catch (error) {
                console.error('Error saving driver:', error);
                alert(`Failed to save driver: ${error.message}`);
            }
        }
        
        // Delete driver
        async function deleteDriver() {
            if (!currentDriver) return;
            
            if (!confirm(`Are you sure you want to delete ${currentDriver.firstName} ${currentDriver.lastName}?`)) {
                return;
            }
            
            try {
                // Get existing drivers
                const drivers = await githubService.getFileContent('drivers.json');
                
                // Remove driver
                const updatedDrivers = drivers.filter(d => d.id !== currentDriver.id);
                
                // Save to GitHub
                await githubService.updateFileContent('drivers.json', updatedDrivers, 'Delete driver');
                
                // Close modal
                document.getElementById('driver-detail-modal').style.display = 'none';
                
                // Refresh drivers list
                loadDriversData();
                
                // Show success message
                alert(`Driver ${currentDriver.firstName} ${currentDriver.lastName} deleted successfully!`);
            } catch (error) {
                console.error('Error deleting driver:', error);
                alert(`Failed to delete driver: ${error.message}`);
            }
        }
        
        // Filter drivers by status
        function filterDrivers() {
            const statusFilter = document.getElementById('drivers-status-filter');
            const filterValue = statusFilter ? statusFilter.value : 'all';
            
            const driverSlips = document.querySelectorAll('.driver-slip');
            driverSlips.forEach(slip => {
                if (filterValue === 'all' || slip.querySelector('.driver-status').textContent.toLowerCase().includes(filterValue)) {
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
        
        // Load related data (cars and cards)
        async function loadRelatedData() {
            try {
                // Load cars for assignment
                await githubService.getFileContent('cars.json');
                // Load cards for assignment
                await githubService.getFileContent('cards.json');
            } catch (error) {
                console.error('Error loading related ', error);
            }
        }
        
        // Load available resources for assignment
        async function loadAvailableResources() {
            const availableCars = document.getElementById('available-cars');
            const availableCards = document.getElementById('available-cards');
            
            if (!availableCars || !availableCards) return;
            
            try {
                // Load cars
                const cars = await githubService.getFileContent('cars.json');
                const unassignedCars = cars.filter(car => !car.driver);
                
                availableCars.innerHTML = '';
                if (unassignedCars.length === 0) {
                    availableCars.innerHTML = '<p>No available cars</p>';
                } else {
                    unassignedCars.forEach(car => {
                        const carItem = document.createElement('div');
                        carItem.className = 'assignment-item';
                        carItem.dataset.id = car.id;
                        carItem.dataset.type = 'car';
                        
                        // Check if this car is already assigned to the current driver
                        if (currentDriver && currentDriver.car === car.tractorPlate) {
                            carItem.classList.add('selected');
                        }
                        
                        carItem.innerHTML = `
                            <strong>${car.tractorPlate}</strong> - ${car.trailerPlate}
                            <div style="font-size: 12px; color: var(--medium-gray); margin-top: 3px;">
                                ${car.maxWeight} | ${car.loadingSpace}
                            </div>
                        `;
                        
                        // Add click handler
                        carItem.addEventListener('click', () => {
                            carItem.classList.toggle('selected');
                        });
                        
                        availableCars.appendChild(carItem);
                    });
                }
                
                // Load cards
                const cards = await githubService.getFileContent('cards.json');
                const unassignedCards = cards.filter(card => !card.assignedTo);
                
                availableCards.innerHTML = '';
                if (unassignedCards.length === 0) {
                    availableCards.innerHTML = '<p>No available cards</p>';
                } else {
                    unassignedCards.forEach(card => {
                        const cardItem = document.createElement('div');
                        cardItem.className = 'assignment-item';
                        cardItem.dataset.id = card.id;
                        cardItem.dataset.type = 'card';
                        
                        // Check if this card is already assigned to the current driver
                        if (currentDriver && currentDriver.card === card.number) {
                            cardItem.classList.add('selected');
                        }
                        
                        cardItem.innerHTML = `
                            <strong>${card.number}</strong> - ${card.expiry}
                            <div style="font-size: 12px; color: var(--medium-gray); margin-top: 3px;">
                                PIN: ${card.pin}
                            </div>
                        `;
                        
                        // Add click handler
                        cardItem.addEventListener('click', () => {
                            cardItem.classList.toggle('selected');
                        });
                        
                        availableCards.appendChild(cardItem);
                    });
                }
            } catch (error) {
                console.error('Error loading available resources:', error);
                availableCars.innerHTML = '<p>Error loading available cars</p>';
                availableCards.innerHTML = '<p>Error loading available cards</p>';
            }
        }
        
        // Save resource assignment
        async function saveResourceAssignment() {
            if (!currentDriver) return;
            
            try {
                // Get selected resources
                const selectedCars = document.querySelectorAll('#available-cars .assignment-item.selected');
                const selectedCards = document.querySelectorAll('#available-cards .assignment-item.selected');
                
                // Get existing data
                const [drivers, cars, cards] = await Promise.all([
                    githubService.getFileContent('drivers.json'),
                    githubService.getFileContent('cars.json'),
                    githubService.getFileContent('cards.json')
                ]);
                
                // Update driver assignment
                const driverIndex = drivers.findIndex(d => d.id === currentDriver.id);
                if (driverIndex !== -1) {
                    // Clear previous assignments
                    const oldCar = drivers[driverIndex].car;
                    const oldCard = drivers[driverIndex].card;
                    
                    // Update driver
                    drivers[driverIndex].car = selectedCars.length > 0 ? selectedCars[0].dataset.id : null;
                    drivers[driverIndex].card = selectedCards.length > 0 ? selectedCards[0].dataset.id : null;
                    
                    // Update cars
                    if (oldCar) {
                        const carIndex = cars.findIndex(c => c.id == oldCar);
                        if (carIndex !== -1) {
                            cars[carIndex].driver = null;
                        }
                    }
                    if (selectedCars.length > 0) {
                        const carIndex = cars.findIndex(c => c.id == selectedCars[0].dataset.id);
                        if (carIndex !== -1) {
                            cars[carIndex].driver = `${drivers[driverIndex].firstName} ${drivers[driverIndex].lastName}`;
                        }
                    }
                    
                    // Update cards
                    if (oldCard) {
                        const cardIndex = cards.findIndex(c => c.id == oldCard);
                        if (cardIndex !== -1) {
                            cards[cardIndex].assignedTo = null;
                        }
                    }
                    if (selectedCards.length > 0) {
                        const cardIndex = cards.findIndex(c => c.id == selectedCards[0].dataset.id);
                        if (cardIndex !== -1) {
                            cards[cardIndex].assignedTo = `${drivers[driverIndex].firstName} ${drivers[driverIndex].lastName}`;
                        }
                    }
                }
                
                // Save all updates
                await Promise.all([
                    githubService.updateFileContent('drivers.json', drivers, 'Update driver assignment'),
                    githubService.updateFileContent('cars.json', cars, 'Update car assignment'),
                    githubService.updateFileContent('cards.json', cards, 'Update card assignment')
                ]);
                
                // Close modal
                document.getElementById('resource-assignment-modal').style.display = 'none';
                
                // Refresh drivers list
                loadDriversData();
                
                // Show success message
                alert('Resource assignment updated successfully!');
            } catch (error) {
                console.error('Error saving resource assignment:', error);
                alert(`Failed to save resource assignment: ${error.message}`);
            }
        }
        
        // Show error message
        function showErrorMessage(error) {
            const driversList = document.getElementById('drivers-list');
            if (!driversList) return;
            
            driversList.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Drivers</h3>
                    <p>${error.message}</p>
                    <div style="margin-top: 15px;">
                        <button class="btn btn-primary" onclick="loadDriversData()">Retry</button>
                    </div>
                </div>
            `;
        }
    };
});
