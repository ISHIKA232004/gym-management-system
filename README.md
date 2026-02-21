# Gym Management System

A comprehensive web-based Gym Management System built with HTML, CSS, JavaScript, and Firebase. This system helps gym owners manage members, track payments, send notifications, and handle supplement store inventory.

## Features

### Admin Module
- 🔐 Secure login for administrators
- 👥 Add, update, and delete members
- 📊 Create and manage bills
- 💰 Assign fee packages to members
- 📨 Send notifications to members
- 📈 Export monthly reports
- 🏪 Supplement store management
- 🥗 Diet details management

### Member Module
- 🔑 Member login
- 📄 View bill receipts
- 🔔 Receive payment notifications
- 💳 Online payment option

### User Module
- 🔍 Search member records
- 📋 View member details

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication, Firestore)
- **Styling**: Bootstrap 5, Custom CSS
- **Icons**: Font Awesome 6
- **Version Control**: Git & GitHub

## Project Structure
gym-management-system/
│
├── index.html # Login page
├── dashboard.html # Main dashboard
├── admin/
│ ├── admin-dashboard.html # Admin panel
│ ├── admin-dashboard.js # Admin logic
│ └── members.html # Member management
├── member/
│ ├── member-dashboard.html # Member panel
│ └── member-dashboard.js # Member logic
├── user/
│ └── user-dashboard.html # User panel
├── css/
│ ├── style.css # Main styles
│ └── responsive.css # Responsive design
├── js/
│ ├── firebase-config.js # Firebase setup
│ ├── auth.js # Authentication
│ └── utils.js # Utility functions
└── README.md

## Installation & Setup

### Prerequisites
- Node.js (optional, for local server)
- Firebase account
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/gym-management-system.git
cd gym-management-system