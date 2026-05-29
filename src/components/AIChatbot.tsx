import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Maximize2, Minimize2, Bot, User, Sparkles, Paperclip, Mic, MicOff, CheckCircle2, XCircle, Volume2, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Papa from "papaparse";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { chatEvents, TABLE_QUERY_KEYS } from "@/lib/chatEvents";

type Msg = { role: "user" | "assistant"; content: string; timestamp?: number; actionResults?: any[] };

const isProd = import.meta.env.PROD;
const proxyUrl = typeof window !== 'undefined' ? `${window.location.origin}/supabase-api` : '';
const baseUrl = isProd && proxyUrl ? proxyUrl : import.meta.env.VITE_SUPABASE_URL;
const CHAT_URL = `${baseUrl}/functions/v1/ai-chat`;
const STORAGE_KEY = "medflow-ai-chat-history";

const SUGGESTIONS = [
  { icon: "🏥", text: "Show all active patients", cat: "query" },
  { icon: "➕", text: "Admit a new patient", cat: "action" },
  { icon: "📅", text: "List today's appointments", cat: "query" },
  { icon: "🛏️", text: "Check available beds", cat: "query" },
  { icon: "🩺", text: "Schedule an appointment", cat: "action" },
  { icon: "🚨", text: "Show active alerts", cat: "query" },
  { icon: "💊", text: "List active medications", cat: "query" },
  { icon: "💵", text: "Show pending bills", cat: "query" },
];

function loadHistory(): Msg[] {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) { const m = JSON.parse(r); if (m.length) return m; } } catch {} return [];
}
function saveHistory(m: Msg[]) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m.slice(-100))); } catch {} }

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(loadHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const { role } = useAuth();

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => { saveHistory(messages); }, [messages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "K") { e.preventDefault(); setOpen(p => !p); }
      if (e.key === "Escape" && open) { if (expanded) setExpanded(false); else setOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, expanded]);

  const handleActionResults = useCallback((results: any[]) => {
    results.forEach(r => {
      if (r.ok && r.table) {
        const keys = TABLE_QUERY_KEYS[r.table] || [r.table];
        keys.forEach(k => queryClient.invalidateQueries({ queryKey: [k] }));
        // Pass the full result including record/id so context can merge locally
        chatEvents.emit("action", { table: r.table, op: r.op, record: r.record, id: r.id });
      }
    });
  }, [queryClient]);

  const send = async (extraContent?: string) => {
    const content = extraContent || input.trim();
    if (!content || loading) return;
    const userMsg: Msg = { role: "user", content, timestamp: Date.now() };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setLoading(true);

    let assistantContent = "";
    let actionResults: any[] = [];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ messages: allMsgs.slice(-10).map(m => ({ role: m.role, content: m.content })), role: role || "admin" }),
      });

      if (!resp.ok) { const e = await resp.json().catch(() => null); throw new Error(e?.error || `Error ${resp.status}`); }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string) => {
        if (!line.startsWith("data: ")) return;
        const j = line.slice(6).trim();
        if (j === "[DONE]") return;
        try {
          const parsed = JSON.parse(j);
          if (parsed.action_results) { actionResults = parsed.action_results; return; }
          const c = parsed.choices?.[0]?.delta?.content;
          if (c) {
            assistantContent += c;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > allMsgs.length) return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              return [...prev, { role: "assistant", content: assistantContent, timestamp: Date.now() }];
            });
          }
        } catch {}
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl); buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          processLine(line);
        }
      }
      if (buffer.trim()) buffer.split("\n").forEach(processLine);

      if (!assistantContent) setMessages(prev => [...prev, { role: "assistant", content: "I couldn't generate a response. Please try again.", timestamp: Date.now() }]);

      if (actionResults.length > 0) {
        handleActionResults(actionResults);
        setMessages(prev => { const last = prev[prev.length - 1]; if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, actionResults } : m); return prev; });
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${err.message || "Something went wrong."}`, timestamp: Date.now() }]);
    } finally { setLoading(false); }
  };

  const toggleVoice = () => {
    if (recording) { recognitionRef.current?.stop(); setRecording(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice not supported. Use Chrome or Edge."); return; }
    const r = new SR(); r.continuous = false; r.interimResults = true; r.lang = "en-US";
    r.onresult = (e: any) => { const t = Array.from(e.results).map((x: any) => x[0].transcript).join(""); setInput(t); if (e.results[0]?.isFinal) { setRecording(false); setTimeout(() => { if (t.trim()) send(t.trim()); }, 300); } };
    r.onerror = () => setRecording(false); r.onend = () => setRecording(false);
    recognitionRef.current = r; r.start(); setRecording(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.name.endsWith(".csv")) {
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => { send(`Uploaded CSV "${file.name}" with ${res.data.length} rows. Preview:\n\`\`\`json\n${JSON.stringify(res.data.slice(0,5),null,2)}\n\`\`\`\nAnalyze this data.`); } });
    } else { send(`Uploaded file: "${file.name}" (${(file.size/1024).toFixed(1)} KB). Help me with this.`); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearHistory = () => { setMessages([]); localStorage.removeItem(STORAGE_KEY); };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const chatSize = expanded
    ? "fixed inset-0 z-[100]"
    : "fixed bottom-24 right-4 lg:bottom-6 lg:right-6 w-[420px] h-[600px] z-[100] rounded-3xl";
  const roleLabel = (role || "admin").charAt(0).toUpperCase() + (role || "admin").slice(1);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-[100] w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center animate-pulse-glow"
            title="Open MedFlow AI (Ctrl+Shift+K)"
          >
            <Sparkles size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            {expanded && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[99]" onClick={() => setExpanded(false)} />}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`${chatSize} ${expanded ? "bg-background" : "glass-card"} flex flex-col overflow-hidden shadow-2xl`}
              style={expanded ? {} : { boxShadow: "0 25px 80px -12px hsl(var(--primary) / 0.2)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center relative">
                    <Bot size={18} className="text-primary" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-sm">MedFlow AI Co-Pilot</h3>
                    <p className="text-muted-foreground text-[10px]">Full CRUD • Real-time • Voice enabled</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={clearHistory} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" title="New chat"><Plus size={14} /></button>
                  <button onClick={() => setExpanded(!expanded)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" title={expanded ? "Minimize" : "Expand"}>
                    {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  <button onClick={() => { setOpen(false); setExpanded(false); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" title="Close (Esc)">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-2 text-center space-y-6 mt-8 mb-8">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg mx-auto">
                      <Sparkles size={28} className="text-primary" />
                    </motion.div>
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                      <h2 className="text-xl font-bold text-foreground">How can I help you today?</h2>
                      <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">Manage patients, beds, appointments, and more with AI commands.</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg mt-4 mx-auto">
                      {SUGGESTIONS.slice(0, 6).map((s, i) => (
                        <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                          onClick={() => send(s.text)}
                          className="text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary/80 border border-border/30 hover:border-primary/40 transition-all flex items-start gap-3"
                        >
                          <span className="text-lg leading-none">{s.icon}</span>
                          <span className="text-xs text-muted-foreground font-medium">{s.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`space-y-4 ${expanded ? "max-w-3xl mx-auto" : ""}`}>
                    {messages.map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                          {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
                        </div>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary/60 text-foreground rounded-bl-md"}`}>
                          {msg.role === "assistant" ? (
                            <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-td:p-2 prose-th:p-2 prose-table:border-collapse prose-th:border prose-th:border-border/40 prose-td:border prose-td:border-border/40 prose-th:bg-secondary/60">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            </div>
                          ) : msg.content}
                          {msg.actionResults && msg.actionResults.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/20">
                              {msg.actionResults.map((r: any, j: number) => (
                                <span key={j} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.ok ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                                  {r.ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                  {r.action?.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {loading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Bot size={14} /></div>
                        <div className="bg-secondary/60 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-muted-foreground text-xs">Analyzing records...</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/30 bg-card">
                <div className={`${expanded ? "max-w-3xl mx-auto" : ""}`}>
                  <div className="flex gap-2 items-end">
                    <button onClick={() => fileRef.current?.click()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors flex-shrink-0" title="Upload file"><Paperclip size={15} /></button>
                    <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.pdf,.png,.jpg" className="hidden" onChange={handleFileUpload} />
                    <button onClick={toggleVoice} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0 ${recording ? "bg-destructive/20 text-destructive ring-2 ring-destructive/30" : "bg-secondary hover:bg-secondary/80 text-muted-foreground"}`} title={recording ? "Stop" : "Voice"}>
                      {recording ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}><MicOff size={15} /></motion.div> : <Mic size={15} />}
                    </button>
                    <textarea ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                      placeholder={recording ? "🎤 Listening..." : "Ask anything or give a command..."}
                      rows={1} disabled={loading || recording}
                      className="flex-1 bg-secondary/60 text-foreground text-sm px-4 py-2.5 rounded-xl outline-none border border-border/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 resize-none max-h-[120px] min-h-[40px]"
                      style={{ height: "40px" }}
                    />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => send()} disabled={loading || !input.trim()}
                      className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-opacity flex-shrink-0" title="Send">
                      <Send size={15} />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <span className="text-muted-foreground/40 text-[9px]">Shift+Enter new line • Ctrl+Shift+K toggle</span>
                    {recording && <span className="text-destructive text-[10px] font-semibold animate-pulse flex items-center gap-1"><Volume2 size={10} /> Recording...</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;