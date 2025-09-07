
"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, Database, FileText, AlertCircle, CheckCircle2, Bug } from "lucide-react";

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'debug';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000); // Longer timeout for debug messages
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 
                  type === 'error' ? 'bg-red-50 border-red-200' : 
                  type === 'debug' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200';
  
  const textColor = type === 'success' ? 'text-green-800' : 
                    type === 'error' ? 'text-red-800' : 
                    type === 'debug' ? 'text-yellow-800' :
                    'text-blue-800';
  
  const Icon = type === 'success' ? CheckCircle2 : 
               type === 'debug' ? Bug : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-start gap-2 px-4 py-3 border rounded-lg shadow-lg max-w-md ${bgColor} ${textColor}`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <span className="font-medium text-sm leading-relaxed">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 flex-shrink-0">
        ×
      </button>
    </div>
  );
}

export default function CSVAnalyzerDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvFiles, setCsvFiles] = useState<string[]>([]);
  const [fileToDelete, setFileToDelete] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'debug' } | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    debugLog("Component mounted, attempting to load CSV files...");
    loadCsvFiles();
  }, []);

  const debugLog = (message: string, data?: any) => {
    console.log(`[DEBUG] ${message}`, data || '');
    if (debugMode) {
      showToast(`DEBUG: ${message}`, 'debug');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'debug') => {
    setToast({ message, type });
  };

  const testServerConnection = async () => {
    debugLog("Testing server connection...");
    
    try {
      // Test basic connection
      debugLog("Step 1: Testing basic fetch to server root");
      const rootResponse = await fetch("http://35.223.93.183:8001/", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      debugLog(`Root endpoint response status: ${rootResponse.status}`);
      
      if (rootResponse.ok) {
        const rootData = await rootResponse.json();
        debugLog("Root endpoint response data:", rootData);
        showToast(`Server connected! Response: ${JSON.stringify(rootData)}`, 'info');
      } else {
        debugLog(`Root endpoint failed with status: ${rootResponse.status}`);
        showToast(`Server responded with status ${rootResponse.status}`, 'error');
      }

      // Test health endpoint
      debugLog("Step 2: Testing health endpoint");
      const healthResponse = await fetch("http://35.223.93.183:8001/health");
      debugLog(`Health endpoint response status: ${healthResponse.status}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        debugLog("Health endpoint response data:", healthData);
        showToast(`Health check passed: ${JSON.stringify(healthData)}`, 'success');
      }

    } catch (error) {
      debugLog("Server connection test failed:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showToast("NETWORK ERROR: Cannot reach server at all. Check if FastAPI is running.", 'error');
      } else {
        showToast(`Connection test failed: ${error}`, 'error');
      }
    }
  };

  const loadCsvFiles = async () => {
    debugLog("Starting loadCsvFiles function");
    
    try {
      debugLog("Step 1: Creating fetch request to /list-csv");
      const requestUrl = "http://35.223.93.183:8001/list-csv";
      debugLog(`Request URL: ${requestUrl}`);
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      debugLog(`Response received - Status: ${response.status}, OK: ${response.ok}`);
      debugLog(`Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        debugLog(`Response not OK, status: ${response.status}`);
        
        let errorText = '';
        try {
          errorText = await response.text();
          debugLog(`Error response body: ${errorText}`);
        } catch (textError) {
          debugLog("Could not read error response body:", textError);
        }

        if (response.status === 404) {
          showToast("API endpoint /list-csv not found. Server running but endpoint missing.", 'error');
          return;
        } else if (response.status === 500) {
          showToast(`Server error (500): ${errorText}`, 'error');
          setCsvFiles([]);
          return;
        } else {
          showToast(`HTTP error ${response.status}: ${errorText}`, 'error');
          return;
        }
      }
      
      debugLog("Step 2: Response OK, parsing JSON");
      const data = await response.json();
      debugLog("Parsed JSON data:", data);
      
      const files = data.files || [];
      debugLog(`Extracted files array:`, files);
      
      setCsvFiles(files);
      debugLog(`State updated with ${files.length} files`);
      
      if (files.length === 0) {
        showToast("CSV files loaded successfully (0 files found)", 'info');
      } else {
        showToast(`CSV files loaded successfully (${files.length} files found)`, 'success');
      }
      
    } catch (error) {
      debugLog("Error in loadCsvFiles:", error);
      console.error("Detailed error:", error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showToast("FETCH ERROR: Cannot connect to server. Check if FastAPI is running on port 8000.", 'error');
      } else if (error instanceof SyntaxError) {
        showToast("JSON PARSE ERROR: Server returned invalid JSON response", 'error');
      } else if (error instanceof Error) {
        showToast(`ERROR: ${error.message}`, 'error');
      } else {
        showToast("UNKNOWN ERROR: Failed to load CSV files", 'error');
      }
    }
  };

  const uploadFile = async () => {
    debugLog("Starting uploadFile function");
    
    if (!selectedFile) {
      debugLog("No file selected");
      showToast("Please select a CSV file", "error");
      return;
    }

    debugLog(`Selected file: ${selectedFile.name}, size: ${selectedFile.size}, type: ${selectedFile.type}`);

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      debugLog("File extension validation failed");
      showToast("Only .csv files are allowed", "error");
      return;
    }

    setIsUploading(true);
    debugLog("Upload state set to true");

    try {
      debugLog("Creating FormData");
      const formData = new FormData();
      formData.append("file", selectedFile);
      debugLog("FormData created and file appended");

      const requestUrl = "http://35.223.93.183:8001/upload-csv";
      debugLog(`Making POST request to: ${requestUrl}`);

      const response = await fetch(requestUrl, {
        method: "POST",
        body: formData,
      });

      debugLog(`Upload response status: ${response.status}, OK: ${response.ok}`);

      let data;
      try {
        data = await response.json();
        debugLog("Upload response data:", data);
      } catch (jsonError) {
        debugLog("Failed to parse upload response as JSON:", jsonError);
        const textResponse = await response.text();
        debugLog("Upload response as text:", textResponse);
        throw new Error(`Server returned invalid JSON: ${textResponse}`);
      }
      
      if (response.ok) {
        debugLog("Upload successful");
        showToast(data.message || "File uploaded successfully!", "success");
        setSelectedFile(null);
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
          debugLog("File input cleared");
        }
        debugLog("Reloading CSV files after successful upload");
        await loadCsvFiles();
      } else {
        debugLog("Upload failed with error response");
        showToast(data.detail || data.message || "Upload failed", "error");
      }
    } catch (error) {
      debugLog("Upload error:", error);
      showToast(`Network error during upload: ${error}`, "error");
    } finally {
      setIsUploading(false);
      debugLog("Upload state set to false");
    }
  };

  const deleteFile = async () => {
    debugLog("Starting deleteFile function");
    
    if (!fileToDelete.trim()) {
      debugLog("No filename entered");
      showToast("Please enter a file name to delete", "error");
      return;
    }

    const filename = fileToDelete.trim().endsWith('.csv') ? fileToDelete.trim() : `${fileToDelete.trim()}.csv`;
    debugLog(`Filename to delete: ${filename}`);

    setIsDeleting(true);
    debugLog("Delete state set to true");

    try {
      const requestUrl = `http://35.223.93.183:8001/delete-csv?filename=${encodeURIComponent(filename)}`;
      debugLog(`Making DELETE request to: ${requestUrl}`);

      const response = await fetch(requestUrl, {
        method: "DELETE",
      });

      debugLog(`Delete response status: ${response.status}, OK: ${response.ok}`);

      let data;
      try {
        data = await response.json();
        debugLog("Delete response data:", data);
      } catch (jsonError) {
        debugLog("Failed to parse delete response as JSON:", jsonError);
        const textResponse = await response.text();
        debugLog("Delete response as text:", textResponse);
        throw new Error(`Server returned invalid JSON: ${textResponse}`);
      }
      
      if (response.ok) {
        debugLog("Delete successful");
        showToast(data.message || "File deleted successfully!", "success");
        setFileToDelete("");
        debugLog("Reloading CSV files after successful delete");
        await loadCsvFiles();
      } else {
        debugLog("Delete failed with error response");
        showToast(data.detail || data.message || "Delete failed", "error");
      }
    } catch (error) {
      debugLog("Delete error:", error);
      showToast(`Network error during deletion: ${error}`, "error");
    } finally {
      setIsDeleting(false);
      debugLog("Delete state set to false");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    debugLog(`File selected:`, file ? `${file.name} (${file.size} bytes)` : 'null');
    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto"> */}
              <div className="p-8 max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Upload Files</h2>
          </div>
          
          
        </div>

        {/* <div className="grid md:grid-cols-2 gap-8 mb-8"> */}
        <div className="grid grid-cols-1 gap-8 mb-8">

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Upload Dataset</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-2 text-center"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Click to select CSV file
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported format: .csv files only
                  </p>
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{selectedFile.name}</p>
                    <p className="text-sm text-blue-700">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={() => {
                      debugLog("Clearing selected file");
                      setSelectedFile(null);
                      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={uploadFile}
              disabled={!selectedFile || isUploading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-top-transparent"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </>
              )}
            </button>
          </div>

          {/* Delete Section */}
          {/* <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Delete Dataset</h3>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter filename (with or without .csv)"
                value={fileToDelete}
                onChange={(e) => {
                  debugLog(`Delete filename input changed: ${e.target.value}`);
                  setFileToDelete(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              />
              
              <button
                onClick={deleteFile}
                disabled={!fileToDelete.trim() || isDeleting}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-top-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete File
                  </>
                )}
              </button>
            </div>
          </div> */}

          <div className="space-y-4">
  <div className="flex items-center gap-2 mb-4">
    <Trash2 className="w-5 h-5 text-gray-600" />
    <h3 className="text-lg font-semibold text-gray-800">Delete Dataset</h3>
  </div>

  <div className="space-y-3">
    <select
      value={fileToDelete}
      onChange={(e) => {
        debugLog(`Selected file to delete: ${e.target.value}`);
        setFileToDelete(e.target.value);
      }}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
    >
      <option value="">-- Select a CSV file --</option>
      {csvFiles.map((file) => (
        <option key={file} value={file}>
          {file}
        </option>
      ))}
    </select>

    <button
      onClick={deleteFile}
      disabled={!fileToDelete.trim() || isDeleting}
      className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
    >
      {isDeleting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          Delete File
        </>
      )}
    </button>
  </div>
</div>

        </div>

        {/* Available Datasets */}
        {/* <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Available Datasets ({csvFiles.length})
          </h3>
          
          {csvFiles.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No CSV files uploaded yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload your first dataset to get started</p>
              <p className="text-xs text-gray-400 mt-2">
                Debug: Check browser console and use debug buttons above for detailed logs
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {csvFiles.map((file, index) => (
                <div
                  key={file}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{file}</p>
                      <p className="text-sm text-gray-500">Dataset {index + 1}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div> */}
      </div>
    </>
  );
}

