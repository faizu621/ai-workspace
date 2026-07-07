"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, Mail, ShieldAlert, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/userService";
import { toast } from "@/components/ui/toast";

export default function UserDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchUsers = async (queryStr: string) => {
    setIsSearching(true);
    try {
      const results = await userService.searchUsers(queryStr);
      setSearchResults(results);
    } catch (err: any) {
      console.error("Search failed", err);
      toast({
        title: "Search Error",
        description: "Failed to search team members from database.",
        type: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Run initial query on mount (empty query returns all or matched members depending on backend search criteria)
  useEffect(() => {
    fetchUsers("");
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Workspace Directory</h1>
        <p className="text-slate-400 mt-1">
          Search for teammates, engineers, and administrators inside your organization.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="max-w-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or keywords..."
            className="pl-11 bg-slate-900 border-slate-800 text-white focus:ring-2 focus:ring-indigo-550 w-full"
          />
          <Button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {/* Loading state */}
      {isSearching && searchResults.length === 0 ? (
        <div className="flex h-32 w-full items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        /* Results Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((user) => (
            <Card key={user.id} className="bg-slate-900 border-slate-800 text-white flex flex-col justify-between hover:border-slate-700 transition duration-200">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base font-semibold leading-tight">{user.name}</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0 flex-grow">
                <p className="text-sm text-slate-350 line-clamp-3">
                  {user.bio || "No biography provided yet."}
                </p>
                
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase bg-indigo-950/40 px-2 py-1 rounded">
                    {user.role || "MEMBER"}
                  </span>
                  
                  <span className="flex items-center gap-1 text-xs">
                    {user.emailVerified ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-450">Verified</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-500 font-medium">Pending</span>
                      </>
                    )}
                  </span>
                </div>
              </CardContent>
              
              <div className="p-4 bg-slate-950/20 border-t border-slate-800/50 flex justify-end">
                <Link href={`/users/${user.id}`}>
                  <Button variant="ghost" className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 flex items-center gap-1">
                    View Profile
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}

          {searchResults.length === 0 && !isSearching && (
            <div className="col-span-full text-center py-10 bg-slate-900/50 border border-dashed border-slate-800 rounded-lg">
              <User className="mx-auto h-12 w-12 text-slate-650" />
              <h3 className="mt-4 text-sm font-semibold text-white">No teammates found</h3>
              <p className="mt-1 text-sm text-slate-400">
                Try searching with a different name or email query.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
