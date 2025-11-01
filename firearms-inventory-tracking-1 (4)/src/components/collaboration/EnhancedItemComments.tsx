import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Trash2, Reply, AtSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
  parent_id?: string;
  user_email?: string;
}

interface EnhancedItemCommentsProps {
  itemType: string;
  itemId: string;
}

export function EnhancedItemComments({ itemType, itemId }: EnhancedItemCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
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
        comment: newComment.trim(),
        parent_id: replyTo
      });

      if (error) throw error;
      setNewComment('');
      setReplyTo(null);
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

  const insertMention = () => {
    setNewComment(prev => prev + '@');
  };

  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments & Discussions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="mb-4">
          {replyTo && (
            <div className="mb-2 p-2 bg-slate-800 rounded text-sm text-slate-400">
              Replying to comment...
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
                className="ml-2"
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="relative">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... Use @ to mention someone"
              className="mb-2 bg-slate-800 border-slate-700 text-white"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertMention}
              className="absolute right-2 top-2"
            >
              <AtSign className="h-4 w-4" />
            </Button>
          </div>
          <Button type="submit" disabled={loading} size="sm">
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </form>

        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-800">
                  <p className="text-white">{comment.comment}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(comment.id)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                      {comment.user_id === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {getReplies(comment.id).map((reply) => (
                  <div key={reply.id} className="ml-8 p-3 rounded-lg bg-slate-800/50 border-l-2 border-orange-600">
                    <p className="text-white text-sm">{reply.comment}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </p>
                      {reply.user_id === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteComment(reply.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
