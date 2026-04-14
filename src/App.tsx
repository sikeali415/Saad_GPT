import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, BookOpen, MessageSquare, Settings, ImageIcon, Info, Phone, Mail, MapPin, Menu, Download, Volume2, VolumeX, Trash2 } from "lucide-react";
import { NeumorphicCard, NeumorphicInput, NeumorphicButton } from "@/src/components/Neumorphic";
import { chatWithAI, generateImage } from "@/src/lib/gemini";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: number;
  type?: "text" | "image";
}

type Section = "menu" | "chat" | "learn" | "images" | "about" | "contact";

export default function App() {
  const [userName, setUserName] = useState("Maliksaad");
  const [activeSection, setActiveSection] = useState<Section>("menu");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [learnMessages, setLearnMessages] = useState<Message[]>([]);
  const [imageMessages, setImageMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-preview-09-2025");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem("saadgpt_chat_history");
    const savedLearn = localStorage.getItem("saadgpt_learn_history");
    const savedImages = localStorage.getItem("saadgpt_image_history");

    if (savedChat) setChatMessages(JSON.parse(savedChat));
    if (savedLearn) setLearnMessages(JSON.parse(savedLearn));
    if (savedImages) setImageMessages(JSON.parse(savedImages));

    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (chatMessages.length > 0) localStorage.setItem("saadgpt_chat_history", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (learnMessages.length > 0) localStorage.setItem("saadgpt_learn_history", JSON.stringify(learnMessages));
  }, [learnMessages]);

  useEffect(() => {
    if (imageMessages.length > 0) localStorage.setItem("saadgpt_image_history", JSON.stringify(imageMessages));
  }, [imageMessages]);

  const messages = activeSection === "chat" ? chatMessages : activeSection === "learn" ? learnMessages : activeSection === "images" ? imageMessages : [];
  const setMessages = activeSection === "chat" ? setChatMessages : activeSection === "learn" ? setLearnMessages : setImageMessages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeSection]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    if (activeSection === "images") {
      const imageUrl = await generateImage(currentInput);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: imageUrl || "I'm sorry, Sir. I couldn't generate that image.",
          timestamp: Date.now(),
          type: imageUrl ? "image" : "text",
        },
      ]);
    } else {
      const history = messages.filter(m => m.type !== "image").map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content,
      }));

      const aiResponse = await chatWithAI(currentInput, history, userName, activeSection, selectedModel);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: aiResponse || "I'm sorry, Sir. I couldn't process that.",
          timestamp: Date.now(),
        },
      ]);
    }
    setIsLoading(false);
  };

  const downloadChat = () => {
    const chatText = messages
      .map((m) => `${m.role === "user" ? "User" : "Saad GPT"}: ${m.content}`)
      .join("\n\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SaadGPT_Chat_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const readAloud = (text: string) => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsReading(false);
    setIsReading(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isAppLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#dde2e8]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-[#dde2e8] shadow-[8px_8px_16px_#a4afc2,-8px_-8px_16px_#ffffff] flex items-center justify-center">
            <Bot className="w-12 h-12 text-[#4c5563] animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-[#4c5563]">Saad is Getting ready</h2>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-[#4c5563] rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-[#4c5563] rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-3 h-3 bg-[#4c5563] rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </motion.div>
      </div>
    );
  }

  const clearHistory = () => {
    if (activeSection === "chat") {
      setChatMessages([]);
      localStorage.removeItem("saadgpt_chat_history");
    } else if (activeSection === "learn") {
      setLearnMessages([]);
      localStorage.removeItem("saadgpt_learn_history");
    } else if (activeSection === "images") {
      setImageMessages([]);
      localStorage.removeItem("saadgpt_image_history");
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "menu":
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-[#4c5563] mb-2">Saad is Ready to Answer You</h1>
              <p className="text-[#8c98a9]">Welcome back, Sir. Your conversations are saved and ready.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
              {[
                { id: "chat", icon: MessageSquare, label: "AI Chat", desc: "General Assistant" },
                { id: "learn", icon: BookOpen, label: "Learn Mode", desc: "Taleem360 & Notes" },
                { id: "images", icon: ImageIcon, label: "Image Gen", desc: "Create AI images" },
                { id: "about", icon: Info, label: "About App", desc: "App and Owner info" },
                { id: "contact", icon: Phone, label: "Contact", desc: "Get in touch" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as Section)}
                  className="group p-6 rounded-2xl bg-[#dde2e8] shadow-[6px_6px_12px_#a4afc2,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#a4afc2,inset_-4px_-4px_8px_#ffffff] transition-all text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-[#dde2e8] shadow-[4px_4px_8px_#a4afc2,-4px_-4px_8px_#ffffff] group-hover:shadow-none transition-all">
                      <item.icon className="w-6 h-6 text-[#4c5563]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4c5563]">{item.label}</h3>
                      <p className="text-xs text-[#8c98a9]">{item.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case "chat":
      case "learn":
      case "images":
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeSection === "learn" && (
              <div className="px-4 py-2 bg-[#dde2e8] border-b border-[#a4afc2]/20 flex flex-wrap gap-2">
                <span className="text-[10px] font-bold text-[#4c5563] uppercase opacity-50">Sources:</span>
                {["Taleem360", "ClassNotes", "Google", "YouTube"].map(s => (
                  <Badge key={s} variant="outline" className="text-[9px] py-0 h-4 bg-[#dde2e8] shadow-[1px_1px_2px_#a4afc2,-1px_-1px_2px_#ffffff] border-none text-[#4c5563]">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {messages.length === 0 && (
                    <div className="text-center py-10 text-[#8c98a9]">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>How can I help you today, Sir?</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.timestamp + idx}
                      initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}>
                        <div className={`flex-shrink-0 mb-1 ${msg.role === "user" ? "ml-2" : "mr-2"}`}>
                          <Avatar className="w-8 h-8 shadow-[2px_2px_4px_#a4afc2,-2px_-2px_4px_#ffffff]">
                            <AvatarFallback className="bg-[#dde2e8] text-xs font-bold">
                              {msg.role === "user" ? "U" : "AI"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div
                          className={`p-4 rounded-2xl text-sm relative group ${
                            msg.role === "user"
                              ? "bg-[#dde2e8] shadow-[inset_4px_4px_8px_#a4afc2,inset_-4px_-4px_8px_#ffffff] rounded-br-none"
                              : "bg-[#dde2e8] shadow-[4px_4px_8px_#a4afc2,-4px_-4px_8px_#ffffff] rounded-bl-none"
                          }`}
                        >
                          {msg.type === "image" ? (
                            <img src={msg.content} alt="Generated" className="rounded-lg max-w-full h-auto shadow-md" referrerPolicy="no-referrer" />
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            {msg.role === "ai" && msg.type !== "image" && (
                              <button 
                                onClick={() => readAloud(msg.content)}
                                className="p-2 rounded-full shadow-[2px_2px_4px_#a4afc2,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#a4afc2,inset_-2px_-2px_4px_#ffffff] transition-all"
                                title="Listen to message"
                              >
                                {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </button>
                            )}
                            <p className="text-[10px] opacity-50 ml-auto">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#dde2e8] shadow-[4px_4px_8px_#a4afc2,-4px_-4px_8px_#ffffff] p-4 rounded-2xl rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#4c5563] rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-[#4c5563] rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-[#4c5563] rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-[#a4afc2]/20">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <NeumorphicInput
                    className="mb-0"
                    placeholder={
                      activeSection === "images" 
                        ? "Describe the image you want me to generate, Sir..." 
                        : activeSection === "learn"
                        ? "What book or concept should we study, Sir?"
                        : `Ask me anything, Sir...`
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                </div>
                <NeumorphicButton
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="px-4 py-0 h-[50px] w-[50px] flex items-center justify-center rounded-full"
                >
                  <Send className="w-5 h-5" />
                </NeumorphicButton>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <ScrollArea className="flex-1 p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8 pb-10">
              <NeumorphicCard>
                <h2 className="text-2xl font-bold mb-4">About Saad GPT</h2>
                <p className="text-[#4c5563] leading-relaxed">
                  Saad GPT is a personalized AI assistant built exclusively for Maliksaad. 
                  Supporting multiple Gemini models including 2.5 Flash and Pro Preview, it is designed to be a versatile companion for learning, 
                  creative image generation, and intelligent conversation.
                </p>
              </NeumorphicCard>

              <NeumorphicCard>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Development Team</h2>
                  <Badge className="bg-[#e0e7ff] text-[#4f46e5] border-none font-bold uppercase tracking-wider text-[10px]">SigNify</Badge>
                </div>
                
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0f172a] to-[#334155] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    S
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">Sike</h3>
                    <p className="text-sm text-[#6b7280]">Lead Developer & Founder</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-3">Client Showcase</h4>
                    <div className="bg-[#f8fafc] border-l-4 border-[#4f46e5] p-4 rounded-r-xl shadow-sm">
                      <h5 className="font-bold text-[#0f172a] mb-1">Saad Chat</h5>
                      <div className="inline-flex items-center space-x-1 bg-[#fef3c7] text-[#d97706] px-2 py-0.5 rounded text-[10px] font-bold mb-2">
                        <span>⚡ Powered by SigNify & Gemini</span>
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        Developed a custom, mobile-responsive AI chat interface featuring text-to-speech (TTS) capabilities, downloadable conversation histories, and persistent menu navigation.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-3">Core Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {["React", "Vite", "HTML / CSS", "Google Gemini API"].map(tech => (
                        <span key={tech} className="px-3 py-1 bg-[#f1f5f9] border border-[#e2e8f0] rounded-full text-[11px] font-bold text-[#334155]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0f172a] rounded-2xl p-6 text-center">
                    <h4 className="text-white font-bold mb-2">Start Your Project</h4>
                    <p className="text-[#94a3b8] text-xs mb-4">Want an app powered by SigNify? Reach out directly.</p>
                    <div className="space-y-2">
                      <a href="tel:03401037014" className="flex items-center space-x-3 w-full p-3 bg-white rounded-xl text-[#0f172a] text-sm font-bold hover:bg-gray-100 transition-colors">
                        <Phone className="w-4 h-4 text-[#34d399]" />
                        <span>0340 1037014</span>
                      </a>
                      <a href="mailto:sikandarmalik685@gmail.com" className="flex items-center space-x-3 w-full p-3 bg-white rounded-xl text-[#0f172a] text-sm font-bold hover:bg-gray-100 transition-colors">
                        <Mail className="w-4 h-4 text-[#ea4335]" />
                        <span>sikandarmalik685@gmail.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </NeumorphicCard>

              <NeumorphicCard>
                <h2 className="text-2xl font-bold mb-4">Owner Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-[#4c5563]" />
                    <span className="font-medium">Name: Maliksaad</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-[#4c5563]" />
                    <span className="font-medium">Address: Sindh, Kashmore</span>
                  </div>
                </div>
              </NeumorphicCard>
            </motion.div>
          </ScrollArea>
        );
      case "contact":
        return (
          <ScrollArea className="flex-1 p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
              <NeumorphicCard>
                <h2 className="text-2xl font-bold mb-6 text-center">Contact Information</h2>
                <div className="grid gap-6">
                  <div className="flex items-center space-x-4 p-4 rounded-xl shadow-[inset_4px_4px_8px_#a4afc2,inset_-4px_-4px_8px_#ffffff]">
                    <Mail className="w-6 h-6 text-[#4c5563]" />
                    <div>
                      <p className="text-xs text-[#8c98a9] uppercase font-bold tracking-wider">Email</p>
                      <p className="font-medium">saadmalikm22@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 rounded-xl shadow-[inset_4px_4px_8px_#a4afc2,inset_-4px_-4px_8px_#ffffff]">
                    <Phone className="w-6 h-6 text-[#4c5563]" />
                    <div>
                      <p className="text-xs text-[#8c98a9] uppercase font-bold tracking-wider">Phone Number</p>
                      <p className="font-medium">03273571281</p>
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
            </motion.div>
          </ScrollArea>
        );
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-[#dde2e8] overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4">
          <NeumorphicCard className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#a4afc2]/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {activeSection !== "menu" && (
                  <button 
                    onClick={() => setActiveSection("menu")}
                    className="p-2 rounded-lg shadow-[2px_2px_4px_#a4afc2,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#a4afc2,inset_-2px_-2px_4px_#ffffff] flex items-center space-x-2"
                  >
                    <Menu className="w-5 h-5 text-[#4c5563]" />
                    <span className="text-xs font-bold text-[#4c5563] hidden sm:inline">Menu</span>
                  </button>
                )}
                <Badge variant="outline" className="bg-[#dde2e8] shadow-[2px_2px_4px_#a4afc2,-2px_-2px_4px_#ffffff] border-none text-[#4c5563] capitalize">
                  {activeSection === "menu" ? "Main Menu" : `${activeSection} Mode`}
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                {activeSection !== "menu" && (
                  <>
                    <Tooltip>
                      <TooltipTrigger 
                        onClick={clearHistory}
                        className="p-2 rounded-lg shadow-[2px_2px_4px_#a4afc2,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#a4afc2,inset_-2px_-2px_4px_#ffffff] transition-all mr-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </TooltipTrigger>
                      <TooltipContent>Clear History</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger 
                        onClick={downloadChat}
                        className="p-2 rounded-lg shadow-[2px_2px_4px_#a4afc2,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#a4afc2,inset_-2px_-2px_4px_#ffffff] transition-all"
                      >
                        <Download className="w-4 h-4 text-[#4c5563]" />
                      </TooltipTrigger>
                      <TooltipContent>Download Chat</TooltipContent>
                    </Tooltip>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedModel} 
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-[10px] bg-transparent border-none text-[#4c5563] font-bold focus:ring-0 cursor-pointer outline-none"
                  >
                    <option value="gemini-2.5-flash-preview-09-2025">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro-preview-09-2025">Gemini 2.5 Pro</option>
                  </select>
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
            </div>

            {renderSection()}
          </NeumorphicCard>
        </div>
      </div>
    </TooltipProvider>
  );
}
