"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProblemDefinition, SupportedLanguage, TestCase } from "@/types/problem";
import { saveCustomProblem } from "@/lib/problems";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AddProblemPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
    const [category, setCategory] = useState("Custom");
    const [language, setLanguage] = useState<SupportedLanguage>("javascript");
    const [description, setDescription] = useState("");
    const [template, setTemplate] = useState("");
    const [testCases, setTestCases] = useState<TestCase[]>([{ input: "", expectedOutput: "" }]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !template.trim()) {
            toast.error("Please fill in all required fields (Title, Description, and Template).");
            return;
        }

        const validTestCases = testCases.filter(tc => tc.input.trim() !== "" || tc.expectedOutput.trim() !== "");
        if (validTestCases.length === 0) {
            toast.error("Please provide at least one valid test case.");
            return;
        }

        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + Date.now().toString().slice(-4);

        const newProblem: ProblemDefinition = {
            id,
            title,
            difficulty,
            category,
            language,
            description,
            template,
            testCases: validTestCases
        };

        try {
            saveCustomProblem(newProblem);
            toast.success("Problem saved successfully!");
            router.push("/problems");
        } catch (error) {
            toast.error("Failed to save problem. LocalStorage might be full.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Button variant="ghost" asChild className="mb-2 hover:bg-muted">
                <Link href="/problems">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </Button>

            <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Create New Problem</h1>
                <p className="text-muted-foreground">Define a custom coding challenge and test cases to run in your workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Problem Details</CardTitle>
                        <CardDescription>Basic information about your coding challenge.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Problem Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Reverse a String"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select value={difficulty} onValueChange={(v: "Easy" | "Medium" | "Hard") => setDifficulty(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy" className="text-green-500">Easy</SelectItem>
                                        <SelectItem value="Medium" className="text-yellow-500">Medium</SelectItem>
                                        <SelectItem value="Hard" className="text-red-500">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. Arrays, Trees..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Default Language</Label>
                                <Select value={language} onValueChange={(v: SupportedLanguage) => setLanguage(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="javascript">JavaScript (Node)</SelectItem>
                                        <SelectItem value="python">Python 3.10</SelectItem>
                                        <SelectItem value="cpp">C++</SelectItem>
                                        <SelectItem value="c">C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (HTML allowed) <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Write your problem description here. You can use basic HTML tags like <p>, <code>, <pre>..."
                                className="min-h-[150px] font-mono text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="template">Starter Code Template <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="template"
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                placeholder="Provide the starting boilerplate code for the user..."
                                className="min-h-[200px] font-mono text-sm bg-zinc-950 text-zinc-300"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Test Cases</CardTitle>
                        <CardDescription>Define the exact standard inputs and expected outputs. The executor uses strict string matching.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {testCases.map((tc, idx) => (
                            <div key={idx} className="p-4 rounded-xl border bg-muted/20 relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleRemoveTestCase(idx)}
                                        disabled={testCases.length === 1}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Test Case #{idx + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Input (stdin)</Label>
                                        <Textarea
                                            value={tc.input}
                                            onChange={(e) => handleTestCaseChange(idx, "input", e.target.value)}
                                            className="font-mono text-sm min-h-[100px]"
                                            placeholder="Standard Input values..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Expected Output (stdout)</Label>
                                        <Textarea
                                            value={tc.expectedOutput}
                                            onChange={(e) => handleTestCaseChange(idx, "expectedOutput", e.target.value)}
                                            className="font-mono text-sm min-h-[100px]"
                                            placeholder="Exact expected standard output..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" className="w-full border-dashed" onClick={handleAddTestCase}>
                            <Plus className="w-4 h-4 mr-2" /> Add Another Test Case
                        </Button>
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-end">
                        <Button type="submit" size="lg" className="w-full sm:w-auto font-bold shadow-lg">
                            <Save className="w-4 h-4 mr-2" /> Save & Publish Problem
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
