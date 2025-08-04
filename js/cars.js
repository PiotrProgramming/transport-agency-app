// DOM Elements
let carsList;
let addCarBtn;

// Initialize cars management
function initCars() {
    carsList = document.getElementById('cars-list');
    addCarBtn = document.getElementById('add-car-btn');
    
    // Set up event listeners
    if (addCarBtn) {
        addCarBtn.addEventListener('click', showAddCarForm);
    }
    
    // Status filter
    const statusFilter = document.getElementById('cars-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterCars);
    }
}

// Load cars data
function loadCarsData() {
    if (!carsList) return;
    
    // Clear existing content
    carsList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleCars = [
        {
            id: 1,
            tractorPlate: 'TR-102-AB',
            trailerPlate: 'TL-205-XY',
            maxWeight: '24,000 kg',
            loadingSpace: '13.6m x 2.45m x 2.7m (90.8 m³)',
            insurance: 'Dec 15, 2023',
            inspection: 'Nov 30, 2023',
            status: 'maintenance',
            driver: 'David Müller'
        },
        {
            id: 2,
            tractorPlate: 'TR-204-BC',
            trailerPlate: 'TL-307-AB',
            maxWeight: '24,000 kg',
            loadingSpace: '13.6m x 2.45m x 2.7m (90.8 m³)',
            insurance: 'Jan 22, 2024',
            inspection: 'Dec 10, 2023',
            status: 'available',
            driver: 'Michael Johnson'
        },
        {
            id: 3,
            tractorPlate: 'TR-307-XY',
            trailerPlate: 'TL-102-BC',
            maxWeight: '22,000 kg',
            loadingSpace: '13.6m x 2.45m x 2.7m (90.8 m³)',
            insurance: 'Feb 5, 2024',
            inspection: 'Jan 15, 2024',
            status: 'in-use',
            driver: 'Anna Schmidt'
        }
    ];
    
    // Render cars
    sampleCars.forEach(car => {
        renderCar(car);
    });
}

// Render a single car
function renderCar(car) {
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
        <td>${car.driver}</td>
    `;
    
    carsList.appendChild(row);
}

// Show add car form
function showAddCarForm() {
    // In a real implementation, this would show a modal form
    const tractorPlate = prompt('Enter tractor plate number:');
    if (!tractorPlate) return;
    
    const trailerPlate = prompt('Enter trailer plate number:');
    if (!trailerPlate) return;
    
    // In a real implementation, we would calculate these based on inputs
    const maxWeight = '24,000 kg';
    const loadingSpace = '13.6m x 2.45m x 2.7m (90.8 m³)';
    const insurance = 'Jan 1, 2024';
    const inspection = 'Dec 1, 2023';
    
    // In a real implementation, we would save this to GitHub
    const newCar = {
        id: Date.now(),
        tractorPlate: tractorPlate,
        trailerPlate: trailerPlate,
        maxWeight: maxWeight,
        loadingSpace: loadingSpace,
        insurance: insurance,
        inspection: inspection,
        status: 'available',
        driver: 'Unassigned'
    };
    
    // Add to UI
    renderCar(newCar);
    
    alert(`Car ${tractorPlate} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Filter cars by status
function filterCars() {
    const statusFilter = document.getElementById('cars-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const carRows = document.querySelectorAll('#cars-list tr');
    carRows.forEach(row => {
        const statusText = row.querySelector('.status-badge').textContent.toLowerCase();
        if (filterValue === 'all' || statusText.includes(filterValue)) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize cars when DOM is loaded
document.addEventListener('DOMContentLoaded', initCars);
