let currentMemberId = null;

// Check authentication
auth.onAuthStateChanged(async user => {
    if (!user) {
        window.location.href = '../index.html';
    } else {
        // Get member details
        const memberDoc = await db.collection('members').where('email', '==', user.email).get();
        if (!memberDoc.empty) {
            currentMemberId = memberDoc.docs[0].id;
            loadMemberData(currentMemberId);
            loadBills(currentMemberId);
            loadNotifications(currentMemberId);
        }
    }
});

// Load member data
async function loadMemberData(memberId) {
    try {
        const memberDoc = await db.collection('members').doc(memberId).get();
        const member = memberDoc.data();
        
        document.getElementById('membershipStatus').textContent = member.status || 'Active';
        
        // Calculate valid until (30 days from join date)
        if (member.joinDate) {
            const joinDate = new Date(member.joinDate);
            const validUntil = new Date(joinDate.setMonth(joinDate.getMonth() + 1));
            document.getElementById('validUntil').textContent = validUntil.toLocaleDateString();
        }
    } catch (error) {
        console.error('Error loading member data:', error);
    }
}

// Load bills
async function loadBills(memberId) {
    try {
        const billsSnap = await db.collection('bills')
            .where('memberId', '==', memberId)
            .orderBy('date', 'desc')
            .get();
        
        const billsTableBody = document.getElementById('billsTableBody');
        billsTableBody.innerHTML = '';
        
        let totalBills = 0;
        let pendingBills = 0;
        let nextDueDate = null;
        let dueAmount = 0;
        
        billsSnap.forEach(doc => {
            const bill = doc.data();
            totalBills++;
            
            if (bill.status === 'pending') {
                pendingBills++;
                if (!nextDueDate || new Date(bill.date) < new Date(nextDueDate)) {
                    nextDueDate = bill.date;
                    dueAmount = bill.amount;
                }
            }
            
            const row = `
                <tr>
                    <td>${new Date(bill.date).toLocaleDateString()}</td>
                    <td>$${bill.amount}</td>
                    <td>
                        <span class="badge bg-${bill.status === 'paid' ? 'success' : 'warning'}">
                            ${bill.status}
                        </span>
                    </td>
                    <td>
                        ${bill.status === 'pending' ? 
                            '<button class="btn btn-sm btn-primary" onclick="payBill(\'' + doc.id + '\')">Pay Now</button>' : 
                            '<button class="btn btn-sm btn-secondary" disabled>Paid</button>'}
                        <button class="btn btn-sm btn-info" onclick="viewReceipt(\'' + doc.id + '\')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
            billsTableBody.innerHTML += row;
        });
        
        // Update stats
        document.getElementById('totalBills').textContent = totalBills;
        document.getElementById('pendingBills').textContent = pendingBills;
        document.getElementById('nextDueDate').textContent = nextDueDate ? new Date(nextDueDate).toLocaleDateString() : '-';
        document.getElementById('dueAmount').textContent = dueAmount;
        
    } catch (error) {
        console.error('Error loading bills:', error);
    }
}

// Load notifications
async function loadNotifications(memberId) {
    try {
        const notificationsSnap = await db.collection('notifications')
            .where('memberId', '==', memberId)
            .orderBy('date', 'desc')
            .get();
        
        const notificationsList = document.getElementById('notificationsList');
        notificationsList.innerHTML = '';
        
        let unreadCount = 0;
        
        notificationsSnap.forEach(doc => {
            const notification = doc.data();
            if (!notification.read) unreadCount++;
            
            const notificationDiv = `
                <div class="alert alert-${notification.read ? 'secondary' : 'info'} mb-2">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${notification.message}</strong>
                            <br>
                            <small>${new Date(notification.date).toLocaleString()}</small>
                        </div>
                        ${!notification.read ? 
                            '<button class="btn btn-sm btn-primary" onclick="markNotificationRead(\'' + doc.id + '\')">Mark Read</button>' : 
                            ''}
                    </div>
                </div>
            `;
            notificationsList.innerHTML += notificationDiv;
        });
        
        document.getElementById('notificationCount').textContent = unreadCount;
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Pay bill
window.payBill = async (billId) => {
    try {
        await db.collection('bills').doc(billId).update({
            status: 'paid',
            paidDate: new Date().toISOString()
        });
        
        logAction('PAY_BILL', auth.currentUser.email, { billId });
        alert('Payment successful!');
        loadBills(currentMemberId);
    } catch (error) {
        alert('Error processing payment: ' + error.message);
    }
};

// View receipt
window.viewReceipt = (billId) => {
    window.open(`receipt.html?billId=${billId}`, '_blank');
};

// Mark notification as read
window.markNotificationRead = async (notificationId) => {
    try {
        await db.collection('notifications').doc(notificationId).update({
            read: true
        });
        loadNotifications(currentMemberId);
    } catch (error) {
        console.error('Error marking notification:', error);
    }
};

// Toggle sections
document.getElementById('viewBills').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('billsSection').classList.remove('d-none');
    document.getElementById('notificationsSection').classList.add('d-none');
});

document.getElementById('viewNotifications').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('billsSection').classList.add('d-none');
    document.getElementById('notificationsSection').classList.remove('d-none');
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await auth.signOut();
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Real-time updates
db.collection('bills').where('memberId', '==', currentMemberId).onSnapshot(() => {
    if (currentMemberId) loadBills(currentMemberId);
});

db.collection('notifications').where('memberId', '==', currentMemberId).onSnapshot(() => {
    if (currentMemberId) loadNotifications(currentMemberId);
});