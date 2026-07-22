"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Sparkles, Code, Briefcase, FileText, MessagesSquare, DollarSign, Building } from "lucide-react";
import apiClient from "@/lib/api-client";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "coach";
  content: string;
}

const COACH_TOPICS = [
  { id: "career", title: "Career Guidance", icon: Briefcase, prompt: "I need some career guidance for my next step." },
  { id: "resume", title: "Resume Advice", icon: FileText, prompt: "Can you give me some advice on how to improve my resume?" },
  { id: "interview", title: "Interview Advice", icon: MessagesSquare, prompt: "What are some general tips for an upcoming interview?" },
  { id: "coding", title: "Coding Advice", icon: Code, prompt: "How can I improve my data structures and algorithms coding skills?" },
  { id: "behavioral", title: "Behavioral Interview Advice", icon: User, prompt: "How should I prepare for a behavioral interview?" },
  { id: "system_design", title: "System Design Advice", icon: Sparkles, prompt: "I need help preparing for a System Design interview." },
  { id: "salary", title: "Salary Negotiation Tips", icon: DollarSign, prompt: "Do you have any tips for salary negotiation?" },
  { id: "company", title: "Company Preparation", icon: Building, prompt: "How should I prepare for a specific company's interview process?" },
];

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiClient.get("/coach/history");
        if (res.data?.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };
    fetchHistory();
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiClient.post("/coach/chat", { message: text });
      
      if (response.data?.success) {
        setMessages((prev) => [...prev, { role: "coach", content: response.data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "coach", content: "Sorry, I couldn't process that right now." }]);
      }
    } catch (error) {
      console.error("Coach chat error:", error);
      setMessages((prev) => [...prev, { role: "coach", content: "Sorry, an error occurred while connecting to the AI Brain." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pl-2 border-b border-white/5 pb-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            InterviewOS AI Career Coach <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Online</span>
          </h1>
          <p className="text-sm text-slate-400">Your personalized AI Career Mentor</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar flex flex-col gap-6">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full my-auto text-center px-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center mb-6 shadow-xl">
                <Sparkles size={32} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">How can I help you today?</h2>
              <p className="text-slate-400 mb-8 max-w-lg">
                I have full access to your InterviewOS telemetry, past coding sessions, and resume. Select a topic below or ask me anything.
              </p>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                {COACH_TOPICS.map((topic, i) => (
                  <motion.button
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSendMessage(topic.prompt)}
                    className="flex flex-col items-start gap-3 p-4 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/5 shadow-xl hover:bg-white/[0.05] hover:border-purple-500/30 transition-all group text-left h-full"
                  >
                    <div className="p-2 rounded-lg bg-white/5 text-slate-300 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                      <topic.icon size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-200">{topic.title}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" 
                    ? "bg-slate-800 text-slate-300" 
                    : "bg-purple-500/20 text-purple-400"
                }`}>
                  {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-xl ${
                  msg.role === "user" 
                    ? "bg-blue-600/90 backdrop-blur-md text-white rounded-tr-sm border border-blue-500/30" 
                    : "bg-white/[0.03] backdrop-blur-md text-slate-200 border border-white/10 rounded-tl-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/10"
                }`}>
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
              </motion.div>
            ))
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 px-5 py-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask InterviewOS AI Career Coach anything..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          className="absolute right-2 p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
