"use client";

/**
 * NotificationBell Component
 * 
 * Fetches notifications on mount, connects to WebSockets for real-time updates,
 * and handles UI state for showing/marking notifications as read.
 */

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import clientApi from "@/lib/client-api";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const popoverRef = useRef<HTMLDivElement>(null);

  // Initialize and load
  useEffect(() => {
    async function init() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      setIsLoggedIn(true);
      setUserId(session.user.id);

      // Load initial data
      try {
        const data = await clientApi.get("/notifications");
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    }
    init();
  }, []);

  // Set up WebSockets
  useEffect(() => {
    if (!userId) return;

    const socket = connectSocket(userId);

    // Listen for new notifications
    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
      disconnectSocket(userId);
    };
  }, [userId]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAsRead(id: string) {
    try {
      await clientApi.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read");
    }
  }

  async function markAllAsRead() {
    try {
      await clientApi.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  }

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#FF007A] text-[9px] font-black flex items-center justify-center border-2 border-[#0A0D15]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-[450px] bg-[#0A0D15] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in slide-in-from-top-2 duration-200">
          
          <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] text-[#FF007A] hover:text-white transition-colors font-bold uppercase tracking-wider"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Bell className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">All caught up</p>
                <p className="text-[10px] text-gray-600 mt-1">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.is_read;
                const timeAgo = formatDistanceToNow(new Date(n.created_at), { addSuffix: true });
                
                return (
                  <div 
                    key={n.id}
                    onClick={() => {
                       if (isUnread) markAsRead(n.id);
                       if (n.link) setIsOpen(false); // Close if navigating
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isUnread ? "bg-white/5 border border-white/10" : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-xs font-bold uppercase tracking-tight line-clamp-1 ${isUnread ? "text-white" : "text-gray-400"}`}>
                            {n.title}
                          </p>
                          {isUnread && <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-[#FF007A] mt-1" />}
                        </div>
                        <p className={`text-[11px] leading-tight ${isUnread ? "text-gray-300 font-medium" : "text-gray-500"}`}>
                          {n.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">
                            {timeAgo}
                          </span>
                          
                          {n.link && (
                            <Link href={n.link} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                              View →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
