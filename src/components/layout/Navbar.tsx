"use client";

import Link from "next/link";
import { Terminal, Code2, Trophy, Laptop, ChevronDown, BrainCircuit, LogOut, User, Medal, Calendar, Shield, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4 sm:px-8">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Image src="/logo.png" alt="MagicCode Logo" width={34} height={34} className="rounded-md" />
                        <span className="hidden font-bold sm:inline-block tracking-tight">
                            <span className="text-foreground text-lg">Magic</span>
                            <span className="text-blue-500 text-2xl">Code</span>
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link
                            href="/learning-paths"
                            className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
                        >
                            <Map className="h-4 w-4 text-emerald-400" />
                            Learning Path
                        </Link>
                        <Link
                            href="/problems"
                            className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
                        >
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            Coding Challenge
                        </Link>
                        <Link
                            href="/playground"
                            className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
                        >
                            <Laptop className="h-4 w-4 text-sky-400" />
                            Open IDE
                        </Link>
                        <Link
                            href="/daily"
                            className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
                        >
                            <Calendar className="h-4 w-4 text-orange-400" />
                            Daily Challenge
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
                        >
                            <Medal className="h-4 w-4 text-yellow-400" />
                            Leaderboard
                        </Link>
                    </nav>
                </div>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search could go here */}
                    </div>
                    <nav className="flex items-center space-x-2">
                        {session ? (
                            <>
                                <NotificationBell />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 px-3 flex items-center gap-2 rounded-full border border-border/50 hover:bg-secondary/50 transition-all">
                                            <div className="flex bg-primary/20 text-primary h-7 w-7 items-center justify-center rounded-full font-bold text-xs shrink-0">
                                                {session.user?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <span className="truncate font-semibold text-sm max-w-[100px] sm:max-w-[150px] hidden sm:block">
                                                {session.user?.name || "User"}
                                            </span>
                                            {session.user?.role === "admin" && (
                                                <span className="text-[10px] uppercase tracking-wider font-bold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-sm shrink-0 border border-red-500/20">
                                                    Admin
                                                </span>
                                            )}
                                            <ChevronDown className="w-4 h-4 text-muted-foreground ml-1 hidden sm:block" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-background border-zinc-800">
                                        <div className="flex items-center justify-start gap-2 p-3">
                                            <div className="flex flex-col space-y-1 leading-none">
                                                <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                                                    {session.user?.name || "User"}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {session.user?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="border-t border-zinc-800 my-1"></div>
                                        {session.user?.role === "admin" && (
                                            <DropdownMenuItem asChild className="cursor-pointer flex gap-2 font-medium text-indigo-600 dark:text-indigo-400 focus:text-indigo-700 dark:focus:text-indigo-300 focus:bg-indigo-500/10">
                                                <Link href="/admin">
                                                    <Shield className="w-4 h-4" />
                                                    Admin Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem asChild className="cursor-pointer flex gap-2">
                                            <Link href="/profile">
                                                <User className="w-4 h-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 flex gap-2">
                                            <LogOut className="w-4 h-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Log In</Link>
                                </Button>
                                <Button size="sm" asChild className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground">
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </nav>
    );
}
