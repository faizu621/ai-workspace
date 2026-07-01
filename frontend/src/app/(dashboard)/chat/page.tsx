"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Plus, Search, Trash2, Send, Bot, Sparkles, Paperclip,
  Image as ImageIcon, StopCircle, RefreshCw, Copy, Check, Terminal, Play,
  Settings, Loader2, ArrowUpRight, X
} from "lucide-react";
import { useChatStore, ChatMessage, Conversation, ChatFile } from "@/store/chatStore";
import { chatService } from "@/services/chatService";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const modelOptions = [
  { id: "Gemini 1.5 Pro", icon: Sparkles, desc: "Best for complex reasoning and large files" },
  { id: "Gemini 1.5 Flash", icon: Bot, desc: "Optimized for speed and quick utilities" },
  { id: "Claude 3.5 Sonnet", icon: Sparkles, desc: "High quality coding and content generation" },
  { id: "GPT-4o", icon: Bot, desc: "Balanced performance across all domains" }
];

const suggestedPrompts = [
  "Write an Amplify build config for Vite React",
  "Compare CSS Grid and Flexbox in Tailwind",
  "Generate a mock TypeScript interface for a User",
  "Create a unit test for a React Zustand store"
];

export default function ChatPage() {
  // Zustand Store hooks
  const {
    conversations, activeConversationId, isStreaming, streamingContent,
    selectConversation, startNewConversation, deleteConversation,
    updateConversationSettings, stopGeneration
  } = useChatStore();

  // Local States
  const [inputText, setInputText] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<ChatFile[]>([]);
  const [uploadText, setUploadText] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chats to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, streamingContent, isStreaming]);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const handleSendMessage = async (text: string) => {
    const prompt = text.trim();
    if (!prompt && attachedFiles.length === 0) return;
    
    setInputText("");
    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    setUploadText("");

    try {
      await aiService.sendMessage(prompt, filesToSend);
    } catch {
      toast({ title: "Failed to query AI", type: "destructive" });
    }
  };

  const handleRegenerate = async (msgId: string) => {
    try {
      await aiService.regenerateMessage(msgId);
    } catch {
      toast({ title: "Regeneration failed", type: "destructive" });
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied", description: "Text copied to clipboard", type: "success" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMockFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadText.trim()) return;
    
    const newFile: ChatFile = {
      name: uploadText,
      size: "150 KB",
      type: "application/json"
    };

    setAttachedFiles([...attachedFiles, newFile]);
    setUploadText("");
    toast({ title: "File attached", description: `'${newFile.name}' ready to upload`, type: "success" });
  };

  // Custom code highlights formatter
  const renderMessageContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        // Extract language and code
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : "code";
        const code = match ? match[2] : part.slice(3, -3);
        const codeBlockId = `${msgId}_code_${index}`;

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-border/80 shadow-md">
            {/* Code Block Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/70 text-[10px] font-mono border-b">
              <span className="uppercase text-muted-foreground font-semibold">{lang}</span>
              <button
                onClick={() => handleCopyText(code, codeBlockId)}
                className="flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors font-medium cursor-pointer"
              >
                {copiedId === codeBlockId ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy Code
                  </>
                )}
              </button>
            </div>
            {/* Pre block */}
            <pre className="p-4 bg-slate-950 dark:bg-card/30 overflow-x-auto text-[11px] font-mono text-emerald-400 leading-normal select-text">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Plain paragraphs with simple markdown replacement
      return (
        <p key={index} className="whitespace-pre-line leading-relaxed text-sm text-foreground/95 select-text">
          {part}
        </p>
      );
    });
  };

  // Sidebar Filtered List
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-130px)] flex border rounded-2xl overflow-hidden bg-card/25 backdrop-blur-md relative">
      
      {/* 1. CHAT SESSIONS SIDEBAR */}
      <aside className="w-64 border-r flex flex-col bg-card/60 shrink-0 hidden md:flex">
        
        {/* Sidebar Controls */}
        <div className="p-3 border-b space-y-2">
          <Button
            onClick={() => {
              const newId = startNewConversation();
              toast({ title: "New Chat Started", type: "success" });
            }}
            variant="outline"
            className="w-full justify-start gap-2 h-9 font-semibold text-xs border-dashed"
          >
            <Plus className="h-4 w-4" /> Start New Session
          </Button>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search chat history..."
              className="pl-8 text-xs h-8.5"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <p className="text-center text-[10px] text-muted-foreground py-8">No chats found</p>
          ) : (
            filteredConversations.map((c) => {
              const isActive = c.id === activeConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold hover:bg-muted/50 cursor-pointer transition-colors group ${
                    isActive ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1.5">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                      toast({ title: "Chat session cleared", type: "destructive" });
                    }}
                    className="text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. CHAT FEED & INPUT */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/30 justify-between relative">
        
        {/* Workspace Chat Header */}
        <header className="p-3 border-b bg-card/45 backdrop-blur-md flex items-center justify-between z-10">
          {activeConv ? (
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                AI
              </span>
              <div className="text-xs">
                <span className="font-bold text-foreground">{activeConv.title}</span>
                <span className="text-[10px] text-muted-foreground block">
                  Model: {activeConv.model} (Temp {activeConv.temperature})
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground font-semibold">Select or start a chat space</span>
          )}

          {/* Model selector dropdown */}
          {activeConv && (
            <select
              value={activeConv.model}
              onChange={(e) => updateConversationSettings(activeConv.id, { model: e.target.value })}
              className="h-8.5 border border-input rounded-xl bg-background text-[11px] px-2.5 focus:outline-none focus:ring-2 focus:ring-ring font-semibold text-muted-foreground"
            >
              {modelOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.id}</option>
              ))}
            </select>
          )}
        </header>

        {/* Main conversation feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {!activeConv ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-foreground">Next-Gen LLM Sandbox</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Start a new session on the left to write code blueprints, query databases, or analyze configurations with streaming responsiveness.
                </p>
              </div>
              <Button onClick={() => startNewConversation()} className="font-semibold text-xs h-9">
                Launch Initial Chat
              </Button>
            </div>
          ) : activeConv.messages.length === 0 ? (
            // Suggested Prompts view
            <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto space-y-6">
              <div className="text-center space-y-1">
                <Bot className="h-10 w-10 mx-auto text-primary" />
                <h3 className="font-bold text-sm">How can I assist your sprints today?</h3>
                <p className="text-xs text-muted-foreground">Select a prompt template or write details below</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-xs">
                {suggestedPrompts.map((pmt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(pmt)}
                    className="p-3 text-left border rounded-xl hover:bg-muted/40 hover:border-primary/40 transition-all font-medium text-muted-foreground hover:text-foreground cursor-pointer flex justify-between items-center group"
                  >
                    <span className="line-clamp-2 pr-2">{pmt}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages mapping
            <div className="space-y-6">
              {activeConv.messages.map((msg) => {
                const isAI = msg.role === "assistant";
                return (
                  <div key={msg.id} className={`flex gap-4 items-start ${isAI ? "p-4 rounded-xl border bg-card/25" : ""}`}>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs select-none ${
                      isAI ? "bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-sm" : "bg-slate-500"
                    }`}>
                      {isAI ? "AI" : "ME"}
                    </div>
                    
                    <div className="flex-1 space-y-2 overflow-hidden">
                      {/* Message body content */}
                      <div className="text-sm">
                        {renderMessageContent(msg.content, msg.id)}
                      </div>

                      {/* Display files if attached */}
                      {msg.files && msg.files.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {msg.files.map((f, fIdx) => (
                            <Badge key={fIdx} variant="outline" className="text-[9px] gap-1 py-0.5 bg-muted/30">
                              <Paperclip className="h-3 w-3 text-primary" /> {f.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Msg actions */}
                      <div className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground border-t border-border/20">
                        <button
                          onClick={() => handleCopyText(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-foreground transition-colors font-medium cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy
                            </>
                          )}
                        </button>
                        
                        {isAI && (
                          <button
                            onClick={() => handleRegenerate(msg.id)}
                            className="flex items-center gap-1 hover:text-foreground transition-colors font-medium cursor-pointer"
                          >
                            <RefreshCw className="h-3 w-3" /> Regenerate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Streaming Content block */}
              {isStreaming && streamingContent && (
                <div className="flex gap-4 items-start p-4 rounded-xl border bg-card/25 animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 text-white font-bold text-xs select-none">
                    AI
                  </div>
                  <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="text-sm">
                      {renderMessageContent(streamingContent, "streaming_node")}
                    </div>
                  </div>
                </div>
              )}

              {/* Typing indicator bubble */}
              {isStreaming && !streamingContent && (
                <div className="flex gap-4 items-start p-4 rounded-xl border bg-card/25">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 text-white font-bold text-xs select-none">
                    AI
                  </div>
                  <div className="flex items-center gap-1.5 h-8">
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Bottom prompt input wrapper */}
        <div className="p-4 border-t bg-card/45 backdrop-blur-md space-y-2 z-10">
          
          {/* Files queue display */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-2">
              {attachedFiles.map((f, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[9px] gap-1 py-0.5 pr-1.5 bg-primary/5 text-primary border-primary/20"
                >
                  <Paperclip className="h-3 w-3 shrink-0" />
                  {f.name}
                  <button
                    onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                    className="hover:bg-muted rounded p-0.5 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {activeConv && (
            <div className="flex gap-2">
              {/* Mock attach file trigger */}
              <div className="relative">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl border shrink-0 h-11 w-11" title="Attach file">
                      <Paperclip className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground transition-colors" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm border-border/80 glassmorphism p-5 space-y-3">
                    <DialogHeader>
                      <DialogTitle className="text-sm font-bold">Attach Mock File</DialogTitle>
                      <DialogDescription className="text-xs">Type a filename to attach to the AI context.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMockFileUpload} className="space-y-3">
                      <Input
                        value={uploadText}
                        onChange={(e) => setUploadText(e.target.value)}
                        placeholder="e.g. system_audit.json"
                        className="text-xs"
                      />
                      <DialogFooter>
                        <Button type="submit" size="sm" className="w-full font-semibold">Attach</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Text Input */}
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isStreaming) {
                    handleSendMessage(inputText);
                  }
                }}
                disabled={isStreaming}
                placeholder={isStreaming ? "AI is typing response..." : "Ask AI details or compose script blueprints..."}
                className="h-11 rounded-xl text-xs flex-1 bg-background/50 border-input shadow-inner"
              />

              {/* Action button */}
              {isStreaming ? (
                <Button
                  onClick={stopGeneration}
                  variant="destructive"
                  className="rounded-xl h-11 px-4 text-xs font-semibold gap-1.5 shrink-0 animate-pulse"
                >
                  <StopCircle className="h-4 w-4" /> Stop
                </Button>
              ) : (
                <Button
                  onClick={() => handleSendMessage(inputText)}
                  variant="gradient"
                  className="rounded-xl h-11 w-11 p-0 shrink-0 shadow-md"
                  disabled={inputText.trim().length === 0 && attachedFiles.length === 0}
                >
                  <Send className="h-4.5 w-4.5 text-white" />
                </Button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
