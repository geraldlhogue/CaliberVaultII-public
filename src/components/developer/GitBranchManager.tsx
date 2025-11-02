import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GitBranch, GitMerge, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Branch {
  name: string;
  current: boolean;
  lastCommit: string;
  behind: number;
  ahead: number;
}

export function GitBranchManager() {
  const [branches, setBranches] = useState<Branch[]>([
    { name: 'main', current: true, lastCommit: '2 hours ago', behind: 0, ahead: 0 },
    { name: 'feature/test-dashboard', current: false, lastCommit: '1 day ago', behind: 2, ahead: 3 }
  ]);
  const [newBranchName, setNewBranchName] = useState('');
  const { toast } = useToast();

  const createBranch = () => {
    if (!newBranchName) return;
    
    toast({
      title: 'Branch Created',
      description: `Created branch: ${newBranchName}`
    });
    
    setBranches([...branches, {
      name: newBranchName,
      current: false,
      lastCommit: 'just now',
      behind: 0,
      ahead: 0
    }]);
    setNewBranchName('');
  };

  const switchBranch = (branchName: string) => {
    setBranches(branches.map(b => ({
      ...b,
      current: b.name === branchName
    })));
    
    toast({
      title: 'Switched Branch',
      description: `Now on branch: ${branchName}`
    });
  };

  const mergeBranch = (branchName: string) => {
    toast({
      title: 'Branch Merged',
      description: `Merged ${branchName} into current branch`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Git Branch Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New branch name..."
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
            />
            <Button onClick={createBranch}>
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>

          <div className="space-y-2">
            {branches.map(branch => (
              <div key={branch.name} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{branch.name}</span>
                      {branch.current && <Badge>Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{branch.lastCommit}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!branch.current && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => switchBranch(branch.name)}>
                        Switch
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => mergeBranch(branch.name)}>
                        <GitMerge className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
