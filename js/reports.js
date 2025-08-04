// DOM Elements
let generateReportBtn;

// Initialize reports
function initReports() {
    generateReportBtn = document.getElementById('generate-report-btn');
    
    // Set up event listeners
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
}

// Load reports data
function loadReportsData() {
    // Update dashboard metrics
    updateDashboardMetrics();
    
    // Load driver performance data
    loadDriverPerformance();
}

// Update dashboard metrics
function updateDashboardMetrics() {
    // In a real implementation, these values would be calculated from GitHub data
    const metrics = {
        revenue: {
            value: '$142,850',
            change: '↑ 12.4% from last month',
            positive: true
        },
        loadCapacity: {
            value: '86.7%',
            change: '↑ 3.2% from last month',
            positive: true
        },
        deliveryRate: {
            value: '92%',
            change: '↑ 3% from last month',
            positive: true
        },
        utilization: {
            value: '78%',
            change: '↓ 2% from last month',
            positive: false
        }
    };
    
    // Update UI
    document.getElementById('revenue-value').textContent = metrics.revenue.value;
    document.getElementById('revenue-change').textContent = metrics.revenue.change;
    document.getElementById('revenue-change').className = metrics.revenue.positive ? 'card-change positive' : 'card-change negative';
    
    document.getElementById('load-capacity-value').textContent = metrics.loadCapacity.value;
    document.getElementById('load-capacity-change').textContent = metrics.loadCapacity.change;
    document.getElementById('load-capacity-change').className = metrics.loadCapacity.positive ? 'card-change positive' : 'card-change negative';
    
    document.getElementById('delivery-rate-value').textContent = metrics.deliveryRate.value;
    document.getElementById('delivery-rate-change').textContent = metrics.deliveryRate.change;
    document.getElementById('delivery-rate-change').className = metrics.deliveryRate.positive ? 'card-change positive' : 'card-change negative';
    
    document.getElementById('utilization-value').textContent = metrics.utilization.value;
    document.getElementById('utilization-change').textContent = metrics.utilization.change;
    document.getElementById('utilization-change').className = metrics.utilization.positive ? 'card-change positive' : 'card-change negative';
}

// Load driver performance data
function loadDriverPerformance() {
    const performanceTable = document.getElementById('drivers-performance');
    if (!performanceTable) return;
    
    // Clear existing content
    performanceTable.innerHTML = '';
    
    // In a real implementation, this data would be calculated from GitHub data
    const performanceData = [
        {
            name: 'Michael Johnson',
            tenders: 12,
            onTimeRate: '95%',
            avgRevenue: '$4,250',
            capacityUtilization: '88.2%'
        },
        {
            name: 'Anna Schmidt',
            tenders: 9,
            onTimeRate: '92%',
            avgRevenue: '$3,167',
            capacityUtilization: '85.7%'
        },
        {
            name: 'David Müller',
            tenders: 18,
            onTimeRate: '88%',
            avgRevenue: '$3,722',
            capacityUtilization: '82.4%'
        }
    ];
    
    // Render performance data
    performanceData.forEach(driver => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${driver.name}</td>
            <td>${driver.tenders}</td>
            <td>${driver.onTimeRate}</td>
            <td>${driver.avgRevenue}</td>
            <td>${driver.capacityUtilization}</td>
        `;
        performanceTable.appendChild(row);
    });
}

// Generate report
function generateReport() {
    const reportPeriod = document.getElementById('report-period').value;
    const periodText = reportPeriod === 'weekly' ? 'Weekly' : reportPeriod === 'monthly' ? 'Monthly' : 'Quarterly';
    
    // In a real implementation, this would generate a PDF report
    alert(`${periodText} report generated successfully!\nIn a real implementation, this would generate a detailed PDF report based on your data from GitHub.`);
    
    // Update metrics to simulate new data
    updateDashboardMetrics();
}

// Initialize reports when DOM is loaded
document.addEventListener('DOMContentLoaded', initReports);
