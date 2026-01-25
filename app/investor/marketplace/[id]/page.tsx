"use client";

import { useParams } from "next/navigation";
import { mockProposals } from "../../../../lib/mock-data";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { 
  BarChart,
  CalendarClock,
  CircleDollarSign,
  Factory,
  FileText,
  Percent,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  calculateFundingProgress, 
  formatCurrency, 
  formatShortDate, 
  getRiskScoreColor 
} from "../../../../lib/utils";
import { Progress } from "../../../../components/ui/progress";
import { Badge } from "../../../../components/ui/badge";
import InvestmentForm from "../../../../components/investor/InvestmentForm";
import { useState } from "react";

export default function MarketplaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [updatedSoldLots, setUpdatedSoldLots] = useState<number | null>(null);
  
  // Find the proposal by ID
  const proposal = mockProposals.find(p => p.id === id);
  
  // Handle 404
  if (!proposal) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Investment Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The investment opportunity you're looking for doesn't exist
        </p>
        <Button onClick={() => router.push("/investor/marketplace")}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const { 
    title, 
    summary, 
    lotSize, 
    lotPrice, 
    totalLots, 
    soldLots,
    maxPerInvestor,
    profitShare,
    investmentPeriod,
    expectedROI,
    riskScore,
    researchSummary,
    riskAssessment,
    createdAt,
  } = proposal;

  const effectiveSoldLots = updatedSoldLots !== null ? updatedSoldLots : soldLots;
  const fundingProgress = calculateFundingProgress(effectiveSoldLots, totalLots);
  const lotsRemaining = totalLots - effectiveSoldLots;
  
  const getRiskLabel = (score: number) => {
    if (score <= 3) return "Low Risk";
    if (score <= 7) return "Medium Risk";
    return "High Risk";
  };

  const handleInvestmentComplete = (purchasedLots: number) => {
    setUpdatedSoldLots(effectiveSoldLots + purchasedLots);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => router.push("/investor/marketplace")}
          className="mb-4"
        >
          Back to Marketplace
        </Button>
        
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-2">{summary}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={getRiskScore(riskScore) === "Low Risk" ? "success" : 
                          getRiskScore(riskScore) === "Medium Risk" ? "warning" : "danger"}>
                {getRiskLabel(riskScore)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Factory className="h-3 w-3" />
                Manufacturing
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {maxPerInvestor} max lots
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-right">
              <div className="text-muted-foreground text-sm">Listed on</div>
              <div className="font-medium">{formatShortDate(createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Investment Details</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                  <CardDescription>Key metrics and information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-muted-foreground text-sm">Lot Price</div>
                      <div className="font-semibold flex items-center gap-1 mt-1">
                        <CircleDollarSign className="h-4 w-4 text-primary" />
                        {formatCurrency(lotPrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">Profit Share</div>
                      <div className="font-semibold flex items-center gap-1 mt-1">
                        <Percent className="h-4 w-4 text-primary" />
                        {profitShare}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">Period</div>
                      <div className="font-semibold flex items-center gap-1 mt-1">
                        <CalendarClock className="h-4 w-4 text-primary" />
                        {investmentPeriod} months
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">Expected Return</div>
                      <div className="font-semibold flex items-center gap-1 mt-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        {expectedROI}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">Risk Score</div>
                      <div className={`font-semibold flex items-center gap-1 mt-1 ${getRiskScoreColor(riskScore)}`}>
                        <BarChart className="h-4 w-4" />
                        {riskScore}/10
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">Lot Size</div>
                      <div className="font-semibold flex items-center gap-1 mt-1">
                        <FileText className="h-4 w-4 text-primary" />
                        {formatCurrency(lotSize)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Funding progress</span>
                      <span className="text-sm font-medium">{fundingProgress}%</span>
                    </div>
                    <Progress value={fundingProgress} className="h-2" />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">
                        {lotsRemaining === 0 ? (
                          <span className="text-green-600 font-medium">Fully Funded</span>
                        ) : (
                          <span>{lotsRemaining} {lotsRemaining === 1 ? 'lot' : 'lots'} remaining</span>
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {effectiveSoldLots} of {totalLots} lots sold
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Investment Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {researchSummary}
                  </p>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h4 className="font-medium mb-2">Risk Assessment</h4>
                    <p className="text-sm">
                      {riskAssessment}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Investment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    This section would contain detailed information about the investment, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Manufacturer background and history</li>
                    <li>Product details and manufacturing process</li>
                    <li>Market analysis and competitive landscape</li>
                    <li>Detailed financial projections</li>
                    <li>Risk mitigation strategies</li>
                    <li>Exit strategy and return distribution</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="research">
              <Card>
                <CardHeader>
                  <CardTitle>Research & Due Diligence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    This investment opportunity has undergone rigorous due diligence by our team and has been approved by the DAO.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Diligence Report</h4>
                      <p className="text-sm">
                        The manufacturer has provided all required documentation and passed our verification process. Their financial statements have been audited and verified by third-party accounting firms.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">DAO Approval Process</h4>
                      <p className="text-sm">
                        This investment opportunity was voted on by DAO members and received majority approval. The DAO set the final terms including lot size, share price, and maximum allocation per investor.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Risk Factors</h4>
                      <p className="text-sm">
                        {riskAssessment}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <InvestmentForm 
            proposal={proposal} 
            onInvestmentComplete={handleInvestmentComplete}
          />
        </div>
      </div>
    </div>
  );
}

function getRiskScore(score: number) {
  if (score <= 3) return "Low Risk";
  if (score <= 7) return "Medium Risk";
  return "High Risk";
} 