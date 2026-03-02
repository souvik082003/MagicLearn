"use client";

import { Workspace } from "@/components/editor/Workspace";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProblemDefinition } from "@/types/problem";

const problemData: Record<string, ProblemDefinition> = {
    "hello-world": {
        id: "hello-world",
        title: "1. Hello World",
        difficulty: "Easy",
        category: "Basics",
        language: "c",
        description: (
            <>
                <p>Write a program that prints exactly <code className="bg-muted px-1 py-0.5 rounded text-primary">Hello World!</code> to the standard output.</p>
                <p className="mt-4 text-sm text-muted-foreground border-l-2 border-primary pl-4">Hint: Use the <code>printf()</code> function.</p>
            </>
        ),
        template: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}',
        testCases: [
            { input: "", expectedOutput: "Hello World!" }
        ]
    },
    "reverse-string": {
        id: "reverse-string",
        title: "2. Reverse String",
        difficulty: "Easy",
        category: "Strings",
        language: "cpp",
        description: (
            <div className="space-y-4">
                <p>Write a function that reverses a string. The input string is given as an array of characters.</p>
                <p>You must do this by modifying the input array in-place.</p>

                <div className="bg-muted p-4 rounded-lg mt-4 border border-border">
                    <h4 className="font-semibold mb-2">Example 1:</h4>
                    <pre className="font-mono text-sm">
                        <span className="text-muted-foreground">Input:</span> s = ["h","e","l","l","o"]<br />
                        <span className="text-muted-foreground">Output:</span> ["o","l","l","e","h"]
                    </pre>
                </div>
            </div>
        ),
        template: '#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nvoid reverseString(vector<char>& s) {\n    // Write your code here\n    \n}\n\nint main() {\n    // Testing code provided in execution environment\n    return 0;\n}',
        testCases: [
            { input: "hello", expectedOutput: "olleh" },
            { input: "Hannah", expectedOutput: "hannaH" }
        ]
    }
};

export default function ProblemPage() {
    const params = useParams();
    const [prob, setProb] = useState<ProblemDefinition | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params?.id as string;
        // Check default hardcoded first
        if (problemData[id]) {
            setProb(problemData[id]);
        } else {
            // Check local storage
            import("@/lib/problems").then(({ getCustomProblems }) => {
                const customProblems = getCustomProblems();
                const found = customProblems.find(p => p.id === id);
                if (found) {
                    setProb(found);
                }
                setLoading(false);
            }).catch(console.error);
            return;
        }
        setLoading(false);
    }, [params?.id]);

    if (loading) return <div className="p-10 text-center">Loading problem...</div>;

    if (!prob) {
        return notFound();
    }

    return (
        <div className="w-full h-[calc(100vh-3.5rem)] bg-background">
            <Workspace problem={prob} />
        </div>
    );
}
