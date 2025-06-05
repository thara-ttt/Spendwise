import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// Enhanced sample data for the reports
const monthlyData = [
  { month: 'Jan', expenses: 45000, income: 75000 },
  { month: 'Feb', expenses: 52000, income: 75000 },
  { month: 'Mar', expenses: 49000, income: 75000 },
  { month: 'Apr', expenses: 63000, income: 75000 },
  { month: 'May', expenses: 51000, income: 75000 },
  { month: 'Jun', expenses: 58000, income: 75000 },
];

const categoryData = [
  { name: 'Food', value: 25000, color: '#22E066' },
  { name: 'Rent', value: 30000, color: '#00B2FF' },
  { name: 'Utilities', value: 12000, color: '#FFCB10' },
  { name: 'Entertainment', value: 8000, color: '#FF1A8B' },
  { name: 'Transportation', value: 15000, color: '#FF7B00' },
  { name: 'Other', value: 9000, color: '#8B5CF6' },
];

const Reports = () => {
  const [viewType, setViewType] = useState("expenses");
  const [chartType, setChartType] = useState("bar");
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze your spending patterns and trends.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Trends</CardTitle>
              <CardDescription>
                Overview of your spending over time
              </CardDescription>
            </div>
            <Tabs defaultValue="expenses" className="w-[400px]" onValueChange={setViewType}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="comparison">Expenses vs. Income</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {viewType === "expenses" ? (
                <LineChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Amount']} 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    name="Expenses" 
                    stroke="#9013FE" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Amount']} 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Legend />
                  <Bar dataKey="expenses" name="Expenses" fill="#9013FE" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="income" name="Income" fill="#00B2FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                How your expenses are distributed by category
              </CardDescription>
            </div>
            <Tabs defaultValue="bar" className="w-[240px]" onValueChange={setChartType}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bar">Bar</TabsTrigger>
                <TabsTrigger value="pie">Pie</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: '#888888' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Amount']} 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Bar dataKey="value" name="Amount">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChartComponent data={categoryData} />
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
          <CardDescription>
            Key statistics about your spending habits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <InsightCard 
              title="Highest Expense" 
              value="₹30,000" 
              category="Rent"
              color="#00B2FF"
            />
            <InsightCard 
              title="Most Frequent" 
              value="₹25,000" 
              category="Food"
              color="#22E066"
            />
            <InsightCard 
              title="Monthly Average" 
              value="₹53,000" 
              category="All Categories"
              color="#9013FE"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Custom PieChart component
const PieChartComponent = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`₹${value}`, 'Amount']} 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Insight card component
const InsightCard = ({ 
  title, 
  value, 
  category, 
  color 
}: { 
  title: string; 
  value: string; 
  category: string; 
  color: string;
}) => {
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      "hover:shadow-md transition-shadow"
    )}>
      <div className="font-medium text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 font-bold text-2xl">{value}</div>
      <div className="mt-1 flex items-center">
        <div 
          className="w-3 h-3 rounded-full mr-2" 
          style={{ backgroundColor: color }}
        ></div>
        <span className="text-sm">{category}</span>
      </div>
    </div>
  );
};

// Import this to make the component compile
import { PieChart, Pie, Cell } from "recharts";

export default Reports;
