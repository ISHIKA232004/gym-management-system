// Check if user is logged in and is admin
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = '../index.html';
    }
});

// Toggle sidebar
document.getElementById('menu-toggle').addEventListener('click', function() {
    document.getElementById('sidebar-wrapper').classList.toggle('d-none');
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const user = auth.currentUser;
        await auth.signOut();
        logAction('LOGOUT', user.email, {});
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Add Member Form
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
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(memberData.email, 'default123');
        
        // Save member details in Firestore
        await db.collection('members').doc(userCredential.user.uid).set({
            ...memberData,
            userId: userCredential.user.uid
        });
        
        // Log the action
        logAction('ADD_MEMBER', auth.currentUser.email, memberData);
        
        alert('Member added successfully!');
        document.getElementById('addMemberForm').reset();
        loadMembers(); // Refresh members list
    } catch (error) {
        alert('Error adding member: ' + error.message);
        logAction('ADD_MEMBER_ERROR', auth.currentUser.email, { error: error.message });
    }
});

// Load members
async function loadMembers() {
    const membersTableBody = document.getElementById('membersTableBody');
    
    try {
        const snapshot = await db.collection('members').get();
        membersTableBody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const member = doc.data();
            const row = `
                <tr>
                    <td>${member.name}</td>
                    <td>${member.email}</td>
                    <td>${member.phone}</td>
                    <td>${member.package}</td>
                    <td>${member.joinDate}</td>
                    <td><span class="badge bg-success">${member.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editMember('${doc.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMember('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="createBill('${doc.id}')">
                            <i class="fas fa-file-invoice"></i>
                        </button>
                    </td>
                </tr>
            `;
            membersTableBody.innerHTML += row;
        });
        
        // Update dashboard stats
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

// Delete member
window.deleteMember = async (memberId) => {
    if (confirm('Are you sure you want to delete this member?')) {
        try {
            await db.collection('members').doc(memberId).delete();
            logAction('DELETE_MEMBER', auth.currentUser.email, { memberId });
            loadMembers();
            alert('Member deleted successfully!');
        } catch (error) {
            alert('Error deleting member: ' + error.message);
        }
    }
};

// Create bill
window.createBill = async (memberId) => {
    const amount = prompt('Enter bill amount:');
    if (amount) {
        try {
            const billData = {
                memberId: memberId,
                amount: parseFloat(amount),
                date: new Date().toISOString(),
                status: 'pending'
            };
            
            await db.collection('bills').add(billData);
            
            // Send notification to member
            await db.collection('notifications').add({
                memberId: memberId,
                message: `New bill created for $${amount}`,
                date: new Date().toISOString(),
                read: false
            });
            
            logAction('CREATE_BILL', auth.currentUser.email, billData);
            alert('Bill created successfully!');
        } catch (error) {
            alert('Error creating bill: ' + error.message);
        }
    }
};


window.markAsPaid = async function(billId) {
    await db.collection('bills').doc(billId).update({
        status: 'paid'
    });

    alert("Payment marked as paid!");
};

// Update dashboard stats
async function updateDashboardStats() {
    try {
        // Total members
        const membersSnap = await db.collection('members').get();
        document.getElementById('totalMembers').textContent = membersSnap.size;
        
        // Active members
        const activeSnap = await db.collection('members').where('status', '==', 'active').get();
        document.getElementById('activeMembers').textContent = activeSnap.size;
        
        // Pending payments
        const pendingSnap = await db.collection('bills').where('status', '==', 'pending').get();
        document.getElementById('pendingPayments').textContent = pendingSnap.size;
        
        // Monthly revenue (current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const billsSnap = await db.collection('bills')
            .where('date', '>=', startOfMonth.toISOString())
            .where('status', '==', 'paid')
            .get();
        
        let revenue = 0;
        billsSnap.forEach(doc => revenue += doc.data().amount);
        document.getElementById('monthlyRevenue').textContent = '$' + revenue;
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Load members on page load
loadMembers();



// function editMember(memberId) {
//     const newName = prompt("Enter new name:");

//     if (newName) {
//         db.collection("members").doc(memberId).update({
//             name: newName
//         })
//         .then(() => {
//             alert("Member updated successfully!");
//             loadMembers();   // 👈 YE ADD KARO
//         })
//         .catch(error => {
//             console.error("Error updating member:", error);
//         });
//     }
// }
window.editMember = async function(memberId) {
    const newName = prompt("Enter new name:");

    if (newName) {
        try {
            await db.collection("members").doc(memberId).update({
                name: newName
            });

            alert("Member updated successfully!");
        } catch (error) {
            console.error("Error updating member:", error);
            alert("Error: " + error.message);
        }
    }
};

// Real-time updates
db.collection('members').onSnapshot(() => {
    loadMembers();
});