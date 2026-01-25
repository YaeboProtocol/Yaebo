"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { AlertCircle, Paperclip, Send, File } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface Comment {
  id: string;
  proposalId: string;
  userId: string;
  userName: string;
  content: string;
  attachments: string[];
  createdAt: Date;
}

interface CommentSectionProps {
  proposalId: string;
  comments: Comment[];
  isConnected: boolean;
  onAddComment: (content: string, attachments: string[]) => Promise<void>;
  connectWallet: () => Promise<void>;
}

export default function CommentSection({
  proposalId,
  comments,
  isConnected,
  onAddComment,
  connectWallet,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      await onAddComment(newComment.trim(), attachments);
      setNewComment("");
      setAttachments([]);
    } catch (err) {
      setError("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mock file upload handler
  const handleFileUpload = () => {
    // In a real implementation, this would handle file uploads
    // For now, just mock adding a dummy file
    const mockFile = `attachment-${Date.now()}.pdf`;
    setAttachments([...attachments, mockFile]);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-6 mb-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {comment.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-medium">{comment.userName}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{comment.content}</p>
                  {comment.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {comment.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center px-2 py-1 bg-muted rounded text-xs"
                        >
                          <File className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[150px]">
                            {attachment.split("/").pop()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to join the discussion
            </p>
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comment..."
              className="mb-2 min-h-[100px]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleFileUpload}
                  className="flex items-center gap-1"
                >
                  <Paperclip className="h-4 w-4" />
                  Attach File
                </Button>
                {attachments.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {attachments.length} file(s) attached
                  </span>
                )}
              </div>
              <Button type="submit" disabled={submitting} className="flex items-center gap-1">
                {submitting ? "Posting..." : "Post Comment"}
                <Send className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 