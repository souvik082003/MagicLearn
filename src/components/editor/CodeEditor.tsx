"use client";

import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { SupportedLanguage } from "@/types/problem";

interface CodeEditorProps {
    language: SupportedLanguage;
    code: string;
    onChange: (value: string | undefined) => void;
    readOnly?: boolean;
}


export function CodeEditor({ language, code, onChange, readOnly = false }: CodeEditorProps) {
    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            // Configure editor formatting or theme if needed
            monaco.editor.defineTheme("custom-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                    "editor.background": "#00000000", // Transparent to use parent background
                },
            });
        }
    }, [monaco]);

    return (
        <div className="h-full w-full rounded-md border overflow-hidden bg-zinc-950/80">
            <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={onChange}
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: '"Fira Code", "Geist Mono", monospace',
                    wordWrap: "on",
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                }}
                loading={<div className="flex h-full items-center justify-center">Loading editor...</div>}
            />
        </div>
    );
}
