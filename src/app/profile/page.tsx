"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2, Settings as SettingsIcon, User as UserIcon, CheckCircle2, XCircle, LogOut, TrendingUp, Trophy, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

interface ProfileData {
    user: {
        name: string;
        email: string;
        xp: number;
        solvedCount: number;
        difficultyCounts: {
            Easy: number;
            Medium: number;
            Hard: number;
        };
        totalCounts?: {
            Easy: number;
            Medium: number;
            Hard: number;
        };
        badges?: {
            id: string;
            name: string;
            description: string;
        }[];
    };
    recentSubmissions: {
        _id: string;
        problemId: string;
        problemTitle: string;
        status: string;
        language: string;
        difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
        createdAt: string;
    }[];
}

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [defaultLanguage, setDefaultLanguage] = useState("javascript");
    const [theme, setTheme] = useState("vs-dark");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/login";
            return;
        }

        if (status === "authenticated") {
            fetch("/api/profile")
                .then(res => res.json())
                .then(d => {
                    if (d.user) {
                        setData(d);
                        setNewName(d.user.name);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load profile", err);
                    setLoading(false);
                });

            fetch("/api/settings")
                .then(res => res.json())
                .then(d => {
                    if (d.settings) {
                        if (d.settings.defaultLanguage) setDefaultLanguage(d.settings.defaultLanguage);
                        if (d.settings.theme) setTheme(d.settings.theme);
                    }
                })
                .catch(console.error);
        }
    }, [status]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName })
            });
            const result = await res.json();

            const settingsRes = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ defaultLanguage, theme })
            });

            if (res.ok && settingsRes.ok) {
                toast.success("Profile settings updated!");
                update({ name: newName }); // Update NextAuth session
                setData(prev => prev ? { ...prev, user: { ...prev.user, name: newName } } : null);
            } else {
                toast.error(result.error || "Update failed");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-950 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const tc = data.user.totalCounts || { Easy: 0, Medium: 0, Hard: 0 };
    const totalQuestions = tc.Easy + tc.Medium + tc.Hard || 1;
    const percentSolved = Math.min(100, Math.round((data.user.solvedCount / totalQuestions) * 100)) || 0;

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-950 text-zinc-100 flex flex-col font-sans">
            <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid gap-8 grid-cols-1 md:grid-cols-[300px_1fr]">

                {/* Left Sidebar - Profile & Settings */}
                <div className="space-y-6">
                    {/* User ID Card */}
                    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 p-1">
                                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                        <UserIcon className="w-10 h-10 text-zinc-400" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-100">{data.user.name}</h2>
                                    <p className="text-zinc-500 text-sm">{data.user.email}</p>
                                </div>

                                <div className="w-full pt-4 border-t border-zinc-800/80 flex justify-between items-center px-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">{data.user.xp}</span>
                                        <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Total XP</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-bold text-zinc-200">{data.user.solvedCount}</span>
                                        <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Solved</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings Form */}
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
                                <SettingsIcon className="w-4 h-4 text-zinc-400" /> Profile Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Display Name</Label>
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-green-500/50"
                                        spellCheck={false}
                                    />
                                </div>
                                <div className="space-y-4 pt-1">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400">Default Language</Label>
                                        <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-green-500/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1e1e1e] border-zinc-800 text-zinc-300">
                                                <SelectItem value="c">C</SelectItem>
                                                <SelectItem value="cpp">C++</SelectItem>
                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                                <SelectItem value="python">Python</SelectItem>
                                                <SelectItem value="java">Java</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400">Editor Theme</Label>
                                        <Select value={theme} onValueChange={setTheme}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-green-500/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1e1e1e] border-zinc-800 text-zinc-300">
                                                <SelectItem value="vs-dark">Dark Minimal</SelectItem>
                                                <SelectItem value="hc-black">High Contrast</SelectItem>
                                                <SelectItem value="vs">Light Mode</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button type="submit" disabled={isSaving} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-300">
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Save Changes
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-zinc-800/80">
                                <Button variant="destructive" className="w-full" onClick={() => signOut({ callbackUrl: "/" })}>
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Badges & Achievements */}
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
                                <Award className="w-5 h-5 text-yellow-500" /> Achievements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!data.user.badges || data.user.badges.length === 0 ? (
                                <p className="text-sm text-zinc-500 text-center py-4">Solve problems to earn badges!</p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {data.user.badges.map((badge) => (
                                        <div key={badge.id} className="flex flex-col items-center justify-center p-3 rounded-lg bg-zinc-950/50 border border-zinc-800 text-center min-w-[100px] flex-1">
                                            <Award className={`w-8 h-8 mb-2 ${badge.id === 'first_steps' ? 'text-blue-400' :
                                                badge.id === 'dedicated' ? 'text-purple-400' :
                                                    badge.id === 'master' ? 'text-yellow-400' :
                                                        'text-emerald-400'
                                                }`} />
                                            <p className="text-xs font-bold text-zinc-200">{badge.name}</p>
                                            <p className="text-[10px] text-zinc-500 mt-1">{badge.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Area - Stats & Activity */}
                <div className="space-y-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-6 flex items-center gap-6">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="36" className="stroke-zinc-800" strokeWidth="8" fill="none" />
                                        <circle
                                            cx="48" cy="48" r="36"
                                            className="stroke-green-500 transition-all duration-1000 ease-in-out"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray="226"
                                            strokeDashoffset={226 - (226 * percentSolved) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-zinc-100">{data.user.solvedCount}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Solved</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-400 font-medium">Easy</span>
                                            <span className="text-zinc-300">{data.user.difficultyCounts.Easy} <span className="text-zinc-600 text-xs">/ {tc.Easy}</span></span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(data.user.difficultyCounts.Easy / Math.max(1, tc.Easy)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-yellow-400 font-medium">Medium</span>
                                            <span className="text-zinc-300">{data.user.difficultyCounts.Medium} <span className="text-zinc-600 text-xs">/ {tc.Medium}</span></span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(data.user.difficultyCounts.Medium / Math.max(1, tc.Medium)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-red-400 font-medium">Hard</span>
                                            <span className="text-zinc-300">{data.user.difficultyCounts.Hard} <span className="text-zinc-600 text-xs">/ {tc.Hard}</span></span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${(data.user.difficultyCounts.Hard / Math.max(1, tc.Hard)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-zinc-800 flex flex-col justify-center">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Global Rank</p>
                                        <h3 className="text-2xl font-bold text-zinc-100">Top 15%</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Current Streak</p>
                                        <h3 className="text-2xl font-bold text-zinc-100">3 Days</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Submissions List */}
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
                                <Calendar className="w-5 h-5 text-zinc-400" /> Recent Submissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.recentSubmissions.length === 0 ? (
                                <div className="text-center py-10 text-zinc-500">
                                    No submissions yet. Start solving problems!
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.recentSubmissions.map((sub) => (
                                        <div key={sub._id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 flex justify-center">
                                                    {sub.status === "Accepted" ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <Link href={`/problems/${sub.problemId}`} className="text-sm font-medium text-zinc-200 group-hover:text-green-400 transition-colors">
                                                        {sub.problemTitle}
                                                    </Link>
                                                    <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                                        <span className={`
                                                            ${sub.difficulty === 'Easy' ? 'text-green-400' : ''}
                                                            ${sub.difficulty === 'Medium' ? 'text-yellow-400' : ''}
                                                            ${sub.difficulty === 'Hard' ? 'text-red-400' : ''}
                                                        `}>{sub.difficulty}</span>
                                                        <span>•</span>
                                                        <span>{sub.language}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-zinc-500 whitespace-nowrap">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 flex justify-center">
                                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                                            View all submissions
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </main>
        </div>
    );
}
