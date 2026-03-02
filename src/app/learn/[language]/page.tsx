"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getTopicsList } from "@/data/topics";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Terminal, Lock, CheckCircle2, BookOpen, ArrowLeft, Trophy, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function LearnPage() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const topicId = searchParams.get("topic");
    const topics = getTopicsList();

    // Extract language from pathname like "/learn/c" or "/learn/cpp"
    const languageKey = pathname?.split('/').pop() || "c";
    const language = languageKey === "cpp" ? "C++" : "C";

    const [completedTopics, setCompletedTopics] = useState<string[]>([]);
    const [xp, setXp] = useState(0);

    // Load progress from localStorage
    useEffect(() => {
        const savedProgress = localStorage.getItem(`completed_topics_${languageKey}`);
        if (savedProgress) {
            const parsed = JSON.parse(savedProgress);
            setCompletedTopics(parsed);
            setXp(parsed.length * 50); // 50 XP per topic
        }
    }, [languageKey]);

    const markTopicCompleted = (id: string) => {
        if (!completedTopics.includes(id)) {
            const newCompleted = [...completedTopics, id];
            setCompletedTopics(newCompleted);
            setXp(newCompleted.length * 50);
            localStorage.setItem(`completed_topics_${languageKey}`, JSON.stringify(newCompleted));
        }
        router.push(`/learn/${languageKey}`); // Go back to map
    };

    // If a topic is selected, render the Topic Detail View
    if (topicId) {
        const currentTopic = topics.find((t) => t.id === topicId) || topics[0];
        const isCompleted = completedTopics.includes(currentTopic.id);

        return (
            <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <Button variant="ghost" className="mb-4 hover:bg-muted" onClick={() => router.push(`/learn/${languageKey}`)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roadmap
                </Button>
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                        {currentTopic.title}
                        <span className="text-sm font-normal px-3 py-1 bg-primary/10 text-primary rounded-full ring-1 ring-primary/20">
                            {language}
                        </span>
                        {isCompleted && (
                            <span className="text-sm font-bold px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center gap-1">
                                <Trophy className="w-4 h-4" /> +50 XP
                            </span>
                        )}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        {currentTopic.tldr}
                    </p>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <div
                        className="text-lg leading-relaxed text-foreground/90 bg-muted/20 p-6 rounded-2xl border border-border/50 shadow-sm"
                        dangerouslySetInnerHTML={{ __html: currentTopic.explanation }}
                    />
                </div>

                {currentTopic.syntax && (
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Terminal className="w-5 h-5" />
                                Syntax
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 border border-zinc-800 overflow-x-auto text-sm font-mono shadow-inner">
                                <code>{languageKey === "cpp" ? currentTopic.syntax.cpp : currentTopic.syntax.c}</code>
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {currentTopic.example && (
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-500">
                                <CodeIcon className="w-5 h-5" />
                                Example Code
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="p-4 rounded-xl bg-zinc-950 text-green-400 border border-zinc-800 overflow-x-auto text-sm font-mono shadow-inner">
                                <code>{languageKey === "cpp" ? currentTopic.example.cpp : currentTopic.example.c}</code>
                            </pre>
                        </CardContent>
                    </Card>
                )}

                <div className="pt-8 pb-12 flex justify-center">
                    <Button
                        size="lg"
                        className={`text-lg px-8 py-6 rounded-2xl shadow-xl transition-all ${isCompleted ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-gradient-to-r from-primary to-blue-600 hover:scale-105'}`}
                        onClick={() => markTopicCompleted(currentTopic.id)}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" /> Lesson Completed
                            </>
                        ) : (
                            <>
                                <Star className="w-6 h-6 mr-2 text-yellow-400 fill-yellow-400" /> Complete Lesson (+50 XP)
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    // GAMIFIED MAP VIEW
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden flex flex-col items-center py-12 px-4">

            {/* Header / Stats */}
            <div className="fixed top-20 right-8 z-10 bg-background/80 backdrop-blur-md rounded-2xl border p-4 shadow-lg flex items-center gap-4">
                <div className="flex items-center gap-2 text-yellow-500 font-black text-xl">
                    <Trophy className="w-6 h-6" />
                    {xp} XP
                </div>
            </div>

            <div className="text-center mb-16 space-y-4 max-w-2xl relative z-10">
                <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    {language} Mastery Path
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                    Follow the roadmap to master {language}. Unlock new lessons as you progress!
                </p>
            </div>

            {/* Path Container */}
            <div className="relative w-full max-w-sm mx-auto flex flex-col items-center z-10 pb-32">
                {topics.map((topic, index) => {
                    const isCompleted = completedTopics.includes(topic.id);
                    const isUnlocked = index === 0 || completedTopics.includes(topics[index - 1].id);
                    const isCurrent = isUnlocked && !isCompleted;

                    // Alternating wobble layout for roadmap feel
                    const offsetX = index % 2 === 0 ? -40 : 40;

                    return (
                        <div key={topic.id} className="relative w-full flex justify-center h-32 group">

                            {/* Connecting Line to next node */}
                            {index < topics.length - 1 && (
                                <div className={`absolute top-1/2 left-1/2 -ml-[2px] w-1 h-32 -z-10 transition-colors duration-500 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                            )}

                            {/* Node Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="absolute top-1/2 -translate-y-1/2"
                                style={{ transform: `translateX(${offsetX}px) translateY(-50%)` }}
                            >
                                <button
                                    onClick={() => isUnlocked && router.push(`/learn/${languageKey}?topic=${topic.id}`)}
                                    disabled={!isUnlocked}
                                    className={`relative rounded-full w-20 h-20 flex items-center justify-center transition-all duration-300 shadow-xl 
                                        ${isCompleted ? "bg-gradient-to-br from-green-400 to-green-600 border-4 border-green-200 text-white cursor-pointer hover:scale-110" :
                                            isCurrent ? "bg-gradient-to-br from-primary to-blue-600 border-4 border-primary/30 text-white ring-4 ring-primary/20 cursor-pointer hover:scale-110" :
                                                "bg-muted border-4 border-muted-foreground/20 text-muted-foreground cursor-not-allowed"}
                                    `}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-8 h-8 drop-shadow-md" />
                                    ) : isCurrent ? (
                                        <BookOpen className="w-8 h-8 drop-shadow-md" />
                                    ) : (
                                        <Lock className="w-8 h-8 opacity-50" />
                                    )}

                                    {/* Tooltip / Label */}
                                    <div className={`absolute ${index % 2 === 0 ? 'left-full ml-4' : 'right-full mr-4'} top-1/2 -translate-y-1/2 w-max max-w-[200px] pointer-events-none transition-opacity duration-200 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <div className="bg-background border shadow-lg rounded-xl p-3">
                                            <p className="font-bold text-sm text-foreground">{topic.title}</p>
                                            {isCompleted && <p className="text-xs text-yellow-500 font-bold mt-1">Completed</p>}
                                            {isCurrent && <p className="text-xs text-primary font-bold mt-1">Current Lesson</p>}
                                            {!isUnlocked && <p className="text-xs text-muted-foreground mt-1">Locked</p>}
                                        </div>
                                    </div>

                                    {/* Pulsing ring for current node */}
                                    {isCurrent && (
                                        <span className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-30" />
                                    )}
                                </button>
                            </motion.div>
                        </div>
                    );
                })}

                {/* End of Path Trophy */}
                <div className="relative w-full flex justify-center h-32 mt-8">
                    <div className="rounded-full w-24 h-24 bg-gradient-to-b from-yellow-300 to-yellow-600 border-4 border-yellow-200 shadow-2xl flex items-center justify-center -translate-y-1/2">
                        <Trophy className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                </div>

            </div>
        </div>
    );
}

function CodeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    )
}
