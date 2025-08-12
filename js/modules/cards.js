// Cards Module - Standalone module for cards management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cards view
    window.initCards = function() {
        console.log('Initializing cards view');
        
        // Get DOM elements
        const addCardBtn = document.getElementById('add-card-btn');
        const cardsStatusFilter = document.getElementById('cards-status-filter');
        const cardsImportBtn = document.getElementById('cards-import-btn');
        const cardFormModal = document.getElementById('card-form-modal');
        const cardFormTitle = document.getElementById('card-form-title');
        const cardForm = document.getElementById('card-form');
        const saveCardBtn = document.querySelector('.save-card-btn');
        const cancelCardBtn = document.querySelector('.cancel-card-btn');
        const closeModalBtns = document.querySelectorAll('.close-modal');
        
        // Current card being edited or viewed
        let currentCard = null;
        
        // Initialize event listeners
        initEventListeners();
        
        // Load cards data
        loadCardsData();
        
        function initEventListeners() {
            // Add card button
            if (addCardBtn) {
                addCardBtn.addEventListener('click', () => {
                    currentCard = null;
                    cardFormTitle.textContent = 'Add New Card';
                    resetCardForm();
                    cardFormModal.style.display = 'block';
                });
            }
            
            // Status filter
            if (cardsStatusFilter) {
                cardsStatusFilter.addEventListener('change', filterCards);
            }
            
            // Import button
            if (cardsImportBtn) {
                cardsImportBtn.addEventListener('click', handleImport);
            }
            
            // Save card button
            if (saveCardBtn) {
                saveCardBtn.addEventListener('click', saveCard);
            }
            
            // Cancel card button
            if (cancelCardBtn) {
                cancelCardBtn.addEventListener('click', () => {
                    cardFormModal.style.display = 'none';
                });
            }
            
            // Close modal buttons
            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    cardFormModal.style.display = 'none';
                });
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === cardFormModal) {
                    cardFormModal.style.display = 'none';
                }
            });
        }
        
        // Load cards data from GitHub
        async function loadCardsData() {
            const cardsList = document.getElementById('cards-list');
            if (!cardsList) return;
            
            try {
                // Show loading state
                cardsList.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">
                            <div class="loading-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </td>
                    </tr>
                `;
                
                // Fetch data from GitHub
                const cards = await githubService.getFileContent('cards.json');
                
                // Render data
                renderCards(cards);
                
                console.log(`Successfully loaded ${cards.length} cards from GitHub`);
            } catch (error) {
                console.error('Error loading cards:', error);
                showErrorMessage(error);
            }
        }
        
        // Render cards
        function renderCards(cards) {
            const cardsList = document.getElementById('cards-list');
            if (!cardsList) return;
            
            // Clear container
            cardsList.innerHTML = '';
            
            if (cards.length === 0) {
                cardsList.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center" style="padding: 30px;">
                            <i class="fas fa-credit-card" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                            <h3>No Cards Found</h3>
                            <p>Get started by adding your first card</p>
                            <button class="btn btn-primary" id="first-card-btn" style="margin-top: 15px;">
                                <i class="fas fa-plus"></i> Add First Card
                            </button>
                        </td>
                    </tr>
                `;
                
                // Add event listener for the first card button
                const firstCardBtn = document.getElementById('first-card-btn');
                if (firstCardBtn) {
                    firstCardBtn.addEventListener('click', () => {
                        currentCard = null;
                        cardFormTitle.textContent = 'Add New Card';
                        resetCardForm();
                        cardFormModal.style.display = 'block';
                    });
                }
                
                return;
            }
            
            // Render each card
            cards.forEach(card => {
                renderCard(card, cardsList);
            });
        }
        
        // Render a single card
        function renderCard(card, container) {
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
                <td>${card.assignedTo ? card.assignedTo : 'Unassigned'}</td>
                <td>${card.vehicle ? card.vehicle : 'Unassigned'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-outline edit-card" data-id="${card.id}" style="padding:5px 10px; font-size:14px;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            `;
            
            container.appendChild(row);
            
            // Add edit button handler
            const editBtn = row.querySelector('.edit-card');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editCard(card);
                });
            }
        }
        
        // Edit card
        function editCard(card) {
            currentCard = card;
            cardFormTitle.textContent = 'Edit Card';
            populateCardForm(card);
            document.getElementById('card-form-modal').style.display = 'block';
        }
        
        // Reset card form
        function resetCardForm() {
            document.getElementById('card-number').value = '';
            document.getElementById('card-pin').value = '';
            document.getElementById('card-expiry').value = '';
            document.getElementById('card-status').value = 'active';
        }
        
        // Populate card form
        function populateCardForm(card) {
            document.getElementById('card-number').value = card.number;
            document.getElementById('card-pin').value = card.pin;
            document.getElementById('card-expiry').value = card.expiry;
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
                    number: number,
                    pin: pin,
                    expiry: expiry,
                    status: document.getElementById('card-status').value,
                    assignedTo: currentCard ? currentCard.assignedTo : null,
                    vehicle: currentCard ? currentCard.vehicle : null
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
            
            const cardRows = document.querySelectorAll('#cards-list tr');
            cardRows.forEach(row => {
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
            alert('Import functionality would open a file picker to import cards from a CSV or Excel file.\n\nIn a real implementation, this data would be saved to your GitHub repository.');
        }
        
        // Show error message
        function showErrorMessage(error) {
            const cardsList = document.getElementById('cards-list');
            if (!cardsList) return;
            
            cardsList.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="error-message" style="width: 100%; margin: 0;">
                            <h3>Error Loading Cards</h3>
                            <p>${error.message}</p>
                            <button class="btn btn-primary" onclick="loadCardsData()">Retry</button>
                        </div>
                    </td>
                </tr>
            `;
        }
    };
});
