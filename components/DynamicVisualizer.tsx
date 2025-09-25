"use client";

import React, { JSX, useEffect, useState, useRef } from "react";
import { FASTAPI_BASE_URL } from '../constants/constant';
import { useLanguage } from "./LanguageProvider";
import { Send, Database, Bot, User, Image, AlertCircle, Loader2, MessageCircle, Upload, Trash2, FileText, CheckCircle2, Bug, Menu, X } from "lucide-react";
import Settings from "./Settings";

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
  const { language, isRTL } = useLanguage();
  const [datasets, setDatasets] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<(string | JSX.Element)[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTextChatMode, setIsTextChatMode] = useState(false);
  const [textChatLog, setTextChatLog] = useState<string[]>([]);
  const [textChatInput, setTextChatInput] = useState("");
  const [textChatLoading, setTextChatLoading] = useState(false);
  const streamBufferRef = useRef<string>("");

  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileToDelete, setFileToDelete] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'debug' } | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const t = (key: string) => {
    const dict: Record<string, string> = language === 'ar' ? {
      text_chat_title: "مساعد الدردشة النصية",
      ask_about_dataset: "اسألني عن مجموعة البيانات \"{dataset}\" أو أي شيء آخر!",
      ask_anything: "اسألني أي شيء! اختر مجموعة بيانات بالأعلى للحصول على رؤى خاصة بالبيانات.",
      thinking: "جاري التفكير...",
      placeholder_dataset: "اسأل عن مجموعة بيانات {dataset} أو أي شيء آخر...",
      placeholder_anything: "اسألني أي شيء أو اختر مجموعة بيانات للحصول على رؤى...",
      placeholder_viz: "اطلب مني إنشاء رسوم، تحليل البيانات، أو توليد الرؤى...",
      sending: "جارٍ الإرسال...",
      send: "إرسال",
      mode: "الوضع",
      text_chat: "دردشة نصية",
      data_viz: "تصوّر البيانات",
      dataset: "مجموعة البيانات",
      none: "لا شيء",
      active_in_chat: "(نشطة في الدردشة)",
      available: "المتوفر",
      datasets: "مجموعات",
      loading: "جارٍ التحميل...",
      you: "أنت",
      bot: "الروبوت",
      error: "خطأ",
      error_enter_message: "خطأ: يرجى إدخال رسالة",
      toggle_text_chat: "تبديل وضع الدردشة النصية",
      text_chat_button: "دردشة نصية",
      connected: "متصل",
      ready_title: "جاهز لتحليل بياناتك",
      ready_hint: "جرّب أن تطلب إنشاء تصوّرات مثل \"أنشئ مخططًا مبعثرًا للبيانات\" أو \"أرني مخططًا شريطيًا\"",
      analyzing_data: "جارٍ تحليل البيانات...",
      dataset_label: "مجموعة البيانات:",
      select_dataset_placeholder: "-- اختر مجموعة بيانات --",
      file_manager: "مدير الملفات",
      upload_dataset: "رفع مجموعة بيانات",
      click_select_csv: "انقر لتحديد ملف CSV",
      supported_csv_only: "الصيغة المدعومة: ملفات .csv فقط",
      uploading: "جارٍ الرفع...",
      upload_csv: "رفع CSV",
      delete_dataset: "حذف مجموعة بيانات",
      select_csv_option: "-- اختر ملف CSV --",
      deleting: "جارٍ الحذف...",
      delete_file: "حذف الملف",
      available_datasets_count: "مجموعات البيانات المتاحة",
      no_csv_yet: "لا توجد ملفات CSV بعد",
      upload_first_hint: "ارفع أول مجموعة بيانات للبدء",
      dataset_n: "مجموعة",
      toast_select_csv: "يرجى اختيار ملف CSV",
      toast_csv_only: "مسموح فقط بملفات .csv",
      toast_upload_success: "تم رفع الملف بنجاح!",
      toast_upload_failed: "فشل الرفع",
      toast_delete_select: "يرجى اختيار ملف للحذف",
      toast_delete_success: "تم حذف الملف بنجاح!",
      toast_delete_failed: "فشل الحذف",
    } : {
      text_chat_title: "Text Chat Assistant",
      ask_about_dataset: "Ask me questions about the \"{dataset}\" dataset or anything else!",
      ask_anything: "Ask me anything! Select a dataset above to get data-specific insights.",
      thinking: "Thinking...",
      placeholder_dataset: "Ask about the {dataset} dataset or anything else...",
      placeholder_anything: "Ask me anything or select a dataset for data insights...",
      placeholder_viz: "Ask me to create charts, analyze data, or generate insights...",
      sending: "Sending...",
      send: "Send",
      mode: "Mode",
      text_chat: "Text Chat",
      data_viz: "Data Visualization",
      dataset: "Dataset",
      none: "None",
      active_in_chat: "(Active in chat)",
      available: "Available",
      datasets: "datasets",
      loading: "Loading...",
      you: "You",
      bot: "Bot",
      error: "Error",
      error_enter_message: "Error: Please enter a message",
      toggle_text_chat: "Toggle Text Chat Mode",
      text_chat_button: "Text Chat",
      connected: "Connected",
      ready_title: "Ready to analyze your data",
      ready_hint: "Try asking me to create visualizations like \"Create a scatter plot of the data\" or \"Show me a bar chart\"",
      analyzing_data: "Analyzing data...",
      dataset_label: "Dataset:",
      select_dataset_placeholder: "-- Select Dataset --",
      file_manager: "File Manager",
      upload_dataset: "Upload Dataset",
      click_select_csv: "Click to select CSV file",
      supported_csv_only: "Supported format: .csv files only",
      uploading: "Uploading...",
      upload_csv: "Upload CSV",
      delete_dataset: "Delete Dataset",
      select_csv_option: "-- Select a CSV file --",
      deleting: "Deleting...",
      delete_file: "Delete File",
      available_datasets_count: "Available Datasets",
      no_csv_yet: "No CSV files uploaded yet",
      upload_first_hint: "Upload your first dataset to get started",
      dataset_n: "Dataset",
      toast_select_csv: "Please select a CSV file",
      toast_csv_only: "Only .csv files are allowed",
      toast_upload_success: "File uploaded successfully!",
      toast_upload_failed: "Upload failed",
      toast_delete_select: "Please select a file to delete",
      toast_delete_success: "File deleted successfully!",
      toast_delete_failed: "Delete failed",
    };
    return dict[key] ?? key;
  };

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

  useEffect(() => {
    setChatLog([]);
    setTextChatLog([]);
  }, [language]);

  useEffect(() => {
    setChatLog([]);
    setTextChatLog([]);
  }, [selectedDataset]);

  const debugLog = (message: string, data?: any) => {
    console.log(`[DEBUG] ${message}`, data || '');
    if (debugMode) {
      showToast(`DEBUG: ${message}`, 'debug');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'debug') => {
    setToast({ message, type });
  };

  const formatAssistantText = (input: string): string => {
    if (!input) return "";
    let text = input.replace(/\r\n?/g, "\n");
    // Fix malformed markdown like "**Heading:* *" by removing stray "* *"
    text = text.replace(/\*\s*\*/g, "");
    text = text.replace(/^\s*#{1,6}\s+(.*)$/gm, (_m, p1) => `**${p1.trim()}**`);
    // Ensure list bullets start on new lines
    text = text.replace(/([^\n])\s*-\s(?=\S)/g, (_m, _p1) => `${_m[0]}\n- `).replace(/^\s*-\s+/gm, "- ");
    text = text.replace(/([^\n])\s*\*\s(?=\S)/g, (_m, _p1) => `${_m[0]}\n* `).replace(/^\s*\*\s+/gm, "* ");
    // Numbered lists (1. or 1)) start on new lines
    text = text.replace(/([^\n])\s*(\d+)[\.)]\s(?=\S)/g, (_m, p1, p2) => `${p1}\n${p2}. `);
    text = text.replace(/\n{3,}/g, "\n\n");
    // Convert ASCII digits to Arabic-Indic when Arabic is selected
    if (language === 'ar') {
      const arabicDigitsMap: Record<string, string> = { '0': '٠','1': '١','2': '٢','3': '٣','4': '٤','5': '٥','6': '٦','7': '٧','8': '٨','9': '٩' };
      text = text.replace(/[0-9]/g, (d) => arabicDigitsMap[d] || d);
    }
    return text;
  };

  const loadDatasets = async () => {
    try {
      const res = await fetch(`${FASTAPI_BASE_URL}/available-datasets`);
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
      showToast(t('toast_select_csv'), "error");
      return;
    }

    debugLog(`Selected file: ${selectedFile.name}, size: ${selectedFile.size}, type: ${selectedFile.type}`);

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      debugLog("File extension validation failed");
      showToast(t('toast_csv_only'), "error");
      return;
    }

    setIsUploading(true);
    debugLog("Upload state set to true");

    try {
      debugLog("Creating FormData");
      const formData = new FormData();
      formData.append("file", selectedFile);
      debugLog("FormData created and file appended");

      const requestUrl = `${FASTAPI_BASE_URL}/upload-csv`;
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
        showToast(data.message || t('toast_upload_success'), "success");
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
        showToast(data.detail || data.message || t('toast_upload_failed'), "error");
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
    showToast(t('toast_delete_select'), "error");
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

    const response = await fetch(`${FASTAPI_BASE_URL}/delete`, {
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
        showToast(data.message || t('toast_delete_success'), "success");
        setFileToDelete("");
        await loadDatasets();
        
        if (selectedDataset === fileToDelete) { // Compare with display name
          setSelectedDataset("");
          debugLog("Cleared selected dataset as it was deleted");
        }
      } else {
        showToast(data.detail || t('toast_delete_failed'), "error");
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
    // setChatLog((prev) => [...prev, `Debug: Sending to ${dataset} with model ${model}`]);
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({ prompt, dataset, model });
      const res = await fetch(`${FASTAPI_BASE_URL}/llm-chat?${queryParams.toString()}`, {
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
          const imageRes = await fetch(`${FASTAPI_BASE_URL}${json.imageUrl}`);
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
      setTextChatLog((prev) => [...prev, (language === 'ar' ? 'خطأ: يرجى إدخال رسالة' : 'Error: Please enter a message')]);
      return;
    }

    const userMessage = textChatInput.trim();
    setTextChatLog((prev) => [...prev, `${language === 'ar' ? 'أنت' : 'You'}: ${userMessage}`]);
    setTextChatLoading(true);

    try {
      const queryParams = new URLSearchParams({ prompt: userMessage, lang: language });
      if (selectedDataset) {
        queryParams.append('dataset', selectedDataset);
      }
      
      const res = await fetch(`${FASTAPI_BASE_URL}/text-chat?${queryParams.toString()}`, {
        method: "POST",
        headers: { Accept: "text/plain" },
      });

      if (!res.ok || !res.body) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      // Seed bot message
      const botLabel = (language === 'ar' ? 'الروبوت' : 'Bot');
      setTextChatLog((prev) => [...prev, `${botLabel}: `]);
      streamBufferRef.current = "";

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamBufferRef.current += chunk;
        const formatted = formatAssistantText(streamBufferRef.current);
        setTextChatLog((prev) => {
          const copy = [...prev];
          const last = copy.length - 1;
          copy[last] = `${botLabel}: ${formatted}`;
          return copy;
        });
      }
      
    } catch (err: any) {
      console.error("Text chat error:", err);
      setTextChatLog((prev) => [...prev, `${language === 'ar' ? 'خطأ' : 'Error'}: ${err.message}`]);
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

    if (entryStr.startsWith("Bot:") || entryStr.startsWith("الروبوت:")) {
      const botLabel = language === 'ar' ? 'الروبوت' : 'Bot';
      const raw = entryStr.replace(`${botLabel}: `, "").trim();
      const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const html = escapeHtml(raw)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1<\/strong>')
        .replace(/`([^`]+)`/g, '<code>$1<\/code>')
        .replace(/\n/g, '<br/>');
      return (
        <div key={index} className={`flex justify-start animate-slideInLeft ${language === 'ar' ? 'text-right' : ''}`}>
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs lg:max-w-md shadow-sm">
            <div className="flex items-start gap-2">
              <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
              <div className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: html }} />
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

    if (entry.startsWith("Bot:") || entry.startsWith("الروبوت:")) {
      const botLabel = language === 'ar' ? 'الروبوت' : 'Bot';
      const raw = entry.replace(`${botLabel}: `, "").trim();
      const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const html = escapeHtml(raw)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1<\/strong>')
        .replace(/`([^`]+)`/g, '<code>$1<\/code>')
        .replace(/\n/g, '<br/>');
      return (
        <div key={index} className={`flex justify-start animate-slideInLeft ${language === 'ar' ? 'text-right' : ''}`}>
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs lg:max-w-md shadow-sm">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
              <div className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: html }} />
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
            <h2 className="text-xl font-bold text-gray-900">{t('file_manager')}</h2>
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
              <h3 className="text-lg font-semibold text-gray-800">{t('upload_dataset')}</h3>
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
                  <span className="text-sm font-medium text-gray-700">{t('click_select_csv')}</span>
                  <p className="text-xs text-gray-500 mt-1">{t('supported_csv_only')}</p>
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
                  {t('uploading')}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {t('upload_csv')}
                </>
              )}
            </button>
          </div>

          {/* Delete Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">{t('delete_dataset')}</h3>
            </div>

            <div className="space-y-3">
              <select
                value={fileToDelete}
                onChange={(e) => setFileToDelete(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              >
                <option value="">{t('select_csv_option')}</option>
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
                    {t('deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t('delete_file')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Available Datasets */}
          {/* <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">{t('available_datasets_count')} ({datasets.length})</h3>
            </div>
            
            {datasets.length === 0 ? (
              <div className="text-center py-6">
                <Database className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t('no_csv_yet')}</p>
                <p className="text-gray-400 text-xs mt-1">{t('upload_first_hint')}</p>
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
                        <p className="text-xs text-gray-500">{t('dataset_n')} {index + 1}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> */}

        <Settings/>
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
                <label className="font-semibold text-gray-800">{t('dataset_label')}</label>
              </div>

              <select
                className="flex-1 max-w-xs border border-gray-300 rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
              >
                <option value="">{t('select_dataset_placeholder')}</option>
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
                title={t('toggle_text_chat')}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{t('text_chat_button')}</span>
              </button>

              {selectedDataset && !isTextChatMode && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t('connected')}
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
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('ready_title')}</h3>
                      <p className="text-gray-500 text-sm max-w-md mx-auto">{t('ready_hint')}</p>
                    </div>
                  )}
                  {chatLog.map(renderChatEntry)}
                  {loading && (
                       <div className="flex justify-start animate-fadeIn">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600">{t('analyzing_data')}</span>
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
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">{language === 'ar' ? 'مساعد الدردشة النصية' : 'Text Chat Assistant'}</h3>
                      <p className="text-gray-500 text-sm max-w-md mx-auto">
                        {selectedDataset 
                          ? (language === 'ar' ? `اسألني عن مجموعة البيانات "${selectedDataset}" أو أي شيء آخر!` : `Ask me questions about the "${selectedDataset}" dataset or anything else!`)
                          : (language === 'ar' ? 'اسألني أي شيء! اختر مجموعة بيانات بالأعلى للحصول على رؤى خاصة بالبيانات.' : 'Ask me anything! Select a dataset above to get data-specific insights.')
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
                          <span className="text-sm text-gray-600">{language === 'ar' ? 'جاري التفكير...' : 'Thinking...'}</span>
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
                className={`w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 ${isTextChatMode && (language === 'ar') ? 'text-right' : ''}`}
                  value={isTextChatMode ? textChatInput : chatInput}
                  onChange={(e) => isTextChatMode ? setTextChatInput(e.target.value) : setChatInput(e.target.value)}
                  placeholder={
                    isTextChatMode 
                    ? (selectedDataset
                        ? (language === 'ar' ? `اسأل عن مجموعة بيانات ${selectedDataset} أو أي شيء آخر...` : `Ask about the ${selectedDataset} dataset or anything else...`)
                        : (language === 'ar' ? 'اسألني أي شيء أو اختر مجموعة بيانات للحصول على رؤى...' : 'Ask me anything or select a dataset for data insights...'))
                    : (language === 'ar' ? 'اطلب مني إنشاء رسوم، تحليل البيانات، أو توليد الرؤى...' : 'Ask me to create charts, analyze data, or generate insights...')
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
                <span className="font-medium">{language === 'ar' ? 'الوضع' : 'Mode'}:</span> {isTextChatMode ? (language === 'ar' ? 'دردشة نصية' : 'Text Chat') : (language === 'ar' ? 'تصوّر البيانات' : 'Data Visualization')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedDataset && !isTextChatMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-700">
                <span className="font-medium">{language === 'ar' ? 'مجموعة البيانات' : 'Dataset'}:</span> {selectedDataset || (language === 'ar' ? 'لا شيء' : 'None')}
                {isTextChatMode && selectedDataset && <span className="text-green-600 ml-1">{language === 'ar' ? '(نشطة في الدردشة)' : '(Active in chat)'}</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                <span className="font-medium">{language === 'ar' ? 'المتوفر' : 'Available'}:</span> {datasets.length > 0 ? `${datasets.length} ${language === 'ar' ? 'مجموعات' : 'datasets'}` : (language === 'ar' ? 'جارٍ التحميل...' : 'Loading...')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}