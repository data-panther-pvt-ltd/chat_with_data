import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';

const ExpandableChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Luna, your AI companion. I'm here to help, chat, and assist you with anything you need. How can I brighten your day?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const generateBotResponse = (userMessage: string) => {
    const responses = [
      "That's an interesting question! Let me help you with that.",
      "I understand what you're asking. Here's what I think...",
      "Great question! Based on what you've shared, I'd suggest...",
      "Thanks for sharing that with me. Here's my response...",
      "I see what you mean. Let me provide some insights on that.",
      "That's a thoughtful inquiry. Here's how I can assist...",
      "I appreciate you reaching out. Here's what I recommend...",
      "Excellent point! Let me elaborate on that for you.",
    ];
    
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Hello there! I'm Luna, and it's wonderful to meet you. What would you like to explore together today?";
    }
    
    if (userMessage.toLowerCase().includes('help')) {
      return "I'm Luna, and I'm here to help! You can ask me questions, seek advice, brainstorm ideas, or just have a friendly conversation. What's on your mind?";
    }
    
    if (userMessage.toLowerCase().includes('thank')) {
      return "You're absolutely welcome! I'm Luna, and helping you makes me happy. Is there anything else I can assist you with?";
    }
    
    return responses[Math.floor(Math.random() * responses.length)] + " " + 
           "Feel free to ask me more questions or share more details if you'd like!";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: generateBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: { key: string; shiftKey: any; preventDefault: () => void; }) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className={`mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out ${
          isMinimized ? 'w-80 h-16' : 'w-80 sm:w-96 h-[500px] sm:h-[600px]'
        } max-w-[90vw] max-h-[80vh]`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-600 text-white rounded-t-2xl">
            {/* Close button at the top */}
            <div className="flex justify-end p-2">
              <button
                onClick={toggleChatbot}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Bot info and minimize button */}
            <div className="flex items-center justify-between px-4 pb-4 -mt-2">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">Apex AI</h3>
                  <p className="text-xs opacity-90">Your intelligent companion</p>
                </div>
              </div>
              <button
                onClick={toggleMinimize}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-3 sm:p-4 h-80 sm:h-85 overflow-y-auto bg-gray-50">
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[250px] sm:max-w-xs ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {message.sender === 'user' ? <User size={12} className="sm:w-4 sm:h-4" /> : <Bot size={12} className="sm:w-4 sm:h-4" />}
                        </div>
                        <div className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}>
                          <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 max-w-[250px] sm:max-w-xs">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                          <Bot size={12} className="sm:w-4 sm:h-4" />
                        </div>
                        <div className="px-3 py-2 sm:px-4 sm:py-2 bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 bg-white border-t border-gray-200 rounded-b-2xl">
                <div className="flex space-x-2">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    rows={1}
                    style={{ minHeight: '36px', maxHeight: '100px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChatbot}
          className="bg-gradient-to-r from-blue-900 to-slate-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default ExpandableChatbot;




// Updated ExpandableChatbot Component
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   MessageCircle, X, Send, Bot, User, Minimize2, Maximize2,
// } from 'lucide-react';

// const ExpandableChatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Hello! I'm Luna, your AI companion. I'm here to help, chat, and assist you with anything you need. How can I brighten your day?",
//       sender: 'bot',
//       timestamp: new Date(),
//     },
//   ]);
//   const [inputText, setInputText] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const inputRef = useRef<HTMLTextAreaElement | null>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (isOpen && !isMinimized) inputRef.current?.focus();
//   }, [isOpen, isMinimized]);

// //   const sendToBackend = async (text) => {
// //   try {
// //     const response = await fetch(
// //       `http://localhost:8000/llm-chat?prompt=${encodeURIComponent(text)}&dataset=gdp&model=deepseek`,
// //       {
// //         method: 'POST',
// //       }
// //     );
// //     const data = await response.json();
// //     return data.reply || data.code_used || "I'm not sure how to respond to that.";
// //   } catch (error) {
// //     console.error('Error from backend:', error);
// //     return "Sorry, I couldn't reach the server.";
// //   }
// // };
// interface BackendResponse {
//   reply?: string;
//   code_used?: string;
//   [key: string]: any;
// }

// const sendToBackend = async (text: string): Promise<string> => {
//   const prompt = text;
//   const dataset = "gdp"; // You can make this dynamic if needed
//   const model = "deepseek"; // Or make it a dropdown selection

//   const queryParams = new URLSearchParams({
//     prompt,
//     dataset,
//     model,
//   });

//   try {
//     const response = await fetch(`http://localhost:8000/llm-chat?${queryParams.toString()}`, {
//       method: 'POST',
//     });

//     const data: BackendResponse = await response.json();
//     return data.reply || data.code_used || "I'm not sure how to respond to that.";
//   } catch (error) {
//     console.error('Error from backend:', error);
//     return "Sorry, I couldn't reach the server.";
//   }
// };

  

//   const handleSendMessage = async () => {
//     if (!inputText.trim()) return;

//     const userMessage = {
//       id: messages.length + 1,
//       text: inputText,
//       sender: 'user',
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputText('');
//     setIsTyping(true);

//     const replyText = await sendToBackend(inputText);

//     const botMessage = {
//       id: messages.length + 2,
//       text: replyText,
//       sender: 'bot',
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, botMessage]);
//     setIsTyping(false);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const formatTime = (date) =>
//     date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//   const toggleChatbot = () => {
//     setIsOpen(!isOpen);
//     setIsMinimized(false);
//   };

//   const toggleMinimize = () => setIsMinimized(!isMinimized);

//   return (
//     <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
//       {isOpen && (
//         <div
//           className={`mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out ${
//             isMinimized ? 'w-80 h-16' : 'w-80 sm:w-96 h-[500px] sm:h-[600px]'
//           } max-w-[90vw] max-h-[80vh]`}
//         >
//           <div className="bg-gradient-to-r from-blue-900 to-slate-600 text-white rounded-t-2xl">
//             <div className="flex justify-end p-2">
//               <button
//                 onClick={toggleChatbot}
//                 className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//             <div className="flex items-center justify-between px-4 pb-4 -mt-2">
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
//                   <Bot size={16} className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg">Apex AI</h3>
//                   <p className="text-xs opacity-90">Your intelligent companion</p>
//                 </div>
//               </div>
//               <button
//                 onClick={toggleMinimize}
//                 className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
//               >
//                 {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
//               </button>
//             </div>
//           </div>

//           {!isMinimized && (
//             <>
//               <div className="flex-1 p-4 h-80 sm:h-85 overflow-y-auto bg-gray-50">
//                 <div className="space-y-4">
//                   {messages.map((msg) => (
//                     <div
//                       key={msg.id}
//                       className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//                     >
//                       <div
//                         className={`flex items-start space-x-2 max-w-xs ${
//                           msg.sender === 'user'
//                             ? 'flex-row-reverse space-x-reverse'
//                             : ''
//                         }`}
//                       >
//                         <div
//                           className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
//                             msg.sender === 'user'
//                               ? 'bg-blue-600 text-white'
//                               : 'bg-gray-200 text-gray-600'
//                           }`}
//                         >
//                           {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
//                         </div>
//                         <div
//                           className={`px-4 py-2 rounded-2xl ${
//                             msg.sender === 'user'
//                               ? 'bg-blue-600 text-white rounded-br-md'
//                               : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
//                           }`}
//                         >
//                           <p className="text-sm leading-relaxed">{msg.text}</p>
//                           <p
//                             className={`text-xs mt-1 ${
//                               msg.sender === 'user'
//                                 ? 'text-blue-100'
//                                 : 'text-gray-500'
//                             }`}
//                           >
//                             {formatTime(msg.timestamp)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   {isTyping && (
//                     <div className="flex justify-start">
//                       <div className="flex items-start space-x-2 max-w-xs">
//                         <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
//                           <Bot size={12} />
//                         </div>
//                         <div className="px-4 py-2 bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md">
//                           <div className="flex space-x-1">
//                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                             <div
//                               className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                               style={{ animationDelay: '0.1s' }}
//                             ></div>
//                             <div
//                               className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                               style={{ animationDelay: '0.2s' }}
//                             ></div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <div ref={messagesEndRef} />
//               </div>

//               <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
//                 <div className="flex space-x-2">
//                   <textarea
//                     ref={inputRef}
//                     value={inputText}
//                     onChange={(e) => setInputText(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Type your message..."
//                     className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     rows="1"
//                     style={{ minHeight: '36px', maxHeight: '100px' }}
//                   />
//                   <button
//                     onClick={handleSendMessage}
//                     disabled={!inputText.trim()}
//                     className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
//                   >
//                     <Send size={16} />
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       {!isOpen && (
//         <button
//           onClick={toggleChatbot}
//           className="bg-gradient-to-r from-blue-900 to-slate-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
//         >
//           <MessageCircle size={24} />
//         </button>
//       )}
//     </div>
//   );
// };

// export default ExpandableChatbot;



