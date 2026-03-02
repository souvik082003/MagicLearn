"use client";

import { useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { executeCode } from "@/lib/piston";
import { Play, Loader2, CheckCircle2, XCircle, Terminal, List, ChevronLeft, ChevronRight, Shuffle, CloudUpload, Settings, FileText, FlaskConical, Beaker, CheckSquare, Maximize2, RotateCcw, SquareTerminal } from "lucide-react";
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

interface WorkspaceProps {
    problem: ProblemDefinition;
}

interface TestCaseResult {
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    error?: string;
}

export function Workspace({ problem }: WorkspaceProps) {
    const [code, setCode] = useState(problem.template);
    const [language, setLanguage] = useState<SupportedLanguage>(problem.language);

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
            }
        }
    };

    // Execution State
    const [isRunning, setIsRunning] = useState(false);
    const [activeRightTab, setActiveRightTab] = useState("testcase");

    // Outputs
    const [customInput, setCustomInput] = useState("");
    const [customOutput, setCustomOutput] = useState("");
    const [customError, setCustomError] = useState("");
    const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);

    const { markProblemCompleted } = useProgress();

    const handleRunCode = async (isTestMode: boolean) => {
        setIsRunning(true);
        setCustomOutput("");
        setCustomError("");

        try {
            if (isTestMode && problem.testCases && problem.testCases.length > 0) {
                setActiveRightTab("testresult");
                setTestResults(null);

                const results: TestCaseResult[] = [];
                let allPassed = true;

                for (const tc of problem.testCases) {
                    const res = await executeCode(language, code, tc.input);

                    if (res.compile_output || res.code !== 0) {
                        results.push({
                            passed: false,
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                            actualOutput: res.stdout,
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
                        actualOutput: actualOutput
                    });
                }

                setTestResults(results);

                if (allPassed) {
                    toast.success("Accepted", { style: { background: '#22c55e', color: 'white' } });
                    markProblemCompleted(problem.id);
                } else {
                    toast.error("Wrong Answer");
                }

            } else {
                // Custom Run Mode
                setActiveRightTab("terminal");
                const result = await executeCode(language, code, customInput);
                if (result.compile_output) {
                    setCustomError(result.compile_output);
                    toast.error("Compilation Error");
                } else if (result.stderr) {
                    setCustomError(result.stderr);
                    toast.error("Execution Error");
                } else {
                    setCustomOutput(result.stdout);
                    toast.success("Executed successfully");
                }
            }
        } catch (_err) {
            setCustomError("Internal Error");
            toast.error("Execution Service Unavailable");
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 disabled:opacity-50">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 disabled:opacity-50">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5">
                        <Settings className="w-4 h-4" />
                    </Button>
                    {/* Simulated avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-400 to-amber-600 ml-2 shadow-inner border border-white/10"></div>
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
                                <TabsList className="bg-transparent h-10 p-0 overflow-x-auto justify-start flex-nowrap">
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
                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${problem.difficulty === "Easy" ? "bg-green-500/10 text-green-400" :
                                                problem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
                                                    "bg-red-500/10 text-red-400"
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                            <span className="px-3 py-1 text-xs rounded-full font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                                                {problem.category}
                                            </span>
                                        </div>

                                        <div className="prose prose-invert prose-p:text-zinc-300 prose-p:leading-relaxed prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-zinc-800 max-w-none">
                                            {problem.description}
                                        </div>
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="editorial" className="p-6 m-0 text-zinc-500 text-sm">
                                Editorial content locked. Premium required.
                            </TabsContent>
                            <TabsContent value="solutions" className="p-6 m-0 text-zinc-500 text-sm">
                                Community solutions go here.
                            </TabsContent>
                            <TabsContent value="submissions" className="p-6 m-0 text-zinc-500 text-sm">
                                Your past submissions history.
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
                                        <TabsList className="bg-transparent h-10 p-0 overflow-x-auto justify-start flex-nowrap">
                                            <TabsTrigger value="testcase" className="data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 text-zinc-400 rounded-md h-8 text-xs font-medium border-none data-[state=active]:shadow-none px-4 mx-1">
                                                <Terminal className="w-3.5 h-3.5 mr-1.5 text-zinc-400" /> Testcase
                                            </TabsTrigger>
                                            <TabsTrigger value="testresult" className="data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 text-zinc-400 rounded-md h-8 text-xs font-medium border-none data-[state=active]:shadow-none px-4 mx-1">
                                                <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Test Result
                                            </TabsTrigger>
                                            <TabsTrigger value="terminal" className="data-[state=active]:bg-zinc-800/50 data-[state=active]:text-zinc-100 text-zinc-400 rounded-md h-8 text-xs font-medium border-none data-[state=active]:shadow-none px-4 mx-1">
                                                <SquareTerminal className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Output
                                            </TabsTrigger>
                                        </TabsList>
                                        <div className="pr-2 flex gap-1">
                                        </div>
                                    </div>

                                    <ScrollArea className="flex-1 w-full relative bg-[#282828]">
                                        {/* Testcase Input Tab */}
                                        <TabsContent value="testcase" className="m-0 p-4 h-full outline-none">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    {problem.testCases?.map((tc, idx) => (
                                                        <div key={idx} className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${idx === 0 ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300'}`}>
                                                            Case {idx + 1}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-4 pt-2">
                                                    <div>
                                                        <Label className="text-xs font-semibold text-zinc-500">Input (stdin/args)</Label>
                                                        <Textarea
                                                            className="mt-1.5 bg-zinc-900 border-none resize-none font-mono text-xs text-zinc-300 rounded-lg min-h-[60px] focus-visible:ring-1 focus-visible:ring-zinc-700"
                                                            value={customInput || (problem.testCases?.[0]?.input || "")}
                                                            onChange={(e) => setCustomInput(e.target.value)}
                                                            placeholder="Example: 1 2 3"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Showing Custom Run Execution result here if no explicit tab exists */}
                                            {customOutput && !isRunning && (
                                                <div className="mt-4 pt-4 border-t border-zinc-800">
                                                    <Label className="text-xs font-semibold text-zinc-500">Output (stdout)</Label>
                                                    <div className="mt-1.5 bg-zinc-900 p-3 rounded-lg font-mono text-xs text-zinc-300 whitespace-pre-wrap">
                                                        {customOutput}
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        {/* Execution Results Tab */}
                                        <TabsContent value="testresult" className="m-0 p-4 h-full outline-none">
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
                                                            <div key={idx} className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${result.passed ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                                                <span className="flex items-center gap-1.5">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                    Case {idx + 1}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-4 pt-2">
                                                        {testResults[0].error && (
                                                            <div>
                                                                <Label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Error</Label>
                                                                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap border border-red-500/20">
                                                                    {testResults[0].error}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {testResults[0].input && (
                                                            <div>
                                                                <Label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Input</Label>
                                                                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg font-mono text-xs text-zinc-300">
                                                                    {testResults[0].input}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <Label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Output</Label>
                                                            <div className={`bg-zinc-900 border p-3 rounded-lg font-mono text-xs whitespace-pre-wrap ${testResults[0].passed ? 'border-zinc-800 text-zinc-300' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
                                                                {testResults[0].actualOutput || <span className="text-zinc-600 italic">null</span>}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <Label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Expected</Label>
                                                            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg font-mono text-xs text-zinc-300 whitespace-pre-wrap">
                                                                {testResults[0].expectedOutput}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        {/* Output/Terminal Tab */}
                                        <TabsContent value="terminal" className="m-0 p-4 h-full flex flex-col outline-none">
                                            {isRunning && activeRightTab === "terminal" ? (
                                                <div className="flex flex-col items-center justify-center h-32 space-y-4">
                                                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                                    <p className="text-zinc-400 text-sm animate-pulse">Executing code...</p>
                                                </div>
                                            ) : (
                                                <div className="flex-1 bg-zinc-950 p-4 rounded-lg font-mono text-sm overflow-auto border border-zinc-800 tracking-tight leading-relaxed min-h-[150px]">
                                                    {customError ? (
                                                        <div className="text-red-400 whitespace-pre-wrap">{customError}</div>
                                                    ) : customOutput ? (
                                                        <div className="text-zinc-300 whitespace-pre-wrap">{customOutput}</div>
                                                    ) : (
                                                        <div className="text-zinc-500/80 italic text-center mt-10">Run code to see output...</div>
                                                    )}
                                                </div>
                                            )}
                                        </TabsContent>
                                    </ScrollArea>
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
