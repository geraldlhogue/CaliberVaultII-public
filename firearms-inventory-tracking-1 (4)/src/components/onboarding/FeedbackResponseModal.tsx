import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FeedbackResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: {
    id: string;
    step_name: string;
    rating: number;
    comments: string;
    team_member_id: string;
    created_at: string;
    team_member?: {
      email: string;
      full_name: string;
    };
  };
  onResponseSent: () => void;
}

const RESPONSE_TEMPLATES = {
  'thank-you': 'Thank you for your feedback! We appreciate you taking the time to share your experience.',
  'investigating': 'Thank you for bringing this to our attention. We are currently investigating this issue and will work on improvements.',
  'resolved': 'We have addressed the issue you reported. Thank you for helping us improve the onboarding experience!',
  'clarification': 'Thank you for your feedback. Could you provide more details about your experience so we can better address your concerns?',
  'feature-request': 'Thank you for your suggestion! We have added it to our feature roadmap for consideration.',
};

export function FeedbackResponseModal({ isOpen, onClose, feedback, onResponseSent }: FeedbackResponseModalProps) {
  const [responseText, setResponseText] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setResponseText(RESPONSE_TEMPLATES[template as keyof typeof RESPONSE_TEMPLATES]);
  };

  const handleSubmit = async () => {
    if (!responseText.trim()) {
      toast({
        title: 'Response Required',
        description: 'Please enter a response before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert response
      const { error: responseError } = await supabase
        .from('feedback_responses')
        .insert({
          feedback_id: feedback.id,
          admin_id: user.id,
          response_text: responseText,
          template_used: selectedTemplate || null,
          is_resolved: isResolved,
        });

      if (responseError) throw responseError;

      // Send email notification
      await supabase.functions.invoke('send-email-notification', {
        body: {
          to: feedback.team_member?.email,
          subject: 'Response to Your Onboarding Feedback',
          html: `
            <h2>Response to Your Feedback</h2>
            <p>Hi ${feedback.team_member?.full_name || 'there'},</p>
            <p>An administrator has responded to your feedback about the "${feedback.step_name}" onboarding step:</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 15px; margin: 20px 0;">
              ${responseText}
            </blockquote>
            ${isResolved ? '<p><strong>This issue has been marked as resolved.</strong></p>' : ''}
            <p>Thank you for helping us improve!</p>
          `,
        },
      });

      toast({
        title: 'Response Sent',
        description: 'Your response has been sent and the user has been notified.',
      });

      onResponseSent();
      onClose();
      setResponseText('');
      setIsResolved(false);
      setSelectedTemplate('');
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: 'Error',
        description: 'Failed to send response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Respond to Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original Feedback */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{feedback.step_name}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= feedback.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{feedback.comments}</p>
            <p className="text-xs text-muted-foreground mt-2">
              From: {feedback.team_member?.full_name || 'Unknown'} ({feedback.team_member?.email})
            </p>
          </div>

          {/* Template Selection */}
          <div>
            <Label>Response Template (Optional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thank-you">Thank You</SelectItem>
                <SelectItem value="investigating">Investigating Issue</SelectItem>
                <SelectItem value="resolved">Issue Resolved</SelectItem>
                <SelectItem value="clarification">Request Clarification</SelectItem>
                <SelectItem value="feature-request">Feature Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Response Text */}
          <div>
            <Label>Your Response</Label>
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type your response here..."
              rows={6}
              className="mt-1"
            />
          </div>

          {/* Mark as Resolved */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="resolved"
              checked={isResolved}
              onCheckedChange={(checked) => setIsResolved(checked as boolean)}
            />
            <Label htmlFor="resolved" className="cursor-pointer">
              Mark this issue as resolved
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
