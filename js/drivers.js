// DOM Elements
let driversList;
let addDriverBtn;

// Initialize drivers management
function initDrivers() {
    driversList = document.getElementById('drivers-list');
    addDriverBtn = document.getElementById('add-driver-btn');
    
    // Set up event listeners
    if (addDriverBtn) {
        addDriverBtn.addEventListener('click', showAddDriverForm);
    }
    
    // Status filter
    const statusFilter = document.getElementById('drivers-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterDrivers);
    }
}

// Load drivers data
function loadDriversData() {
    if (!driversList) return;
    
    // Clear existing content
    driversList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleDrivers = [
        {
            id: 1,
            firstName: 'Michael',
            lastName: 'Johnson',
            license: 'DL-789456',
            experience: '8 years',
            car: 'TR-204-BC',
            card: '**** 5678',
            tenders: '12 (3 active)',
            lastDelivery: 'Oct 17, 2023',
            status: 'available'
        },
        {
            id: 2,
            firstName: 'Anna',
            lastName: 'Schmidt',
            license: 'DL-123789',
            experience: '5 years',
            car: 'TR-307-XY',
            card: '**** 1234',
            tenders: '9 (2 active)',
            lastDelivery: 'Oct 20, 2023',
            status: 'on-duty'
        },
        {
            id: 3,
            firstName: 'David',
            lastName: 'Müller',
            license: 'DL-456123',
            experience: '12 years',
            car: 'TR-102-AB',
            card: '**** 9012',
            tenders: '18 (0 active)',
            lastDelivery: 'Oct 10, 2023',
            status: 'maintenance'
        }
    ];
    
    // Render drivers
    sampleDrivers.forEach(driver => {
        renderDriver(driver);
    });
}

// Render a single driver
function renderDriver(driver) {
    const driverSlip = document.createElement('div');
    driverSlip.className = 'driver-slip';
    driverSlip.dataset.id = driver.id;
    
    // Determine status class and text
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
                <span class="detail-label">Experience:</span> ${driver.experience}
            </div>
            <div>
                <span class="detail-label">Assigned Car:</span> ${driver.car}
            </div>
            <div>
                <span class="detail-label">Assigned Card:</span> ${driver.card}
            </div>
            <div>
                <span class="detail-label">Tenders:</span> ${driver.tenders}
            </div>
            <div>
                <span class="detail-label">Last Delivery:</span> ${driver.lastDelivery}
            </div>
        </div>
    `;
    
    // Add click handler for detailed view
    driverSlip.addEventListener('click', () => {
        showDriverDetails(driver);
    });
    
    driversList.appendChild(driverSlip);
}

// Show driver details
function showDriverDetails(driver) {
    // In a real implementation, this would show a modal with detailed information
    alert(`Detailed view for ${driver.firstName} ${driver.lastName}\nIn a real implementation, this would show all driver details and current tenders.`);
}

// Show add driver form
function showAddDriverForm() {
    // In a real implementation, this would show a modal form
    const name = prompt('Enter driver first name:');
    if (!name) return;
    
    const lastName = prompt('Enter driver last name:');
    if (!lastName) return;
    
    // In a real implementation, we would save this to GitHub
    const newDriver = {
        id: Date.now(),
        firstName: name,
        lastName: lastName,
        license: 'DL-' + Math.floor(100000 + Math.random() * 900000),
        experience: '0 years',
        car: 'Unassigned',
        card: 'Unassigned',
        tenders: '0 (0 active)',
        lastDelivery: 'Never',
        status: 'available'
    };
    
    // Add to UI
    renderDriver(newDriver);
    
    alert(`Driver ${name} ${lastName} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
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

// Initialize drivers when DOM is loaded
document.addEventListener('DOMContentLoaded', initDrivers);
