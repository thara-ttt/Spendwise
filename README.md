# 💸 SpendWise - Smart Expense Tracker

SpendWise is a powerful and modern full-stack expense tracking application built with React, TypeScript, and Tailwind CSS. Designed to simplify personal finance management, it provides advanced data visualization, real-time tracking, and collaborative features to help users stay on top of their budgets.

---

## 🚀 Features

### 🛡️ Authentication
- User registration and login
- Secure authentication with session persistence
- Profile management
- Protected routes

### 📊 Dashboard
- **Overview Cards**: Total Expenses, Income, Remaining Budget, and Upcoming Payments
- **Expense Analysis**: Toggle between Pie Chart and Bar Chart (category-wise)
- **Recent Expenses**: Latest 5 transactions with badges and tooltips
- **Quick Add**: Popup dialog to quickly log an expense

### 📋 Expenses Page
- Full chronological list of expenses
- Advanced filters and sorting
- Edit/Delete with confirmation
- Category-based color-coded tags

### 🔁 Recurring Expenses
- Add subscriptions or regular bills
- Set frequency (monthly, weekly, etc.)
- Auto-generate recurring entries
- Edit/delete with ease

### 📈 Reports
- **Expense Trends**: Monthly trends with toggle between "Expenses" & "Expenses vs. Income"
- **Breakdown Charts**: Interactive Pie/Bar charts
- **Custom Date Range**: Calendar-based selection
- Export reports and apply filters

### 🤝 Shared Expenses
- Share expenses with other users
- Split bills and track shared responsibility
- Invite others to join shared lists

### 🖥️ UI/UX Design
- Responsive layout (mobile/tablet/desktop)
- Glassmorphic card design
- Sidebar navigation with collapsible drawer
- Motion transitions with Framer Motion
- High-contrast and accessible design

### 📊 Data Visualization
- Pie, Bar, and Line charts for category and trend insights
- Tooltips and animations for better understanding
- Color-coded categories and status indicators

### 🔔 Notifications
- Toasts for actions (success, error, updates)
- Realtime feedback for user actions

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, React Router, React Hook Form, Framer Motion
- **Data Fetching**: React Query
- **Charts**: Recharts
- **State Management**: Context API / Redux (optional)
- **Authentication**: JWT or Firebase Auth (based on your setup)
- **Backend**: Node.js + Express (or Firebase / Supabase)
- **Database**: MongoDB / PostgreSQL

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/spendwise-expense-tracker.git
cd spendwise-expense-tracker

# Install dependencies
npm install

# Run the development server
npm run dev
