
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { expensesData } from "@/data/expensesData";

export function RecentTransactions() {
  // Map category to appropriate styling
  const getCategoryClass = (category: string) => {
    const categories: Record<string, string> = {
      "Food": "category-pill-food",
      "Rent": "category-pill-rent",
      "Utilities": "category-pill-utilities",
      "Transportation": "category-pill-transportation",
      "Entertainment": "category-pill-entertainment"
    };
    
    return categories[category] || "category-pill-other";
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

  // Get only the 5 most recent transactions
  const recentTransactions = [...expensesData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentTransactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">
              {formatDate(transaction.date)}
            </TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("category-pill", getCategoryClass(transaction.category))}>
                {transaction.category}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              ₹{transaction.amount.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
