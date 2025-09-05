
import React, { useState, useCallback, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Upload, FileText, BarChart3, TrendingUp, Download, Eye, Filter, Brain, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import * as Papa from 'papaparse';

interface CSVData {
  [key: string]: string | number;
}

interface ColumnStats {
  name: string;
  type: 'numeric' | 'text' | 'date';
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: string | number;
  uniqueCount: number;
  nullCount: number;
  totalCount: number;
}

interface AnalysisResult {
  summary: {
    totalRows: number;
    totalColumns: number;
    numericColumns: string[];
    textColumns: string[];
    dateColumns: string[];
  };
  columnStats: ColumnStats[];
  correlations?: { [key: string]: { [key: string]: number } };
  insights: {
    dataQuality: string;
    keyFindings: string[];
    recommendations: string[];
    patterns: string[];
    anomalies: string[];
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#87ceeb'];

export default function CSVAnalyzer() {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [activeChart, setActiveChart] = useState<string>('bar');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filterValue, setFilterValue] = useState<string>('');

  const detectColumnType = (values: (string | number)[]): 'numeric' | 'text' | 'date' => {
    const nonEmptyValues = values.filter(v => v !== '' && v !== null && v !== undefined);
    if (nonEmptyValues.length === 0) return 'text';

    const numericCount = nonEmptyValues.filter(v => !isNaN(Number(v))).length;
    const dateCount = nonEmptyValues.filter(v => !isNaN(Date.parse(String(v)))).length;

    if (numericCount / nonEmptyValues.length > 0.8) return 'numeric';
    if (dateCount / nonEmptyValues.length > 0.6) return 'date';
    return 'text';
  };

  const calculateStats = (values: (string | number)[], type: string): Partial<ColumnStats> => {
    const nonEmptyValues = values.filter(v => v !== '' && v !== null && v !== undefined);
    
    if (type === 'numeric') {
      const numValues = nonEmptyValues.map(v => Number(v)).filter(v => !isNaN(v));
      const sorted = numValues.sort((a, b) => a - b);
      
      return {
        min: Math.min(...numValues),
        max: Math.max(...numValues),
        mean: numValues.reduce((a, b) => a + b, 0) / numValues.length,
        median: sorted[Math.floor(sorted.length / 2)]
      };
    }
    
    return {};
  };

  const generateInsights = useCallback((data: CSVData[], stats: ColumnStats[]) => {
    const insights = {
      dataQuality: '',
      keyFindings: [] as string[],
      recommendations: [] as string[],
      patterns: [] as string[],
      anomalies: [] as string[]
    };

    // Data Quality Assessment
    const totalCells = data.length * stats.length;
    const totalNulls = stats.reduce((sum, stat) => sum + stat.nullCount, 0);
    const nullPercentage = (totalNulls / totalCells) * 100;
    
    if (nullPercentage < 5) {
      insights.dataQuality = "Excellent data quality with minimal missing values";
    } else if (nullPercentage < 15) {
      insights.dataQuality = "Good data quality with some missing values to address";
    } else if (nullPercentage < 30) {
      insights.dataQuality = "Moderate data quality - consider data cleaning";
    } else {
      insights.dataQuality = "Poor data quality - significant missing values detected";
    }

    // Key Findings
    const numericStats = stats.filter(s => s.type === 'numeric');
    const textStats = stats.filter(s => s.type === 'text');
    
    insights.keyFindings.push(`Dataset contains ${data.length.toLocaleString()} rows and ${stats.length} columns`);
    
    if (numericStats.length > 0) {
      const avgUniqueRatio = numericStats.reduce((sum, stat) => sum + (stat.uniqueCount / stat.totalCount), 0) / numericStats.length;
      if (avgUniqueRatio > 0.8) {
        insights.keyFindings.push("High data diversity - most numeric columns have unique values");
      } else if (avgUniqueRatio < 0.1) {
        insights.keyFindings.push("Low data diversity - numeric columns have many repeated values");
      }
    }

    if (textStats.length > 0) {
      const categoricalColumns = textStats.filter(stat => stat.uniqueCount < stat.totalCount * 0.5);
      if (categoricalColumns.length > 0) {
        insights.keyFindings.push(`${categoricalColumns.length} categorical text columns identified`);
      }
    }

    // Patterns Detection
    numericStats.forEach(stat => {
      if (stat.mean && stat.median) {
        const skewness = Math.abs(stat.mean - stat.median) / (stat.max! - stat.min!);
        if (skewness > 0.1) {
          insights.patterns.push(`${stat.name}: Data is ${stat.mean > stat.median ? 'right' : 'left'}-skewed`);
        }
      }
      
      if (stat.min !== undefined && stat.max !== undefined) {
        const range = stat.max - stat.min;
        const standardDeviation = Math.sqrt(
          data.reduce((sum, row) => {
            const val = Number(row[stat.name]) || 0;
            return sum + Math.pow(val - stat.mean!, 2);
          }, 0) / data.length
        );
        
        if (standardDeviation > range * 0.3) {
          insights.patterns.push(`${stat.name}: High variability detected`);
        }
      }
    });

    // Anomalies Detection
    numericStats.forEach(stat => {
      if (stat.min !== undefined && stat.max !== undefined && stat.mean !== undefined) {
        const outlierThreshold = (stat.max - stat.min) * 0.1;
        const potentialOutliers = data.filter(row => {
          const val = Number(row[stat.name]) || 0;
          return Math.abs(val - stat.mean!) > outlierThreshold * 3;
        });
        
        if (potentialOutliers.length > data.length * 0.05) {
          insights.anomalies.push(`${stat.name}: ${potentialOutliers.length} potential outliers detected`);
        }
      }
    });

    // Recommendations
    if (nullPercentage > 10) {
      insights.recommendations.push("Consider implementing data cleaning procedures for missing values");
    }
    
    if (numericStats.length > 1) {
      insights.recommendations.push("Explore correlations between numeric variables for deeper insights");
    }
    
    if (textStats.length > 0) {
      insights.recommendations.push("Consider creating visualizations for categorical data distribution");
    }
    
    if (data.length > 1000) {
      insights.recommendations.push("Large dataset detected - consider sampling for initial exploration");
    }

    if (insights.patterns.length === 0) {
      insights.patterns.push("No significant patterns detected in the current analysis");
    }
    
    if (insights.anomalies.length === 0) {
      insights.anomalies.push("No significant anomalies detected in the data");
    }

    return insights;
  }, []);

  const analyzeData = useCallback((data: CSVData[]) => {
    if (data.length === 0) return;

    const columns = Object.keys(data[0]);
    const columnStats: ColumnStats[] = [];

    columns.forEach(col => {
      const values = data.map(row => row[col]);
      const type = detectColumnType(values);
      const uniqueValues = [...new Set(values)];
      const nullCount = values.filter(v => v === '' || v === null || v === undefined).length;
      
      const stats: ColumnStats = {
        name: col,
        type,
        uniqueCount: uniqueValues.length,
        nullCount,
        totalCount: values.length,
        ...calculateStats(values, type)
      };

      // Calculate mode
      const frequency: { [key: string]: number } = {};
      values.forEach(v => {
        const key = String(v);
        frequency[key] = (frequency[key] || 0) + 1;
      });
      const modeKey = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
      stats.mode = type === 'numeric' ? Number(modeKey) : modeKey;

      columnStats.push(stats);
    });

    const numericColumns = columnStats.filter(s => s.type === 'numeric').map(s => s.name);
    const textColumns = columnStats.filter(s => s.type === 'text').map(s => s.name);
    const dateColumns = columnStats.filter(s => s.type === 'date').map(s => s.name);

    const analysisResult: AnalysisResult = {
      summary: {
        totalRows: data.length,
        totalColumns: columns.length,
        numericColumns,
        textColumns,
        dateColumns
      },
      columnStats,
      insights: generateInsights(data, columnStats)
    };

    setAnalysis(analysisResult);
    setSelectedColumns(numericColumns.slice(0, 2));
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as CSVData[];
        setCsvData(data);
        analyzeData(data);
        setIsLoading(false);
      },
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsLoading(false);
      }
    });
  }, [analyzeData]);

  const filteredData = useMemo(() => {
    if (!filterValue) return csvData;
    
    return csvData.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(filterValue.toLowerCase())
      )
    );
  }, [csvData, filterValue]);

  const chartData = useMemo(() => {
    if (!analysis || selectedColumns.length === 0) return [];
    
    return filteredData.slice(0, 50).map((row, index) => ({
      index: index + 1,
      ...selectedColumns.reduce((acc, col) => ({
        ...acc,
        [col]: Number(row[col]) || 0
      }), {})
    }));
  }, [filteredData, selectedColumns, analysis]);

  const pieChartData = useMemo(() => {
    if (!analysis || selectedColumns.length === 0) return [];
    
    const col = selectedColumns[0];
    const values = filteredData.map(row => String(row[col]));
    const frequency: { [key: string]: number } = {};
    
    values.forEach(v => {
      frequency[v] = (frequency[v] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [filteredData, selectedColumns]);

  const renderChart = () => {
    if (!chartData.length) return null;

    switch (activeChart) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="index" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              {selectedColumns.map((col, index) => (
                <Line 
                  key={col} 
                  type="monotone" 
                  dataKey={col} 
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={3}
                  dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="index" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              {selectedColumns.map((col, index) => (
                <Bar 
                  key={col} 
                  dataKey={col} 
                  fill={COLORS[index % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        if (selectedColumns.length < 2) return <div className="text-center text-gray-500 py-20">Select at least 2 numeric columns for scatter plot</div>;
        
        const scatterData = filteredData.slice(0, 100).map(row => ({
          x: Number(row[selectedColumns[0]]) || 0,
          y: Number(row[selectedColumns[1]]) || 0
        }));
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
              <XAxis dataKey="x" name={selectedColumns[0]} stroke="#6b7280" />
              <YAxis dataKey="y" name={selectedColumns[1]} stroke="#6b7280" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter dataKey="y" fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-100 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
        
          <h1 className="text-4xl font-bold text-gray-800 mb-2">CSV Data Analyzer</h1>
          <p className="text-xl text-gray-700">Upload, analyze, and visualize your data instantly</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 hover:border-blue-400 transition-colors">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Upload Your CSV File</h3>
              <p className="text-gray-500 mb-4">Drag and drop or click to select your CSV file</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label 
                htmlFor="csv-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg hover:from-slate-700 hover:to-slate-700 transition-all cursor-pointer"
              >
                <FileText className="w-5 h-5 mr-2" />
                Choose File
              </label>
              {fileName && (
                <p className="mt-4 text-sm text-green-600 font-medium">
                  Loaded: {fileName}
                </p>
              )}
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Analyzing your data...</p>
          </div>
        )}

        {analysis && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Rows</p>
                    <p className="text-3xl font-bold">{analysis.summary.totalRows.toLocaleString()}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Columns</p>
                    <p className="text-3xl font-bold">{analysis.summary.totalColumns}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Numeric Columns</p>
                    <p className="text-3xl font-bold">{analysis.summary.numericColumns.length}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Text Columns</p>
                    <p className="text-3xl font-bold">{analysis.summary.textColumns.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>

            {/* AI-Powered Insights */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                AI-Powered Analysis
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Quality Assessment */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    Data Quality Assessment
                  </h4>
                  <p className="text-gray-700">{analysis.insights.dataQuality}</p>
                </div>

                {/* Key Findings */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    Key Findings
                  </h4>
                  <ul className="space-y-2">
                    {analysis.insights.keyFindings.map((finding, index) => (
                      <li key={index} className="text-gray-700 text-sm flex items-start">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Patterns Detected */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    Patterns Detected
                  </h4>
                  <ul className="space-y-2">
                    {analysis.insights.patterns.map((pattern, index) => (
                      <li key={index} className="text-gray-700 text-sm flex items-start">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Anomalies */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    Anomalies & Outliers
                  </h4>
                  <ul className="space-y-2">
                    {analysis.insights.anomalies.map((anomaly, index) => (
                      <li key={index} className="text-gray-700 text-sm flex items-start">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {anomaly}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  AI Recommendations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                      <p className="text-gray-700 text-sm flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Filter data..."
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gray-500" />
                  <select
                    multiple
                    value={selectedColumns}
                    onChange={(e) => setSelectedColumns(Array.from(e.target.selectedOptions, option => option.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {analysis.summary.numericColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['bar', 'line', 'pie', 'scatter'].map(chartType => (
                  <button
                    key={chartType}
                    onClick={() => setActiveChart(chartType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeChart === chartType
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
                  </button>
                ))}
              </div>
            </div>

            {/* Visualization */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Data Visualization</h3>
              {renderChart()}
            </div>

            {/* Column Statistics */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Column Statistics</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Column</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Unique</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Null</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Min</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Max</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Mean</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.columnStats.map((stat, index) => (
                      <tr key={stat.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4 font-medium text-gray-900">{stat.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stat.type === 'numeric' ? 'bg-blue-100 text-blue-800' :
                            stat.type === 'date' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {stat.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{stat.uniqueCount}</td>
                        <td className="py-3 px-4 text-gray-600">{stat.nullCount}</td>
                        <td className="py-3 px-4 text-gray-600">{stat.min?.toFixed(2) || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{stat.max?.toFixed(2) || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{stat.mean?.toFixed(2) || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{String(stat.mode)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}