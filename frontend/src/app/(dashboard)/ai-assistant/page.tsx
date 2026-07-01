"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Bot, Cpu, Sliders, Volume2, Mic, Paperclip, Send,
  HelpCircle, StopCircle, RefreshCw, Copy, Check, Info, Trash2, ArrowUpRight, X
} from "lucide-react";
import { useChatStore, ChatMessage, Conversation, ChatFile } from "@/store/chatStore";
import { chatService } from "@/services/chatService";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

export default function AIAssistantPage() {
  const {
    conversations, activeConversationId, isStreaming, streamingContent,
    selectConversation, startNewConversation, updateConversationSettings,
    deleteConversation, stopGeneration
  } = useChatStore();

  const [promptText, setPromptText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<ChatFile[]>([]);
  const [uploadName, setUploadName] = useState("");
  const [showUploadInput, setShowUploadInput] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chats to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, streamingContent, isStreaming]);

  // Handle Send
  const handleSend = async (text: string) => {
    const prompt = text.trim();
    if (!prompt && attachedFiles.length === 0) return;
    if (!activeConv) {
      // Auto initialize a conversation if none exists
      const newId = startNewConversation();
      // Wait a moment for state synchronization
      setTimeout(() => handleSend(prompt), 100);
      return;
    }
    
    setPromptText("");
    const files = [...attachedFiles];
    setAttachedFiles([]);
    setShowUploadInput(false);

    try {
      await aiService.sendMessage(prompt, files);
    } catch {
      toast({ title: "Operation failed", type: "destructive" });
    }
  };

  // Mock Voice Recording
  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    toast({ title: "Recording Active", description: "Analyzing voice frequency input...", type: "info" });

    // Mock speech to text translation after 2.5s
    setTimeout(() => {
      setIsRecording((curr) => {
        if (curr) {
          setPromptText("Optimize this API call to utilize query indexes.");
          toast({ title: "Speech Translated", description: "Inserted query parameters into input.", type: "success" });
          return false;
        }
        return false;
      });
    }, 2500);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied Code", type: "success" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMockUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) return;
    
    const fileObj: ChatFile = {
      name: uploadName,
      size: "2.4 MB",
      type: "application/pdf"
    };

    setAttachedFiles([...attachedFiles, fileObj]);
    setUploadName("");
    setShowUploadInput(false);
    toast({ title: "Attached Document", description: `'${fileObj.name}' ready`, type: "success" });
  };

  // Custom Formatter
  const renderFormattedMessage = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : "code";
        const code = match ? match[2] : part.slice(3, -3);
        const codeId = `${msgId}_code_${index}`;

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/60 text-[10px] font-mono border-b">
              <span className="uppercase text-muted-foreground">{lang}</span>
              <button
                onClick={() => handleCopyText(code, codeId)}
                className="flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors font-semibold"
              >
                {copiedId === codeId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copiedId === codeId ? "Copied" : "Copy Code"}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 dark:bg-card/20 overflow-x-auto text-[11px] font-mono text-emerald-400">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return (
        <p key={index} className="whitespace-pre-line leading-relaxed text-sm text-foreground/90">
          {part}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">Focused developer console for language model prototyping</p>
      </div>

      {/* CORE SPLIT WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN: ADVANCED PARAMETERS PANEL */}
        <div className="space-y-6 lg:col-span-1">
          {activeConv ? (
            <>
              {/* Token Usage Card */}
              <Card className="border-border/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-violet-500" /> Token Usage Card
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Prompt Tokens</span>
                    <span className="font-semibold text-foreground">{activeConv.tokenUsage.promptTokens}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Completion Tokens</span>
                    <span className="font-semibold text-foreground">{activeConv.tokenUsage.completionTokens}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Session Tokens</span>
                    <span className="text-primary">{activeConv.tokenUsage.totalTokens}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Rate Limit Caps</span>
                      <span>{Math.round((activeConv.tokenUsage.totalTokens / 50000) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min((activeConv.tokenUsage.totalTokens / 50000) * 100, 100)}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Sliders Card */}
              <Card className="border-border/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-primary" /> Model Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-xs">
                  {/* Temperature slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="text-primary">{activeConv.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={activeConv.temperature}
                      onChange={(e) => updateConversationSettings(activeConv.id, { temperature: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>Precise/Logical</span>
                      <span>Creative/Fluent</span>
                    </div>
                  </div>

                  {/* Active session reset */}
                  <Button
                    onClick={() => {
                      deleteConversation(activeConv.id);
                      toast({ title: "Session Cleared", type: "info" });
                    }}
                    variant="outline"
                    className="w-full h-8.5 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 gap-1.5 border-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Terminate Session
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-4 text-center text-xs text-muted-foreground">
              Parameters are accessible once an active session begins.
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: FOCUSED CHAT INTERFACE */}
        <div className="lg:col-span-3">
          <Card className="border-border/80 h-[65vh] flex flex-col justify-between overflow-hidden relative bg-card/25 backdrop-blur-md">
            
            {/* Chat header */}
            <div className="p-4 border-b bg-card/45 backdrop-blur-md flex items-center justify-between">
              {activeConv ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 border-primary/20 text-primary uppercase">
                    {activeConv.model}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">Workbench session active</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground font-semibold">Ready to spawn chatbot console</span>
              )}
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {!activeConv ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                  <Bot className="h-10 w-10 text-primary animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">Focused Chat Interface</h3>
                    <p className="text-xs text-muted-foreground">
                      Input your prompt blueprint below. An active prototyping session will initialize automatically.
                    </p>
                  </div>
                </div>
              ) : activeConv.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-xs mx-auto space-y-2 text-xs">
                  <Sparkles className="h-8 w-8 text-primary/40" />
                  <p className="font-semibold">Prototyping Session Initialized</p>
                  <p className="text-muted-foreground">Write details below or toggle microphone input to test speech capture.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeConv.messages.map((msg) => {
                    const isAI = msg.role === "assistant";
                    return (
                      <div key={msg.id} className={`flex gap-4 items-start ${isAI ? "p-4 rounded-xl border bg-card/10" : ""}`}>
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs select-none ${
                          isAI ? "bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-sm" : "bg-slate-500"
                        }`}>
                          {isAI ? "AI" : "ME"}
                        </div>
                        
                        <div className="flex-1 space-y-2 overflow-hidden">
                          <div className="text-sm">
                            {renderFormattedMessage(msg.content, msg.id)}
                          </div>

                          {msg.files && msg.files.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {msg.files.map((f, fIdx) => (
                                <Badge key={fIdx} variant="outline" className="text-[9px] gap-1 py-0.5 bg-muted/30">
                                  <Paperclip className="h-3 text-primary" /> {f.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground border-t border-border/20">
                            <button
                              onClick={() => handleCopyText(msg.content, msg.id)}
                              className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
                            >
                              {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Streaming Block */}
                  {isStreaming && streamingContent && (
                    <div className="flex gap-4 items-start p-4 rounded-xl border bg-card/10 animate-pulse">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 text-white font-bold text-xs select-none">
                        AI
                      </div>
                      <div className="flex-1 space-y-2 overflow-hidden">
                        <div className="text-sm">
                          {renderFormattedMessage(streamingContent, "streaming_node_assistant")}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {isStreaming && !streamingContent && (
                    <div className="flex gap-4 items-start p-4 rounded-xl border bg-card/10">
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

            {/* Input card */}
            <div className="p-4 border-t bg-card/45 backdrop-blur-md space-y-3">
              {/* Files queue */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {attachedFiles.map((f, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px] gap-1 py-0.5 bg-primary/5 text-primary border-primary/20">
                      <Paperclip className="h-3 w-3" /> {f.name}
                      <button onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))} className="hover:bg-muted p-0.5 rounded text-muted-foreground">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Upload Input panel */}
              {showUploadInput && (
                <form onSubmit={handleMockUpload} className="flex gap-2 p-2 border rounded-lg bg-background/50 animate-slide-up">
                  <Input
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="Document name (e.g. wireframes.pdf)"
                    className="h-8.5 text-xs flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="h-8.5 font-semibold">Attach</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowUploadInput(false)} className="h-8.5">Cancel</Button>
                </form>
              )}

              {/* Voice Soundwave indicator */}
              {isRecording && (
                <div className="flex items-center justify-center gap-1.5 py-2.5 border rounded-lg bg-violet-600/5 border-violet-500/20 text-[10px] text-violet-500 font-semibold animate-pulse">
                  <Volume2 className="h-4.5 w-4.5" /> Listening to speech input...
                  <div className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 bg-violet-500 h-2 animate-bounce" />
                    <span className="w-0.5 bg-violet-500 h-3 animate-bounce [animation-delay:0.1s]" />
                    <span className="w-0.5 bg-violet-500 h-1 animate-bounce [animation-delay:0.3s]" />
                    <span className="w-0.5 bg-violet-500 h-2.5 animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {/* Mock Upload trigger */}
                <Button
                  onClick={() => setShowUploadInput(!showUploadInput)}
                  variant="outline"
                  size="icon"
                  className="rounded-xl h-11 w-11 shrink-0"
                  title="Upload wireframe file"
                >
                  <Paperclip className="h-4.5 w-4.5 text-muted-foreground" />
                </Button>

                {/* Microphone / Voice Trigger */}
                <Button
                  onClick={handleToggleVoice}
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  className={`rounded-xl h-11 w-11 shrink-0 ${isRecording ? "animate-pulse" : ""}`}
                  title="Trigger Voice Prototyping"
                >
                  <Mic className="h-4.5 w-4.5" />
                </Button>

                {/* Text input */}
                <Input
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !isStreaming) handleSend(promptText); }}
                  disabled={isStreaming}
                  placeholder={isStreaming ? "Generating text responses..." : "Type developer prompt or start voice logs..."}
                  className="h-11 rounded-xl text-xs flex-1 bg-background/50 border-input shadow-inner"
                />

                {/* Action button */}
                {isStreaming ? (
                  <Button
                    onClick={stopGeneration}
                    variant="destructive"
                    className="rounded-xl h-11 px-4 text-xs font-semibold gap-1.5 shrink-0"
                  >
                    <StopCircle className="h-4 w-4" /> Cancel
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSend(promptText)}
                    variant="gradient"
                    className="rounded-xl h-11 w-11 p-0 shrink-0"
                    disabled={promptText.trim().length === 0 && attachedFiles.length === 0}
                  >
                    <Send className="h-4.5 w-4.5 text-white" />
                  </Button>
                )}
              </div>
            </div>

          </Card>
        </div>

      </div>
    </div>
  );
}
