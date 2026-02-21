// Your web app's Firebase configuration
const firebaseConfig = {

    apiKey: "AIzaSyCmMFTeKflpkYOpHzm4Bbt1mdSJOZHFIvM",
    authDomain: "gym-management-system-3b6d1.firebaseapp.com",
    projectId: "gym-management-system-3b6d1",
    storageBucket: "gym-management-system-3b6d1.firebasestorage.app",
    messagingSenderId: "748996862170",
    appId: "1:748996862170:web:76287350f022e9309805e3",
    measurementId: "G-BF0DY8409T"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Logging function
function logAction(action, user, details) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Action: ${action}, User: ${user}, Details:`, details);
    
    // Store logs in Firestore
    db.collection('logs').add({
        action: action,
        user: user,
        details: details,
        timestamp: timestamp
    }).catch(error => console.error("Logging error:", error));
}

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCmMFTeKflpkYOpHzm4Bbt1mdSJOZHFIvM",
//   authDomain: "gym-management-system-3b6d1.firebaseapp.com",
//   projectId: "gym-management-system-3b6d1",
//   storageBucket: "gym-management-system-3b6d1.firebasestorage.app",
//   messagingSenderId: "748996862170",
//   appId: "1:748996862170:web:76287350f022e9309805e3",
//   measurementId: "G-BF0DY8409T"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);