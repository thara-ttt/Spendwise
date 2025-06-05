
import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface ExpenseData {
  month_name: string;
  month_num: number;
  year_num: number;
  total_amount: number;
}

interface ExpenseTrendsChartProps {
  data?: Array<{
    name: string;
    amount: number;
  }>;
}

const ExpenseTrendsChart = ({ data: initialData }: ExpenseTrendsChartProps) => {
  const [data, setData] = useState(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenseTrends = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: expenseTrends, error } = await supabase
          .rpc('get_expense_trends', { months_back: 6 });
        
        if (error) {
          throw error;
        }
        
        if (expenseTrends) {
          // Transform the data to match the expected format
          const formattedData = expenseTrends.map((item: ExpenseData) => ({
            name: item.month_name,
            amount: Number(item.total_amount)
          })).reverse(); // Reverse to show oldest to newest
          
          setData(formattedData);
        }
      } catch (error: any) {
        console.error('Error fetching expense trends:', error);
        setError(error.message || 'Failed to load expense data');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if no initial data was provided
    if (!initialData || initialData.length === 0) {
      fetchExpenseTrends();
    }
  }, [initialData]);

  // If loading and no data, show a loading state
  if (isLoading && data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If error and no data, show error message
  if (error && data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-destructive">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <RechartsTooltip 
          formatter={(value) => [`₹${value}`, 'Amount']} 
          labelStyle={{ color: 'black' }}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
          }}
        />
        <Bar 
          dataKey="amount" 
          fill="#9b87f5"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ExpenseTrendsChart;
