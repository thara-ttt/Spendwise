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
import { Plus, Filter, Download } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { expensesData } from "@/data/expensesData";

// Available categories
const categories = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Other"
];

// Define a type for our expense data that works with both sources
type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  added_by?: string; // from Supabase
  addedBy?: string;  // from local data
};

const Expenses = () => {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>(expensesData);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const { toast } = useToast();
  
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      
      if (user) {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) throw error;
        if (data && data.length > 0) {
          // Map Supabase data to our Expense type with normalized properties
          const normalizedData: Expense[] = data.map(item => ({
            id: item.id,
            description: item.description,
            amount: item.amount,
            category: item.category || '',
            date: item.date,
            added_by: item.added_by, // Keep for Supabase compatibility
            addedBy: item.added_by   // Add for local data compatibility
          }));
          
          setExpenses(normalizedData);
        }
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      // Fallback to demo data
      setExpenses(expensesData);
    }
  };

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
      
      if (!newExpense.description || !newExpense.amount || !newExpense.category) {
        throw new Error("Please fill in all fields");
      }
      
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
        
        // Refetch expenses
        await fetchExpenses();
      } else {
        // Demo mode - add to local data
        const newExpenseItem: Expense = {
          id: crypto.randomUUID(),
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          date: newExpense.date,
          added_by: "You (Demo)",
          addedBy: "You (Demo)"
        };
        
        setExpenses([newExpenseItem, ...expenses]);
      }
      
      toast({
        title: "Expense Added",
        description: `Added ${newExpense.description} for ₹${newExpense.amount}`,
      });
      
      setIsAddExpenseOpen(false);
      setNewExpense({
        description: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      console.error("Error adding expense:", error);
      toast({
        variant: "destructive",
        title: "Error adding expense",
        description: error.message || "There was an error adding your expense. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      // Create CSV content
      const headers = ["Date", "Description", "Category", "Added By", "Amount"];
      const csvContent = [
        headers.join(","),
        ...expenses.map(expense => [
          formatDate(expense.date),
          `"${expense.description}"`,
          expense.category,
          expense.added_by || expense.addedBy || "You",
          expense.amount
        ].join(","))
      ].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `expenses_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Complete",
        description: "Your expenses have been exported to CSV",
      });
    } catch (error) {
      console.error("Error exporting expenses:", error);
      toast({
        variant: "destructive",
        title: "Error exporting",
        description: "There was an error exporting your expenses. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilter = (category: string) => {
    setFilterCategory(category);
    setIsFiltering(false);
    
    if (category) {
      toast({
        title: "Filter Applied",
        description: `Showing only ${category} expenses`,
      });
    }
  };

  const filteredExpenses = filterCategory 
    ? expenses.filter(expense => expense.category === filterCategory)
    : expenses;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Manage and track your expenses.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isFiltering} onOpenChange={setIsFiltering}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                {filterCategory ? `Filter: ${filterCategory}` : "Filter"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Expenses</DialogTitle>
                <DialogDescription>
                  Filter expenses by category
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <Button 
                      key={category} 
                      variant={filterCategory === category ? "default" : "outline"}
                      onClick={() => handleFilter(category)}
                    >
                      {category}
                    </Button>
                  ))}
                  <Button 
                    variant={!filterCategory ? "default" : "outline"}
                    onClick={() => handleFilter("")}
                    className="col-span-2"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
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
                    <option value="">Select a category</option>
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
                <Button type="submit" onClick={handleAddExpense} disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Expense"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>
            A complete list of all your recorded expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("category-pill", getCategoryClass(expense.category))}>
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{expense.added_by || expense.addedBy || "You"}</TableCell>
                  <TableCell className="text-right">
                    ₹{typeof expense.amount === 'number' ? expense.amount.toFixed(2) : expense.amount}
                  </TableCell>
                </TableRow>
              ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    {filterCategory ? `No expenses found in category: ${filterCategory}` : "No expenses found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
