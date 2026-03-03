"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SupportedLanguage, TestCase } from "@/types/problem";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash, ArrowLeft, Save, ImagePlus, Upload, X, Clipboard, Code2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminAddProblemPage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
    const [category, setCategory] = useState("Custom");
    const [language, setLanguage] = useState<SupportedLanguage>("javascript");
    const [description, setDescription] = useState("");

    // Per-language records for Templates and Driver Code
    const [templates, setTemplates] = useState<Partial<Record<SupportedLanguage, string>>>({});
    const [driverCodes, setDriverCodes] = useState<Partial<Record<SupportedLanguage, string>>>({});
    const [activeLangTab, setActiveLangTab] = useState<SupportedLanguage>("javascript");

    const [companies, setCompanies] = useState("");
    const [topics, setTopics] = useState("");
    const [testCases, setTestCases] = useState<TestCase[]>([{ input: "", expectedOutput: "" }]);
    const [problemId, setProblemId] = useState("");
    const [loadingId, setLoadingId] = useState(true);

    // Structured description fields
    const [problemStatement, setProblemStatement] = useState("");
    const [inputFormat, setInputFormat] = useState("");
    const [outputFormat, setOutputFormat] = useState("");
    const [examples, setExamples] = useState([{ input: "", output: "", explanation: "", image: "" }]);
    const [constraints, setConstraints] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const processImageFile = (file: File, onDone: (dataUrl: string) => void) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            onDone(reader.result as string);
            toast.success('Image added!');
        };
        reader.onerror = () => toast.error('Failed to read image');
        reader.readAsDataURL(file);
    };

    const handlePasteFor = (onDone: (dataUrl: string) => void) => (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) processImageFile(file, onDone);
                return;
            }
        }
    };

    const addExample = () => setExamples([...examples, { input: "", output: "", explanation: "", image: "" }]);
    const removeExample = (idx: number) => {
        if (examples.length > 1) setExamples(examples.filter((_, i) => i !== idx));
    };
    const updateExample = (idx: number, field: string, value: string) => {
        const updated = [...examples];
        updated[idx] = { ...updated[idx], [field]: value };
        setExamples(updated);
    };

    // Build HTML description from structured fields
    const buildDescription = () => {
        let html = '';
        if (problemStatement.trim()) {
            html += `<h3 style="margin-top:0">Problem Statement</h3>\n<p>${problemStatement.replace(/\n/g, '<br/>')}</p>\n`;
        }
        if (imageUrl.trim()) {
            html += `<img src="${imageUrl}" alt="Problem illustration" style="max-width:100%; border-radius:8px; margin:16px 0;" />\n`;
        }
        if (inputFormat.trim()) {
            html += `<h4 style="margin-top:24px;margin-bottom:8px">Input Format</h4>\n<p>${inputFormat.replace(/\n/g, '<br/>')}</p>\n`;
        }
        if (outputFormat.trim()) {
            html += `<h4 style="margin-top:20px;margin-bottom:8px">Output Format</h4>\n<p>${outputFormat.replace(/\n/g, '<br/>')}</p>\n`;
        }
        examples.forEach((ex, i) => {
            if (ex.input.trim() || ex.output.trim() || ex.image) {
                html += `<hr style="border:none;border-top:1px solid #333;margin:24px 0 16px" />\n`;
                html += `<h4 style="margin-bottom:12px">Example ${i + 1}:</h4>\n`;
                if (ex.image) {
                    html += `<img src="${ex.image}" alt="Example ${i + 1} diagram" style="max-width:100%;border-radius:8px;margin:8px 0 12px" />\n`;
                }
                html += `<div style="background:#1a1a2e;padding:12px;border-radius:8px;margin:8px 0;font-family:monospace;"><strong>Input:</strong>\n<pre style="margin:4px 0 12px 0;white-space:pre-wrap;font-family:inherit">${ex.input}</pre><strong>Output:</strong>\n<pre style="margin:4px 0 0 0;white-space:pre-wrap;font-family:inherit">${ex.output}</pre></div>\n`;
                if (ex.explanation.trim()) {
                    html += `<p style="margin-top:8px;color:#aaa"><strong>Explanation:</strong> ${ex.explanation}</p>\n`;
                }
            }
        });
        if (constraints.trim()) {
            html += `<hr style="border:none;border-top:1px solid #333;margin:24px 0 16px" />\n`;
            html += `<h4 style="margin-bottom:8px">Constraints:</h4>\n<ul style="margin:0;padding-left:20px">\n`;
            constraints.split('\n').filter(c => c.trim()).forEach(c => {
                html += `  <li style="margin:4px 0">${c.trim()}</li>\n`;
            });
            html += `</ul>\n`;
        }
        return html;
    };

    // Auto-generate next MC ID on mount
    useEffect(() => {
        fetch("/api/problems?all=true")
            .then(res => res.json())
            .then(data => {
                if (data.problems) {
                    // Find the highest MC number
                    let maxNum = 0;
                    data.problems.forEach((p: any) => {
                        const match = (p.problemId || "").match(/^mc(\d+)$/i);
                        if (match) {
                            const num = parseInt(match[1], 10);
                            if (num > maxNum) maxNum = num;
                        }
                    });
                    const nextNum = maxNum + 1;
                    const nextId = `MC${String(nextNum).padStart(2, '0')}`;
                    setProblemId(nextId);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingId(false));
    }, []);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: "", expectedOutput: "" }]);
    };

    const handleRemoveTestCase = (index: number) => {
        if (testCases.length > 1) {
            setTestCases(testCases.filter((_, i) => i !== index));
        }
    };

    const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
        const newTestCases = [...testCases];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        setTestCases(newTestCases);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Compose description from structured fields if present, otherwise use raw
        const finalDescription = problemStatement.trim()
            ? buildDescription()
            : description;

        if (!title.trim() || (!problemStatement.trim() && !description.trim())) {
            toast.error("Please fill in all required fields (Title and Problem Statement/Description).");
            return;
        }

        const validTestCases = testCases.filter(tc => tc.input.trim() !== "" || tc.expectedOutput.trim() !== "");
        if (validTestCases.length === 0) {
            toast.error("Please provide at least one valid test case.");
            return;
        }

        const finalProblemId = problemId.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + Date.now().toString().slice(-4);

        const companyArray = companies.split(",").map(c => c.trim()).filter(c => c !== "");
        const topicArray = topics.split(",").map(t => t.trim()).filter(t => t !== "");

        const newProblem = {
            problemId: finalProblemId,
            title,
            difficulty,
            category,
            language,
            description: finalDescription,
            template: templates,
            driverCode: driverCodes,
            companies: companyArray,
            topics: topicArray,
            authorName: session?.user?.name || "Admin",
            testCases: validTestCases
        };

        try {
            const res = await fetch("/api/problems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProblem),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save problem");
            }

            toast.success("Problem saved successfully!");
            router.push("/admin/problems");
        } catch (error: any) {
            toast.error(error.message || "Failed to save problem.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Button variant="ghost" asChild className="mb-2 hover:bg-muted text-zinc-400">
                <Link href="/admin/problems">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Problem Sets
                </Link>
            </Button>

            <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Curate Problem</h1>
                <p className="text-zinc-400">Define a custom coding challenge and assign topic tags for discovery.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="bg-[#1e1e1e] border-zinc-800 text-zinc-100">
                    <CardHeader>
                        <CardTitle>Problem Details</CardTitle>
                        <CardDescription className="text-zinc-500">Basic information about your coding challenge.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-zinc-300">Problem Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Detect Cycle in a Graph"
                                className="bg-zinc-950 border-zinc-800"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="problemId" className="text-zinc-300">Problem ID (MC Code)</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="problemId"
                                    value={problemId}
                                    onChange={(e) => setProblemId(e.target.value.toUpperCase())}
                                    placeholder={loadingId ? "Loading..." : "e.g. MC01"}
                                    className="bg-zinc-950 border-zinc-800 font-mono text-lg tracking-wider max-w-[200px]"
                                />
                                <span className="text-xs text-zinc-500">Auto-generated. Edit if needed.</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Difficulty</Label>
                                <Select value={difficulty} onValueChange={(v: "Easy" | "Medium" | "Hard") => setDifficulty(v)}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                                        <SelectValue placeholder="Select Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1e1e1e] border-zinc-800 text-zinc-300">
                                        <SelectItem value="Easy" className="text-green-500">Easy</SelectItem>
                                        <SelectItem value="Medium" className="text-yellow-500">Medium</SelectItem>
                                        <SelectItem value="Hard" className="text-red-500">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-zinc-300">Category</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. Graph Theory"
                                    className="bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Default Language</Label>
                                <Select value={language} onValueChange={(v: SupportedLanguage) => setLanguage(v)}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1e1e1e] border-zinc-800 text-zinc-300">
                                        <SelectItem value="javascript">JavaScript (Node)</SelectItem>
                                        <SelectItem value="python">Python 3.10</SelectItem>
                                        <SelectItem value="cpp">C++</SelectItem>
                                        <SelectItem value="c">C</SelectItem>
                                        <SelectItem value="java">Java 15</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="companies" className="text-zinc-300">Companies (comma separated)</Label>
                                <Input
                                    id="companies"
                                    value={companies}
                                    onChange={(e) => setCompanies(e.target.value)}
                                    placeholder="e.g. Adobe, Google, Amazon"
                                    className="bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topics" className="text-zinc-300">Topics (comma separated)</Label>
                                <Input
                                    id="topics"
                                    value={topics}
                                    onChange={(e) => setTopics(e.target.value)}
                                    placeholder="e.g. Arrays, Sorting, Binary Search"
                                    className="bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>

                        {/* === STRUCTURED DESCRIPTION BUILDER === */}
                        <Card className="bg-zinc-950/50 border-zinc-800 border-dashed">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base text-zinc-200">📝 Problem Description Builder</CardTitle>
                                <CardDescription className="text-zinc-500 text-xs">Fill in the sections below. These will auto-compose into the final HTML description.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Problem Statement */}
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Problem Statement <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        value={problemStatement}
                                        onChange={(e) => setProblemStatement(e.target.value)}
                                        placeholder="Given an m × n matrix, complete the spiral rotation..."
                                        className="min-h-[100px] bg-zinc-950 border-zinc-800 text-sm text-zinc-100"
                                    />
                                </div>

                                {/* Input / Output Format */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Input Format</Label>
                                        <Textarea
                                            value={inputFormat}
                                            onChange={(e) => setInputFormat(e.target.value)}
                                            placeholder="First line contains two integers m and n.\nNext m lines contain n integers each."
                                            className="min-h-[80px] bg-zinc-950 border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Output Format</Label>
                                        <Textarea
                                            value={outputFormat}
                                            onChange={(e) => setOutputFormat(e.target.value)}
                                            placeholder="Print the elements of the matrix in spiral order formatted as [1,2,3...]"
                                            className="min-h-[80px] bg-zinc-950 border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 flex items-center gap-2">
                                        <ImagePlus className="w-4 h-4 text-blue-400" />
                                        Image / Diagram <span className="text-zinc-500 text-xs ml-1">(Optional — upload, paste, or enter URL)</span>
                                    </Label>

                                    {!imageUrl ? (
                                        <div
                                            className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center hover:border-blue-500/50 transition-colors cursor-pointer bg-zinc-950/50"
                                            onPaste={handlePasteFor(setImageUrl)}
                                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500'); }}
                                            onDragLeave={(e) => { e.currentTarget.classList.remove('border-blue-500'); }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('border-blue-500');
                                                const file = e.dataTransfer.files[0];
                                                if (file) processImageFile(file, setImageUrl);
                                            }}
                                            onClick={() => document.getElementById('imageFileInput')?.click()}
                                            tabIndex={0}
                                        >
                                            <input
                                                id="imageFileInput"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) processImageFile(file, setImageUrl);
                                                }}
                                            />
                                            <div className="space-y-1">
                                                <Upload className="w-6 h-6 mx-auto text-zinc-600" />
                                                <p className="text-zinc-400 text-xs">Click, drag & drop, or <span className="text-blue-400">Ctrl+V</span> to paste</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative inline-block">
                                            <img src={imageUrl} alt="Preview" className="max-h-48 rounded-lg border border-zinc-700" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                onClick={() => setImageUrl('')}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* URL fallback */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-zinc-600">Or enter URL:</span>
                                        <Input
                                            value={imageUrl.startsWith('data:') ? '' : imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://i.imgur.com/image.png"
                                            className="bg-zinc-950 border-zinc-800 text-sm text-zinc-200 h-8 text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Examples */}
                                <div className="space-y-3">
                                    <Label className="text-zinc-300">Examples</Label>
                                    {examples.map((ex, idx) => (
                                        <div key={idx} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-3 relative group">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Example {idx + 1}</span>
                                                {examples.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300" onClick={() => removeExample(idx)}>
                                                        <Trash className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Per-example image upload */}
                                            <div className="space-y-1">
                                                <Label className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <ImagePlus className="w-3 h-3" /> Diagram / Screenshot (optional)
                                                </Label>
                                                {!ex.image ? (
                                                    <div
                                                        className="border border-dashed border-zinc-700 rounded-lg p-3 text-center hover:border-blue-500/50 transition-colors cursor-pointer bg-zinc-950/30"
                                                        onPaste={handlePasteFor((url) => updateExample(idx, 'image', url))}
                                                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500'); }}
                                                        onDragLeave={(e) => { e.currentTarget.classList.remove('border-blue-500'); }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            e.currentTarget.classList.remove('border-blue-500');
                                                            const file = e.dataTransfer.files[0];
                                                            if (file) processImageFile(file, (url) => updateExample(idx, 'image', url));
                                                        }}
                                                        onClick={() => document.getElementById(`exImgInput${idx}`)?.click()}
                                                        tabIndex={0}
                                                    >
                                                        <input
                                                            id={`exImgInput${idx}`}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) processImageFile(file, (url) => updateExample(idx, 'image', url));
                                                            }}
                                                        />
                                                        <p className="text-zinc-500 text-xs">Click, drop, or Ctrl+V to add image</p>
                                                    </div>
                                                ) : (
                                                    <div className="relative inline-block">
                                                        <img src={ex.image} alt={`Example ${idx + 1}`} className="max-h-32 rounded border border-zinc-700" />
                                                        <Button type="button" variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5 rounded-full" onClick={() => updateExample(idx, 'image', '')}>
                                                            <X className="w-2.5 h-2.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-zinc-500">Input</Label>
                                                    <Textarea
                                                        value={ex.input}
                                                        onChange={(e) => updateExample(idx, "input", e.target.value)}
                                                        placeholder="matrix = [[1,2,3],[4,5,6],[7,8,9]]"
                                                        className="bg-zinc-950 border-zinc-800 font-mono text-xs text-zinc-200 min-h-[60px]"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-zinc-500">Output</Label>
                                                    <Textarea
                                                        value={ex.output}
                                                        onChange={(e) => updateExample(idx, "output", e.target.value)}
                                                        placeholder="[[7,4,1],[8,5,2],[9,6,3]]"
                                                        className="bg-zinc-950 border-zinc-800 font-mono text-xs text-zinc-200 min-h-[60px]"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-zinc-500">Explanation (optional)</Label>
                                                <Input
                                                    value={ex.explanation}
                                                    onChange={(e) => updateExample(idx, "explanation", e.target.value)}
                                                    placeholder="The matrix is rotated 90 degrees clockwise."
                                                    className="bg-zinc-950 border-zinc-800 text-xs text-zinc-200"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" className="border-dashed border-zinc-700 text-zinc-400 hover:text-white text-xs" onClick={addExample}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Example
                                    </Button>
                                </div>

                                {/* Constraints */}
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Constraints <span className="text-zinc-500 text-xs ml-1">(one per line)</span></Label>
                                    <Textarea
                                        value={constraints}
                                        onChange={(e) => setConstraints(e.target.value)}
                                        placeholder={"n == matrix.length == matrix[i].length\n1 <= n <= 20\n-1000 <= matrix[i][j] <= 1000"}
                                        className="min-h-[80px] bg-zinc-950 border-zinc-800 font-mono text-xs text-zinc-200"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Raw HTML fallback */}
                        <details className="group">
                            <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors">
                                Advanced: Raw HTML Description (overrides builder if Problem Statement is empty)
                            </summary>
                            <div className="mt-2 space-y-2">
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Write raw HTML here if you prefer..."
                                    className="min-h-[150px] font-mono text-sm bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </details>

                        <div className="pt-4 border-t border-zinc-800">
                            <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-blue-400" /> Language Specific Code
                            </h3>

                            <Tabs value={activeLangTab} onValueChange={(v) => setActiveLangTab(v as SupportedLanguage)} className="w-full">
                                <TabsList className="bg-zinc-900 border-b border-zinc-800 rounded-none w-full justify-start h-auto p-0 flex-wrap">
                                    <TabsTrigger value="javascript" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2">JavaScript</TabsTrigger>
                                    <TabsTrigger value="python" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2">Python</TabsTrigger>
                                    <TabsTrigger value="cpp" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2">C++</TabsTrigger>
                                    <TabsTrigger value="c" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2">C</TabsTrigger>
                                    <TabsTrigger value="java" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2">Java</TabsTrigger>
                                </TabsList>

                                {(["javascript", "python", "cpp", "c", "java"] as SupportedLanguage[]).map((lang) => (
                                    <TabsContent key={lang} value={lang} className="p-4 space-y-6 bg-zinc-950/30 border border-t-0 border-zinc-800 rounded-b-lg m-0">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300">Starter Code Template <span className="text-zinc-500 text-xs ml-2">(Optional Codeforces Boilerplate or Leetcode Function signature)</span></Label>
                                            <Textarea
                                                value={templates[lang] || ""}
                                                onChange={(e) => setTemplates(prev => ({ ...prev, [lang]: e.target.value }))}
                                                placeholder={`Provide the starting boilerplate code for ${lang}...`}
                                                className="min-h-[150px] font-mono text-sm bg-zinc-950 text-zinc-300 border-zinc-800 focus:border-zinc-700"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-zinc-300">Hidden Driver Code (Optional) </Label>
                                            <CardDescription className="mb-2 text-zinc-500">
                                                Use the <code className="bg-zinc-900 px-1 py-0.5 rounded text-white border border-zinc-800">{"{{USER_CODE}}"}</code> macro to wrap their function. Leave blank for raw Codeforces execution.
                                            </CardDescription>
                                            <Textarea
                                                value={driverCodes[lang] || ""}
                                                onChange={(e) => setDriverCodes(prev => ({ ...prev, [lang]: e.target.value }))}
                                                placeholder={`Example wrapper for ${lang}...`}
                                                className="min-h-[150px] font-mono text-sm bg-zinc-950/50 border-dashed text-zinc-400 border-zinc-800 focus:border-zinc-700"
                                            />
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1e1e1e] border-zinc-800 text-zinc-100">
                    <CardHeader>
                        <CardTitle>Test Cases</CardTitle>
                        <CardDescription className="text-zinc-500">Define the exact standard inputs and expected outputs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {testCases.map((tc, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 bg-red-500 hover:bg-red-600"
                                        onClick={() => handleRemoveTestCase(idx)}
                                        disabled={testCases.length === 1}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                                <h4 className="text-sm font-semibold mb-3 text-zinc-500 uppercase tracking-wide">Test Case #{idx + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-400">Input (stdin)</Label>
                                        <Textarea
                                            value={tc.input}
                                            onChange={(e) => handleTestCaseChange(idx, "input", e.target.value)}
                                            className="font-mono text-sm min-h-[100px] bg-zinc-950 border-zinc-800"
                                            placeholder="Standard Input values..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-400">Expected Output (stdout)</Label>
                                        <Textarea
                                            value={tc.expectedOutput}
                                            onChange={(e) => handleTestCaseChange(idx, "expectedOutput", e.target.value)}
                                            className="font-mono text-sm min-h-[100px] bg-zinc-950 border-zinc-800"
                                            placeholder="Exact expected standard output..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" className="w-full border-dashed border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white" onClick={handleAddTestCase}>
                            <Plus className="w-4 h-4 mr-2" /> Add Another Test Case
                        </Button>
                    </CardContent>
                    <CardFooter className="bg-[#191919] border-t border-zinc-800 py-4 px-6 flex justify-end">
                        <Button type="submit" size="lg" className="w-full sm:w-auto font-bold shadow-lg bg-green-600 hover:bg-green-500 text-white">
                            <Save className="w-4 h-4 mr-2" /> Create Curated Problem
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
