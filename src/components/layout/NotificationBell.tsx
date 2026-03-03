"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NotificationItem {
    _id: string;
    type: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Don't render on code editor pages
    const isEditorPage = pathname?.startsWith("/problems/") && pathname !== "/problems" && pathname !== "/problems/submit";

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (data.notifications) setNotifications(data.notifications);
            if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
        } catch {
            // silent
        }
    };

    useEffect(() => {
        if (!session?.user) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [session]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {
            // silent
        }
    };

    const markRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id }),
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // silent
        }
    };

    if (!session?.user || isEditorPage) return null;

    const getTimeAgo = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "question_approved": return "✅";
            case "question_rejected": return "❌";
            case "new_question": return "🆕";
            case "review_needed": return "📝";
            default: return "🔔";
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-foreground/60 hover:text-foreground hover:bg-secondary/50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                onClick={markAllRead}
                            >
                                <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
                            </Button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 transition-colors cursor-pointer hover:bg-secondary/30 ${!n.read ? "bg-primary/5" : ""}`}
                                    onClick={() => {
                                        if (!n.read) markRead(n._id);
                                        if (n.link) {
                                            setIsOpen(false);
                                            window.location.href = n.link;
                                        }
                                    }}
                                >
                                    <span className="text-lg shrink-0 mt-0.5">{getIcon(n.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug ${!n.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                                            {n.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(n.createdAt)}</p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-1">
                                        {!n.read && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        )}
                                        {n.link && (
                                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
