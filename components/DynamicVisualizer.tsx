// "use client";

// import React, { JSX, useEffect, useState, useRef } from "react";
// import { Send, Database, Bot, User, Image, AlertCircle, Loader2, MessageCircle } from "lucide-react";

// export default function DashboardDemo() {
//   const [datasets, setDatasets] = useState<string[]>([]);
//   const [selectedDataset, setSelectedDataset] = useState<string>("");
//   const [chatInput, setChatInput] = useState("");
//   const [chatLog, setChatLog] = useState<(string | JSX.Element)[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isTextChatMode, setIsTextChatMode] = useState(false);
//   const [textChatLog, setTextChatLog] = useState<string[]>([]);
//   const [textChatInput, setTextChatInput] = useState("");
//   const [textChatLoading, setTextChatLoading] = useState(false);
  
//   // Refs for autoscroll functionality
//   const chatContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
//   const textChatContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

//   // Autoscroll function
//   const scrollToBottom = (containerRef: React.RefObject<HTMLDivElement>) => {
//     if (containerRef.current) {
//       containerRef.current.scrollTop = containerRef.current.scrollHeight;
//     }
//   };

//   // Auto-scroll whenever chat logs change
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (!isTextChatMode) {
//         scrollToBottom(chatContainerRef);
//       }
//     }, 100); // Small delay to ensure DOM is updated
    
//     return () => clearTimeout(timer);
//   }, [chatLog, loading, isTextChatMode]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (isTextChatMode) {
//         scrollToBottom(textChatContainerRef);
//       }
//     }, 100);
    
//     return () => clearTimeout(timer);
//   }, [textChatLog, textChatLoading, isTextChatMode]);

//   // Auto-scroll when switching modes
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (isTextChatMode) {
//         scrollToBottom(textChatContainerRef);
//       } else {
//         scrollToBottom(chatContainerRef);
//       }
//     }, 200);
    
//     return () => clearTimeout(timer);
//   }, [isTextChatMode]);

//   useEffect(() => {
//     fetch("http://localhost:8000/available-datasets")
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Available datasets:", data);
//         setDatasets(data.datasets);
//         if (data.datasets.length > 0) {
//           setSelectedDataset(data.datasets[0]);
//         }
//       })
//       .catch((err) => {
//         console.error("Error fetching datasets:", err);
//         setChatLog((prev) => [...prev, `Error fetching datasets: ${err.message}`]);
//       });
//   }, []);

//   async function handleChatSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!chatInput.trim() || !selectedDataset) {
//       setChatLog((prev) => [...prev, "Error: Please enter a message and select a dataset"]);
//       return;
//     }

//     const prompt = chatInput.trim();
//     const dataset = selectedDataset;
//     const model = "deepseek";

//     console.log("Sending request:", { prompt, dataset, model });
//     setChatLog((prev) => [...prev, `You: ${chatInput}`]);
//     setChatLog((prev) => [...prev, `Debug: Sending to ${dataset} with model ${model}`]);
//     setLoading(true);

//     try {
//       const queryParams = new URLSearchParams({ prompt, dataset, model });
//       const res = await fetch(`http://localhost:8000/llm-chat?${queryParams.toString()}`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//         },
//       });

//       console.log("Response status:", res.status);
//       console.log("Response headers:", Object.fromEntries(res.headers.entries()));

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error("Error response:", errorText);
//         throw new Error(`HTTP ${res.status}: ${errorText}`);
//       }

//       const json = await res.json();
//       console.log("Success response:", json);
//       setChatLog((prev) => [...prev, `Bot: ${json.reply}`]);

//       if (json.imageUrl) {
//         try {
//           const imageRes = await fetch(`http://localhost:8000${json.imageUrl}`);
//           if (imageRes.ok) {
//             const blob = await imageRes.blob();
//             const imageUrl = URL.createObjectURL(blob);

//             setChatLog((prev) => [
//               ...prev,
//               <img
//                 key={Date.now()}
//                 src={imageUrl}
//                 alt="Generated plot"
//                 className="w-full max-w-md mx-auto rounded-xl shadow-lg my-4 border border-gray-200"
//               />,
//             ]);
//           } else {
//             setChatLog((prev) => [...prev, `Error loading image: ${imageRes.status}`]);
//           }
//         } catch (imgErr: any) {
//           setChatLog((prev) => [...prev, `Error loading image: ${imgErr.message}`]);
//         }
//       }
//     } catch (err: any) {
//       console.error("Request error:", err);
//       setChatLog((prev) => [...prev, `Error: ${err.message}`]);
//     }

//     setChatInput("");
//     setLoading(false);
//   }

//   async function handleTextChatSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!textChatInput.trim()) {
//       setTextChatLog((prev) => [...prev, "Error: Please enter a message"]);
//       return;
//     }

//     const userMessage = textChatInput.trim();
//     setTextChatLog((prev) => [...prev, `You: ${userMessage}`]);
//     setTextChatLoading(true);

//     try {
//       // Use the actual backend text-chat endpoint with optional dataset
//       const queryParams = new URLSearchParams({ prompt: userMessage });
//       if (selectedDataset) {
//         queryParams.append('dataset', selectedDataset);
//       }
      
//       const res = await fetch(`http://localhost:8000/text-chat?${queryParams.toString()}`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//         },
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(`HTTP ${res.status}: ${errorText}`);
//       }

//       const json = await res.json();
//       setTextChatLog((prev) => [...prev, `Bot: ${json.reply}`]);
      
//     } catch (err: any) {
//       console.error("Text chat error:", err);
//       setTextChatLog((prev) => [...prev, `Error: ${err.message}`]);
//     }

//     setTextChatInput("");
//     setTextChatLoading(false);
//   }

//   const handleSubmitClick = () => {
//     const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
//     handleChatSubmit(fakeEvent);
//   };

//   const handleTextChatSubmitClick = () => {
//     const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
//     handleTextChatSubmit(fakeEvent);
//   };

//   const renderChatEntry = (entry: string | JSX.Element, index: number) => {
//     if (React.isValidElement(entry)) {
//       return (
//         <div key={index} className="flex justify-center animate-fadeIn">
//           <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 max-w-md">
//             {entry}
//           </div>
//         </div>
//       );
//     }

//     const entryStr = entry.toString();
    
//     if (entryStr.startsWith("Debug:")) {
//       return (
//         <div key={index} className="flex justify-center animate-fadeIn">
//           <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">
//             {entryStr.replace("Debug: ", "")}
//           </div>
//         </div>
//       );
//     }

//     if (entryStr.startsWith("You:")) {
//       return (
//         <div key={index} className="flex justify-end animate-slideInRight">
//           <div className="bg-slate-800 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs lg:max-w-md shadow-lg">
//             <div className="flex items-start gap-2">
//               <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
//               <span className="text-sm">{entryStr.replace("You: ", "")}</span>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (entryStr.startsWith("Bot:")) {
//       return (
//         <div key={index} className="flex justify-start animate-slideInLeft">
//           <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs lg:max-w-md shadow-sm">
//             <div className="flex items-start gap-2">
//               <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
//               <span className="text-sm text-gray-800">{entryStr.replace("Bot: ", "")}</span>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (entryStr.startsWith("Error:")) {
//       return (
//         <div key={index} className="flex justify-center animate-fadeIn">
//           <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 border border-red-200 shadow-sm">
//             <div className="flex items-center gap-2">
//               <AlertCircle className="w-4 h-4 flex-shrink-0" />
//               <span className="text-sm">{entryStr}</span>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div key={index} className="flex justify-center animate-fadeIn">
//         <div className="bg-gray-50 text-gray-700 rounded-xl px-4 py-3 border border-gray-200">
//           <span className="text-sm">{entryStr}</span>
//         </div>
//       </div>
//     );
//   };

//   const renderTextChatEntry = (entry: string, index: number) => {
//     if (entry.startsWith("You:")) {
//       return (
//         <div key={index} className="flex justify-end animate-slideInRight">
//           <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs lg:max-w-md shadow-lg">
//             <div className="flex items-start gap-2">
//               <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
//               <span className="text-sm">{entry.replace("You: ", "")}</span>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (entry.startsWith("Bot:")) {
//       return (
//         <div key={index} className="flex justify-start animate-slideInLeft">
//           <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs lg:max-w-md shadow-sm">
//             <div className="flex items-start gap-2">
//               <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
//               <span className="text-sm text-gray-800">{entry.replace("Bot: ", "")}</span>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (entry.startsWith("Error:")) {
//       return (
//         <div key={index} className="flex justify-center animate-fadeIn">
//           <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 border border-red-200 shadow-sm">
//             <div className="flex items-center gap-2">
//               <AlertCircle className="w-4 h-4 flex-shrink-0" />
//               <span className="text-sm">{entry}</span>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div key={index} className="flex justify-center animate-fadeIn">
//         <div className="bg-gray-50 text-gray-700 rounded-xl px-4 py-3 border border-gray-200">
//           <span className="text-sm">{entry}</span>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes slideInLeft {
//           from { opacity: 0; transform: translateX(-20px); }
//           to { opacity: 1; transform: translateX(0); }
//         }
//         @keyframes slideInRight {
//           from { opacity: 0; transform: translateX(20px); }
//           to { opacity: 1; transform: translateX(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//         .animate-slideInLeft {
//           animation: slideInLeft 0.3s ease-out;
//         }
//         .animate-slideInRight {
//           animation: slideInRight 0.3s ease-out;
//         }
        
//         /* Custom scrollbar */
//         .chat-container::-webkit-scrollbar {
//           width: 6px;
//         }
//         .chat-container::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 3px;
//         }
//         .chat-container::-webkit-scrollbar-thumb {
//           background: #c1c1c1;
//           border-radius: 3px;
//         }
//         .chat-container::-webkit-scrollbar-thumb:hover {
//           background: #a8a8a8;
//         }
//       `}</style>

     
//       <div className="max-w-4xl mx-auto px-6 py-6">
//         {/* Dataset Selection & Mode Toggle */}
//         <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <label className="font-semibold text-gray-800">Dataset:</label>
//             </div>

//             <select
//               className="flex-1 max-w-xs border border-gray-300 rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
//               value={selectedDataset}
//               onChange={(e) => setSelectedDataset(e.target.value)}
//             >
//               <option value="">-- Select Dataset --</option>
//               {datasets.map((ds) => (
//                 <option key={ds} value={ds}>
//                   {ds}
//                 </option>
//               ))}
//             </select>

//             {/* Text Chat Toggle Button */}
//             <button
//               onClick={() => setIsTextChatMode(!isTextChatMode)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
//                 isTextChatMode
//                   ? "bg-green-600 text-white shadow-lg"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
//               }`}
//               title="Toggle Text Chat Mode"
//             >
//               <MessageCircle className="w-4 h-4" />
//               <span className="text-sm">Text Chat</span>
//             </button>

//             {selectedDataset && !isTextChatMode && (
//               <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//                 Connected
//               </div>
//             )}
//           </div> 
//         </div>

//         {/* Chat Container */}
//         <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
//           <div 
//             ref={isTextChatMode ? textChatContainerRef : chatContainerRef}
//             className="h-96 overflow-y-auto p-6 space-y-4 chat-container scroll-smooth"
//           >
//             {!isTextChatMode ? (
//               // Data Visualization Chat
//               <>
//                 {chatLog.length === 0 && (
//                   <div className="text-center py-12">
//                     <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to analyze your data</h3>
//                     <p className="text-gray-500 text-sm max-w-md mx-auto">
//                       Try asking me to create visualizations like "Create a scatter plot of the data" or "Show me a bar chart"
//                     </p>
//                   </div>
//                 )}
//                 {chatLog.map(renderChatEntry)}
//                 {loading && (
//                   <div className="flex justify-start animate-fadeIn">
//                     <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
//                       <div className="flex items-center gap-2">
//                         <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
//                         <span className="text-sm text-gray-600">Analyzing data...</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               // Text Chat Mode
//               <>
//                 {textChatLog.length === 0 && (
//                   <div className="text-center py-12">
//                     <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-semibold text-gray-600 mb-2">Text Chat Assistant</h3>
//                     <p className="text-gray-500 text-sm max-w-md mx-auto">
//                       {selectedDataset 
//                         ? `Ask me questions about the "${selectedDataset}" dataset or anything else!`
//                         : "Ask me anything! Select a dataset above to get data-specific insights."
//                       }
//                     </p>
//                   </div>
//                 )}
//                 {textChatLog.map(renderTextChatEntry)}
//                 {textChatLoading && (
//                   <div className="flex justify-start animate-fadeIn">
//                     <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
//                       <div className="flex items-center gap-2">
//                         <Loader2 className="w-4 h-4 animate-spin text-green-600" />
//                         <span className="text-sm text-gray-600">Thinking...</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         {/* Input Area */}
//         <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-200">
//           <div className="flex gap-3 items-end">
//             <div className="flex-1">
//               <input
//                 className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
//                 value={isTextChatMode ? textChatInput : chatInput}
//                 onChange={(e) => isTextChatMode ? setTextChatInput(e.target.value) : setChatInput(e.target.value)}
//                 placeholder={
//                   isTextChatMode 
//                     ? (selectedDataset 
//                         ? `Ask about the ${selectedDataset} dataset or anything else...` 
//                         : "Ask me anything or select a dataset for data insights...")
//                     : "Ask me to create charts, analyze data, or generate insights..."
//                 }
//                 onKeyPress={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault();
//                     isTextChatMode ? handleTextChatSubmitClick() : handleSubmitClick();
//                   }
//                 }}
//                 disabled={isTextChatMode ? textChatLoading : loading}
//               />
//             </div>
//             <button
//               onClick={isTextChatMode ? handleTextChatSubmitClick : handleSubmitClick}
//               className={`text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium ${
//                 isTextChatMode 
//                   ? "bg-green-600 hover:bg-green-700" 
//                   : "bg-purple-600 hover:bg-purple-700"
//               }`}
//               disabled={
//                 isTextChatMode 
//                   ? textChatLoading || !textChatInput.trim()
//                   : loading || !selectedDataset || !chatInput.trim()
//               }
//             >
//               {(isTextChatMode ? textChatLoading : loading) ? (
//                 <Loader2 className="w-4 h-4 animate-spin" />
//               ) : (
//                 <Send className="w-4 h-4" />
//               )}
//               {(isTextChatMode ? textChatLoading : loading) ? "Sending..." : "Send"}
//             </button>
//           </div>
//         </div>

//         {/* Status Info */}
//         <div className="mt-4 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//             <div className="flex items-center gap-2">
//               <div className={`w-2 h-2 rounded-full ${
//                 isTextChatMode ? 'bg-green-500' : (selectedDataset ? 'bg-green-500' : 'bg-gray-400')
//               }`}></div>
//               <span className="text-gray-700">
//                 <span className="font-medium">Mode:</span> {isTextChatMode ? "Text Chat" : "Data Visualization"}
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className={`w-2 h-2 rounded-full ${selectedDataset && !isTextChatMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
//               <span className="text-gray-700">
//                 <span className="font-medium">Dataset:</span> {selectedDataset || "None"}
//                 {isTextChatMode && selectedDataset && <span className="text-green-600 ml-1">(Active in chat)</span>}
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Database className="w-4 h-4 text-gray-500" />
//               <span className="text-gray-700">
//                 <span className="font-medium">Available:</span> {datasets.length > 0 ? `${datasets.length} datasets` : "Loading..."}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import React, { JSX, useEffect, useState, useRef } from "react";
import { Send, Database, Bot, User, Image, AlertCircle, Loader2, MessageCircle, Upload, Trash2, FileText, CheckCircle2, Bug, Menu, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'debug';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
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

export default function DashboardDemo() {
  const [datasets, setDatasets] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<(string | JSX.Element)[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTextChatMode, setIsTextChatMode] = useState(false);
  const [textChatLog, setTextChatLog] = useState<string[]>([]);
  const [textChatInput, setTextChatInput] = useState("");
  const [textChatLoading, setTextChatLoading] = useState(false);
  
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileToDelete, setFileToDelete] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'debug' } | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  
  // Refs for autoscroll functionality
  const chatContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const textChatContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  // Autoscroll function
  const scrollToBottom = (containerRef: React.RefObject<HTMLDivElement>) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Auto-scroll whenever chat logs change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isTextChatMode) {
        scrollToBottom(chatContainerRef);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [chatLog, loading, isTextChatMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTextChatMode) {
        scrollToBottom(textChatContainerRef);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [textChatLog, textChatLoading, isTextChatMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTextChatMode) {
        scrollToBottom(textChatContainerRef);
      } else {
        scrollToBottom(chatContainerRef);
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [isTextChatMode]);

  const debugLog = (message: string, data?: any) => {
    console.log(`[DEBUG] ${message}`, data || '');
    if (debugMode) {
      showToast(`DEBUG: ${message}`, 'debug');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'debug') => {
    setToast({ message, type });
  };

  const loadDatasets = async () => {
    try {
      const res = await fetch("http://localhost:8000/available-datasets");
      const data = await res.json();
      console.log("Available datasets:", data);
      setDatasets(data.datasets);
      if (data.datasets.length > 0 && !selectedDataset) {
        setSelectedDataset(data.datasets[0]);
      }
    } catch (err: any) {
      console.error("Error fetching datasets:", err);
      setChatLog((prev) => [...prev, `Error fetching datasets: ${err.message}`]);
    }
  };

  useEffect(() => {
    debugLog("Component mounted, loading datasets...");
    loadDatasets();
  }, []);

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

      const requestUrl = "http://localhost:8000/upload-csv";
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
        debugLog("Reloading datasets after successful upload");
        await loadDatasets();
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
    debugLog("No filename selected");
    showToast("Please select a file to delete", "error");
    return;
  }

  // Transform the display name back to actual filename
  let filename = fileToDelete.trim();
  filename = filename.replaceAll("-", "_") + ".csv"; // Use replaceAll to handle multiple hyphens
  
  debugLog(`Display name: "${fileToDelete}"`);
  debugLog(`Actual filename to delete: "${filename}"`);

  setIsDeleting(true);

  try {
    const requestBody = { filename: filename };
    debugLog(`Sending request body:`, requestBody);

    const response = await fetch("http://localhost:8000/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    debugLog(`Response status: ${response.status}`);
    const responseText = await response.text();
    debugLog(`Response text: "${responseText}"`);
    
    if (responseText) {
      const data = JSON.parse(responseText);
      if (response.ok) {
        showToast(data.message || "File deleted successfully!", "success");
        setFileToDelete("");
        await loadDatasets();
        
        if (selectedDataset === fileToDelete) { // Compare with display name
          setSelectedDataset("");
          debugLog("Cleared selected dataset as it was deleted");
        }
      } else {
        showToast(data.detail || "Delete failed", "error");
      }
    }
  } catch (error) {
    debugLog("Delete error:", error);
    showToast(`Network error: ${error}`, "error");
  } finally {
    setIsDeleting(false);
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

  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !selectedDataset) {
      setChatLog((prev) => [...prev, "Error: Please enter a message and select a dataset"]);
      return;
    }

    const prompt = chatInput.trim();
    const dataset = selectedDataset;
    const model = "deepseek";

    console.log("Sending request:", { prompt, dataset, model });
    setChatLog((prev) => [...prev, `You: ${chatInput}`]);
    setChatLog((prev) => [...prev, `Debug: Sending to ${dataset} with model ${model}`]);
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({ prompt, dataset, model });
      const res = await fetch(`http://localhost:8000/llm-chat?${queryParams.toString()}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      console.log("Success response:", json);
      setChatLog((prev) => [...prev, `Bot: ${json.reply}`]);

      if (json.imageUrl) {
        try {
          const imageRes = await fetch(`http://localhost:8000${json.imageUrl}`);
          if (imageRes.ok) {
            const blob = await imageRes.blob();
            const imageUrl = URL.createObjectURL(blob);

            setChatLog((prev) => [
              ...prev,
              <img
                key={Date.now()}
                src={imageUrl}
                alt="Generated plot"
                className="w-full max-w-md mx-auto rounded-xl shadow-lg my-4 border border-gray-200"
              />,
            ]);
          } else {
            setChatLog((prev) => [...prev, `Error loading image: ${imageRes.status}`]);
          }
        } catch (imgErr: any) {
          setChatLog((prev) => [...prev, `Error loading image: ${imgErr.message}`]);
        }
      }
    } catch (err: any) {
      console.error("Request error:", err);
      setChatLog((prev) => [...prev, `Error: ${err.message}`]);
    }

    setChatInput("");
    setLoading(false);
  }

  async function handleTextChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!textChatInput.trim()) {
      setTextChatLog((prev) => [...prev, "Error: Please enter a message"]);
      return;
    }

    const userMessage = textChatInput.trim();
    setTextChatLog((prev) => [...prev, `You: ${userMessage}`]);
    setTextChatLoading(true);

    try {
      const queryParams = new URLSearchParams({ prompt: userMessage });
      if (selectedDataset) {
        queryParams.append('dataset', selectedDataset);
      }
      
      const res = await fetch(`http://localhost:8000/text-chat?${queryParams.toString()}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      setTextChatLog((prev) => [...prev, `Bot: ${json.reply}`]);
      
    } catch (err: any) {
      console.error("Text chat error:", err);
      setTextChatLog((prev) => [...prev, `Error: ${err.message}`]);
    }

    setTextChatInput("");
    setTextChatLoading(false);
  }

  const handleSubmitClick = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleChatSubmit(fakeEvent);
  };

  const handleTextChatSubmitClick = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleTextChatSubmit(fakeEvent);
  };

  const renderChatEntry = (entry: string | JSX.Element, index: number) => {
    if (React.isValidElement(entry)) {
      return (
        <div key={index} className="flex justify-center animate-fadeIn">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 max-w-md">
            {entry}
          </div>
        </div>
      );
    }

    const entryStr = entry.toString();
    
    if (entryStr.startsWith("Debug:")) {
      return (
        <div key={index} className="flex justify-center animate-fadeIn">
          <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">
            {entryStr.replace("Debug: ", "")}
          </div>
        </div>
      );
    }

    if (entryStr.startsWith("You:")) {
      return (
        <div key={index} className="flex justify-end animate-slideInRight">
          <div className="bg-slate-800 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs lg:max-w-md shadow-lg">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{entryStr.replace("You: ", "")}</span>
            </div>
          </div>
        </div>
      );
    }

    if (entryStr.startsWith("Bot:")) {
      return (
        <div key={index} className="flex justify-start animate-slideInLeft">
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs lg:max-w-md shadow-sm">
            <div className="flex items-start gap-2">
              <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
              <span className="text-sm text-gray-800">{entryStr.replace("Bot: ", "")}</span>
            </div>
          </div>
        </div>
      );
    }

    if (entryStr.startsWith("Error:")) {
      return (
        <div key={index} className="flex justify-center animate-fadeIn">
          <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 border border-red-200 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{entryStr}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className="flex justify-center animate-fadeIn">
        <div className="bg-gray-50 text-gray-700 rounded-xl px-4 py-3 border border-gray-200">
          <span className="text-sm">{entryStr}</span>
        </div>
      </div>
    );
  };

  const renderTextChatEntry = (entry: string, index: number) => {
    if (entry.startsWith("You:")) {
      return (
        <div key={index} className="flex justify-end animate-slideInRight">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs lg:max-w-md shadow-lg">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{entry.replace("You: ", "")}</span>
            </div>
          </div>
        </div>
      );
    }

    if (entry.startsWith("Bot:")) {
      return (
        <div key={index} className="flex justify-start animate-slideInLeft">
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs lg:max-w-md shadow-sm">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
              <span className="text-sm text-gray-800">{entry.replace("Bot: ", "")}</span>
            </div>
          </div>
        </div>
      );
    }

    if (entry.startsWith("Error:")) {
      return (
        <div key={index} className="flex justify-center animate-fadeIn">
          <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 border border-red-200 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{entry}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className="flex justify-center animate-fadeIn">
        <div className="bg-gray-50 text-gray-700 rounded-xl px-4 py-3 border border-gray-200">
          <span className="text-sm">{entry}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        .chat-container::-webkit-scrollbar {
          width: 6px;
        }
        .chat-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .chat-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .chat-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">File Manager</h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-full pb-20">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Upload Dataset</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
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
                  <FileText className="w-6 h-6 text-gray-600" />
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
                    <p className="font-medium text-blue-900 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-blue-700">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={() => {
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
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Delete Dataset</h3>
            </div>

            <div className="space-y-3">
              <select
                value={fileToDelete}
                onChange={(e) => setFileToDelete(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              >
                <option value="">-- Select a CSV file --</option>
                {datasets.map((file) => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>

              <button
                onClick={deleteFile}
                disabled={!fileToDelete.trim() || isDeleting}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
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

          {/* Available Datasets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Available Datasets ({datasets.length})</h3>
            </div>
            
            {datasets.length === 0 ? (
              <div className="text-center py-6">
                <Database className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No CSV files uploaded yet</p>
                <p className="text-gray-400 text-xs mt-1">Upload your first dataset to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {datasets.map((file, index) => (
                  <div
                    key={file}
                    className={`bg-gray-50 border rounded-lg p-3 hover:shadow-sm transition-shadow ${
                      selectedDataset === file ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-green-100 rounded">
                        <FileText className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">{file}</p>
                        <p className="text-xs text-gray-500">Dataset {index + 1}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Floating Hamburger Menu */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-[60] p-3 bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl transition-all duration-200 shadow-lg border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>

        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Dataset Selection & Mode Toggle */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-800">Dataset:</label>
              </div>

              <select
                className="flex-1 max-w-xs border border-gray-300 rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
              >
                <option value="">-- Select Dataset --</option>
                {datasets.map((ds) => (
                  <option key={ds} value={ds}>
                    {ds}
                  </option>
                ))}
              </select>

              {/* Text Chat Toggle Button */}
              <button
                onClick={() => setIsTextChatMode(!isTextChatMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  isTextChatMode
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
                title="Toggle Text Chat Mode"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Text Chat</span>
              </button>

              {selectedDataset && !isTextChatMode && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Connected
                </div>
              )}
            </div> 
          </div>

          {/* Chat Container */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div 
              ref={isTextChatMode ? textChatContainerRef : chatContainerRef}
              className="h-96 overflow-y-auto p-6 space-y-4 chat-container scroll-smooth"
            >
              {!isTextChatMode ? (
                // Data Visualization Chat
                <>
                  {chatLog.length === 0 && (
                    <div className="text-center py-12">
                      <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to analyze your data</h3>
                      <p className="text-gray-500 text-sm max-w-md mx-auto">
                        Try asking me to create visualizations like "Create a scatter plot of the data" or "Show me a bar chart"
                      </p>
                    </div>
                  )}
                  {chatLog.map(renderChatEntry)}
                  {loading && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600">Analyzing data...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Text Chat Mode
                <>
                  {textChatLog.length === 0 && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Text Chat Assistant</h3>
                      <p className="text-gray-500 text-sm max-w-md mx-auto">
                        {selectedDataset 
                          ? `Ask me questions about the "${selectedDataset}" dataset or anything else!`
                          : "Ask me anything! Select a dataset above to get data-specific insights."
                        }
                      </p>
                    </div>
                  )}
                  {textChatLog.map(renderTextChatEntry)}
                  {textChatLoading && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                  value={isTextChatMode ? textChatInput : chatInput}
                  onChange={(e) => isTextChatMode ? setTextChatInput(e.target.value) : setChatInput(e.target.value)}
                  placeholder={
                    isTextChatMode 
                      ? (selectedDataset 
                          ? `Ask about the ${selectedDataset} dataset or anything else...` 
                          : "Ask me anything or select a dataset for data insights...")
                      : "Ask me to create charts, analyze data, or generate insights..."
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      isTextChatMode ? handleTextChatSubmitClick() : handleSubmitClick();
                    }
                  }}
                  disabled={isTextChatMode ? textChatLoading : loading}
                />
              </div>
              <button
                onClick={isTextChatMode ? handleTextChatSubmitClick : handleSubmitClick}
                className={`text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium ${
                  isTextChatMode 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
                disabled={
                  isTextChatMode 
                    ? textChatLoading || !textChatInput.trim()
                    : loading || !selectedDataset || !chatInput.trim()
                }
              >
                {(isTextChatMode ? textChatLoading : loading) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {(isTextChatMode ? textChatLoading : loading) ? "Sending..." : "Send"}
              </button>
            </div>
          </div>

          {/* Status Info */}
          <div className="mt-4 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isTextChatMode ? 'bg-green-500' : (selectedDataset ? 'bg-green-500' : 'bg-gray-400')
                }`}></div>
                <span className="text-gray-700">
                  <span className="font-medium">Mode:</span> {isTextChatMode ? "Text Chat" : "Data Visualization"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedDataset && !isTextChatMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-700">
                  <span className="font-medium">Dataset:</span> {selectedDataset || "None"}
                  {isTextChatMode && selectedDataset && <span className="text-green-600 ml-1">(Active in chat)</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  <span className="font-medium">Available:</span> {datasets.length > 0 ? `${datasets.length} datasets` : "Loading..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}