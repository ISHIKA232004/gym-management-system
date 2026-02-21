document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Log the login action
        logAction('LOGIN', user.email, { userType: userType });
        
        // Redirect based on user type
        switch(userType) {
            case 'admin':
                window.location.href = 'admin/admin-dashboard.html';
                break;
            case 'member':
                window.location.href = 'member/member-dashboard.html';
                break;
            case 'user':
                window.location.href = 'user/user-dashboard.html';
                break;
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
        logAction('LOGIN_FAILED', email, { error: error.message });
    }
});

// Check auth state
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User is logged in:', user.email);
    } else {
        console.log('User is logged out');
    }
});