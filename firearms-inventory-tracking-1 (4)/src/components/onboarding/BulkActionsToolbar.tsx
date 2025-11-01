import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, Archive, X } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onRespondToSelected: () => void;
  onMarkAsResolved: () => void;
  onArchive: () => void;
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  onRespondToSelected,
  onMarkAsResolved,
  onArchive,
  onClearSelection
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-center gap-4">
        <Badge variant="secondary" className="text-sm">
          {selectedCount} selected
        </Badge>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onRespondToSelected}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Respond to Selected
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={onMarkAsResolved}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Resolved
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={onArchive}
          >
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="ml-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
