// Initialize cards management
function initCards() {
    console.log('Initializing cards view');
    
    // Register this view's initializer with the app state
    appState.registerViewInitializer('cards', function() {
        console.log('Cards view initialized');
    });
    
    // Register this view's data loader with the app state
    appState.registerViewLoader('cards', function() {
        console.log('Cards view data loader called');
        loadCardsData();
    });
    
    // Set up event listeners for the add card button
    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn && !addCardBtn.dataset.initialized) {
        addCardBtn.addEventListener('click', showAddCardForm);
        addCardBtn.dataset.initialized = 'true';
    }
    
    // Initialize drag and drop
    initDragAndDrop();
}

// Load cards data
function loadCardsData() {
    console.log('Loading cards data');
    
    const cardsList = document.getElementById('cards-list');
    if (!cardsList) {
        console.error('Cards list element not found');
        return;
    }
    
    // Clear existing content
    cardsList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleCards = [
        {
            id: 1,
            number: '**** 1234',
            pin: '••••',
            expiry: '08/25',
            assignedTo: 'Anna Schmidt',
            vehicle: 'TR-307-XY',
            status: 'active'
        },
        {
            id: 2,
            number: '**** 5678',
            pin: '••••',
            expiry: '11/24',
            assignedTo: 'Michael Johnson',
            vehicle: 'TR-204-BC',
            status: 'active'
        },
        {
            id: 3,
            number: '**** 9012',
            pin: '••••',
            expiry: '05/24',
            assignedTo: 'David Müller',
            vehicle: 'TR-102-AB',
            status: 'expired'
        }
    ];
    
    // Render cards
    sampleCards.forEach(card => {
        renderCard(card);
    });
    
    // Initialize drag and drop areas
    initAssignmentAreas();
    
    console.log(`Successfully loaded ${sampleCards.length} cards`);
}

// Render a single card
function renderCard(card) {
    const row = document.createElement('tr');
    row.dataset.id = card.id;
    
    // Determine status class and text
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
    
    row.innerHTML = `
        <td>${card.number}</td>
        <td>${card.pin}</td>
        <td>${card.expiry}</td>
        <td>${card.assignedTo}</td>
        <td>${card.vehicle}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
            <button class="btn btn-outline edit-card" data-id="${card.id}" style="padding:5px 10px; font-size:14px;">Edit</button>
        </td>
    `;
    
    cardsList.appendChild(row);
    
    // Add edit button handler
    const editBtn = row.querySelector('.edit-card');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editCard(card);
        });
    }
}

// Show add card form
function showAddCardForm() {
    const number = prompt('Enter card number (last 4 digits):');
    if (!number) return;
    
    const pin = prompt('Enter card PIN:');
    if (!pin) return;
    
    const expiry = prompt('Enter card expiry date (MM/YY):');
    if (!expiry) return;
    
    // In a real implementation, we would save this to GitHub
    const newCard = {
        id: Date.now(),
        number: '**** ' + number,
        pin: '••••',
        expiry: expiry,
        assignedTo: 'Unassigned',
        vehicle: 'Unassigned',
        status: 'active'
    };
    
    // Add to UI
    renderCard(newCard);
    
    alert(`Card **** ${number} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Edit card
function editCard(card) {
    const newExpiry = prompt('Enter new expiry date (MM/YY):', card.expiry);
    if (!newExpiry) return;
    
    // Update UI
    const row = document.querySelector(`#cards-list tr[data-id="${card.id}"]`);
    if (row) {
        const cells = row.querySelectorAll('td');
        cells[2].textContent = newExpiry;
    }
    
    alert(`Card updated!\nIn a real implementation, this change would be saved to your GitHub repository.`);
}

// Initialize drag and drop areas
function initAssignmentAreas() {
    const assignmentContainer = document.getElementById('assignment-container');
    if (!assignmentContainer) return;
    
    // Clear existing content
    assignmentContainer.innerHTML = '';
    
    // In a real implementation, we would fetch drivers and cards from GitHub
    const sampleDrivers = [
        { id: 1, name: 'Michael Johnson', status: 'available' },
        { id: 2, name: 'Anna Schmidt', status: 'on-duty' },
        { id: 3, name: 'David Müller', status: 'maintenance' }
    ];
    
    const sampleCards = [
        { id: 1, number: '**** 1234', status: 'active' },
        { id: 2, number: '**** 5678', status: 'active' },
        { id: 3, number: '**** 9012', status: 'expired' }
    ];
    
    // Create drivers area
    const driversArea = document.createElement('div');
    driversArea.style.flex = '1';
    driversArea.style.background = 'var(--light-gray)';
    driversArea.style.padding = '20px';
    driversArea.style.borderRadius = 'var(--border-radius)';
    driversArea.innerHTML = '<h3 style="margin-bottom: 15px;">Available Drivers</h3>';
    
    // Add drivers
    sampleDrivers.forEach(driver => {
        const driverElement = document.createElement('div');
        driverElement.className = 'driver-slip';
        driverElement.draggable = true;
        driverElement.dataset.type = 'driver';
        driverElement.dataset.id = driver.id;
        driverElement.innerHTML = `
            <div class="driver-name">${driver.name}</div>
            <div class="driver-status" style="margin-top: 5px; font-size: 12px;">
                Status: ${driver.status === 'available' ? 'Available' : driver.status === 'on-duty' ? 'On Duty' : 'Maintenance'}
            </div>
        `;
        driversArea.appendChild(driverElement);
    });
    
    // Create cards area
    const cardsArea = document.createElement('div');
    cardsArea.style.flex = '1';
    cardsArea.style.background = 'var(--light-gray)';
    cardsArea.style.padding = '20px';
    cardsArea.style.borderRadius = 'var(--border-radius)';
    cardsArea.innerHTML = '<h3 style="margin-bottom: 15px;">Available Cards</h3>';
    
    // Add cards
    sampleCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'driver-slip';
        cardElement.draggable = true;
        cardElement.dataset.type = 'card';
        cardElement.dataset.id = card.id;
        cardElement.innerHTML = `
            <div class="driver-name">Card: ${card.number}</div>
            <div class="driver-status" style="margin-top: 5px; font-size: 12px;">
                Status: ${card.status === 'active' ? 'Active' : 'Expired'}
            </div>
        `;
        cardsArea.appendChild(cardElement);
    });
    
    // Add areas to container
    assignmentContainer.appendChild(driversArea);
    assignmentContainer.appendChild(cardsArea);
}

// Initialize drag and drop
function initDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.draggable) {
            e.dataTransfer.setData('text/plain', e.target.dataset.id);
            e.target.classList.add('dragging');
        }
    });
    
    document.addEventListener('dragend', (e) => {
        if (e.target.draggable) {
            e.target.classList.remove('dragging');
        }
    });
    
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const draggable = document.querySelector(`[data-id="${id}"]`);
        
        if (draggable && e.target.closest('.driver-slip')) {
            const target = e.target.closest('.driver-slip');
            const targetType = target.dataset.type;
            const draggedType = draggable.dataset.type;
            
            // Only allow certain combinations
            if ((draggedType === 'driver' && targetType === 'card') || 
                (draggedType === 'card' && targetType === 'driver')) {
                
                // In a real implementation, we would update the assignment in GitHub
                alert(`Assignment created!\nIn a real implementation, this assignment would be saved to your GitHub repository.`);
                
                // Visual feedback
                if (draggedType === 'driver') {
                    target.innerHTML += `<div style="margin-top: 5px; color: var(--accent);">Assigned: ${draggable.querySelector('.driver-name').textContent}</div>`;
                } else {
                    target.innerHTML += `<div style="margin-top: 5px; color: var(--accent);">Assigned Card: ${draggable.querySelector('.driver-name').textContent}</div>`;
                }
            }
        }
    });
}

// Initialize cards when DOM is loaded
document.addEventListener('DOMContentLoaded', initCards);
