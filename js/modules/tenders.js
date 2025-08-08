// Initialize tenders management
function initTenders() {
    console.log('Initializing tenders view');
    
    // Register this view's initializer with the app state
    appState.registerViewInitializer('tenders', function() {
        console.log('Tenders view initialized');
    });
    
    // Register this view's data loader with the app state
    appState.registerViewLoader('tenders', function() {
        console.log('Tenders view data loader called');
        loadTendersData();
    });
    
    // Set up event listeners for the add tender button
    const addTenderBtn = document.getElementById('add-tender-btn');
    if (addTenderBtn && !addTenderBtn.dataset.initialized) {
        addTenderBtn.addEventListener('click', showAddTenderForm);
        addTenderBtn.dataset.initialized = 'true';
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('tenders-status-filter');
    if (statusFilter && !statusFilter.dataset.initialized) {
        statusFilter.addEventListener('change', filterTenders);
        statusFilter.dataset.initialized = 'true';
    }
}

// Load tenders data
function loadTendersData() {
    console.log('Loading tenders data');
    
    const tendersList = document.getElementById('tenders-list');
    if (!tendersList) {
        console.error('Tenders list element not found');
        return;
    }
    
    // Clear existing content
    tendersList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleTenders = [
        {
            id: 'TX-7890',
            route: 'Berlin (10115) → Paris (75001)',
            loadingDate: 'Oct 15, 2023',
            unloadingDate: 'Oct 17, 2023',
            price: '$4,250',
            status: 'delivered',
            driver: 'Michael Johnson'
        },
        {
            id: 'TX-7891',
            route: 'Munich (80331) → Vienna (1010)',
            loadingDate: 'Oct 18, 2023',
            unloadingDate: 'Oct 20, 2023',
            price: '$2,850',
            status: 'pending',
            driver: 'Anna Schmidt'
        },
        {
            id: 'TX-7892',
            route: 'Hamburg (20095) → Copenhagen (1050)',
            loadingDate: 'Oct 22, 2023',
            unloadingDate: 'Oct 24, 2023',
            price: '$3,150',
            status: 'available',
            driver: 'Unassigned'
        },
        {
            id: 'TX-7893',
            route: 'Frankfurt (60311) → Amsterdam (1012)',
            loadingDate: 'Oct 25, 2023',
            unloadingDate: 'Oct 27, 2023',
            price: '$3,750',
            status: 'available',
            driver: 'Unassigned'
        }
    ];
    
    // Render tenders
    sampleTenders.forEach(tender => {
        renderTender(tender);
    });
    
    console.log(`Successfully loaded ${sampleTenders.length} tenders`);
}

// Render a single tender
function renderTender(tender) {
    const row = document.createElement('tr');
    row.dataset.id = tender.id;
    
    // Determine status class and text
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
    
    row.innerHTML = `
        <td>#${tender.id}</td>
        <td>${tender.route}</td>
        <td>${tender.loadingDate}</td>
        <td>${tender.unloadingDate}</td>
        <td>${tender.price}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${tender.driver}</td>
        <td>
            <button class="btn btn-outline ${tender.status === 'available' ? 'assign-tender' : 'tender-details'}" 
                data-id="${tender.id}" style="padding:5px 10px; font-size:14px;">
                ${tender.status === 'available' ? 'Assign' : 'Details'}
            </button>
        </td>
    `;
    
    tendersList.appendChild(row);
    
    // Add button handler
    const actionBtn = row.querySelector('button');
    if (actionBtn) {
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (tender.status === 'available') {
                assignTender(tender);
            } else {
                showTenderDetails(tender);
            }
        });
    }
}

// Show add tender form
function showAddTenderForm() {
    const route = prompt('Enter route (e.g., Berlin → Paris):');
    if (!route) return;
    
    const loadingDate = prompt('Enter loading date (e.g., Oct 25, 2023):');
    if (!loadingDate) return;
    
    const unloadingDate = prompt('Enter unloading date (e.g., Oct 27, 2023):');
    if (!unloadingDate) return;
    
    const price = prompt('Enter price (e.g., $3,750):');
    if (!price) return;
    
    // In a real implementation, we would save this to GitHub
    const newTender = {
        id: 'TX-' + Math.floor(10000 + Math.random() * 90000),
        route: route,
        loadingDate: loadingDate,
        unloadingDate: unloadingDate,
        price: price,
        status: 'available',
        driver: 'Unassigned'
    };
    
    // Add to UI
    renderTender(newTender);
    
    alert(`Tender #${newTender.id} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Assign tender to driver
function assignTender(tender) {
    const driver = prompt('Enter driver name to assign this tender to:');
    if (!driver) return;
    
    // Update UI
    const row = document.querySelector(`#tenders-list tr[data-id="${tender.id}"]`);
    if (row) {
        const cells = row.querySelectorAll('td');
        cells[6].textContent = driver;
        cells[5].innerHTML = '<span class="status-badge status-pending">Pending</span>';
        cells[7].innerHTML = '<button class="btn btn-outline tender-details" style="padding:5px 10px; font-size:14px;">Details</button>';
        
        // Update button handler
        const actionBtn = row.querySelector('button');
        if (actionBtn) {
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showTenderDetails({...tender, driver: driver, status: 'pending'});
            });
        }
    }
    
    alert(`Tender #${tender.id} assigned to ${driver}!\nIn a real implementation, this assignment would be saved to your GitHub repository.`);
}

// Show tender details
function showTenderDetails(tender) {
    let additionalInfo = '';
    
    if (tender.status === 'sold') {
        additionalInfo = `\nSold for: ${tender.soldPrice}\nPayment terms: ${tender.paymentTerms} days`;
    }
    
    alert(`Tender #${tender.id} Details:\nRoute: ${tender.route}\nLoading: ${tender.loadingDate}\nUnloading: ${tender.unloadingDate}\nPrice: ${tender.price}\nStatus: ${tender.status}\nDriver: ${tender.driver}${additionalInfo}\n\nIn a real implementation, this would show a detailed view with all tender information.`);
}

// Filter tenders by status
function filterTenders() {
    const statusFilter = document.getElementById('tenders-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const tenderRows = document.querySelectorAll('#tenders-list tr');
    tenderRows.forEach(row => {
        const statusText = row.querySelector('.status-badge').textContent.toLowerCase();
        if (filterValue === 'all' || 
            (filterValue === 'unassigned' && statusText === 'available' && row.querySelector('td:nth-child(7)').textContent === 'Unassigned') ||
            (filterValue !== 'unassigned' && statusText.includes(filterValue))) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize tenders when DOM is loaded
document.addEventListener('DOMContentLoaded', initTenders);
