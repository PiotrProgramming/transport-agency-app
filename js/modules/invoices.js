// Initialize invoices management
function initInvoices() {
    console.log('Initializing invoices view');
    
    // Register this view's initializer with the app state
    appState.registerViewInitializer('invoices', function() {
        console.log('Invoices view initialized');
    });
    
    // Register this view's data loader with the app state
    appState.registerViewLoader('invoices', function() {
        console.log('Invoices view data loader called');
        loadInvoicesData();
    });
    
    // Set up event listeners for the add invoice button
    const addInvoiceBtn = document.getElementById('add-invoice-btn');
    if (addInvoiceBtn && !addInvoiceBtn.dataset.initialized) {
        addInvoiceBtn.addEventListener('click', showAddInvoiceForm);
        addInvoiceBtn.dataset.initialized = 'true';
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('invoices-status-filter');
    if (statusFilter && !statusFilter.dataset.initialized) {
        statusFilter.addEventListener('change', filterInvoices);
        statusFilter.dataset.initialized = 'true';
    }
}

// Load invoices data
function loadInvoicesData() {
    console.log('Loading invoices data');
    
    const invoicesList = document.getElementById('invoices-list');
    if (!invoicesList) {
        console.error('Invoices list element not found');
        return;
    }
    
    // Clear existing content
    invoicesList.innerHTML = '';
    
    // In a real implementation, we would fetch this from GitHub
    const sampleInvoices = [
        {
            id: 'INV-2023',
            client: 'Global Logistics Inc.',
            issueDate: 'Sep 25, 2023',
            dueDate: 'Oct 25, 2023',
            amount: '$12,450',
            status: 'pending',
            paymentTerms: 'Net 30'
        },
        {
            id: 'INV-2022',
            client: 'European Freight Co.',
            issueDate: 'Sep 18, 2023',
            dueDate: 'Oct 18, 2023',
            amount: '$8,750',
            status: 'paid',
            paymentTerms: 'Net 15'
        },
        {
            id: 'INV-2021',
            client: 'Transcontinental Ltd.',
            issueDate: 'Sep 10, 2023',
            dueDate: 'Oct 10, 2023',
            amount: '$15,200',
            status: 'overdue',
            paymentTerms: 'Net 20'
        }
    ];
    
    // Render invoices
    sampleInvoices.forEach(invoice => {
        renderInvoice(invoice);
    });
    
    console.log(`Successfully loaded ${sampleInvoices.length} invoices`);
}

// Render a single invoice
function renderInvoice(invoice) {
    const row = document.createElement('tr');
    row.dataset.id = invoice.id;
    
    // Determine status class and text
    let statusClass, statusText;
    switch(invoice.status) {
        case 'pending':
            statusClass = 'status-pending';
            statusText = 'Pending';
            break;
        case 'paid':
            statusClass = 'status-delivered';
            statusText = 'Paid';
            break;
        case 'unpaid':
            statusClass = 'status-cancelled';
            statusText = 'Unpaid';
            break;
        case 'overdue':
            statusClass = 'status-cancelled';
            statusText = 'Overdue';
            break;
        default:
            statusClass = 'status-pending';
            statusText = 'Pending';
    }
    
    row.innerHTML = `
        <td>#${invoice.id}</td>
        <td>${invoice.client}</td>
        <td>${invoice.issueDate}</td>
        <td>${invoice.dueDate}</td>
        <td>${invoice.amount}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${invoice.paymentTerms}</td>
    `;
    
    invoicesList.appendChild(row);
}

// Show add invoice form
function showAddInvoiceForm() {
    const client = prompt('Enter client name:');
    if (!client) return;
    
    const issueDate = prompt('Enter issue date (e.g., Sep 25, 2023):');
    if (!issueDate) return;
    
    const dueDate = prompt('Enter due date (e.g., Oct 25, 2023):');
    if (!dueDate) return;
    
    const amount = prompt('Enter amount (e.g., $12,450):');
    if (!amount) return;
    
    const paymentTerms = prompt('Enter payment terms (e.g., Net 30):', 'Net 30');
    if (!paymentTerms) return;
    
    // In a real implementation, we would save this to GitHub
    const newInvoice = {
        id: 'INV-' + new Date().getFullYear(),
        client: client,
        issueDate: issueDate,
        dueDate: dueDate,
        amount: amount,
        status: 'pending',
        paymentTerms: paymentTerms
    };
    
    // Add to UI
    renderInvoice(newInvoice);
    
    alert(`Invoice #${newInvoice.id} added successfully!\nIn a real implementation, this data would be saved to your GitHub repository.`);
}

// Filter invoices by status
function filterInvoices() {
    const statusFilter = document.getElementById('invoices-status-filter');
    const filterValue = statusFilter ? statusFilter.value : 'all';
    
    const invoiceRows = document.querySelectorAll('#invoices-list tr');
    invoiceRows.forEach(row => {
        const statusText = row.querySelector('.status-badge').textContent.toLowerCase();
        if (filterValue === 'all' || statusText.includes(filterValue)) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize invoices when DOM is loaded
document.addEventListener('DOMContentLoaded', initInvoices);
