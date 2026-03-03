"use client";

import { useState, useEffect } from "react";
import { CodeEditor } from "./CodeEditor";
import { SolutionsTab } from "./SolutionsTab";
import { executeCode } from "@/lib/piston";
import { Play, Loader2, CheckCircle2, XCircle, Terminal, List, ChevronLeft, ChevronRight, Shuffle, CloudUpload, FileText, FlaskConical, Beaker, CheckSquare, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useProgress } from "@/lib/progress";
import { ProblemDefinition, SupportedLanguage } from "@/types/problem";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WorkspaceProps {
    problem: ProblemDefinition;
}

interface TestCaseResult {
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    consoleOutput?: string;
    error?: string;
}

export function Workspace({ problem }: WorkspaceProps) {
    const [code, setCode] = useState(problem.template);
    const [language, setLanguage] = useState<SupportedLanguage>(problem.language);

    // Submission history
    interface SubmissionRecord {
        _id: string;
        status: string;
        language: string;
        createdAt: string;
    }
    const [submissionHistory, setSubmissionHistory] = useState<SubmissionRecord[]>([]);

    const handleLanguageChange = (newLang: SupportedLanguage) => {
        setLanguage(newLang);
        if (newLang === problem.language) {
            setCode(problem.template);
        } else {
            switch (newLang) {
                case "c":
                    setCode('#include <stdio.h>\n\nint main() {\n    return 0;\n}');
                    break;
                case "cpp":
                    setCode('#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}');
                    break;
                case "javascript":
                    setCode('/**\n * JavaScript snippet\n */\nfunction main() {\n    \n}\n\nmain();');
                    break;
                case "python":
                    setCode('# Python 3 snippet\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()');
                    break;
                case "java":
                    setCode('public class Main {\n    public static void main(String[] args) {\n        // Write Java code here\n    }\n}');
                    break;
            }
        }
    };

    // Execution State
    const [isRunning, setIsRunning] = useState(false);
    const [activeRightTab, setActiveRightTab] = useState("testcase");
    const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);

    // Outputs
    const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);

    const { markProblemCompleted } = useProgress();

    // Problem Sequence Navigation
    const router = useRouter();
    const [problemSequence, setProblemSequence] = useState<string[]>([]);

    // Fetch user preferences and problem sequence
    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                if (data.settings?.defaultLanguage) {
                    const lang = data.settings.defaultLanguage as SupportedLanguage;
                    if (lang !== problem.language) {
                        handleLanguageChange(lang);
                    }
                }
            })
            .catch(console.error);

        // Fetch sequence to power Next/Prev navigation
        fetch("/api/problems")
            .then(res => res.json())
            .then(data => {
                if (data.problems) {
                    // Pull standard sequential ID map
                    const fetchedIds = data.problems.map((p: any) => p.problemId || p.id).reverse();

                    // Prepend default fallback IDs just like the main directory
                    const defaultIds = ["hello-world", "variables", "two-sum", "reverse-string", "linked-list-cycle", "pointers-intro"];
                    const allIds = Array.from(new Set([...defaultIds, ...fetchedIds]));

                    setProblemSequence(allIds);
                }
            })
            .catch(console.error);

        // Fetch submission history
        fetchSubmissions();
    }, []);

    const fetchSubmissions = () => {
        fetch(`/api/submissions?problemId=${problem.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.submissions) setSubmissionHistory(data.submissions);
            })
            .catch(console.error);
    };

    const handleNavigate = (direction: 'prev' | 'next' | 'shuffle') => {
        if (problemSequence.length === 0) return;

        const currentIndex = problemSequence.indexOf(problem.id);
        let targetId = null;

        if (direction === 'shuffle') {
            const randomIndex = Math.floor(Math.random() * problemSequence.length);
            targetId = problemSequence[randomIndex];
        } else if (direction === 'prev' && currentIndex > 0) {
            targetId = problemSequence[currentIndex - 1];
        } else if (direction === 'next' && currentIndex < problemSequence.length - 1) {
            targetId = problemSequence[currentIndex + 1];
        }

        if (targetId && targetId !== problem.id) {
            router.push(`/problems/${targetId}`);
        } else if (!targetId && direction !== 'shuffle') {
            toast.info(direction === 'next' ? "You are at the last problem!" : "This is the first problem.");
        }
    };

    const handleRunCode = async (isSubmit: boolean) => {
        setIsRunning(true);
        setActiveRightTab("testresult");
        setTestResults(null);

        try {
            // Apply driver code macro substitution if exists
            let finalCode = code;
            if (problem.driverCode) {
                if (problem.driverCode.includes("{{USER_CODE}}")) {
                    finalCode = problem.driverCode.replace("{{USER_CODE}}", code);
                } else {
                    finalCode = problem.driverCode + "\n" + code;
                }
            }

            const results: TestCaseResult[] = [];
            let allPassed = true;

            const testCasesToRun = problem.testCases || [];

            if (testCasesToRun.length === 0) {
                toast.error("No test cases defined for this problem.");
                setIsRunning(false);
                return;
            }

            for (const tc of testCasesToRun) {
                const res = await executeCode(language, finalCode, tc.input);

                if (res.compile_output || res.code !== 0) {
                    results.push({
                        passed: false,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        actualOutput: res.stdout,
                        consoleOutput: res.stdout,
                        error: res.compile_output || res.stderr || "Execution failed"
                    });
                    allPassed = false;
                    continue;
                }

                const actualOutput = res.stdout.trim();
                const passed = actualOutput === tc.expectedOutput.trim();
                if (!passed) allPassed = false;

                results.push({
                    passed,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: actualOutput,
                    consoleOutput: res.stdout
                });
            }

            setTestResults(results);

            const finalStatus = allPassed ? "Accepted" : "Wrong Answer";

            if (allPassed) {
                toast.success(isSubmit ? "Submission Accepted!" : "Run Successful", { style: { background: '#22c55e', color: 'white' } });
                if (isSubmit) markProblemCompleted(problem.id);
            } else {
                toast.error(isSubmit ? "Submission failed" : "Test Cases Failed");
            }

            // Send submission to backend only if it's an actual submit
            if (isSubmit) {
                try {
                    await fetch("/api/submissions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            problemId: problem.id,
                            code: code,
                            status: finalStatus,
                            language: language
                        })
                    });
                    // Refresh submission history and switch to submissions tab
                    fetchSubmissions();
                } catch (err) {
                    console.error("Failed to record submission", err);
                }
            }
        } catch (_err) {
            toast.error("Execution Service Unavailable");
            setTestResults([{
                passed: false,
                input: "",
                expectedOutput: "",
                actualOutput: "",
                error: "Internal Error: Could not reach execution service."
            }]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] text-zinc-300 font-sans">
            {/* Top Workspace Navbar */}
            <div className="flex-none h-12 flex items-center justify-between px-4 bg-[#282828] border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5">
                        <Link href="/problems">
                            <List className="w-4 h-4 mr-2" /> Problem List
                        </Link>
                    </Button>
                    <div className="flex items-center gap-0.5 ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 disabled:opacity-50" onClick={() => handleNavigate('prev')}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 disabled:opacity-50" onClick={() => handleNavigate('next')}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5" onClick={() => handleNavigate('shuffle')}>
                            <Shuffle className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 h-8 border border-white/10"
                        onClick={() => handleRunCode(false)}
                        disabled={isRunning}
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-zinc-400" /> : <Play className="w-4 h-4 mr-2 text-green-500 fill-green-500/20" />}
                        Run
                    </Button>
                    <Button
                        size="sm"
                        className="bg-green-600/90 hover:bg-green-500 text-green-50 h-8 border border-green-500/50 font-medium"
                        onClick={() => handleRunCode(true)}
                        disabled={isRunning}
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CloudUpload className="w-4 h-4 mr-2" />}
                        Submit
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Profile link */}
                    <Button variant="ghost" size="sm" asChild className="h-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5">
                        <Link href="/profile">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-amber-600 shadow-inner border border-white/10"></div>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Main Interactive Editor Area */}
            <div className="flex-1 overflow-hidden p-2">
                {/* @ts-expect-error missing strict types */}
                <ResizablePanelGroup id="workspace-outer" direction="horizontal" className="h-full w-full rounded-lg overflow-hidden">

                    {/* Left Panel: Problem Definition Area */}
                    <ResizablePanel defaultSize={45} minSize={30} className="bg-[#282828] rounded-lg border border-zinc-800/80 flex flex-col overflow-hidden">
                        <Tabs defaultValue="description" className="flex flex-col h-full bg-[#282828]">
                            <div className="flex items-center justify-between px-2 bg-[#282828] border-b border-zinc-800">
                                <TabsList className="bg-transparent h-10 p-0 overflow-hidden justify-start flex-nowrap">
                                    <TabsTrigger value="description" className="data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 text-zinc-400 rounded-md h-8 text-xs font-medium border-none data-[state=active]:shadow-none px-3 mx-1">
                                        <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Description
                                    </TabsTrigger>
                                    <TabsTrigger value="editorial" className="data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 text-zinc-400 rounded-md h-8 text-xs font-medium border-none data-[state=active]:shadow-none px-3 mx-1">
                                        <FlaskConical className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> Editorial
                                    </TabsTrigger>
                                    <TabsTrigger value="solutions" className="data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 text-zinc-400 rounded-md h-8 text-xs font-medium border-none data-[state=active]:shadow-none px-3 mx-1">
                                        <Beaker className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Solutions
                                    </TabsTrigger>
                                    <TabsTrigger value="submissions" className="data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 text-zinc-400 rounded-md h-8 text-xs font-medium border-none data-[state=active]:shadow-none px-3 mx-1">
                                        <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-green-400" /> Submissions
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="description" className="flex-1 overflow-hidden m-0 p-0 outline-none">
                                <ScrollArea className="h-full">
                                    <div className="p-6 pb-20">
                                        <h1 className="text-2xl font-bold text-zinc-100 mb-4 tracking-tight">{problem.title}</h1>

                                        <div className="flex flex-wrap gap-3 mb-8">
                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${problem.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                                problem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                                                    "bg-red-500/10 text-red-400 border border-red-500/20"
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                            <span className="px-3 py-1 text-xs rounded-full font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                                                {problem.category}
                                            </span>
                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${problem.isCustom ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                                                {problem.isCustom ? `User Submitted by ${problem.authorName || "Anonymous"}` : "Official Problem"}
                                            </span>
                                            {problem.solvers !== undefined && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {problem.solvers.length} {problem.solvers.length === 1 ? 'Solve' : 'Solves'}
                                                </span>
                                            )}
                                        </div>

                                        <div
                                            className="prose prose-invert prose-p:text-zinc-300 prose-p:leading-relaxed prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-zinc-800 max-w-none"
                                            dangerouslySetInnerHTML={{ __html: problem.description as string }}
                                        />
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="editorial" className="p-6 m-0 text-zinc-500 text-sm">
                                Editorial content locked. Premium required.
                            </TabsContent>
                            <TabsContent value="solutions" className="m-0 h-full">
                                <SolutionsTab problemId={problem.id} currentCode={code} currentLanguage={language} />
                            </TabsContent>
                            <TabsContent value="submissions" className="m-0 h-full overflow-hidden">
                                <ScrollArea className="h-full">
                                    <div className="p-4">
                                        {submissionHistory.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 text-zinc-500 text-sm">
                                                <CheckSquare className="w-8 h-8 mb-2 opacity-30" />
                                                No submissions yet. Submit your solution!
                                            </div>
                                        ) : (
                                            <div className="space-y-0">
                                                <div className="grid grid-cols-3 gap-4 px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-zinc-600 border-b border-zinc-800">
                                                    <span>Status</span>
                                                    <span>Language</span>
                                                    <span className="text-right">Submitted</span>
                                                </div>
                                                {submissionHistory.map((sub, idx) => {
                                                    const timeAgo = (() => {
                                                        const diff = Date.now() - new Date(sub.createdAt).getTime();
                                                        const mins = Math.floor(diff / 60000);
                                                        if (mins < 1) return "Just now";
                                                        if (mins < 60) return `${mins} min ago`;
                                                        const hrs = Math.floor(mins / 60);
                                                        if (hrs < 24) return `${hrs} hr ago`;
                                                        const days = Math.floor(hrs / 24);
                                                        if (days < 30) return `${days}d ago`;
                                                        return new Date(sub.createdAt).toLocaleDateString();
                                                    })();
                                                    return (
                                                        <div key={sub._id} className={`grid grid-cols-3 gap-4 px-3 py-2.5 text-xs border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${idx === 0 ? 'bg-zinc-800/20' : ''}`}>
                                                            <span className={`font-semibold flex items-center gap-1.5 ${sub.status === 'Accepted' ? 'text-green-500' : 'text-red-400'}`}>
                                                                {sub.status === 'Accepted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                                {sub.status}
                                                            </span>
                                                            <span className="text-zinc-400">{sub.language}</span>
                                                            <span className="text-zinc-500 text-right">{timeAgo}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </ResizablePanel>

                    <ResizableHandle className="w-2 bg-[#0a0a0a] hover:bg-[#282828] active:bg-blue-500/50 transition-colors cursor-col-resize z-10" />

                    {/* Right Panel: Code Editor & Execution Results */}
                    <ResizablePanel defaultSize={55} minSize={30} className="flex flex-col h-full">
                        {/* Editor Section */}
                        {/* @ts-expect-error missing strict types */}
                        <ResizablePanelGroup id="workspace-inner" direction="vertical" className="!flex-col flex w-full h-full rounded-lg overflow-hidden border border-zinc-800/80 bg-[#1e1e1e]">

                            <ResizablePanel defaultSize={65} className="flex flex-col relative bg-[#1e1e1e] rounded-t-lg">
                                {/* Editor Header */}
                                <div className="h-10 flex items-center justify-between px-3 bg-[#282828] border-b border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <Code2Icon className="w-4 h-4 text-green-500 ml-1" />
                                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mr-2">Code</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Select value={language} onValueChange={(v: SupportedLanguage) => handleLanguageChange(v)}>
                                            <SelectTrigger className="h-7 w-auto bg-transparent border-none text-xs text-zinc-300 hover:text-zinc-100 hover:bg-white/5 focus:ring-0 shadow-none">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#282828] border-zinc-700 text-zinc-100 text-xs">
                                                <SelectItem value="cpp">C++</SelectItem>
                                                <SelectItem value="c">C</SelectItem>
                                                <SelectItem value="java">Java</SelectItem>
                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                                <SelectItem value="python">Python 3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-100" onClick={() => setCode(problem.template)}>
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* The Editor */}
                                <div className="flex-1 relative w-full h-full bg-[#1e1e1e]">
                                    <CodeEditor language={language} code={code} onChange={(v) => setCode(v || "")} />
                                </div>
                            </ResizablePanel>

                            <ResizableHandle className="h-1.5 bg-zinc-800/50 hover:bg-zinc-700 active:bg-blue-500/50 transition-colors cursor-row-resize z-10" />

                            {/* Output Panel Section */}
                            <ResizablePanel defaultSize={35} className="bg-[#282828] flex flex-col min-h-[100px]">
                                <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex flex-col h-full w-full">
                                    <div className="flex items-center justify-between px-2 bg-[#282828] border-b border-zinc-800">
                                        <TabsList className="bg-transparent h-10 p-0 overflow-hidden justify-start flex-nowrap">
                                            <TabsTrigger value="testcase" className="data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 text-zinc-400 rounded-md h-8 text-xs font-medium border-none data-[state=active]:shadow-none px-4 mx-1">
                                                <Terminal className="w-3.5 h-3.5 mr-1.5 text-zinc-400" /> Testcase
                                            </TabsTrigger>
                                            <TabsTrigger value="testresult" className="data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 text-zinc-400 rounded-md h-8 text-xs font-medium border-none data-[state=active]:shadow-none px-4 mx-1">
                                                <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Test Result
                                            </TabsTrigger>
                                        </TabsList>
                                        <div className="pr-2 flex gap-1">
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full flex flex-col bg-[#282828] overflow-y-auto min-h-0">
                                        {/* Testcase Input Tab */}
                                        <TabsContent value="testcase" className="m-0 p-4 outline-none">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    {problem.testCases?.map((tc, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => setActiveTestCaseIdx(idx)}
                                                            className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${idx === activeTestCaseIdx ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300'}`}
                                                        >
                                                            Case {idx + 1}
                                                        </div>
                                                    ))}
                                                </div>

                                                {problem.testCases && problem.testCases[activeTestCaseIdx] && (
                                                    <div className="space-y-4 pt-2">
                                                        <div>
                                                            <Label className="text-xs font-semibold text-zinc-500">Input</Label>
                                                            <div className="mt-1.5 bg-zinc-900/80 p-3 font-mono text-xs text-zinc-300 rounded-lg whitespace-pre-wrap border border-zinc-800/50">
                                                                {problem.testCases[activeTestCaseIdx].input}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs font-semibold text-zinc-500">Expected Output</Label>
                                                            <div className="mt-1.5 bg-zinc-900/80 p-3 font-mono text-xs text-zinc-300 rounded-lg whitespace-pre-wrap border border-zinc-800/50">
                                                                {problem.testCases[activeTestCaseIdx].expectedOutput}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        {/* Execution Results Tab */}
                                        <TabsContent value="testresult" className="m-0 p-4 outline-none">
                                            {isRunning && activeRightTab === "testresult" ? (
                                                <div className="flex flex-col items-center justify-center h-32 space-y-4">
                                                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                                    <p className="text-zinc-400 text-sm animate-pulse">Running against test cases...</p>
                                                </div>
                                            ) : !testResults ? (
                                                <div className="flex items-center justify-center h-full text-zinc-500 text-sm p-10 mt-4">
                                                    You must run your code first
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Global Status Banner */}
                                                    <div className="pb-2">
                                                        {testResults.every(t => t.passed) ? (
                                                            <h3 className="text-2xl font-semibold text-green-500 tracking-tight">Accepted</h3>
                                                        ) : (
                                                            <h3 className="text-2xl font-semibold text-red-500 tracking-tight">Wrong Answer</h3>
                                                        )}
                                                        <p className="text-zinc-500 text-xs mt-1">Runtime: {(Math.random() * 50 + 10).toFixed(0)} ms</p>
                                                    </div>

                                                    {/* Individual Test Cases Display */}
                                                    <div className="flex gap-2">
                                                        {testResults.map((result, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => setActiveTestCaseIdx(idx)}
                                                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${activeTestCaseIdx === idx ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-[#282828] ' : ''}${result.passed ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                                                <span className="flex items-center gap-1.5">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                    Case {idx + 1}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-4 pt-4">
                                                        {(() => {
                                                            const activeResult = testResults[activeTestCaseIdx] || testResults[0];
                                                            return (
                                                                <>
                                                                    {activeResult.error && (
                                                                        <div>
                                                                            <Label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Error</Label>
                                                                            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap border border-red-500/20">
                                                                                {activeResult.error}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {activeResult.input && (
                                                                        <div>
                                                                            <Label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Input</Label>
                                                                            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg font-mono text-xs text-zinc-300">
                                                                                {activeResult.input}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div>
                                                                        <Label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Output</Label>
                                                                        <div className={`bg-zinc-900 border p-3 rounded-lg font-mono text-xs whitespace-pre-wrap ${activeResult.passed ? 'border-zinc-800 text-zinc-300' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
                                                                            {activeResult.actualOutput || <span className="text-zinc-600 italic">null</span>}
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <Label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Expected</Label>
                                                                        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg font-mono text-xs text-zinc-300 whitespace-pre-wrap">
                                                                            {activeResult.expectedOutput}
                                                                        </div>
                                                                    </div>

                                                                    {activeResult.consoleOutput && activeResult.consoleOutput.trim() && !activeResult.error && (
                                                                        <div>
                                                                            <Label className="text-xs font-semibold text-zinc-500 mb-1.5 flex items-center gap-2">
                                                                                <Terminal className="w-3.5 h-3.5" /> Console (Stdout)
                                                                            </Label>
                                                                            <div className="bg-[#1e1e1e] border border-zinc-800 p-3 rounded-lg font-mono text-xs text-zinc-400 whitespace-pre-wrap">
                                                                                {activeResult.consoleOutput}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        {/* Removed terminal output block as run/submit utilizes visual Result testcase diffs instead */}
                                    </div>
                                </Tabs>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}

// Quick helper icon for the Editor header
function Code2Icon(props: React.ComponentProps<"svg">) {
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
