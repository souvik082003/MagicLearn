"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Code2, CheckCircle2, Search, Zap, BookOpen, Star, Plus, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgress } from "@/lib/progress";
import { getCustomProblems, saveCustomProblem } from "@/lib/problems";
import { ProblemDefinition } from "@/types/problem";
import { toast } from "sonner";

// Extended problem list
const defaultProblems: Partial<ProblemDefinition>[] = [
    { id: "hello-world", title: "Hello World", difficulty: "Easy", language: "c", category: "Basics" },
    { id: "variables", title: "Variables & Types", difficulty: "Easy", language: "cpp", category: "Basics" },
    { id: "two-sum", title: "Two Sum Simulator", difficulty: "Medium", language: "cpp", category: "Arrays" },
    { id: "reverse-string", title: "Reverse String", difficulty: "Easy", language: "c", category: "Strings" },
    { id: "linked-list-cycle", title: "Linked List Cycle", difficulty: "Medium", language: "cpp", category: "Data Structures" },
    { id: "pointers-intro", title: "Intro to Pointers", difficulty: "Hard", language: "c", category: "Pointers" },
];

export default function ProblemsPage() {
    const { isProblemCompleted } = useProgress();
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyTab, setDifficultyTab] = useState("all");
    const [sourceTab, setSourceTab] = useState("all");
    const [problems, setProblems] = useState<Partial<ProblemDefinition>[]>(defaultProblems);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const loadProblems = () => {
        const customProblems = getCustomProblems();
        // Tag them so we can filter by source
        const taggedCustom = customProblems.map(p => ({ ...p, isCustom: true }));
        setProblems([...defaultProblems.map(p => ({ ...p, isCustom: false })), ...taggedCustom]);
    };

    useEffect(() => {
        loadProblems();
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsed = JSON.parse(content);

                // Allow single object or array
                const newProblems: ProblemDefinition[] = Array.isArray(parsed) ? parsed : [parsed];

                let addedCount = 0;
                for (const prob of newProblems) {
                    if (prob.id && prob.title && prob.template) {
                        saveCustomProblem(prob);
                        addedCount++;
                    }
                }

                if (addedCount > 0) {
                    toast.success(`Successfully imported ${addedCount} custom problem(s)!`);
                    loadProblems(); // Reload state
                } else {
                    toast.error("Invalid JSON format. Expected ProblemDefinition format.");
                }
            } catch (err) {
                toast.error("Failed to parse the JSON file.");
            }
        };
        reader.readAsText(file);

        // Reset input so the same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = "";
    };


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

        return matchesSearch && matchesDifficulty && matchesSource;
    });

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
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/problems/add">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Custom Problem
                            </Link>
                        </Button>
                        <Button variant="outline" className="border-dashed font-semibold" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Upload Coding Set (JSON)
                        </Button>
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>

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
                                            {/* Custom Upload Badge */}
                                            {prob.isCustom && (
                                                <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/5">
                                                    Custom
                                                </Badge>
                                            )}
                                        </div>
                                        {prob.id && isProblemCompleted(prob.id) ? (
                                            <span className="flex items-center text-sm font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                                <CheckCircle2 className="w-4 h-4 mr-1" /> Solved
                                            </span>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{prob.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <Code2 className="w-4 h-4" /> {prob.language}
                                    </CardDescription>
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
