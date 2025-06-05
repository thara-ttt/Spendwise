import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecentTransactions } from "@/components/RecentTransactions";
import ExpenseTrendsChart from "@/components/charts/ExpenseTrendsChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import SummaryCards from "@/components/dashboard/SummaryCards";
import { CreditCard, CalendarClock, Users } from "@/components/icons/DashboardIcons";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import the data from other sections to keep it synchronized
import { expensesData } from "@/data/expensesData";
import { recurringExpensesData } from "@/data/recurringExpensesData";
import { categoryData } from "@/data/categoryData";
import { teams, teamMembers } from "@/data/sharedData";

const Dashboard = () => {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [recurringExpenses, setRecurringExpenses] = useState(0);
  const [teamMemberCount, setTeamMemberCount] = useState(0);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState<any[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();
  const [categories] = useState([
    "Food", "Rent", "Utilities", "Transportation", "Entertainment", "Other"
  ]);

  useEffect(() => {
    // Calculate total expenses from expense data
    const total = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpenses(total);

    // Calculate recurring expenses
    const recurring = recurringExpensesData.reduce((sum, expense) => sum + expense.amount, 0);
    setRecurringExpenses(recurring);

    // Get team member count
    setTeamMemberCount(teamMembers.length);

    // Generate monthly expense data from expenses
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);

    // Create monthly aggregated data
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      // In a real app, this would filter expenses by month
      // For demo, we'll use the existing expense data with some variance
      const baseAmount = 75000 + Math.random() * 50000;
      monthlyData.push({
        name: monthName,
        amount: Math.round(baseAmount)
      });
    }
    setMonthlyExpenseData(monthlyData);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value
    });
  };

  const handleAddExpense = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      
      if (user) {
        // Try to add to Supabase if user is authenticated
        const { error } = await supabase
          .from('expenses')
          .insert({
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            category: newExpense.category,
            date: newExpense.date,
            user_id: user.id,
            added_by: user.email
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "Expense Added",
        description: `Added ${newExpense.description} for ₹${newExpense.amount}`,
      });
      
      setIsAddExpenseOpen(false);
      setNewExpense({
        description: "",
        amount: "",
        category: "Food",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        variant: "destructive",
        title: "Error adding expense",
        description: "There was an error adding your expense. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            An overview of your finances.
          </p>
        </div>
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Enter the details of your new expense.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={newExpense.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount (₹)
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <select
                  id="category"
                  name="category"
                  value={newExpense.category}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={newExpense.date}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddExpense} isLoading={isLoading}>
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        totalExpenses={totalExpenses}
        recurringExpenses={recurringExpenses}
        teamMemberCount={teamMemberCount}
      />

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Expense Trends</CardTitle>
            <CardDescription>
              Your expenses over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ExpenseTrendsChart data={monthlyExpenseData} />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>
              How your expenses are distributed
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <CategoryPieChart data={categoryData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your most recent expenses
          </CardDescription>
        </CardHeader>
        <RecentTransactions />
      </Card>
    </div>
  );
};

export default Dashboard;
