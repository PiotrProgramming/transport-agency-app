// Initialize reports
function initReports() {
    console.log('Initializing reports view');
    
    // Register this view's initializer with the app state
    appState.registerViewInitializer('reports', function() {
        console.log('Reports view initialized');
    });
    
    // Register this view's data loader with the app state
    appState.registerViewLoader('reports', function() {
        console.log('Reports view data loader called');
        loadReportsData();
    });
    
    // Set up event listeners for the generate report button
    const generateReportBtn = document.getElementById('generate-report-btn');
    if (generateReportBtn && !generateReportBtn.dataset.initialized) {
        generateReportBtn.addEventListener('click', generateReport);
        generateReportBtn.dataset.initialized = 'true';
    }
}

// Load reports data
function loadReportsData() {
    console.log('Loading reports data');
    
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
    const revenueValue = document.getElementById('revenue-value');
    const revenueChange = document.getElementById('revenue-change');
    const loadCapacityValue = document.getElementById('load-capacity-value');
    const loadCapacityChange = document.getElementById('load-capacity-change');
    const deliveryRateValue = document.getElementById('delivery-rate-value');
    const deliveryRateChange = document.getElementById('delivery-rate-change');
    const utilizationValue = document.getElementById('utilization-value');
    const utilizationChange = document.getElementById('utilization-change');
    
    if (revenueValue) revenueValue.textContent = metrics.revenue.value;
    if (revenueChange) {
        revenueChange.textContent = metrics.revenue.change;
        revenueChange.className = metrics.revenue.positive ? 'card-change positive' : 'card-change negative';
    }
    
    if (loadCapacityValue) loadCapacityValue.textContent = metrics.loadCapacity.value;
    if (loadCapacityChange) {
        loadCapacityChange.textContent = metrics.loadCapacity.change;
        loadCapacityChange.className = metrics.loadCapacity.positive ? 'card-change positive' : 'card-change negative';
    }
    
    if (deliveryRateValue) deliveryRateValue.textContent = metrics.deliveryRate.value;
    if (deliveryRateChange) {
        deliveryRateChange.textContent = metrics.deliveryRate.change;
        deliveryRateChange.className = metrics.deliveryRate.positive ? 'card-change positive' : 'card-change negative';
    }
    
    if (utilizationValue) utilizationValue.textContent = metrics.utilization.value;
    if (utilizationChange) {
        utilizationChange.textContent = metrics.utilization.change;
        utilizationChange.className = metrics.utilization.positive ? 'card-change positive' : 'card-change negative';
    }
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
