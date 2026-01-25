'use client';

import React from 'react';
import Link from 'next/link';
import { Building, Users, ChartBar, ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2, FileText, PieChart, ArrowUpRight } from "lucide-react";
import { CommentsSection } from "@/components/CommentsSection";
import type { Comment, Document } from "@/components/CommentsSection";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-16 px-4">
      <div className="text-center max-w-3xl mb-16">
        <div className="flex justify-center mb-6">
          <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Tokenized Manufacturing Debt
          </Badge>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-5 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Securely Tradable Debts Protocol
        </h1>
        <p className="text-xl text-muted-foreground">
          Tokenize high-margin manufacturing debt, enabling crypto investors to fund 
          manufacturers and earn real-world yields.
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 w-full max-w-6xl mb-16">
        <Card className="border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Manufacturer Portal
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Business</Badge>
            </div>
            <CardDescription className="text-base mt-1">
              Apply for funding and manage your debt applications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Document Upload</p>
                  <p className="text-sm text-muted-foreground">Upload required business documents</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Track Status</p>
                  <p className="text-sm text-muted-foreground">Monitor application progress</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Reviewer Chat</p>
                  <p className="text-sm text-muted-foreground">Communicate with reviewers</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Application History</p>
                  <p className="text-sm text-muted-foreground">View past and current applications</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/manufacturer" className="w-full">
              <Button variant="default" className="w-full justify-between group">
                Access Portal
                <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                Diligence Dashboard
              </CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Reviewers</Badge>
            </div>
            <CardDescription className="text-base mt-1">
              Review and process manufacturer applications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Review Applications</p>
                  <p className="text-sm text-muted-foreground">Analyze manufacturer requests</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Verify Documents</p>
                  <p className="text-sm text-muted-foreground">Check submitted materials</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Request Information</p>
                  <p className="text-sm text-muted-foreground">Gather additional details</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Propose to DAO</p>
                  <p className="text-sm text-muted-foreground">Forward approved applications</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/diligence" className="w-full">
              <Button variant="default" className="w-full justify-between group">
                Enter Dashboard
                <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                DAO Governance
              </CardTitle>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Members</Badge>
            </div>
            <CardDescription className="text-base mt-1">
              Vote on investment proposals and governance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Proposal Voting</p>
                  <p className="text-sm text-muted-foreground">Vote on funding terms</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Member Discussion</p>
                  <p className="text-sm text-muted-foreground">Participate in governance</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Detailed Reviews</p>
                  <p className="text-sm text-muted-foreground">Access comprehensive reports</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Tracking Dashboard</p>
                  <p className="text-sm text-muted-foreground">Monitor proposal outcomes</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/dao" className="w-full">
              <Button variant="default" className="w-full justify-between group">
                Join DAO
                <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Investor Marketplace
              </CardTitle>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Investors</Badge>
            </div>
            <CardDescription className="text-base mt-1">
              Fund manufacturing projects and track returns
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Browse Projects</p>
                  <p className="text-sm text-muted-foreground">Explore investment options</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">View Documentation</p>
                  <p className="text-sm text-muted-foreground">Access detailed information</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Purchase Lots</p>
                  <p className="text-sm text-muted-foreground">Invest with set returns</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Portfolio Tracking</p>
                  <p className="text-sm text-muted-foreground">Monitor your investments</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/investor" className="w-full">
              <Button variant="default" className="w-full justify-between group">
                Explore Investments
                <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="w-full max-w-3xl mb-16">
        <h2 className="text-2xl font-bold mb-4 text-center">Featured Interface Preview</h2>
        <CommentsPreview />
      </div>

      <div className="mt-10 text-center max-w-3xl mx-auto bg-primary/5 p-8 rounded-xl border border-primary/10">
        <h2 className="text-2xl font-bold mb-3">Ready to explore the diligence interface?</h2>
        <p className="text-muted-foreground mb-6">Experience our comprehensive application review system and help businesses secure funding.</p>
        <Link href="/diligence">
          <Button size="lg" className="mt-2 px-8 py-6 text-base font-medium group">
            Go to Diligence Dashboard
            <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Add a component to showcase the Comments UI
function CommentsPreview() {
  // Mock data for demonstration
  const mockComments = [
    {
      id: '1',
      content: 'We\'ve reviewed your application and it looks promising. Could you please provide more details about your manufacturing capacity?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      user: {
        name: 'Sarah Johnson',
        role: 'Diligence',
        avatar: '/avatars/sarah.jpg'
      },
      attachments: []
    },
    {
      id: '2',
      content: 'Thank you for the feedback! I\'ve attached our production capacity report along with the equipment specifications. Let me know if you need anything else.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      user: {
        name: 'Michael Chen',
        role: 'Manufacturer',
        avatar: '/avatars/michael.jpg'
      },
      attachments: [
        {
          id: 'a1',
          name: 'production-capacity.pdf',
          url: '#',
          type: 'application/pdf'
        },
        {
          id: 'a2',
          name: 'equipment-specs.xlsx',
          url: '#',
          type: 'application/excel'
        }
      ]
    }
  ];

  // Mock function for adding comments
  const handleAddComment = async (content: string, attachments: Document[]) => {
    console.log('Comment added:', content, attachments);
    // In a real app, this would add the comment to the list
    return new Promise<void>(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="w-full shadow-lg rounded-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">Application Review Interface</h3>
        <p className="text-sm text-gray-600">Preview of our communication system</p>
      </div>
      
      <div className="p-4">
        <CommentsSection 
          comments={mockComments}
          onAddComment={handleAddComment}
          canReply={true}
        />
      </div>
    </div>
  );
}
