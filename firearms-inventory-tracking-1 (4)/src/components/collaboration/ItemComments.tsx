import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user_email?: string;
}

interface ItemCommentsProps {
  itemType: string;
  itemId: string;
}

export function ItemComments({ itemType, itemId }: ItemCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadComments();
    getCurrentUser();

    const channel = supabase
      .channel(`comments_${itemType}_${itemId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'item_comments',
        filter: `item_id=eq.${itemId}`
      }, () => loadComments())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [itemType, itemId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('item_comments')
        .select('*')
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('item_comments').insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
        comment: newComment.trim()
      });

      if (error) throw error;
      setNewComment('');
      toast.success('Comment added');
    } catch (error: any) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from('item_comments').delete().eq('id', commentId);
      if (error) throw error;
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="mb-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="mb-2"
          />
          <Button type="submit" disabled={loading} size="sm">
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </form>

        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 rounded-lg bg-muted">
                <p className="text-sm">{comment.comment}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                  {comment.user_id === currentUserId && (
                    <Button variant="ghost" size="sm" onClick={() => deleteComment(comment.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
