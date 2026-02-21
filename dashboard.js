// Check if user is logged in
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadUserData(user);
        loadDashboardData();
    }
});

// Load user data
async function loadUserData(user) {
    try {
        // Get user details from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            document.getElementById('userName').textContent = userDoc.data().name || user.email;
        } else {
            document.getElementById('userName').textContent = user.email;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load stats
        const membersSnap = await db.collection('members').get();
        document.getElementById('totalMembers').textContent = membersSnap.size;
        
        const activeSnap = await db.collection('members').where('status', '==', 'active').get();
        document.getElementById('activeMembers').textContent = activeSnap.size;
        
        // Load pending payments total
        const pendingSnap = await db.collection('bills').where('status', '==', 'pending').get();
        let pendingTotal = 0;
        pendingSnap.forEach(doc => pendingTotal += doc.data().amount);
        document.getElementById('pendingPayments').textContent = '$' + pendingTotal;
        
        // Load monthly revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const paidSnap = await db.collection('bills')
            .where('status', '==', 'paid')
            .where('date', '>=', startOfMonth.toISOString())
            .get();
        
        let revenue = 0;
        paidSnap.forEach(doc => revenue += doc.data().amount);
        document.getElementById('monthlyRevenue').textContent = '$' + revenue;
        
        // Load recent members
        loadRecentMembers();
        
        // Load recent bills
        loadRecentBills();
        
        // Load all members for modals
        loadMembersForSelect();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load recent members
async function loadRecentMembers() {
    try {
        const recentSnap = await db.collection('members')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        const tbody = document.getElementById('recentMembersBody');
        tbody.innerHTML = '';
        
        recentSnap.forEach(doc => {
            const member = doc.data();
            const row = `
                <tr>
                    <td>${member.name || 'N/A'}</td>
                    <td>${member.email || 'N/A'}</td>
                    <td>${member.phone || 'N/A'}</td>
                    <td>${member.package || 'N/A'}</td>
                    <td>${member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</td>
                    <td><span class="badge bg-success">${member.status || 'active'}</span></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading recent members:', error);
    }
}

// Load recent bills
async function loadRecentBills() {
    try {
        const recentSnap = await db.collection('bills')
            .orderBy('date', 'desc')
            .limit(5)
            .get();
        
        const tbody = document.getElementById('recentBillsBody');
        tbody.innerHTML = '';
        
        for (const doc of recentSnap.docs) {
            const bill = doc.data();
            
            // Get member details
            let memberName = 'Unknown';
            if (bill.memberId) {
                const memberDoc = await db.collection('members').doc(bill.memberId).get();
                if (memberDoc.exists) {
                    memberName = memberDoc.data().name;
                }
            }
            
            const row = `
                <tr>
                    <td>${memberName}</td>
                    <td>$${bill.amount || 0}</td>
                    <td>${bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                        <span class="badge bg-${bill.status === 'paid' ? 'success' : 'warning'}">
                            ${bill.status || 'pending'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewBill('${doc.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        }
    } catch (error) {
        console.error('Error loading recent bills:', error);
    }
}

// Load members for select dropdown
async function loadMembersForSelect() {
    try {
        const membersSnap = await db.collection('members').get();
        const select = document.getElementById('billMember');
        select.innerHTML = '<option value="">Choose Member</option>';
        
        membersSnap.forEach(doc => {
            const member = doc.data();
            select.innerHTML += `<option value="${doc.id}">${member.name} (${member.email})</option>`;
        });
    } catch (error) {
        console.error('Error loading members for select:', error);
    }
}

// Navigation
document.getElementById('dashboardLink').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('dashboard');
});

document.getElementById('membersLink').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('members');
    loadAllMembers();
});

document.getElementById('billsLink').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('bills');
    loadAllBills();
});

// Show/hide sections
function showSection(section) {
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('membersContent').style.display = 'none';
    document.getElementById('billsContent').style.display = 'none';
    
    document.getElementById(section + 'Content').style.display = 'block';
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(section + 'Link').classList.add('active');
}

// Load all members
async function loadAllMembers() {
    try {
        const membersSnap = await db.collection('members').get();
        const tbody = document.getElementById('allMembersBody');
        tbody.innerHTML = '';
        
        membersSnap.forEach(doc => {
            const member = doc.data();
            const row = `
                <tr>
                    <td>${member.name || 'N/A'}</td>
                    <td>${member.email || 'N/A'}</td>
                    <td>${member.phone || 'N/A'}</td>
                    <td>${member.package || 'N/A'}</td>
                    <td>${member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</td>
                    <td><span class="badge bg-success">${member.status || 'active'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editMember('${doc.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMember('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="createBillForMember('${doc.id}')">
                            <i class="fas fa-file-invoice"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading all members:', error);
    }
}

// Load all bills
async function loadAllBills() {
    try {
        const billsSnap = await db.collection('bills').orderBy('date', 'desc').get();
        const tbody = document.getElementById('allBillsBody');
        tbody.innerHTML = '';
        
        for (const doc of billsSnap.docs) {
            const bill = doc.data();
            
            // Get member details
            let memberName = 'Unknown';
            if (bill.memberId) {
                const memberDoc = await db.collection('members').doc(bill.memberId).get();
                if (memberDoc.exists) {
                    memberName = memberDoc.data().name;
                }
            }
            
            const row = `
                <tr>
                    <td>${doc.id.slice(0, 8)}...</td>
                    <td>${memberName}</td>
                    <td>$${bill.amount || 0}</td>
                    <td>${bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A'}</td>
                    <td>${bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                        <span class="badge bg-${bill.status === 'paid' ? 'success' : 'warning'}">
                            ${bill.status || 'pending'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewBill('${doc.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBill('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        }
    } catch (error) {
        console.error('Error loading all bills:', error);
    }
}

// Add member form submit
document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const memberData = {
        name: document.getElementById('memberName').value,
        email: document.getElementById('memberEmail').value,
        phone: document.getElementById('memberPhone').value,
        package: document.getElementById('memberPackage').value,
        joinDate: document.getElementById('joinDate').value,
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        // Create auth user
        const userCredential = await auth.createUserWithEmailAndPassword(memberData.email, 'password123');
        
        // Save to Firestore
        await db.collection('members').doc(userCredential.user.uid).set({
            ...memberData,
            userId: userCredential.user.uid
        });
        
        // Also save to users collection for role
        await db.collection('users').doc(userCredential.user.uid).set({
            email: memberData.email,
            name: memberData.name,
            role: 'member',
            createdAt: new Date().toISOString()
        });
        
        logAction('ADD_MEMBER', auth.currentUser.email, memberData);
        
        alert('Member added successfully!');
        bootstrap.Modal.getInstance(document.getElementById('addMemberModal')).hide();
        document.getElementById('addMemberForm').reset();
        
        // Refresh data
        loadDashboardData();
        if (document.getElementById('membersContent').style.display !== 'none') {
            loadAllMembers();
        }
    } catch (error) {
        alert('Error adding member: ' + error.message);
        logAction('ADD_MEMBER_ERROR', auth.currentUser.email, { error: error.message });
    }
});

// Create bill form submit
document.getElementById('createBillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const billData = {
        memberId: document.getElementById('billMember').value,
        amount: parseFloat(document.getElementById('billAmount').value),
        dueDate: document.getElementById('billDueDate').value,
        description: document.getElementById('billDescription').value,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    try {
        await db.collection('bills').add(billData);
        
        // Create notification for member
        await db.collection('notifications').add({
            memberId: billData.memberId,
            message: `New bill created for $${billData.amount}`,
            date: new Date().toISOString(),
            read: false
        });
        
        logAction('CREATE_BILL', auth.currentUser.email, billData);
        
        alert('Bill created successfully!');
        bootstrap.Modal.getInstance(document.getElementById('createBillModal')).hide();
        document.getElementById('createBillForm').reset();
        
        // Refresh data
        if (document.getElementById('billsContent').style.display !== 'none') {
            loadAllBills();
        }
    } catch (error) {
        alert('Error creating bill: ' + error.message);
        logAction('CREATE_BILL_ERROR', auth.currentUser.email, { error: error.message });
    }
});

// Delete member
window.deleteMember = async (memberId) => {
    if (confirm('Are you sure you want to delete this member?')) {
        try {
            await db.collection('members').doc(memberId).delete();
            logAction('DELETE_MEMBER', auth.currentUser.email, { memberId });
            loadAllMembers();
            loadDashboardData();
            alert('Member deleted successfully!');
        } catch (error) {
            alert('Error deleting member: ' + error.message);
        }
    }
};

// View bill
window.viewBill = (billId) => {
    window.open(`bill-receipt.html?billId=${billId}`, '_blank');
};

// Edit member
window.editMember = (memberId) => {
    alert('Edit member functionality - to be implemented');
};

// Delete bill
window.deleteBill = async (billId) => {
    if (confirm('Are you sure you want to delete this bill?')) {
        try {
            await db.collection('bills').doc(billId).delete();
            logAction('DELETE_BILL', auth.currentUser.email, { billId });
            loadAllBills();
            loadDashboardData();
            alert('Bill deleted successfully!');
        } catch (error) {
            alert('Error deleting bill: ' + error.message);
        }
    }
};

// Create bill for specific member
window.createBillForMember = (memberId) => {
    // Set the member in the create bill modal
    document.getElementById('billMember').value = memberId;
    // Show the modal
    new bootstrap.Modal(document.getElementById('createBillModal')).show();
};

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const user = auth.currentUser;
        await auth.signOut();
        logAction('LOGOUT', user.email, {});
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', () => {
    loadDashboardData();
});

// Export button
document.getElementById('exportBtn').addEventListener('click', () => {
    alert('Export functionality - to be implemented');
});

// Print button
document.getElementById('printBtn').addEventListener('click', () => {
    window.print();
});

// Real-time updates
db.collection('members').onSnapshot(() => {
    if (document.getElementById('dashboardContent').style.display !== 'none') {
        loadDashboardData();
    }
});

db.collection('bills').onSnapshot(() => {
    if (document.getElementById('dashboardContent').style.display !== 'none') {
        loadDashboardData();
    }
});