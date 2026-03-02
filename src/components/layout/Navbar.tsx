import Link from "next/link";
import { Terminal, Code2, Trophy, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4 sm:px-8">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Terminal className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">C Learning Hub</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link
                            href="/learn/c"
                            className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
                        >
                            <Code2 className="h-4 w-4" />
                            Learn C
                        </Link>
                        <Link
                            href="/learn/cpp"
                            className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
                        >
                            <Code2 className="h-4 w-4" />
                            Learn C++
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
                    </nav>
                </div>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search could go here */}
                    </div>
                    <nav className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/learn/c">Get Started</Link>
                        </Button>
                        <Button size="sm" asChild className="hidden sm:inline-flex">
                            <Link href="/problems">Code Now</Link>
                        </Button>
                    </nav>
                </div>
            </div>
        </nav>
    );
}
