import { useState, useEffect } from 'react';
import { TeamService, SharedItem, Team } from '@/services/team/TeamService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Lock, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function SharedInventory() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadSharedItems(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      const data = await TeamService.getTeams();
      setTeams(data);
      if (data.length > 0) {
        setSelectedTeam(data[0]);
      }
    } catch (error: any) {
      toast.error('Failed to load teams: ' + error.message);
    }
  };

  const loadSharedItems = async (teamId: string) => {
    try {
      const data = await TeamService.getSharedItems(teamId);
      setSharedItems(data);
    } catch (error: any) {
      toast.error('Failed to load shared items: ' + error.message);
    }
  };

  const handleUnshare = async (id: string) => {
    if (!confirm('Remove this item from team?')) return;
    
    try {
      await TeamService.unshareItem(id);
      loadSharedItems(selectedTeam!.id);
      toast.success('Item unshared');
    } catch (error: any) {
      toast.error('Failed to unshare item: ' + error.message);
    }
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'full': return <Lock className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Shared Inventory</h2>
          <p className="text-slate-400">Items shared with your teams</p>
        </div>
        <Select
          value={selectedTeam?.id}
          onValueChange={(id) => setSelectedTeam(teams.find(t => t.id === id) || null)}
        >
          <SelectTrigger className="w-64 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sharedItems.map((item) => (
          <Card key={item.id} className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="capitalize">{item.item_type}</span>
                <div className="flex items-center gap-2">
                  {getAccessIcon(item.access_level)}
                  <span className="text-sm text-slate-400">{item.access_level}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  Shared {new Date(item.shared_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnshare(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sharedItems.length === 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="py-12 text-center">
            <Share2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No items shared with this team yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
