// DOM Elements
let invoicesList;
let addInvoiceBtn;

// Initialize invoices management
function initInvoices() {
    invoicesList = document.getElementById('invoices-list');
    addInvoiceBtn = document.getElementById('add-invoice-btn');
    
    // Set up event listeners
    if (addInvoiceBtn) {
        addInvoiceBtn.addEventListener('click', showAddInvoiceForm);
    }
    
    // Status filter
    const statusFilter = document.getElementById('invoices-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterInvoices);
    }
}

// Load invoices data
function loadInvoicesData() {
    if (!invoicesList) return;
    
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
    // In a real implementation, this would show a modal form
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
