
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CalendarClock, Users } from "@/components/icons/DashboardIcons";
import { supabase } from "@/integrations/supabase/client";
// Import local data to use as fallback
import { expensesData } from "@/data/expensesData";
import { recurringExpensesData } from "@/data/recurringExpensesData";
import { teamMembers } from "@/data/sharedData";

interface SummaryCardsProps {
  totalExpenses?: number;
  recurringExpenses?: number;
  teamMemberCount?: number;
}

const SummaryCards = ({ 
  totalExpenses: initialTotalExpenses, 
  recurringExpenses: initialRecurringExpenses, 
  teamMemberCount: initialTeamMemberCount 
}: SummaryCardsProps) => {
  const [totalExpenses, setTotalExpenses] = useState(initialTotalExpenses || 0);
  const [recurringExpenses, setRecurringExpenses] = useState(initialRecurringExpenses || 0);
  const [teamMemberCount, setTeamMemberCount] = useState(initialTeamMemberCount || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.log('User not authenticated, using local data');
          setIsAuthenticated(false);
          useFallbackData();
          return;
        }
        
        setIsAuthenticated(true);
        const userId = userData.user.id;
        
        // Get current year and month
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        // Fetch data from Supabase tables if authenticated
        if (!initialTotalExpenses) {
          await fetchTotalExpenses(userId, year, month);
        }
        
        if (!initialRecurringExpenses) {
          await fetchRecurringExpenses(userId);
        }
        
        if (!initialTeamMemberCount) {
          await fetchTeamMemberCount(userId);
        }
      } catch (error) {
        console.error('Error fetching summary data:', error);
        // Fall back to local data if Supabase queries fail
        useFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if initial values weren't provided
    if (!initialTotalExpenses || !initialRecurringExpenses || !initialTeamMemberCount) {
      fetchSummaryData();
    }
  }, [initialTotalExpenses, initialRecurringExpenses, initialTeamMemberCount]);

  const fetchTotalExpenses = async (userId: string, year: number, month: number) => {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = month === 12 
        ? `${year + 1}-01-01` 
        : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
      
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lt('date', endDate);
      
      if (error) throw error;
      
      if (expenses && expenses.length > 0) {
        const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        setTotalExpenses(total);
      } else {
        // If no expenses found for current month, set to 0
        setTotalExpenses(0);
      }
    } catch (error) {
      console.error('Error fetching total expenses:', error);
      throw error;
    }
  };

  const fetchRecurringExpenses = async (userId: string) => {
    try {
      const { data: recurring, error } = await supabase
        .from('recurring_expenses')
        .select('amount')
        .eq('user_id', userId)
        .eq('active', true);
      
      if (error) throw error;
      
      if (recurring && recurring.length > 0) {
        const total = recurring.reduce((sum, expense) => sum + Number(expense.amount), 0);
        setRecurringExpenses(total);
      } else {
        // If no recurring expenses found, set to 0
        setRecurringExpenses(0);
      }
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      throw error;
    }
  };

  const fetchTeamMemberCount = async (userId: string) => {
    try {
      const { data: members, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (members) {
        setTeamMemberCount(members.length);
      } else {
        setTeamMemberCount(0);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  };

  const useFallbackData = () => {
    // Get current year and month for filtering local data
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Filter expense data for current month
    const currentMonthExpenses = expensesData.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month;
    });
    
    // Calculate total expenses for current month from local data
    const totalExpensesAmount = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpenses(totalExpensesAmount);
    
    // Calculate recurring expenses from local data
    const activeRecurring = recurringExpensesData.filter(expense => expense.active);
    const recurringExpensesAmount = activeRecurring.reduce((sum, expense) => sum + expense.amount, 0);
    setRecurringExpenses(recurringExpensesAmount);
    
    // Set team member count from local data
    setTeamMemberCount(teamMembers.length);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Expenses
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? 
              <div className="h-7 w-24 bg-muted animate-pulse rounded"></div> : 
              `₹${totalExpenses.toLocaleString()}`
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Current month expenses
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Recurring Expenses
          </CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? 
              <div className="h-7 w-24 bg-muted animate-pulse rounded"></div> : 
              `₹${recurringExpenses.toLocaleString()}`
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Monthly subscription costs
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Team Members
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? 
              <div className="h-7 w-12 bg-muted animate-pulse rounded"></div> : 
              teamMemberCount
            }
          </div>
          <p className="text-xs text-muted-foreground">
            People sharing expenses
            {!isAuthenticated && <span className="block text-xs text-muted-foreground">(local data)</span>}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
