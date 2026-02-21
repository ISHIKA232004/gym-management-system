// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number
function validatePhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
}

// Show loading spinner
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
        `;
    }
}

// Hide loading spinner
function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Gym Management</strong>
            <small>just now</small>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Export data to CSV
function exportToCSV(data, filename) {
    const csvContent = data.map(row => 
        Object.values(row).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Generate PDF receipt
async function generateReceipt(billData, memberData) {
    // This would require a PDF library like jsPDF
    // For now, we'll create a printable HTML receipt
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
        <html>
            <head>
                <title>Payment Receipt</title>
                <link rel="stylesheet" href="../css/style.css">
            </head>
            <body>
                <div class="receipt-container">
                    <div class="receipt-header">
                        <h3>Gym Management System</h3>
                        <p>Payment Receipt</p>
                    </div>
                    <div class="receipt-details">
                        <table>
                            <tr>
                                <td>Receipt No:</td>
                                <td>${billData.id}</td>
                            </tr>
                            <tr>
                                <td>Date:</td>
                                <td>${formatDate(billData.date)}</td>
                            </tr>
                            <tr>
                                <td>Member Name:</td>
                                <td>${memberData.name}</td>
                            </tr>
                            <tr>
                                <td>Amount:</td>
                                <td>${formatCurrency(billData.amount)}</td>
                            </tr>
                            <tr>
                                <td>Status:</td>
                                <td>${billData.status}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="text-center mt-4">
                        <p>Thank you for your payment!</p>
                        <button class="btn btn-primary no-print" onclick="window.print()">Print Receipt</button>
                    </div>
                </div>
            </body>
        </html>
    `);
}