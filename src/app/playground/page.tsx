"use client";

import { useState } from "react";
import { executeCode } from "@/lib/piston";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { SupportedLanguage } from "@/types/problem";
import { Loader2, Play, SquareTerminal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const defaultSnippets: Record<SupportedLanguage, string> = {
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, C World!\\n");\n    return 0;\n}',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++ World!" << endl;\n    return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java World!");\n    }\n}',
    javascript: 'console.log("Hello, JavaScript World!");',
    python: 'print("Hello, Python World!")'
};

export default function PlaygroundPage() {
    const [language, setLanguage] = useState<SupportedLanguage>("cpp");
    const [code, setCode] = useState(defaultSnippets.cpp);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");

    const handleLanguageChange = (newLang: SupportedLanguage) => {
        setLanguage(newLang);
        setCode(defaultSnippets[newLang]);
        setOutput("");
        setError("");
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput("");
        setError("");

        try {
            const result = await executeCode(language, code, "");
            if (result.compile_output) {
                setError(result.compile_output);
                toast.error("Compilation Error");
            } else if (result.stderr) {
                setError(result.stderr);
                toast.error("Execution Error");
            } else {
                setOutput(result.stdout || "Program exited with no output.");
                toast.success("Executed successfully");
            }
        } catch (err) {
            setError("Internal Error");
            toast.error("Execution Service Unavailable");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-[#0a0a0a] text-zinc-300 font-sans">
            {/* Top Bar Navigation */}
            <div className="flex-none h-14 flex items-center justify-between px-6 bg-[#1a1a1a] border-b border-zinc-800/80">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        <SquareTerminal className="w-5 h-5 text-sky-400" />
                        Online IDE
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={language} onValueChange={(v: SupportedLanguage) => handleLanguageChange(v)}>
                        <SelectTrigger className="w-36 h-9 bg-[#282828] border-zinc-700 text-sm text-zinc-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#282828] border-zinc-700 text-zinc-100">
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="c">C</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python 3</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-700 bg-[#282828] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700" onClick={() => handleLanguageChange(language)} title="Reset Code">
                        <RotateCcw className="w-4 h-4" />
                    </Button>

                    <Button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        variant="secondary"
                        className="h-9 bg-green-600/90 hover:bg-green-500 text-green-50 border border-green-500/50 min-w-24 font-semibold"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        Run Code
                    </Button>
                </div>
            </div>

            {/* Main IDE area */}
            <div className="flex-1 overflow-hidden p-2 flex flex-col h-[calc(100vh-3.5rem)]">
                {/* @ts-expect-error missing strict types */}
                <ResizablePanelGroup direction="vertical" className="w-full flex-grow rounded-lg border border-zinc-800/80 overflow-hidden bg-[#1e1e1e]">
                    <ResizablePanel defaultSize={70} className="relative flex flex-col bg-[#1e1e1e] h-full">
                        <div className="flex-none h-9 bg-[#282828] border-b border-zinc-800 flex items-center px-4">
                            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Editor</span>
                        </div>
                        <div className="flex-1 relative w-full h-full">
                            <CodeEditor language={language} code={code} onChange={(v) => setCode(v || "")} />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="h-1.5 bg-zinc-800/50 hover:bg-zinc-700 active:bg-blue-500/50 transition-colors cursor-row-resize z-10" />

                    <ResizablePanel defaultSize={30} className="bg-[#282828] flex flex-col min-h-[100px] h-full">
                        <div className="flex-none h-9 bg-[#282828] border-b border-zinc-800 flex items-center px-4">
                            <div className="flex items-center gap-2">
                                <SquareTerminal className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-200">Terminal</span>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 w-full bg-[#1A1A1A] p-4 text-sm font-mono h-full">
                            {isRunning ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[100px] space-y-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                                    <p className="text-zinc-500 text-xs animate-pulse">Computing...</p>
                                </div>
                            ) : error ? (
                                <div className="text-red-400 whitespace-pre-wrap">{error}</div>
                            ) : output ? (
                                <div className="text-zinc-300 whitespace-pre-wrap">{output}</div>
                            ) : (
                                <div className="text-zinc-500/80 italic text-sm mt-2">Waiting for code execution...</div>
                            )}
                        </ScrollArea>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
