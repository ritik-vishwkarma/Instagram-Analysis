import { BarChart, Bar, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from "react";
import {
  fetchTimeEngagementData,
  DayData,
  HourData
} from "@/db";

// Define the available metrics for toggling
type MetricType = 'total' | 'likes' | 'comments' | 'ratio';

const TimeBasedInsights = () => {
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [hourData, setHourData] = useState<HourData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('total');

  // Format number to K and M
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Helper function to format ratio values
  const formatRatio = (value: number): string => {
    return value.toFixed(1);
  };

  // Helper function to get color for each metric
  const getColorForMetric = (metric: MetricType): string => {
    switch (metric) {
      case 'likes': return '#8884d8';
      case 'comments': return '#82ca9d';
      case 'ratio': return '#ffb00f';
      default: return '#8B8000';
    }
  };

  // Helper function to get display name for each metric
  const getNameForMetric = (metric: MetricType): string => {
    switch (metric) {
      case 'likes': return 'Likes';
      case 'comments': return 'Comments';
      case 'ratio': return 'Likes/Comments';
      default: return 'Engagement';
    }
  };

  // Helper function to format tooltip values based on metric
  const formatTooltipValue = (value: number, metric: MetricType): string => {
    if (metric === 'ratio') {
      return formatRatio(value);
    }
    return formatNumber(value);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { dayData: dayEngagementData, hourData: hourEngagementData } = await fetchTimeEngagementData();
        setDayData(dayEngagementData);
        setHourData(hourEngagementData);
      } catch (err) {
        console.error("Error loading time-based data:", err);
        setError("Failed to load engagement data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Find peak engagement periods for insights based on selected metric
  const getBestDay = (): string => {
    if (dayData.length === 0) return "";
    const bestDay = dayData.reduce((max, day) =>
      day[selectedMetric] > max[selectedMetric] ? day : max, dayData[0]);
    return bestDay.fullDay;
  };

  const getPeakHours = (): string => {
    if (hourData.length === 0) return "";
    const sortedHours = [...hourData].sort((a, b) => b[selectedMetric] - a[selectedMetric]);
    const topHours = sortedHours.slice(0, 3);
    return topHours.map(h => h.hour).join(', ');
  };

  // Get description text based on selected metric
  const getMetricDescription = (): string => {
    switch (selectedMetric) {
      case 'likes':
        return `${getBestDay()} sees most likes`;
      case 'comments':
        return `${getBestDay()} gets most comments`;
      case 'ratio':
        return `${getBestDay()} has highest Likes/Comments ratio`;
      default:
        return `${getBestDay()} has highest engagement`;
    }
  };

  return (
    <div className="p-2 text-white h-full">
      {/* Even more compact title */}
      <div className="flex justify-center mb-1">
        <div className="relative inline-block">
          <h1 className="text-base font-bold text-center text-white relative z-10 px-3 py-0.5">
            Time Based Analysis
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-600/30 rounded-md backdrop-blur-sm border border-white/10 shadow-md transform -rotate-1 z-0"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-500/20 rounded-md backdrop-blur-sm border border-white/10 shadow-md transform rotate-1 z-0"></div>
        </div>
      </div>

      {/* Ultra compact loading state */}
      {loading && (
        <div className="text-center py-0.5">
          <div className="inline-block animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-1"></div>
          <span className="text-white text-xs">Loading data...</span>
        </div>
      )}

      {/* Ultra compact error state */}
      {error && (
        <div className="bg-red-900/50 p-1 rounded mb-1 text-center text-xs">
          <p className="text-red-200">{error}</p>
          <button
            className="mt-0.5 px-2 py-0.5 bg-red-700 hover:bg-red-600 rounded text-white text-xs"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Ultra compact metric toggle buttons */}
      {!loading && !error && (
        <div className="flex justify-center mb-1 gap-2">
          {(['total', 'likes', 'comments', 'ratio'] as MetricType[]).map(metric => (
            <button
              key={metric}
              className={`px-2 py-0.5 rounded text-xs ${selectedMetric === metric ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-500 transition-colors`}
              onClick={() => setSelectedMetric(metric)}
            >
              {getNameForMetric(metric)}
            </button>
          ))}
        </div>
      )}

      {/* Grid with two columns for horizontal layout - minimized gap */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Best Day to Post - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-gray-950 border-gray-800 h-full">
              <CardContent className="p-1 flex flex-col h-full">
                <div className="text-center">
                  <h2 className="text-xs font-semibold text-white">Best Day to Post</h2>
                </div>
                <div className="flex justify-center flex-grow">
                  <BarChart
                    width={330}
                    height={270}
                    data={dayData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="day" stroke="#fff" tick={{ fontSize: 11 }} />
                    <YAxis
                      stroke="#fff"
                      tickFormatter={selectedMetric === 'ratio' ? formatRatio : formatNumber}
                      domain={selectedMetric === 'ratio' ? [0, 'auto'] : undefined}
                      tick={{ fontSize: 11 }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '5px',
                        color: '#fff',
                        padding: '5px',
                        fontSize: '12px'
                      }}
                      labelFormatter={(label) => {
                        const dayItem = dayData.find(item => item.day === label);
                        return dayItem ? dayItem.fullDay : label;
                      }}
                      formatter={(value) => [
                        typeof value === 'number'
                          ? formatTooltipValue(value, selectedMetric as MetricType)
                          : value.toString(),
                        getNameForMetric(selectedMetric as MetricType)
                      ]}
                    />
                    <Bar
                      dataKey={selectedMetric}
                      fill={getColorForMetric(selectedMetric as MetricType)}
                      name={getNameForMetric(selectedMetric as MetricType)}
                    />
                  </BarChart>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Engagement by Hour - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-gray-950 border-gray-800 h-full">
              <CardContent className="p-1 flex flex-col h-full">
                <div className="text-center">
                  <h2 className="text-xs font-semibold text-white">Engagement by Hour</h2>
                </div>
                <div className="flex justify-center flex-grow">
                  <LineChart
                    width={330}
                    height={270}
                    data={hourData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                      dataKey="hour"
                      stroke="#fff"
                      interval={3}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#fff"
                      tickFormatter={selectedMetric === 'ratio' ? formatRatio : formatNumber}
                      domain={selectedMetric === 'ratio' ? [0, 'auto'] : undefined}
                      tick={{ fontSize: 11 }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '5px',
                        color: '#fff',
                        padding: '5px',
                        fontSize: '12px'
                      }}
                      labelFormatter={(label) => `Time: ${label}`}
                      formatter={(value) => [
                        typeof value === 'number'
                          ? formatTooltipValue(value, selectedMetric as MetricType)
                          : value.toString(),
                        getNameForMetric(selectedMetric as MetricType)
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={getColorForMetric(selectedMetric as MetricType)}
                      strokeWidth={1.5}
                      activeDot={{ r: 4 }}
                      dot={{ r: 2.5 }}
                      name={getNameForMetric(selectedMetric as MetricType)}
                    />
                    <defs>
                      <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={getColorForMetric(selectedMetric as MetricType)}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={getColorForMetric(selectedMetric as MetricType)}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="none"
                      fillOpacity={0.3}
                      fill="url(#engagementGradient)"
                    />
                  </LineChart>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TimeBasedInsights;