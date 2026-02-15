'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Activity, ArrowUp, ArrowDown } from 'lucide-react';

// Enhanced mock data with timestamps and variations
// Using deterministic values to avoid hydration mismatches
const generateAssetValueData = () => {
  const base = 125000000;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Use deterministic pseudo-random values based on index to avoid hydration mismatch
  const deterministicValues = [0.2, 0.8, 0.5, 0.9, 0.3, 0.7, 0.1, 0.6, 0.4, 0.85, 0.15, 0.75];
  return months.map((month, i) => ({
    month,
    value: base + (i * 7500000) + deterministicValues[i] * 2000000,
    timestamp: new Date(2024, i, 1).toISOString(),
  }));
};

const generatePerformanceData = () => {
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
  let base = 100;
  // Use deterministic values to avoid hydration mismatch
  const deterministicVolatility = [3.2, 4.1, 3.8, 4.5, 3.5, 4.2];
  const deterministicClose = [0.1, -0.2, 0.3, -0.1, 0.2, 0.15];
  const deterministicVolume = [750000, 850000, 600000, 900000, 650000, 800000];
  return weeks.map((date, i) => {
    const open = base;
    const volatility = deterministicVolatility[i];
    const high = open + volatility;
    const low = open - volatility;
    const close = open + deterministicClose[i] * 4;
    base = close;
    return { date, open, high, low, close, volume: deterministicVolume[i] };
  });
};


const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
};

// Custom Bloomberg-style tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-2xl backdrop-blur-sm">
        <p className="text-muted-foreground text-xs font-medium mb-2 uppercase tracking-wide">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground text-xs font-medium">{entry.name}:</span>
            </div>
            <span className="text-foreground text-sm font-mono font-semibold">
              {typeof entry.value === 'number' 
                ? (entry.name === 'value' ? formatCurrency(entry.value) : entry.value.toFixed(2))
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Live indicator component
const LiveIndicator = () => {
  const [isPulsing, setIsPulsing] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="w-2 h-2 rounded-full bg-green-500"
        animate={{ opacity: isPulsing ? [1, 0.3, 1] : 1 }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="text-xs font-medium text-green-500 uppercase tracking-wider">Live</span>
    </div>
  );
};

export function FinanceCharts() {
  // Initialize with empty arrays to avoid hydration mismatch, then populate on client
  const [assetData, setAssetData] = useState<Array<{month: string, value: number, timestamp: string}>>([]);
  const [performanceData, setPerformanceData] = useState<Array<{date: string, open: number, high: number, low: number, close: number, volume: number}>>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize data only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setAssetData(generateAssetValueData());
    setPerformanceData(generatePerformanceData());
    setLastUpdate(new Date());
  }, []);

  // Simulate real-time updates (only after initial mount)
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      setAssetData(prev => {
        if (prev.length === 0) return prev;
        const newData = [...prev];
        const lastValue = newData[newData.length - 1].value;
        newData.push({
          month: new Date().toLocaleDateString('en-US', { month: 'short' }),
          value: lastValue + (Math.random() - 0.3) * 500000,
          timestamp: new Date().toISOString(),
        });
        return newData.slice(-12); // Keep last 12 data points
      });
      setPerformanceData(generatePerformanceData());
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isMounted]);

  // Don't calculate metrics until data is loaded to avoid hydration mismatch
  if (!isMounted || assetData.length === 0) {
    return (
      <section id="charts" className="w-full py-24 px-6 md:px-8 bg-gradient-to-b from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-bold">Real-Time Asset Performance</h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Loading charts...
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentValue = assetData[assetData.length - 1]?.value || 0;
  const previousValue = assetData[assetData.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue ? ((change / previousValue) * 100) : 0;

  return (
    <section id="charts" className="w-full py-24 px-6 md:px-8 bg-gradient-to-b from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold">Real-Time Asset Performance</h2>
            <LiveIndicator />
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time performance metrics and asset allocation insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Asset Value Growth - Bloomberg Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group"
          >
            <Card className="border-primary/20 bg-card/50 hover:border-primary/40 transition-all duration-300 overflow-hidden backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-card/50 to-primary/5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">Asset Value Growth</CardTitle>
                      <CardDescription>Total Value Locked (TVL)</CardDescription>
                    </div>
                  </div>
                  <LiveIndicator />
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <motion.span 
                    className="text-3xl font-mono font-bold text-foreground"
                    key={currentValue}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {formatCurrency(currentValue)}
                  </motion.span>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={change}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      {Math.abs(changePercent).toFixed(2)}%
                    </motion.div>
                  </AnimatePresence>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-background/50">
                <div className="h-[350px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={assetData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))" 
                        vertical={false}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '11px', fontFamily: 'monospace' }}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '11px', fontFamily: 'monospace' }}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={formatCurrency}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        width={70}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        fill="url(#colorValue)"
                        dot={false}
                        activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                        animationDuration={300}
                        isAnimationActive={true}
                      />
                      <ReferenceLine 
                        y={currentValue} 
                        stroke="hsl(var(--primary))" 
                        strokeDasharray="2 2" 
                        opacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-4 pb-4 text-xs text-muted-foreground font-mono">
                  Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tokenized Asset Performance - Enhanced OHLC Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group"
          >
            <Card className="border-primary/30 bg-card/80 hover:border-primary/50 transition-all duration-300 overflow-hidden backdrop-blur-sm shadow-xl relative">
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <CardHeader className="bg-gradient-to-r from-card/80 via-primary/10 to-card/80 border-b border-primary/20 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20 shadow-lg shadow-primary/30">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground font-bold">Tokenized Asset Performance</CardTitle>
                      <CardDescription className="text-muted-foreground/80">OHLC Weekly Chart</CardDescription>
                    </div>
                  </div>
                  <LiveIndicator />
                </div>
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div className="px-3 py-1.5 rounded-md bg-background/50 border border-border/50">
                    <span className="text-muted-foreground text-xs">Last:</span>
                    <span className="ml-2 font-mono font-bold text-foreground text-base">
                      ${performanceData[performanceData.length - 1]?.close.toFixed(2)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20">
                    <span className="text-muted-foreground text-xs">High:</span>
                    <span className="ml-2 font-mono font-bold text-green-500 text-base">
                      ${Math.max(...performanceData.map(d => d.high)).toFixed(2)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20">
                    <span className="text-muted-foreground text-xs">Low:</span>
                    <span className="ml-2 font-mono font-bold text-red-500 text-base">
                      ${Math.min(...performanceData.map(d => d.low)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-gradient-to-b from-background/80 to-background/50 relative">
                <div className="h-[350px] p-4 relative">
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-50 pointer-events-none" />
                  
                  <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                    <ComposedChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))" 
                        vertical={false}
                        opacity={0.2}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '600' }}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1.5 }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '600' }}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        domain={['dataMin - 2', 'dataMax + 2']}
                        axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1.5 }}
                        width={60}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.5 }}
                      />
                      {/* Enhanced High bars with gradient */}
                      <Bar
                        dataKey="high"
                        fill="url(#highGradient)"
                        radius={[4, 4, 0, 0]}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))' }}
                      />
                      {/* Enhanced Low bars with gradient */}
                      <Bar
                        dataKey="low"
                        fill="url(#lowGradient)"
                        radius={[0, 0, 4, 4]}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))' }}
                      />
                      {/* Enhanced Close line with glow */}
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ 
                          r: 6, 
                          fill: 'hsl(var(--primary))', 
                          stroke: 'hsl(var(--background))', 
                          strokeWidth: 3,
                          style: { filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }
                        }}
                        animationDuration={300}
                        style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))' }}
                      />
                      {/* Enhanced Open line with better styling */}
                      <Line
                        type="monotone"
                        dataKey="open"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        strokeDasharray="5 3"
                        dot={false}
                        activeDot={{ 
                          r: 5, 
                          fill: '#f59e0b', 
                          stroke: 'hsl(var(--background))', 
                          strokeWidth: 2,
                          style: { filter: 'drop-shadow(0 0 6px #f59e0b)' }
                        }}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-4 pb-4 flex items-center justify-between text-xs bg-background/30 border-t border-border/50 relative z-10">
                  <div className="flex items-center gap-4 text-muted-foreground font-mono">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-primary/10 border border-primary/20">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                      <span className="font-semibold">Close</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                      <span className="font-semibold">Open</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground font-mono font-semibold">
                    Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
