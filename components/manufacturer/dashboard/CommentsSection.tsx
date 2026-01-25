import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Comment, Document } from '@/types';
import { FileText, Image as ImageIcon, Paperclip, Send, Upload, X, Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { uploadDocument } from '@/lib/mock-service';

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (content: string, attachments: Document[]) => Promise<void>;
  canReply: boolean;
}

export default function CommentsSection({ 
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

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      const doc = await uploadDocument(file, file.type);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {comments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">No comments yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <li key={comment.id} className="p-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user.name}
                      </p>
                      <p className="ml-1 text-xs text-gray-500">
                        ({comment.user.role})
                      </p>
                      <p className="ml-2 text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                      {comment.content}
                    </div>
                    
                    {comment.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {comment.attachments.map((attachment) => (
                          <Link
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {getAttachmentIcon(attachment)}
                            <span className="ml-1 max-w-[150px] truncate">
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
        
        {canReply && (
          <div className="p-4 bg-gray-50">
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <label htmlFor="comment" className="sr-only">
                Add your comment
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Add a comment or reply to the diligence team..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isSubmitting}
              />
              
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white"
                    >
                      {getAttachmentIcon(attachment)}
                      <span className="ml-1 max-w-[150px] truncate">
                        {attachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        className="ml-1 text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex">
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
                    <label
                      htmlFor="file-upload"
                      className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-1" />
                      )}
                      Attach File
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || commentText.trim() === ''}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting || commentText.trim() === ''
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 