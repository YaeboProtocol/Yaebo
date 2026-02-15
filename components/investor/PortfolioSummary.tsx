"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { 
  CircleDollarSign, 
  TrendingUp, 
  BarChart, 
  Clock 
} from "lucide-react";
import { formatCurrency, formatPercentage } from "../../lib/utils";

interface PortfolioSummaryProps {
  totalInvested: number;
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  totalClaimable: number;
  activeInvestments: number;
}

export default function PortfolioSummary({
  totalInvested,
  totalValue,
  totalReturn,
  returnPercentage,
  totalClaimable,
  activeInvestments,
}: PortfolioSummaryProps) {
  
  // Calculate the return color based on percentage
  const getReturnColor = (percentage: number) => {
    if (percentage >= 0) return "text-green-500";
    return "text-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Invested
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CircleDollarSign className="h-5 w-5 text-primary mr-2" />
            <div className="text-2xl font-bold">
              {formatCurrency(totalInvested)}
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Across {activeInvestments} active investments
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Portfolio Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <BarChart className="h-5 w-5 text-primary mr-2" />
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Including unrealized returns
          </div>
        </CardContent>
      </Card>
      
      <AnimatedReturnCard 
        totalReturn={totalReturn}
        returnPercentage={returnPercentage}
        getReturnColor={getReturnColor}
      />
      
      <Card className={totalClaimable > 0 ? "border-green-200 bg-green-50" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Claimable Returns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-primary mr-2" />
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalClaimable)}
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {totalClaimable > 0 
              ? "Available to claim now"
              : "No returns available to claim"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Animated value component for smooth transitions
function AnimatedValue({ 
  value, 
  formatFn, 
  className, 
  prefix = "" 
}: { 
  value: number; 
  formatFn: (val: number) => string; 
  className?: string;
  prefix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number | null>(null);
  const previousValueRef = useRef(value);
  
  useEffect(() => {
    // Only animate if value actually changed significantly
    if (Math.abs(previousValueRef.current - value) < 0.01) {
      return;
    }
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const startValue = displayValue;
    const endValue = value;
    const duration = 500; // 500ms animation
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, displayValue]);
  
  return (
    <span className={className} style={{ transition: 'color 0.3s ease' }}>
      {prefix}{formatFn(displayValue)}
    </span>
  );
}

// Animated Return Card Component
function AnimatedReturnCard({
  totalReturn,
  returnPercentage,
  getReturnColor,
}: {
  totalReturn: number;
  returnPercentage: number;
  getReturnColor: (percentage: number) => string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Returns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-primary mr-2" />
          <div className="text-2xl font-bold flex items-center">
            <AnimatedValue 
              value={totalReturn} 
              formatFn={formatCurrency}
              className={getReturnColor(returnPercentage)}
            />
            <AnimatedValue 
              value={returnPercentage} 
              formatFn={formatPercentage}
              className={`ml-2 text-sm ${getReturnColor(returnPercentage)}`}
              prefix="+"
            />
          </div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          ROI: <AnimatedValue 
            value={returnPercentage} 
            formatFn={formatPercentage}
            className={getReturnColor(returnPercentage)}
            prefix="+"
          />
        </div>
      </CardContent>
    </Card>
  );
} 