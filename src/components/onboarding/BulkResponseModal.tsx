import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BulkResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (responseText: string, template: string | null, markResolved: boolean) => void;
}

const RESPONSE_TEMPLATES = [
  { id: 'acknowledgment', name: 'Acknowledgment', text: 'Thank you for your feedback! We appreciate you taking the time to share your experience with us.' },
  { id: 'investigating', name: 'Investigating', text: 'We have received your feedback and are currently investigating the issue. We will update you soon.' },
  { id: 'resolved', name: 'Issue Resolved', text: 'Thank you for reporting this. We have addressed the issue and it should now be resolved.' },
  { id: 'improvement', name: 'Improvement Planned', text: 'Great suggestion! We are planning to implement this improvement in an upcoming update.' },
  { id: 'clarification', name: 'Need Clarification', text: 'Thank you for your feedback. Could you provide more details to help us better understand the issue?' }
];

export function BulkResponseModal({ isOpen, onClose, selectedCount, onConfirm }: BulkResponseModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [responseText, setResponseText] = useState('');
  const [markResolved, setMarkResolved] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = RESPONSE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setResponseText(template.text);
    }
  };

  const handleConfirm = () => {
    if (!responseText.trim()) return;
    onConfirm(responseText, selectedTemplate || null, markResolved);
    setResponseText('');
    setSelectedTemplate('');
    setMarkResolved(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Respond to Multiple Feedback Items</DialogTitle>
          <DialogDescription>
            Send the same response to {selectedCount} selected feedback items
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This response will be sent to <strong>{selectedCount}</strong> team members
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label>Response Template (Optional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template or write custom response" />
              </SelectTrigger>
              <SelectContent>
                {RESPONSE_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Response Message</Label>
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type your response here..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="mark-resolved"
              checked={markResolved}
              onCheckedChange={(checked) => setMarkResolved(checked as boolean)}
            />
            <Label htmlFor="mark-resolved" className="cursor-pointer">
              Mark all selected items as resolved
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!responseText.trim()}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Send to {selectedCount} Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
