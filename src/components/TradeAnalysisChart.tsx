import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, Cell, Text } from "recharts";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TradeStats {
  year_val: number;
  month_val: number;
  value: number;
  trade_flow: string;
  hs_code_id: string;
}

interface ChartData {
  month: string;
  total_value: number;
  isLatest?: boolean;
}

interface TradeAnalysisChartProps {
  hsCode: string;
}

export function TradeAnalysisChart({ hsCode }: TradeAnalysisChartProps) {
  const [loading, setLoading] = useState(true);
  const [tradeStats, setTradeStats] = useState<TradeStats[]>([]);

  // Helper functions defined before they're used
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  };

  const getBarColor = (entry: ChartData) => {
    return entry.isLatest ? '#22c55e' : '#86efac';
  };

  useEffect(() => {
    fetchTradeStats();
  }, [hsCode]);

  const fetchTradeStats = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('trade_stats')
        .select('*')
        .eq('hs_code_id', hsCode)
        .order('year_val', { ascending: true })
        .order('month_val', { ascending: true });

      if (error) throw error;
      setTradeStats(data || []);
    } catch (error: any) {
      console.error('Error fetching trade stats:', error);
      toast.error('Failed to fetch trade statistics');
    } finally {
      setLoading(false);
    }
  };

  const chartData: ChartData[] = useMemo(() => {
    if (!tradeStats.length) return [];

    const monthlyData = new Map<string, ChartData>();

    tradeStats.forEach(stat => {
      if (!stat.year_val || !stat.month_val) return;

      const date = new Date(stat.year_val, stat.month_val - 1);
      const monthKey = date.toISOString().slice(0, 10);
      
      const existing = monthlyData.get(monthKey) || {
        month: monthKey,
        total_value: 0,
        isLatest: false
      };

      const value = Number(stat.value) || 0;
      existing.total_value += value;

      monthlyData.set(monthKey, existing);
    });

    const sortedData = Array.from(monthlyData.values())
      .sort((a, b) => a.month.localeCompare(b.month));

    // Mark the last data point as latest
    if (sortedData.length > 0) {
      sortedData[sortedData.length - 1].isLatest = true;
    }

    return sortedData;
  }, [tradeStats]);

  const latestMonth = useMemo(() => {
    if (chartData.length === 0) return null;
    const lastDataPoint = chartData[chartData.length - 1];
    return formatDate(lastDataPoint.month);
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Analysis for HS Code {hsCode}</CardTitle>
        <CardDescription>
          Showing imports for consumption data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tradeStats.length > 0 ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={true}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatDate}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={true}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => formatValue(value)}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(134, 239, 172, 0.1)' }}
                  formatter={(value: number) => [formatValue(value), 'Total Value']}
                  labelFormatter={formatDate}
                  contentStyle={{
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}
                />
                <Bar
                  dataKey="total_value"
                  fill="#86efac"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationBegin={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry)}
                    />
                  ))}
                </Bar>
                {latestMonth && (
                  <Text
                    x={chartData.length > 1 ? '85%' : '50%'}
                    y={15}
                    textAnchor="middle"
                    className="fill-current text-sm font-medium"
                  >
                    Latest data: {latestMonth}
                  </Text>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <p className="text-muted-foreground mb-2">No trade data available for this HTS code.</p>
            <p className="text-sm text-muted-foreground">Try selecting a different time period or check back later.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}