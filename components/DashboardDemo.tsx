
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  Pie,
  Line,
  Area,
  Bar
} from "recharts";
import {
  ChartBarIcon,
  CircleStackIcon,
  ArrowTrendingUpIcon,
  TableCellsIcon,
  EyeIcon,
  FunnelIcon,
  Square3Stack3DIcon,
  ChartPieIcon
} from "@heroicons/react/24/outline";
import CSVAnalyzerDashboard from "./OperationsDataFile";

const CHART_COLORS = [
  "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", 
  "#f59e0b", "#06b6d4", "#84cc16", "#f97316"
];

const PIE_COLORS = [
  "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", 
  "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"
];

interface DatasetStats {
  total: number;
  avg: number;
  max: number;
  min: number;
  variance: number;
  median: number;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const chartConfigs: Record<string, ChartConfig> = {
  bar: { type: 'bar', title: 'Bar Chart', icon: ChartBarIcon },
  line: { type: 'line', title: 'Line Chart', icon: ArrowTrendingUpIcon },
  pie: { type: 'pie', title: 'Pie Chart', icon: ChartPieIcon },
  area: { type: 'area', title: 'Area Chart', icon: Square3Stack3DIcon },
  scatter: { type: 'scatter', title: 'Scatter Plot', icon: CircleStackIcon }
};

export default function Dashboard() {
  const [datasets, setDatasets] = useState<string[]>([]);
  const [dataMap, setDataMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<
    Record<string, { indexKey: string; valueKey: string; chartType: string }>
  >({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "dataSize">("name");

  useEffect(() => {
    async function fetchDatasets() {
      try {
        const res = await fetch("http://localhost:8000/available-datasets");
        if (!res.ok) throw new Error("Failed to fetch available datasets");
        const { datasets } = await res.json();
        setDatasets(datasets);

        const dataFetches = datasets.map((ds: any) =>
          fetch(`http://localhost:8000/${ds}`).then((r) => {
            if (!r.ok) throw new Error(`Failed to fetch dataset: ${ds}`);
            return r.json();
          })
        );

        const results = await Promise.all(dataFetches);
        const newDataMap: Record<string, any[]> = {};
        datasets.forEach((ds: string, i: number) => {
          newDataMap[ds] = results[i].data || [];
        });
        setDataMap(newDataMap);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setLoading(false);
      }
    }

    fetchDatasets();
  }, []);

  const getKeys = (data: any[]) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const calculateStats = (data: any[], valueKey: string): DatasetStats => {
    const numericData = data
      .map((d) => parseFloat(d[valueKey]))
      .filter((n) => !isNaN(n));
    
    if (!numericData.length) {
      return { total: 0, avg: 0, max: 0, min: 0, variance: 0, median: 0 };
    }

    const sorted = [...numericData].sort((a, b) => a - b);
    const sum = numericData.reduce((a, b) => a + b, 0);
    const avg = sum / numericData.length;
    const variance = numericData.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / numericData.length;
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return {
      total: sum,
      avg,
      max: Math.max(...numericData),
      min: Math.min(...numericData),
      variance,
      median
    };
  };

  const filteredDatasets = datasets
    .filter((ds) => ds.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.localeCompare(b);
      } else {
        return (dataMap[b]?.length || 0) - (dataMap[a]?.length || 0);
      }
    });

  const totalDataPoints = Object.values(dataMap).reduce(
    (sum, data) => sum + data.length,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard</h2>
            <p className="text-gray-500">Fetching your data visualization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H18.93a2 2 0 001.732-2.5L13.732 4a2 2 0 00-3.464 0L3.338 16.5A2 2 0 005.07 19z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-red-700">Connection Error</h2>
            <p className="text-red-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100  to-slate-100">
      {/* Enhanced Header with Stats */}
      {/* <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
             
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-900 to-slate-800 bg-clip-text">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 flex items-center space-x-4">
                  <span>{datasets.length} datasets</span>
                  <span>•</span>
                  <span>{totalDataPoints.toLocaleString()} data points</span>
                  <span>•</span>
                  <span>{filteredDatasets.length} visible</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search datasets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-64"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "dataSize")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="name">Sort by Name</option>
                <option value="dataSize">Sort by Data Size</option>
              </select>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <FunnelIcon className="h-4 w-4 inline mr-2" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <TableCellsIcon className="h-4 w-4 inline mr-2" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      {/* <CSVAnalyzerDashboard/> */}

      {/* Dataset Grid/List */}
      <div className="container mx-auto px-6 py-8">
        {filteredDatasets.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
              <EyeIcon className="h-8 w-8 text-gray-500 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">No datasets found</p>
            <p className="text-gray-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {filteredDatasets.map((ds, index) => {
              const data = dataMap[ds];
              const keys = getKeys(data);
              if (keys.length < 2) return null;

              const indexKey = selectedColumns[ds]?.indexKey || keys[0];
              const valueKey = selectedColumns[ds]?.valueKey || keys[1];
              const chartType = selectedColumns[ds]?.chartType || 'bar';

              return (
                <EnhancedChartCard
                  key={ds}
                  dataset={ds}
                  data={data}
                  keys={keys}
                  indexKey={indexKey}
                  valueKey={valueKey}
                  chartType={chartType}
                  onSelectionChange={(newIndex, newValue, newChartType) =>
                    setSelectedColumns((prev) => ({
                      ...prev,
                      [ds]: { indexKey: newIndex, valueKey: newValue, chartType: newChartType },
                    }))
                  }
                  colorIndex={index % CHART_COLORS.length}
                  viewMode={viewMode}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EnhancedChartCard({
  dataset,
  data,
  keys,
  indexKey,
  valueKey,
  chartType,
  onSelectionChange,
  colorIndex,
  viewMode,
}: {
  dataset: string;
  data: any[];
  keys: string[];
  indexKey: string;
  valueKey: string;
  chartType: string;
  onSelectionChange: (indexKey: string, valueKey: string, chartType: string) => void;
  colorIndex: number;
  viewMode: "grid" | "list";
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const primaryColor = CHART_COLORS[colorIndex];

  const stats = calculateStats(data, valueKey);
  const chartData = prepareChartData(data, indexKey, valueKey, chartType);

  const StatCard = ({ label, value, icon: Icon, color }: {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <div className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
        {/* <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div> */}
      </div>
    </div>
  );

  const renderChart = () => {
    const chartHeight = isExpanded ? 400 : 280;
    
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={chartData.slice(0, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={chartHeight / 3}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, valueKey]} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={primaryColor} 
                strokeWidth={3}
                dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: primaryColor, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={primaryColor} 
                fill={`${primaryColor}30`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" type="number" />
              <YAxis dataKey="value" />
              <Tooltip />
              <Scatter dataKey="value" fill={primaryColor} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default: // bar chart
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData.slice(0, isExpanded ? undefined : 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill={primaryColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className={`bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${
      viewMode === "list" ? "flex flex-col" : ""
    }`}>
      {/* Card Header */}
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            {/* <div 
              className="w-4 h-4 rounded-full shadow-lg" 
              style={{ backgroundColor: primaryColor }} 
            /> */}
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {dataset.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <span>{data.length} rows</span>
                <span>•</span>
                <span>{keys.length} columns</span>
                <span>•</span>
                <span className="capitalize">{chartType} chart</span>
              </CardDescription>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <EyeIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <StatCard 
              label="Avg" 
              value={stats.avg.toFixed(1)} 
              icon={ArrowTrendingUpIcon}
              color="blue"
            />
            <StatCard 
              label="Max" 
              value={stats.max.toLocaleString()} 
              icon={ChartBarIcon}
              color="green"
            />
            <StatCard 
              label="Min" 
              value={stats.min.toLocaleString()} 
              icon={FunnelIcon}
              color="red"
            />
            <StatCard 
              label="Med" 
              value={stats.median.toFixed(1)} 
              icon={CircleStackIcon}
              color="purple"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Control Panel */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-32">
            <label className="block text-xs font-medium text-gray-700 mb-1">X-Axis</label>
            <select
              value={indexKey}
              onChange={(e) => onSelectionChange(e.target.value, valueKey, chartType)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {keys.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-32">
            <label className="block text-xs font-medium text-gray-700 mb-1">Y-Axis</label>
            <select
              value={valueKey}
              onChange={(e) => onSelectionChange(indexKey, e.target.value, chartType)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {keys.filter((k) => k !== indexKey).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-32">
            <label className="block text-xs font-medium text-gray-700 mb-1">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => onSelectionChange(indexKey, valueKey, e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(chartConfigs).map(([key, config]) => (
                <option key={key} value={key}>{config.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200">
            {renderChart()}
          </div>
          
          {/* Chart Controls */}
          <div className="flex justify-between items-center mt-4">
            {data.length > 10 && chartType === 'bar' && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isExpanded ? "Show Less" : `Show All ${data.length} Records`}
              </button>
            )}
            
            {/* <div className="flex items-center space-x-2 ml-auto">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
                Export
              </button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                Fullscreen
              </button>
            </div> */}
          </div>
        </div>

        {/* Detailed Stats Panel */}
        {showDetails && stats && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3">Detailed Statistics</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Total:</span>
                <span className="ml-2 font-medium">{stats.total.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Variance:</span>
                <span className="ml-2 font-medium">{stats.variance.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Std Dev:</span>
                <span className="ml-2 font-medium">{Math.sqrt(stats.variance).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Range:</span>
                <span className="ml-2 font-medium">{(stats.max - stats.min).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Data Points:</span>
                <span className="ml-2 font-medium">{data.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Valid Values:</span>
                <span className="ml-2 font-medium">
                  {data.filter(d => !isNaN(parseFloat(d[valueKey]))).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function calculateStats(data: any[], valueKey: string): DatasetStats {
  const numericData = data
    .map((d) => parseFloat(d[valueKey]))
    .filter((n) => !isNaN(n));
  
  if (!numericData.length) {
    return { total: 0, avg: 0, max: 0, min: 0, variance: 0, median: 0 };
  }

  const sorted = [...numericData].sort((a, b) => a - b);
  const sum = numericData.reduce((a, b) => a + b, 0);
  const avg = sum / numericData.length;
  const variance = numericData.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / numericData.length;
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  return {
    total: sum,
    avg,
    max: Math.max(...numericData),
    min: Math.min(...numericData),
    variance,
    median
  };
}

function prepareChartData(data: any[], indexKey: string, valueKey: string, chartType: string) {
  if (chartType === 'pie') {
    // For pie charts, aggregate by categories
    const aggregated = data.reduce((acc, item) => {
      const key = String(item[indexKey]);
      const value = parseFloat(item[valueKey]) || 0;
      acc[key] = (acc[key] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(aggregated)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }

  if (chartType === 'scatter') {
    return data.map((item, index) => ({
      index: index + 1,
      value: parseFloat(item[valueKey]) || 0,
      name: String(item[indexKey])
    }));
  }

  return data.map((item) => ({
    name: String(item[indexKey]),
    value: parseFloat(item[valueKey]) || 0,
  }));
}

function getKeys(data: any[]) {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]);
}