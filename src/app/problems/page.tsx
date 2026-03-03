"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Code2, CheckCircle2, Search, Zap, BookOpen, Star, Building2, FilterX, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgress } from "@/lib/progress";
import { ProblemDefinition } from "@/types/problem";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { fallbackProblems } from "@/data/fallbackProblems";

// We extract the array of definitions from the dictionary
const defaultProblems: Partial<ProblemDefinition>[] = Object.values(fallbackProblems).map(p => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    language: p.language,
    category: p.category
}));

export default function ProblemsPage() {
    const { isProblemCompleted } = useProgress();
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyTab, setDifficultyTab] = useState("all");
    const [sourceTab, setSourceTab] = useState("all");
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [problems, setProblems] = useState<Partial<ProblemDefinition>[]>(defaultProblems);
    const loadProblems = async () => {
        try {
            const res = await fetch("/api/problems");
            if (res.ok) {
                const data = await res.json();

                // Add default static problems if desired, or just use the DB ones
                const dbProblems = data.problems.map((p: any) => ({ ...p, isCustom: p.category === "Custom", id: p.problemId }));

                // We merge with defaultProblems so they never lose the base set.
                const merged = [...defaultProblems.map(p => ({ ...p, isCustom: false })), ...dbProblems];

                // Remove duplicates by id just in case
                let uniqueContent = Array.from(new Map(merged.map(item => [item.id, item])).values());

                // Sort by creation date ascending (oldest first) to assign sequential standard IDs
                uniqueContent.sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeA - timeB;
                });

                // Strip hardcoded prefixes and assign stable sequence numbers
                uniqueContent = uniqueContent.map((p, idx) => ({
                    ...p,
                    title: p.title?.replace(/^\d+\.\s*/, ''),
                    problemNumber: idx + 1
                }));

                // Re-sort ascending natively
                uniqueContent.sort((a, b) => (a.problemNumber || 0) - (b.problemNumber || 0));

                setProblems(uniqueContent);
            }
        } catch (error) {
            console.error("Failed to load problems:", error);
            // Fallback to defaults
            setProblems(defaultProblems.map(p => ({ ...p, isCustom: false })));
        }
    };

    useEffect(() => {
        loadProblems();
    }, []);


    const completedCount = problems.filter((p) => p.id && isProblemCompleted(p.id)).length;
    const progressPercentage = problems.length > 0 ? (completedCount / problems.length) * 100 : 0;

    const filteredProblems = problems.filter((prob) => {
        const matchesSearch = prob.title?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesDifficulty = true;
        if (difficultyTab === "easy") matchesDifficulty = prob.difficulty === "Easy";
        if (difficultyTab === "medium") matchesDifficulty = prob.difficulty === "Medium";
        if (difficultyTab === "hard") matchesDifficulty = prob.difficulty === "Hard";

        let matchesSource = true;
        if (sourceTab === "standard") matchesSource = prob.isCustom === false;
        if (sourceTab === "custom") matchesSource = prob.isCustom === true;

        let matchesCompany = true;
        if (selectedCompany) {
            matchesCompany = !!prob.companies?.some(c => c.toLowerCase() === selectedCompany.toLowerCase());
        }

        return matchesSearch && matchesDifficulty && matchesSource && matchesCompany;
    });

    // Extract all unique companies from the loaded problem set, case-insensitive
    const companyMap = new Map<string, string>();
    problems.flatMap(p => p.companies || []).filter(Boolean).forEach(c => {
        const key = c.toLowerCase();
        if (!companyMap.has(key)) {
            // Title Case: capitalize first letter
            companyMap.set(key, c.charAt(0).toUpperCase() + c.slice(1).toLowerCase());
        }
    });
    const uniqueCompanies = Array.from(companyMap.values()).sort();

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-[calc(100vh-3.5rem)] bg-background">
            {/* Header Section */}
            <div className="flex justify-between items-start md:items-end gap-4 flex-col md:flex-row">
                <div className="space-y-4 w-full md:w-auto flex-1">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3">
                        <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-500/20" />
                        Coding Challenges
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Master multiple languages through interactive problem solving. From basic syntax to advanced algorithms.
                    </p>
                </div>

                <div className="flex flex-col gap-3 items-end">
                    {/* Stats Card */}
                    <Card className="w-full md:w-auto min-w-[300px] border-primary/20 bg-primary/5">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Star className="w-4 h-4 text-primary" /> Overall Progress
                                </span>
                                <span className="font-bold">{completedCount} / {problems.length}</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                        </CardContent>
                    </Card>

                    {session?.user && (
                        <Button asChild className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white">
                            <Link href="/problems/submit">
                                <PlusCircle className="w-4 h-4 mr-2" /> Submit a Question
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border">
                <div className="relative w-full xl:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search problems..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full xl:w-auto">
                    {/* Source Toggle */}
                    <Tabs value={sourceTab} onValueChange={setSourceTab} className="w-full sm:w-auto">
                        <TabsList className="grid w-full grid-cols-3 sm:w-[300px]">
                            <TabsTrigger value="all">All Sets</TabsTrigger>
                            <TabsTrigger value="standard">Standard</TabsTrigger>
                            <TabsTrigger value="custom" className="text-blue-500 data-[state=active]:text-blue-500">Custom</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Difficulty Toggle */}
                    <Tabs value={difficultyTab} onValueChange={setDifficultyTab} className="w-full sm:w-auto">
                        <TabsList className="grid w-full grid-cols-4 sm:w-[400px]">
                            <TabsTrigger value="all">Any</TabsTrigger>
                            <TabsTrigger value="easy" className="text-green-500 data-[state=active]:text-green-500">Easy</TabsTrigger>
                            <TabsTrigger value="medium" className="text-yellow-500 data-[state=active]:text-yellow-500">Medium</TabsTrigger>
                            <TabsTrigger value="hard" className="text-red-500 data-[state=active]:text-red-500">Hard</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Company Folders Row */}
            {uniqueCompanies.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Company Problem Sets
                    </h3>
                    <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar snap-x">
                        <Button
                            variant={selectedCompany === null ? "default" : "secondary"}
                            className="rounded-full snap-start whitespace-nowrap"
                            onClick={() => setSelectedCompany(null)}
                        >
                            <FilterX className="w-4 h-4 mr-2" /> All Companies
                        </Button>
                        {uniqueCompanies.map(company => (
                            <Button
                                key={company}
                                variant={selectedCompany === company ? "default" : "outline"}
                                className={`rounded-full snap-start whitespace-nowrap border-primary/20 hover:border-primary/50 ${selectedCompany === company ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-card'}`}
                                onClick={() => setSelectedCompany(company)}
                            >
                                <Building2 className={`w-4 h-4 mr-2 ${selectedCompany === company ? '' : 'text-blue-500'}`} /> {company}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Problems Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProblems.map((prob, idx) => (
                    <motion.div
                        key={prob.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Link href={`/problems/${prob.id}`}>
                            <Card className="hover:border-primary/50 transition-all cursor-pointer group h-full hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    prob.difficulty === "Easy" ? "border-green-500/50 text-green-500" :
                                                        prob.difficulty === "Medium" ? "border-yellow-500/50 text-yellow-500" :
                                                            "border-red-500/50 text-red-500"
                                                }
                                            >
                                                {prob.difficulty}
                                            </Badge>
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> {prob.category}
                                            </Badge>
                                            {/* Custom vs Official Badge */}
                                            {prob.isCustom ? (
                                                <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/5">
                                                    Custom
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5">
                                                    Official
                                                </Badge>
                                            )}
                                            {/* Dynamic "New" Badge (Active for 5 days) */}
                                            {prob.createdAt && (Date.now() - new Date(prob.createdAt).getTime()) < 5 * 24 * 60 * 60 * 1000 && (
                                                <Badge variant="default" className="bg-red-500 text-white hover:bg-red-600 border-none shadow-md">
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                        {prob.id && isProblemCompleted(prob.id) ? (
                                            <span className="flex items-center text-sm font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full shrink-0">
                                                <CheckCircle2 className="w-4 h-4 mr-1" /> Solved
                                            </span>
                                        ) : (
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                                        {prob.problemNumber ? `${prob.problemNumber}. ` : ""}{prob.title}
                                    </CardTitle>
                                    <div className="flex justify-between items-center mt-2">
                                        <CardDescription className="flex items-center gap-2">
                                            <Code2 className="w-4 h-4" /> {prob.language}
                                            {prob.submittedBy && (
                                                <span className="text-xs text-blue-400 ml-2">By: {prob.submittedBy}</span>
                                            )}
                                        </CardDescription>

                                        {/* Company preview chips on card */}
                                        {prob.companies && prob.companies.length > 0 && (
                                            <div className="flex gap-1 overflow-hidden">
                                                {prob.companies.slice(0, 2).map((c, i) => (
                                                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md whitespace-nowrap">
                                                        {c}
                                                    </span>
                                                ))}
                                                {prob.companies.length > 2 && <span className="text-[10px] px-1.5 py-0.5 text-zinc-500 border border-zinc-800 rounded-md">+{prob.companies.length - 2}</span>}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {filteredProblems.length === 0 && (
                <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No problems found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}
