// Load dashboard data
function loadDashboardData() {
    // Get the tenders table body
    const tendersTable = document.getElementById('dashboard-tenders');
    if (!tendersTable) return;
    
    // Clear existing content
    tendersTable.innerHTML = '';
    
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
        // Determine status class
        let statusClass;
        switch(tender.status) {
            case 'available':
                statusClass = 'status-available';
                break;
            case 'pending':
                statusClass = 'status-pending';
                break;
            case 'delivered':
                statusClass = 'status-delivered';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                break;
            default:
                statusClass = 'status-available';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${tender.id}</td>
            <td>${tender.route}</td>
            <td>${tender.loadingDate}</td>
            <td>${tender.unloadingDate}</td>
            <td>${tender.price}</td>
            <td><span class="status-badge ${statusClass}">${tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}</span></td>
            <td>${tender.driver}</td>
        `;
        tendersTable.appendChild(row);
    });
}

// Initialize dashboard
function initDashboard() {
    // Load data when the view becomes active
    document.addEventListener('viewchange', (e) => {
        if (e.detail === 'dashboard') {
            loadDashboardData();
        }
    });
    
    // Initial load if dashboard is the current view
    if (appState.currentView === 'dashboard') {
        loadDashboardData();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);
