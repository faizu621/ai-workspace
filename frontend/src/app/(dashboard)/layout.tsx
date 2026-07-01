"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Terminal, Sun, Moon, Bell, Search, LogOut, Settings, LayoutDashboard,
  Kanban, MessageSquare, Bot, FileText, BarChart3, Users2, ShieldAlert,
  ChevronLeft, ChevronRight, Menu, X, Check, Calendar, Plus, HelpCircle
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { searchService, SearchResult } from "@/services/searchService";
import { notificationService } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Zustand Store hooks
  const { user, isAuthenticated, activeWorkspace, workspaces, switchWorkspace, logout } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore();

  // Component states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Hydration safety check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auth Guard redirect
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push("/login");
    }
  }, [isClient, isAuthenticated, router]);

  // Global command search event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search execution trigger
  useEffect(() => {
    const runSearch = async () => {
      if (searchQuery.trim().length > 1) {
        const res = await searchService.search(searchQuery);
        setSearchResults(res);
      } else {
        setSearchResults([]);
      }
    };
    const debounce = setTimeout(runSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  if (!isClient || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Terminal className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  // Sidebar Links
  const sidebarLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: Users2 },
    { name: "Tasks", href: "/tasks", icon: Kanban },
    { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Extra Admin link if admin role
  if (user.role === "admin") {
    sidebarLinks.splice(7, 0, { name: "Admin Panel", href: "/admin", icon: ShieldAlert });
  }

  const handleSignOut = () => {
    logout();
    toast({ title: "Signed Out", description: "You have signed out of your session.", type: "info" });
    router.push("/login");
  };

  const currentWorkspaceName = activeWorkspace.name;

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors overflow-hidden">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col border-r bg-card/60 backdrop-blur-md transition-all duration-300 relative z-30 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
              <Terminal className="h-4.5 w-4.5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-400 dark:to-fuchsia-400">
                AI Workspace
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex h-6 w-6 rounded-md border bg-background hover:bg-muted items-center justify-center text-muted-foreground hover:text-foreground absolute right-[-12px] top-5"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Sidebar Workspace Select */}
        <div className="p-3 border-b">
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className={`w-full flex items-center justify-between p-2 rounded-lg border bg-background/50 hover:bg-muted/80 text-left transition-colors text-xs font-semibold ${
                isSidebarCollapsed ? "justify-center" : ""
              }`}
            >
              {isSidebarCollapsed ? (
                <Badge variant="outline" className="w-7 h-7 rounded-md p-0 flex items-center justify-center font-bold bg-primary/10 border-primary/20 text-primary">
                  {currentWorkspaceName[0]}
                </Badge>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] flex items-center justify-center">
                      {currentWorkspaceName[0]}
                    </span>
                    <span className="truncate max-w-[120px]">{currentWorkspaceName}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground rotate-90" />
                </>
              )}
            </button>

            {isWorkspaceDropdownOpen && !isSidebarCollapsed && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border bg-popover text-popover-foreground shadow-lg p-1 space-y-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setIsWorkspaceDropdownOpen(false);
                      toast({ title: "Workspace Switched", description: `Active: ${ws.name}`, type: "success" });
                    }}
                    className={`w-full flex items-center justify-between p-2 text-xs font-semibold rounded-md hover:bg-muted transition-colors ${
                      activeWorkspace.id === ws.id ? "bg-muted text-primary" : ""
                    }`}
                  >
                    <span>{ws.name}</span>
                    {activeWorkspace.id === ws.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const LinkIcon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-muted group ${
                  isActive ? "bg-primary/10 border-l-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LinkIcon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-primary" : ""}`} />
                {!isSidebarCollapsed && <span className="truncate">{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Profile */}
        <div className="p-3 border-t bg-card/20 flex flex-col gap-2">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 p-1">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-rose-500 rounded-lg p-1.5 hover:bg-muted transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-10 h-10 mx-auto flex items-center justify-center text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-muted transition-colors"
              title="Log Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs">
          <aside className="w-64 bg-card p-4 flex flex-col border-r h-full animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white">
                  <Terminal className="h-4.5 w-4.5" />
                </div>
                <span className="font-bold text-lg">AI Workspace</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {sidebarLinks.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-colors ${
                      isActive ? "bg-primary/10 border-l-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LinkIcon className="h-5 w-5 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t pt-4 flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.role.toUpperCase()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-rose-500">
                <LogOut className="h-4.5 w-4.5" />
              </Button>
            </div>
          </aside>
          <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* HEADER NAVBAR */}
        <header className="h-16 border-b bg-card/45 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* CMD+K Search bar button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-between w-48 md:w-72 bg-muted/60 hover:bg-muted/90 border border-input rounded-xl px-3 py-1.5 text-xs text-muted-foreground transition-colors group select-none cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                Quick Search...
              </span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-[8px]">Ctrl</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl border hover:bg-muted"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-violet-400" />
            </Button>

            {/* Notifications panel dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl border hover:bg-muted"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileDropdownOpen(false);
                }}
              >
                <Bell className="h-4.5 w-4.5" />
                {getUnreadCount() > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white select-none ring-2 ring-background">
                    {getUnreadCount()}
                  </span>
                )}
              </Button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-popover text-popover-foreground shadow-lg z-50 overflow-hidden animate-slide-up">
                  <div className="p-3 border-b flex items-center justify-between bg-muted/40">
                    <span className="text-xs font-semibold">System Notifications</span>
                    {getUnreadCount() > 0 && (
                      <button
                        onClick={() => {
                          markAllAsRead();
                          toast({ title: "Inbox Cleared", description: "All notifications read.", type: "success" });
                        }}
                        className="text-[10px] text-primary hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            setIsNotificationsOpen(false);
                            if (n.type === "ai") router.push("/chat");
                            if (n.type === "info") router.push("/tasks");
                          }}
                          className={`p-3 text-left hover:bg-muted/50 cursor-pointer transition-colors ${
                            !n.read ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex justify-between gap-1 items-start">
                            <h4 className={`text-xs font-semibold leading-tight ${!n.read ? "text-primary" : ""}`}>
                              {n.title}
                            </h4>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-normal truncate-3-lines">
                            {n.description}
                          </p>
                          <span className="text-[8px] text-muted-foreground block mt-1.5">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t bg-muted/20 text-center">
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Dismiss Menu
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <Avatar className="h-8 w-8 cursor-pointer hover:opacity-90 border transition-opacity">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-popover text-popover-foreground shadow-lg z-50 p-1 divide-y animate-slide-up">
                  <div className="p-3">
                    <p className="text-xs font-semibold text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 p-2 text-xs font-semibold rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Account Settings
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-2 p-2 text-xs font-semibold rounded-md hover:bg-muted text-rose-500 transition-colors text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* 4. CMD+K SEARCH DIALOG */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-border/80 shadow-2xl glassmorphism">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="sr-only">Search Platform</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, tasks, file listings, AI chats..."
                className="pl-10 h-11 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm"
                autoFocus
              />
            </div>
          </DialogHeader>
          <div className="max-h-[350px] overflow-y-auto p-2">
            {searchQuery.trim().length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <Search className="h-8 w-8 mx-auto text-muted-foreground/30 animate-pulse" />
                <p>Type keywords to search across the entire workspace</p>
                <div className="flex gap-2 justify-center pt-2">
                  <Badge variant="outline" className="text-[10px] font-mono">proj_1</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">Kanban</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">amplify.yml</Badge>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No matching results found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((res) => {
                  let badgeVariant: "default" | "secondary" | "outline" | "success" = "outline";
                  if (res.type === "project") badgeVariant = "default";
                  if (res.type === "task") badgeVariant = "secondary";
                  if (res.type === "chat") badgeVariant = "success";

                  return (
                    <button
                      key={res.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                        router.push(res.url);
                      }}
                      className="w-full text-left flex items-start justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="space-y-1 min-w-0 pr-4">
                        <p className="text-sm font-semibold truncate text-foreground">{res.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{res.subtitle}</p>
                      </div>
                      <Badge variant={badgeVariant} className="text-[10px] uppercase shrink-0 mt-0.5">
                        {res.type}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-3 border-t bg-muted/40 text-right flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <span>ESC to cancel</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
