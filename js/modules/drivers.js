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
        
        // Car management elements
        const addCarBtn = document.createElement('button');
        addCarBtn.className = 'btn btn-primary';
        addCarBtn.innerHTML = '<i class="fas fa-plus"></i> Add Car';
        addCarBtn.style.marginTop = '15px';
        
        const carsStatusFilter = document.getElementById('cars-status-filter');
        const carsImportBtn = document.createElement('button');
        carsImportBtn.className = 'btn btn-outline';
        carsImportBtn.innerHTML = '<i class="fas fa-file-import"></i> Import';
        carsImportBtn.style.marginTop = '15px';
        
        // Card management elements
        const addCardBtn = document.createElement('button');
        addCardBtn.className = 'btn btn-primary';
        addCardBtn.innerHTML = '<i class="fas fa-plus"></i> Add Card';
        addCardBtn.style.marginTop = '15px';
        
        const cardsStatusFilter = document.getElementById('cards-status-filter');
        const cardsImportBtn = document.createElement('button');
        cardsImportBtn.className = 'btn btn-outline';
        cardsImportBtn.innerHTML = '<i class="fas fa-file-import"></i> Import';
        cardsImportBtn.style.marginTop = '15px';
        
        // Tab elements
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Current driver being edited or viewed
        let currentDriver = null;
        let currentCar = null;
        let currentCard = null;
        
        // Initialize event listeners
        initEventListeners();
        
        // Load all data
        loadData();
        
        function initEventListeners() {
            // Tab switching
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const tabName = tab.getAttribute('data-tab');
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `${tabName}-tab`) {
                            content.classList.add('active');
                            
                            // Load data for the active tab
                            if (tabName === 'drivers') {
                                loadDriversData();
                            } else if (tabName === 'cars') {
                                loadCarsData();
                            } else if (tabName === 'cards') {
                                loadCardsData();
                            }
                        }
                    });
                });
            });
            
            // Add driver button
            if (addDriverBtn) {
                addDriverBtn.addEventListener('click', () => {
                    currentDriver = null;
                    driverFormTitle.textContent = 'Add New Driver';
                    resetDriverForm();
                    driverFormModal.style.display = 'block';
                });
            }
            
            // Status filter for drivers
            if (driversStatusFilter) {
                driversStatusFilter.addEventListener('change', filterDrivers);
            }
            
            // Import button for drivers
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
                    document.getElementById('car-form-modal').style.display = 'none';
                    document.getElementById('card-form-modal').style.display = 'none';
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
            
            // Add car button
            const carsTab = document.getElementById('cars-tab');
            if (carsTab && !document.getElementById('add-car-btn')) {
                const header = carsTab.querySelector('.table-header');
                if (header) {
                    const actions = header.querySelector('.action-buttons');
                    if (actions) {
                        actions.appendChild(addCarBtn);
                        actions.appendChild(carsImportBtn);
                    }
                }
            }
            
            // Add car button event listener
            addCarBtn.addEventListener('click', () => {
                currentCar = null;
                document.getElementById('car-form-title').textContent = 'Add New Car';
                resetCarForm();
                document.getElementById('car-form-modal').style.display = 'block';
            });
            
            // Status filter for cars
            if (carsStatusFilter) {
                carsStatusFilter.addEventListener('change', filterCars);
            }
            
            // Import button for cars
            carsImportBtn.addEventListener('click', handleCarsImport);
            
            // Add card button
            const cardsTab = document.getElementById('cards-tab');
            if (cardsTab && !document.getElementById('add-card-btn')) {
                const header = cardsTab.querySelector('.table-header');
                if (header) {
                    const actions = header.querySelector('.action-buttons');
                    if (actions) {
                        actions.appendChild(addCardBtn);
                        actions.appendChild(cardsImportBtn);
                    }
                }
            }
            
            // Add card button event listener
            addCardBtn.addEventListener('click', () => {
                currentCard = null;
                document.getElementById('card-form-title').textContent = 'Add New Card';
                resetCardForm();
                document.getElementById('card-form-modal').style.display = 'block';
            });
            
            // Status filter for cards
            if (cardsStatusFilter) {
                cardsStatusFilter.addEventListener('change', filterCards);
            }
            
            // Import button for cards
            cardsImportBtn.addEventListener('click', handleCardsImport);
            
            // Save car button
            document.querySelector('.save-car-btn').addEventListener('click', saveCar);
            
            // Cancel car button
            document.querySelector('.cancel-car-btn').addEventListener('click', () => {
                document.getElementById('car-form-modal').style.display = 'none';
            });
            
            // Save card button
            document.querySelector('.save-card-btn').addEventListener('click', saveCard);
            
            // Cancel card button
            document.querySelector('.cancel-card-btn').addEventListener('click', () => {
                document.getElementById('card-form-modal').style.display = 'none';
            });
            
            // Cubic meters calculation
            const carLoadingSpace = document.getElementById('car-loading-space');
            if (carLoadingSpace) {
                carLoadingSpace.addEventListener('input', calculateCubicMeters);
            }
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === driverFormModal || 
                    e.target === resourceAssignmentModal ||
                    e.target === document.getElementById('car-form-modal') ||
                    e.target === document.getElementById('card-form-modal')) {
                    driverFormModal.style.display = 'none';
                    resourceAssignmentModal.style.display = 'none';
                    document.getElementById('car-form-modal').style.display = 'none';
                    document.getElementById('card-form-modal').style.display = 'none';
                }
            });
        }
        
        // Load all data
        async function loadData() {
            try {
                // Load drivers data
                loadDriversData();
                
                // Load cars data
                loadCarsData();
                
                // Load cards data
                loadCardsData();
                
                // Check for notifications
                checkForNotifications();
                
                // Set up automatic status updates
                setupStatusAutomation();
            } catch (error) {
                console.error('Error loading ', error);
            }
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
                showErrorMessage(driversList, error);
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
                    </div>
                `;
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
        function showErrorMessage(container, error) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Data</h3>
                    <p>${error.message}</p>
                    <div style="margin-top: 15px;">
                        <button class="btn btn-primary" onclick="loadDriversData()">Retry</button>
                    </div>
                </div>
            `;
        }
        
        // Load cars data from GitHub
        async function loadCarsData() {
            const carsList = document.getElementById('cars-list');
            if (!carsList) return;
            
            try {
                // Show loading state
                carsList.innerHTML = `
                    <div class="view-placeholder">
                        <div class="loading-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <p>Loading cars data...</p>
                    </div>
                `;
                
                // Fetch data from GitHub
                const cars = await githubService.getFileContent('cars.json');
                
                // Render data
                renderCars(cars);
                
                console.log(`Successfully loaded ${cars.length} cars from GitHub`);
            } catch (error) {
                console.error('Error loading cars:', error);
                showErrorMessage(carsList, error);
            }
        }
        
        // Render cars
        function renderCars(cars) {
            const carsList = document.getElementById('cars-list');
            if (!carsList) return;
            
            if (cars.length === 0) {
                carsList.innerHTML = `
                    <div class="view-placeholder">
                        <i class="fas fa-truck" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                        <h3>No Cars Found</h3>
                        <p>Get started by adding your first car</p>
                    </div>
                `;
                return;
            }
            
            // Clear container
            carsList.innerHTML = '';
            
            // Render each car
            cars.forEach(car => {
                renderCar(car, carsList);
            });
        }
        
        // Render a single car
        function renderCar(car, container) {
            const carSlip = document.createElement('div');
            carSlip.className = 'driver-slip'; // Reusing the same class for consistency
            carSlip.dataset.id = car.id;
            
            // Determine status class
            let statusClass, statusText;
            switch(car.status) {
                case 'available':
                    statusClass = 'status-available';
                    statusText = 'Available';
                    break;
                case 'in-use':
                    statusClass = 'status-pending';
                    statusText = 'In Use';
                    break;
                case 'maintenance':
                    statusClass = 'status-cancelled';
                    statusText = 'Maintenance';
                    break;
                default:
                    statusClass = 'status-available';
                    statusText = 'Available';
            }
            
            carSlip.innerHTML = `
                <div class="driver-header">
                    <div class="driver-name">${car.tractorPlate}</div>
                    <div class="driver-status ${statusClass}">${statusText}</div>
                </div>
                <div class="driver-details">
                    <div>
                        <span class="detail-label">Trailer:</span> ${car.trailerPlate}
                    </div>
                    <div>
                        <span class="detail-label">Max Weight:</span> ${car.maxWeight}
                    </div>
                    <div>
                        <span class="detail-label">Loading Space:</span> ${car.loadingSpace}
                    </div>
                    <div>
                        <span class="detail-label">Insurance:</span> ${car.insurance}
                    </div>
                    <div>
                        <span class="detail-label">Inspection:</span> ${car.inspection}
                    </div>
                    <div>
                        <span class="detail-label">Driver:</span> ${car.driver || 'Unassigned'}
                    </div>
                </div>
            `;
            
            // Add click handler
            carSlip.addEventListener('click', () => {
                currentCar = car;
                document.getElementById('car-form-title').textContent = 'Edit Car';
                populateCarForm(car);
                document.getElementById('car-form-modal').style.display = 'block';
            });
            
            container.appendChild(carSlip);
        }
        
        // Reset car form
        function resetCarForm() {
            document.getElementById('car-tractor-plate').value = '';
            document.getElementById('car-trailer-plate').value = '';
            document.getElementById('car-max-weight').value = '';
            document.getElementById('car-loading-space').value = '';
            document.getElementById('car-insurance').value = '';
            document.getElementById('car-inspection').value = '';
            document.getElementById('car-status').value = 'available';
            document.getElementById('car-insurance-notify').value = '30';
            document.getElementById('car-insurance-reminder').value = '7';
            document.getElementById('car-inspection-notify').value = '30';
            document.getElementById('car-inspection-reminder').value = '7';
            document.getElementById('cubic-meters').textContent = '0.00';
        }
        
        // Populate car form
        function populateCarForm(car) {
            document.getElementById('car-tractor-plate').value = car.tractorPlate;
            document.getElementById('car-trailer-plate').value = car.trailerPlate;
            document.getElementById('car-max-weight').value = car.maxWeight;
            document.getElementById('car-loading-space').value = car.loadingSpace;
            document.getElementById('car-insurance').value = car.insurance;
            document.getElementById('car-inspection').value = car.inspection;
            document.getElementById('car-status').value = car.status;
            document.getElementById('car-insurance-notify').value = car.insuranceNotify || '30';
            document.getElementById('car-insurance-reminder').value = car.insuranceReminder || '7';
            document.getElementById('car-inspection-notify').value = car.inspectionNotify || '30';
            document.getElementById('car-inspection-reminder').value = car.inspectionReminder || '7';
            
            // Calculate cubic meters
            calculateCubicMeters();
        }
        
        // Calculate cubic meters
        function calculateCubicMeters() {
            const loadingSpace = document.getElementById('car-loading-space').value;
            if (!loadingSpace) return;
            
            // Extract dimensions (assuming format like "13.6m x 2.45m x 2.7m")
            const dimensions = loadingSpace.match(/(\d+\.?\d*)/g);
            if (dimensions && dimensions.length >= 3) {
                const length = parseFloat(dimensions[0]);
                const width = parseFloat(dimensions[1]);
                const height = parseFloat(dimensions[2]);
                
                if (!isNaN(length) && !isNaN(width) && !isNaN(height)) {
                    const cubicMeters = (length * width * height).toFixed(2);
                    document.getElementById('cubic-meters').textContent = cubicMeters;
                }
            }
        }
        
        // Save car
        async function saveCar() {
            // Validate form
            const tractorPlate = document.getElementById('car-tractor-plate').value;
            const trailerPlate = document.getElementById('car-trailer-plate').value;
            
            if (!tractorPlate || !trailerPlate) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                // Get existing cars
                const cars = await githubService.getFileContent('cars.json');
                
                // Create or update car
                const carData = {
                    tractorPlate: tractorPlate,
                    trailerPlate: trailerPlate,
                    maxWeight: document.getElementById('car-max-weight').value,
                    loadingSpace: document.getElementById('car-loading-space').value,
                    insurance: document.getElementById('car-insurance').value,
                    inspection: document.getElementById('car-inspection').value,
                    status: document.getElementById('car-status').value,
                    driver: currentCar ? currentCar.driver : null,
                    insuranceNotify: document.getElementById('car-insurance-notify').value,
                    insuranceReminder: document.getElementById('car-insurance-reminder').value,
                    inspectionNotify: document.getElementById('car-inspection-notify').value,
                    inspectionReminder: document.getElementById('car-inspection-reminder').value
                };
                
                if (currentCar) {
                    // Update existing car
                    carData.id = currentCar.id;
                    const index = cars.findIndex(c => c.id === currentCar.id);
                    if (index !== -1) {
                        cars[index] = carData;
                    }
                } else {
                    // Add new car
                    carData.id = cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1;
                    cars.push(carData);
                }
                
                // Save to GitHub
                await githubService.updateFileContent('cars.json', cars, currentCar ? 'Update car' : 'Add new car');
                
                // Close modal
                document.getElementById('car-form-modal').style.display = 'none';
                
                // Refresh cars list
                loadCarsData();
                
                // Show success message
                alert(`Car ${tractorPlate} ${currentCar ? 'updated' : 'added'} successfully!`);
            } catch (error) {
                console.error('Error saving car:', error);
                alert(`Failed to save car: ${error.message}`);
            }
        }
        
        // Filter cars by status
        function filterCars() {
            const statusFilter = document.getElementById('cars-status-filter');
            const filterValue = statusFilter ? statusFilter.value : 'all';
            
            const carSlips = document.querySelectorAll('#cars-list .driver-slip');
            carSlips.forEach(slip => {
                const statusText = slip.querySelector('.driver-status').textContent.toLowerCase();
                
                if (filterValue === 'all' || statusText.includes(filterValue)) {
                    slip.style.display = 'block';
                } else {
                    slip.style.display = 'none';
                }
            });
        }
        
        // Handle cars import
        function handleCarsImport() {
            alert('Import functionality would open a file picker to import cars from a CSV or Excel file.\n\nIn a real implementation, this data would be saved to your GitHub repository.');
        }
        
        // Load cards data from GitHub
        async function loadCardsData() {
            const cardsList = document.getElementById('cards-list');
            if (!cardsList) return;
            
            try {
                // Show loading state
                cardsList.innerHTML = `
                    <div class="view-placeholder">
                        <div class="loading-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <p>Loading cards data...</p>
                    </div>
                `;
                
                // Fetch data from GitHub
                const cards = await githubService.getFileContent('cards.json');
                
                // Render data
                renderCards(cards);
                
                console.log(`Successfully loaded ${cards.length} cards from GitHub`);
            } catch (error) {
                console.error('Error loading cards:', error);
                showErrorMessage(cardsList, error);
            }
        }
        
        // Render cards
        function renderCards(cards) {
            const cardsList = document.getElementById('cards-list');
            if (!cardsList) return;
            
            if (cards.length === 0) {
                cardsList.innerHTML = `
                    <div class="view-placeholder">
                        <i class="fas fa-credit-card" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                        <h3>No Cards Found</h3>
                        <p>Get started by adding your first card</p>
                    </div>
                `;
                return;
            }
            
            // Clear container
            cardsList.innerHTML = '';
            
            // Render each card
            cards.forEach(card => {
                renderCard(card, cardsList);
            });
        }
        
        // Render a single card
        function renderCard(card, container) {
            const cardSlip = document.createElement('div');
            cardSlip.className = 'driver-slip'; // Reusing the same class for consistency
            cardSlip.dataset.id = card.id;
            
            // Determine status class
            let statusClass, statusText;
            switch(card.status) {
                case 'active':
                    statusClass = 'status-available';
                    statusText = 'Active';
                    break;
                case 'expired':
                    statusClass = 'status-cancelled';
                    statusText = 'Expired';
                    break;
                default:
                    statusClass = 'status-available';
                    statusText = 'Active';
            }
            
            cardSlip.innerHTML = `
                <div class="driver-header">
                    <div class="driver-name">${card.number}</div>
                    <div class="driver-status ${statusClass}">${statusText}</div>
                </div>
                <div class="driver-details">
                    <div>
                        <span class="detail-label">PIN:</span> ${card.pin}
                    </div>
                    <div>
                        <span class="detail-label">Expiry:</span> ${card.expiry}
                    </div>
                    <div>
                        <span class="detail-label">Type:</span> ${card.type}
                    </div>
                    <div>
                        <span class="detail-label">Assigned To:</span> ${card.assignedTo || 'Unassigned'}
                    </div>
                    <div>
                        <span class="detail-label">Notify Before:</span> ${card.notifyBefore} days
                    </div>
                    <div>
                        <span class="detail-label">Reminder Freq:</span> ${card.reminderFreq} days
                    </div>
                </div>
            `;
            
            // Add click handler
            cardSlip.addEventListener('click', () => {
                currentCard = card;
                document.getElementById('card-form-title').textContent = 'Edit Card';
                populateCardForm(card);
                document.getElementById('card-form-modal').style.display = 'block';
            });
            
            container.appendChild(cardSlip);
        }
        
        // Reset card form
        function resetCardForm() {
            document.getElementById('card-type').value = 'fuel';
            document.getElementById('card-number').value = '';
            document.getElementById('card-pin').value = '';
            document.getElementById('card-expiry').value = '';
            document.getElementById('card-notify').value = '30';
            document.getElementById('card-reminder').value = '7';
            document.getElementById('card-status').value = 'active';
        }
        
        // Populate card form
        function populateCardForm(card) {
            document.getElementById('card-type').value = card.type;
            document.getElementById('card-number').value = card.number;
            document.getElementById('card-pin').value = card.pin;
            document.getElementById('card-expiry').value = card.expiry;
            document.getElementById('card-notify').value = card.notifyBefore || '30';
            document.getElementById('card-reminder').value = card.reminderFreq || '7';
            document.getElementById('card-status').value = card.status;
        }
        
        // Save card
        async function saveCard() {
            // Validate form
            const number = document.getElementById('card-number').value;
            const pin = document.getElementById('card-pin').value;
            const expiry = document.getElementById('card-expiry').value;
            
            if (!number || !pin || !expiry) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                // Get existing cards
                const cards = await githubService.getFileContent('cards.json');
                
                // Create or update card
                const cardData = {
                    type: document.getElementById('card-type').value,
                    number: number,
                    pin: pin,
                    expiry: expiry,
                    status: document.getElementById('card-status').value,
                    notifyBefore: document.getElementById('card-notify').value,
                    reminderFreq: document.getElementById('card-reminder').value,
                    assignedTo: currentCard ? currentCard.assignedTo : null
                };
                
                if (currentCard) {
                    // Update existing card
                    cardData.id = currentCard.id;
                    const index = cards.findIndex(c => c.id === currentCard.id);
                    if (index !== -1) {
                        cards[index] = cardData;
                    }
                } else {
                    // Add new card
                    cardData.id = cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1;
                    cards.push(cardData);
                }
                
                // Save to GitHub
                await githubService.updateFileContent('cards.json', cards, currentCard ? 'Update card' : 'Add new card');
                
                // Close modal
                document.getElementById('card-form-modal').style.display = 'none';
                
                // Refresh cards list
                loadCardsData();
                
                // Show success message
                alert(`Card **** ${number.slice(-4)} ${currentCard ? 'updated' : 'added'} successfully!`);
            } catch (error) {
                console.error('Error saving card:', error);
                alert(`Failed to save card: ${error.message}`);
            }
        }
        
        // Filter cards by status
        function filterCards() {
            const statusFilter = document.getElementById('cards-status-filter');
            const filterValue = statusFilter ? statusFilter.value : 'all';
            
            const cardSlips = document.querySelectorAll('#cards-list .driver-slip');
            cardSlips.forEach(slip => {
                const statusText = slip.querySelector('.driver-status').textContent.toLowerCase();
                
                if (filterValue === 'all' || statusText.includes(filterValue)) {
                    slip.style.display = 'block';
                } else {
                    slip.style.display = 'none';
                }
            });
        }
        
        // Handle cards import
        function handleCardsImport() {
            alert('Import functionality would open a file picker to import cards from a CSV or Excel file.\n\nIn a real implementation, this data would be saved to your GitHub repository.');
        }
        
        // Check for notifications
        function checkForNotifications() {
            // This would check for upcoming expirations and show notifications
            console.log('Checking for notifications...');
            
            // In a real implementation, this would:
            // 1. Check car insurance and inspection dates
            // 2. Check card expiry dates
            // 3. Show notifications based on user settings
        }
        
        // Setup automatic status updates
        function setupStatusAutomation() {
            // This would set up automatic status updates
            console.log('Setting up status automation...');
            
            // In a real implementation, this would:
            // 1. Check driver availability based on assigned tenders
            // 2. Check car status based on inspection dates
            // 3. Update statuses automatically
            
            // Run status check every 5 minutes
            setInterval(() => {
                console.log('Running status check...');
                // In a real implementation, this would update statuses
            }, 300000);
        }
    };
});
