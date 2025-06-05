import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { recurringExpensesData as localRecurringData } from "@/data/recurringExpensesData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define types for our recurring expenses
type RecurringExpenseFromSupabase = {
  id: string;
  user_id: string | null;
  description: string;
  amount: number;
  category: string | null;
  frequency: string;
  next_payment: string;
  active: boolean | null;
  created_at: string | null;
}

type RecurringExpense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  frequency: string;
  nextPayment: string;
  active: boolean;
}

// Available categories and frequencies
const categories = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Other"
];

const frequencies = [
  "Daily",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "Quarterly",
  "Yearly"
];

const Recurring = () => {
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(localRecurringData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [newRecurring, setNewRecurring] = useState({
    description: "",
    amount: "",
    category: "",
    frequency: "",
    nextPayment: new Date().toISOString().split('T')[0],
  });

  // Map Supabase data to our frontend format
  const mapSupabaseToRecurringExpense = (data: RecurringExpenseFromSupabase[]): RecurringExpense[] => {
    return data.map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount,
      category: expense.category || 'Other',
      frequency: expense.frequency,
      nextPayment: expense.next_payment,
      active: expense.active === null ? true : expense.active,
    }));
  };

  // Fetch recurring expenses from Supabase
  useEffect(() => {
    const fetchRecurringExpenses = async () => {
      try {
        setIsLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          // User is authenticated, fetch from Supabase
          const { data, error } = await supabase
            .from('recurring_expenses')
            .select('*')
            .order('next_payment', { ascending: true });
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Map data to our frontend format
            const formattedData = mapSupabaseToRecurringExpense(data);
            setRecurringExpenses(formattedData);
          }
        } else {
          // Not authenticated, use local data
          setRecurringExpenses(localRecurringData);
        }
      } catch (error) {
        console.error("Error fetching recurring expenses:", error);
        toast({
          title: "Error",
          description: "Failed to fetch recurring expenses",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecurringExpenses();
  }, [toast]);

  // Map category to appropriate styling
  const getCategoryClass = (category: string) => {
    const categoryClasses: Record<string, string> = {
      "Food": "category-pill-food",
      "Rent": "category-pill-rent",
      "Utilities": "category-pill-utilities",
      "Transportation": "category-pill-transportation",
      "Entertainment": "category-pill-entertainment"
    };
    
    return categoryClasses[category] || "category-pill-other";
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate days until next payment
  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(dateString);
    nextDate.setHours(0, 0, 0, 0);
    
    const differenceInTime = nextDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return differenceInDays;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRecurring({
      ...newRecurring,
      [name]: value
    });
  };

  const handleAddRecurring = async () => {
    try {
      // Validation
      if (!newRecurring.description || !newRecurring.amount || !newRecurring.category || 
          !newRecurring.frequency || !newRecurring.nextPayment) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      
      // Create the new expense object for our frontend
      const newExpenseFrontend: RecurringExpense = {
        id: `temp-${Date.now()}`,
        description: newRecurring.description,
        amount: parseFloat(newRecurring.amount),
        category: newRecurring.category,
        frequency: newRecurring.frequency,
        nextPayment: newRecurring.nextPayment,
        active: true
      };

      // Create the expense object for Supabase (using snake_case)
      const newExpenseSupabase = {
        description: newRecurring.description,
        amount: parseFloat(newRecurring.amount),
        category: newRecurring.category,
        frequency: newRecurring.frequency,
        next_payment: newRecurring.nextPayment,
        active: true
      };

      // Try to save to Supabase if user is authenticated
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        // Insert into Supabase
        const { data, error } = await supabase
          .from('recurring_expenses')
          .insert([newExpenseSupabase])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Convert the returned data to our frontend format
          const mappedData = mapSupabaseToRecurringExpense(data);
          // Add to local state
          setRecurringExpenses(prevExpenses => [...prevExpenses, mappedData[0]]);
          toast({
            title: "Success",
            description: "Recurring expense added successfully",
          });
        }
      } else {
        // For demo purposes without authentication
        // Add to local state only
        setRecurringExpenses(prevExpenses => [...prevExpenses, newExpenseFrontend]);
        toast({
          title: "Success",
          description: "Recurring expense added to local state (not saved to database)",
        });
      }

      // Reset form and close dialog
      setIsAddRecurringOpen(false);
      setNewRecurring({
        description: "",
        amount: "",
        category: "",
        frequency: "",
        nextPayment: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error adding recurring expense:", error);
      toast({
        title: "Error",
        description: "Failed to add recurring expense",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate monthly total from recurring expenses
  const calculateMonthlyTotal = () => {
    let total = 0;
    
    recurringExpenses.forEach(expense => {
      if (!expense.active) return;
      
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      
      switch (expense.frequency) {
        case 'Daily':
          total += amount * 30; // Approximate days in a month
          break;
        case 'Weekly':
          total += amount * 4.33; // Average weeks in a month
          break;
        case 'Bi-weekly':
          total += amount * 2.17; // Bi-weekly in a month
          break;
        case 'Monthly':
          total += amount;
          break;
        case 'Quarterly':
          total += amount / 3; // Divided over 3 months
          break;
        case 'Yearly':
          total += amount / 12; // Divided over 12 months
          break;
        default:
          total += amount;
      }
    });
    
    return total.toFixed(2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Expenses</h1>
          <p className="text-muted-foreground">
            Manage your recurring bills and subscriptions.
          </p>
        </div>
        <Dialog open={isAddRecurringOpen} onOpenChange={setIsAddRecurringOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Recurring Expense</DialogTitle>
              <DialogDescription>
                Enter the details of your recurring expense.
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
                  value={newRecurring.description}
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
                  value={newRecurring.amount}
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
                  value={newRecurring.category}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <select
                  id="frequency"
                  name="frequency"
                  value={newRecurring.frequency}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select frequency</option>
                  {frequencies.map(frequency => (
                    <option key={frequency} value={frequency}>{frequency}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nextPayment" className="text-right">
                  Next Payment
                </Label>
                <Input
                  id="nextPayment"
                  name="nextPayment"
                  type="date"
                  value={newRecurring.nextPayment}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleAddRecurring}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Recurring Expense"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>
            Your scheduled recurring expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recurringExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recurring expenses found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Add Recurring" to create your first recurring expense.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Days Until</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringExpenses.map((expense) => {
                  const daysUntil = getDaysUntil(expense.nextPayment);
                  
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {expense.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("category-pill", getCategoryClass(expense.category))}>
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.frequency}</TableCell>
                      <TableCell>{formatDate(expense.nextPayment)}</TableCell>
                      <TableCell>
                        <Badge variant={daysUntil <= 3 ? "destructive" : daysUntil <= 7 ? "secondary" : "outline"}>
                          {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{parseFloat(String(expense.amount)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>
            Total recurring expenses by month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">₹{calculateMonthlyTotal()}</p>
              <p className="text-sm text-muted-foreground">Total monthly recurring expenses</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              View Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recurring;
