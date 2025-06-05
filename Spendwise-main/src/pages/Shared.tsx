
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, Share2, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { teamMembers, teams, sharedExpenses } from "@/data/sharedData";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Shared = () => {
  const [activeTab, setActiveTab] = useState("teams");
  const [selectedTeam, setSelectedTeam] = useState<(typeof teams)[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    type: "Team",
    members: 1
  });
  const { toast } = useToast();

  // Handle opening the details dialog for a team
  const handleViewDetails = (team: (typeof teams)[0]) => {
    setSelectedTeam(team);
    setIsDetailsOpen(true);
  };

  // Handle sharing a team
  const handleShareTeam = (team: (typeof teams)[0], e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening details dialog
    setIsSharing(true);
    
    // Simulate sharing process
    setTimeout(() => {
      setIsSharing(false);
      toast({
        title: "Invite link copied",
        description: `Invite link for "${team.name}" copied to clipboard.`,
      });
    }, 1000);
  };

  // Handle creating a new group
  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group.",
        variant: "destructive"
      });
      return;
    }

    // Simulate creating a new group
    const newTeam = {
      id: teams.length + 1,
      name: newGroup.name,
      members: newGroup.members,
      createdDate: new Date().toISOString(),
      type: newGroup.type
    };

    // In a real app, we would save this to Supabase
    // For demo purposes, just show a toast
    toast({
      title: "Group created",
      description: `"${newGroup.name}" has been created successfully.`,
    });

    // Reset form and close dialog
    setNewGroup({
      name: "",
      type: "Team",
      members: 1
    });
    setIsNewGroupOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shared Expenses</h1>
          <p className="text-muted-foreground">
            Collaborate on expenses with teams, family, and business partners
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsNewGroupOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Group
        </Button>
      </div>

      <Tabs defaultValue="teams" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teams">Groups & Teams</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="expenses">Shared Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teams" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <Card key={team.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{team.name}</CardTitle>
                    <Badge variant="outline">{team.type}</Badge>
                  </div>
                  <CardDescription>
                    Created on {new Date(team.createdDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{team.members} members</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 flex justify-between pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => handleShareTeam(team, e)}
                    disabled={isSharing}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewDetails(team)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            <Card 
              className="flex flex-col items-center justify-center p-6 h-[167px] border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsNewGroupOpen(true)}
            >
              <Button variant="outline" className="h-auto p-4 rounded-full mb-2">
                <PlusCircle className="h-6 w-6" />
              </Button>
              <p className="text-sm font-medium">Create New Group</p>
              <p className="text-xs text-muted-foreground">Add a team, family or other group</p>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="people" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Collaborators</CardTitle>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite People
                </Button>
              </div>
              <CardDescription>
                People who share expenses with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined on {new Date(member.joinedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="mr-2">
                        {member.type}
                      </Badge>
                      <Badge variant={member.role === 'Admin' ? 'default' : 'outline'}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Shared Expenses</CardTitle>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
              <CardDescription>
                Expenses shared among teams and collaborators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Description</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Group</th>
                      <th className="px-4 py-3">Paid By</th>
                      <th className="px-4 py-3 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b hover:bg-muted/20">
                        <td className="px-4 py-3">{expense.description}</td>
                        <td className="px-4 py-3 font-medium">₹{expense.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">{new Date(expense.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{expense.team}</td>
                        <td className="px-4 py-3">{expense.paidBy}</td>
                        <td className="px-4 py-3">
                          <Badge variant={expense.status === 'Settled' ? 'outline' : 'default'}>
                            {expense.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTeam?.name}
              <Badge variant="outline" className="ml-2">{selectedTeam?.type}</Badge>
            </DialogTitle>
            <DialogDescription>
              Created on {selectedTeam ? new Date(selectedTeam.createdDate).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Team Members ({selectedTeam?.members})</h3>
              <div className="flex flex-wrap gap-2">
                {teamMembers.slice(0, selectedTeam?.members || 0).map((member) => (
                  <div key={member.id} className="flex items-center gap-2 p-2 bg-background rounded border">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Recent Expenses</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedExpenses
                    .filter(expense => expense.team === selectedTeam?.name)
                    .slice(0, 3)
                    .map(expense => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell>{expense.paidBy}</TableCell>
                        <TableCell className="text-right">₹{expense.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 sm:justify-between sm:gap-0">
            <Button variant="outline" onClick={() => handleShareTeam(selectedTeam!, new Event('click') as any)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Group
            </Button>
            <Button onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Group Dialog */}
      <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Add a new group to share expenses with team members, family, or friends.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Group Name
              </label>
              <Input 
                id="name" 
                placeholder="Enter group name" 
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Group Type
              </label>
              <select 
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newGroup.type}
                onChange={(e) => setNewGroup({...newGroup, type: e.target.value})}
              >
                <option>Team</option>
                <option>Family</option>
                <option>Shared Living</option>
                <option>Business</option>
                <option>Friends</option>
                <option>Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="members" className="text-sm font-medium">
                Initial Members
              </label>
              <Input 
                id="members" 
                type="number" 
                min="1"
                value={newGroup.members}
                onChange={(e) => setNewGroup({...newGroup, members: parseInt(e.target.value) || 1})}
              />
              <p className="text-xs text-muted-foreground">
                You will be added automatically as an admin.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="invite-automatically" />
              <label htmlFor="invite-automatically" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Send invitations after creating
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewGroupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shared;
