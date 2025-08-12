// Cars Module - Standalone module for cars management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cars view
    window.initCars = function() {
        console.log('Initializing cars view');
        
        // Get DOM elements
        const addCarBtn = document.getElementById('add-car-btn');
        const carsStatusFilter = document.getElementById('cars-status-filter');
        const carsImportBtn = document.getElementById('cars-import-btn');
        const carFormModal = document.getElementById('car-form-modal');
        const carFormTitle = document.getElementById('car-form-title');
        const carForm = document.getElementById('car-form');
        const saveCarBtn = document.querySelector('.save-car-btn');
        const cancelCarBtn = document.querySelector('.cancel-car-btn');
        const closeModalBtns = document.querySelectorAll('.close-modal');
        
        // Current car being edited or viewed
        let currentCar = null;
        
        // Initialize event listeners
        initEventListeners();
        
        // Load cars data
        loadCarsData();
        
        function initEventListeners() {
            // Add car button
            if (addCarBtn) {
                addCarBtn.addEventListener('click', () => {
                    currentCar = null;
                    carFormTitle.textContent = 'Add New Car';
                    resetCarForm();
                    carFormModal.style.display = 'block';
                });
            }
            
            // Status filter
            if (carsStatusFilter) {
                carsStatusFilter.addEventListener('change', filterCars);
            }
            
            // Import button
            if (carsImportBtn) {
                carsImportBtn.addEventListener('click', handleImport);
            }
            
            // Save car button
            if (saveCarBtn) {
                saveCarBtn.addEventListener('click', saveCar);
            }
            
            // Cancel car button
            if (cancelCarBtn) {
                cancelCarBtn.addEventListener('click', () => {
                    carFormModal.style.display = 'none';
                });
            }
            
            // Close modal buttons
            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    carFormModal.style.display = 'none';
                });
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === carFormModal) {
                    carFormModal.style.display = 'none';
                }
            });
        }
        
        // Load cars data from GitHub
        async function loadCarsData() {
            const carsList = document.getElementById('cars-list');
            if (!carsList) return;
            
            try {
                // Show loading state
                carsList.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center">
                            <div class="loading-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </td>
                    </tr>
                `;
                
                // Fetch data from GitHub
                const cars = await githubService.getFileContent('cars.json');
                
                // Render data
                renderCars(cars);
                
                console.log(`Successfully loaded ${cars.length} cars from GitHub`);
            } catch (error) {
                console.error('Error loading cars:', error);
                showErrorMessage(error);
            }
        }
        
        // Render cars
        function renderCars(cars) {
            const carsList = document.getElementById('cars-list');
            if (!carsList) return;
            
            // Clear container
            carsList.innerHTML = '';
            
            if (cars.length === 0) {
                carsList.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center" style="padding: 30px;">
                            <i class="fas fa-truck" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                            <h3>No Cars Found</h3>
                            <p>Get started by adding your first car</p>
                            <button class="btn btn-primary" id="first-car-btn" style="margin-top: 15px;">
                                <i class="fas fa-plus"></i> Add First Car
                            </button>
                        </td>
                    </tr>
                `;
                
                // Add event listener for the first car button
                const firstCarBtn = document.getElementById('first-car-btn');
                if (firstCarBtn) {
                    firstCarBtn.addEventListener('click', () => {
                        currentCar = null;
                        carFormTitle.textContent = 'Add New Car';
                        resetCarForm();
                        carFormModal.style.display = 'block';
                    });
                }
                
                return;
            }
            
            // Render each car
            cars.forEach(car => {
                renderCar(car, carsList);
            });
        }
        
        // Render a single car
        function renderCar(car, container) {
            const row = document.createElement('tr');
            row.dataset.id = car.id;
            
            // Determine status class and text
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
            
            row.innerHTML = `
                <td>${car.tractorPlate}</td>
                <td>${car.trailerPlate}</td>
                <td>${car.maxWeight}</td>
                <td>${car.loadingSpace}</td>
                <td>${car.insurance}</td>
                <td>${car.inspection}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${car.driver ? car.driver : 'Unassigned'}</td>
                <td>
                    <button class="btn btn-outline edit-car" data-id="${car.id}" style="padding:5px 10px; font-size:14px;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            `;
            
            container.appendChild(row);
            
            // Add edit button handler
            const editBtn = row.querySelector('.edit-car');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editCar(car);
                });
            }
        }
        
        // Edit car
        function editCar(car) {
            currentCar = car;
            carFormTitle.textContent = 'Edit Car';
            populateCarForm(car);
            document.getElementById('car-form-modal').style.display = 'block';
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
                    driver: currentCar ? currentCar.driver : null
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
            
            const carRows = document.querySelectorAll('#cars-list tr');
            carRows.forEach(row => {
                const statusText = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';
                if (filterValue === 'all' || statusText.includes(filterValue)) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            });
        }
        
        // Handle import
        function handleImport() {
            alert('Import functionality would open a file picker to import cars from a CSV or Excel file.\n\nIn a real implementation, this data would be saved to your GitHub repository.');
        }
        
        // Show error message
        function showErrorMessage(error) {
            const carsList = document.getElementById('cars-list');
            if (!carsList) return;
            
            carsList.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="error-message" style="width: 100%; margin: 0;">
                            <h3>Error Loading Cars</h3>
                            <p>${error.message}</p>
                            <button class="btn btn-primary" onclick="loadCarsData()">Retry</button>
                        </div>
                    </td>
                </tr>
            `;
        }
    };
});
