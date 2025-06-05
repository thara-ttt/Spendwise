
// Sample shared expense data for the application

// Team members data
export const teamMembers = [
  { id: 1, name: 'John Doe', role: 'Admin', joinedDate: '2023-01-15', avatar: '', type: 'Business Partner' },
  { id: 2, name: 'Jane Smith', role: 'Member', joinedDate: '2023-01-20', avatar: '', type: 'Team Member' },
  { id: 3, name: 'Alex Johnson', role: 'Member', joinedDate: '2023-02-05', avatar: '', type: 'Family' },
  { id: 4, name: 'Maria Garcia', role: 'Member', joinedDate: '2023-03-10', avatar: '', type: 'Business Partner' }
];

// Teams/groups data
export const teams = [
  { id: 1, name: 'Marketing Team', members: 4, createdDate: '2023-01-10', type: 'Team' },
  { id: 2, name: 'Family', members: 3, createdDate: '2023-01-05', type: 'Family' },
  { id: 3, name: 'Roommates', members: 2, createdDate: '2023-02-15', type: 'Shared Living' },
  { id: 4, name: 'Startup Co-founders', members: 3, createdDate: '2023-03-20', type: 'Business' }
];

// Shared expenses data
export const sharedExpenses = [
  { id: 1, description: 'Office Supplies', amount: 15650.00, date: '2023-04-12', team: 'Marketing Team', paidBy: 'John Doe', status: 'Settled' },
  { id: 2, description: 'Team Lunch', amount: 8975.00, date: '2023-04-15', team: 'Marketing Team', paidBy: 'Jane Smith', status: 'Pending' },
  { id: 3, description: 'Monthly Rent', amount: 120000.00, date: '2023-04-01', team: 'Roommates', paidBy: 'Alex Johnson', status: 'Settled' },
  { id: 4, description: 'Software Subscription', amount: 4999.00, date: '2023-04-05', team: 'Startup Co-founders', paidBy: 'Maria Garcia', status: 'Pending' }
];
