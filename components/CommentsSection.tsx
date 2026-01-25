import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FileText, Image as ImageIcon, Paperclip, Send, Upload, X, Loader2, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  attachments: Document[];
}

export interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (content: string, attachments: Document[]) => Promise<void>;
  canReply?: boolean;
}

export function CommentsSection({ 
  comments, 
  onAddComment,
  canReply = true,
}: CommentsSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [attachments, setAttachments] = useState<Document[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (commentText.trim() === '') return;
    
    try {
      setIsSubmitting(true);
      await onAddComment(commentText, attachments);
      setCommentText('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock file upload handler
  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const doc: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        url: '#', // Mock URL
        type: file.type
      };
      
      setAttachments((prev) => [...prev, doc]);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (docId: string) => {
    setAttachments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  };

  const getAttachmentIcon = (doc: Document) => {
    if (doc.type.includes('pdf')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    } else if (doc.type.includes('image')) {
      return <ImageIcon className="h-4 w-4 text-green-500" />;
    } else {
      return <Paperclip className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Manufacturer':
        return 'bg-blue-100 text-blue-800';
      case 'Diligence':
        return 'bg-purple-100 text-purple-800';
      case 'DAO':
        return 'bg-amber-100 text-amber-800';
      case 'Investor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Comments & Updates</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-normal">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </Badge>
        </div>
        <CardDescription>
          Communication with the diligence team and updates on your application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto px-6">
          {comments.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No comments yet.</p>
              {canReply && (
                <p className="text-xs text-gray-400 mt-1">
                  Start the conversation using the form below.
                </p>
              )}
            </div>
          ) : (
            <ul className="space-y-6 py-4">
              {comments.map((comment) => (
                <li key={comment.id} className="relative">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="font-medium text-sm">{comment.user.name}</h4>
                        <Badge variant="secondary" className={cn("text-xs px-2 py-0.5 h-5", getRoleColor(comment.user.role))}>
                          {comment.user.role}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg rounded-tl-none">
                        {comment.content}
                      </div>
                      
                      {comment.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 py-1">
                          {comment.attachments.map((attachment) => (
                            <Link
                              key={attachment.id}
                              href={attachment.url}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
                            >
                              {getAttachmentIcon(attachment)}
                              <span className="max-w-[150px] truncate">
                                {attachment.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      
      {canReply && (
        <CardFooter className="flex flex-col p-4 pt-6 border-t">
          <form onSubmit={handleCommentSubmit} className="w-full space-y-4">
            <Textarea
              placeholder="Add a comment or reply to the diligence team..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmitting}
              className="min-h-24 resize-none"
            />
            
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <Badge
                    key={attachment.id}
                    variant="secondary"
                    className="gap-1.5 py-1 pl-3 h-7"
                  >
                    {getAttachmentIcon(attachment)}
                    <span className="max-w-[150px] truncate">
                      {attachment.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full ml-1 hover:bg-gray-200"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="relative">
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  disabled={isUploading || isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={isUploading || isSubmitting}
                  asChild
                >
                  <label htmlFor="file-upload">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-1" />
                    )}
                    Attach File
                  </label>
                </Button>
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting || commentText.trim() === ''}
                size="sm"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send
              </Button>
            </div>
          </form>
        </CardFooter>
      )}
    </Card>
  );
} 