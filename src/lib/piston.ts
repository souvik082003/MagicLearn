import axios from "axios";

const PISTON_API_URL = "https://emkc.org/api/v1/piston";

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    compile_output?: string;
    code: number;
}

export const executeCode = async (
    language: "c" | "cpp" | "java" | "javascript" | "python",
    code: string,
    stdin: string = ""
): Promise<ExecutionResult> => {
    try {
        // Piston requires finding the right language version
        const versionMap = {
            c: "10.2.0",
            cpp: "10.2.0",
            java: "15.0.2",
            javascript: "18.15.0",
            python: "3.10.0"
        };

        let apiLang: string = language;
        if (language === "python") apiLang = "python3";
        if (language === "javascript") apiLang = "javascript"; // or node

        const response = await axios.post(`${PISTON_API_URL}/execute`, {
            language: apiLang,
            source: code,
            args: [],
            stdin: stdin,
        });

        const data = response.data;

        return {
            stdout: data.stdout || data.output || "",
            stderr: data.stderr || "",
            compile_output: undefined,
            code: data.ran ? 0 : 1,
        };
    } catch (error: any) {
        console.error("Execution failed:", error);
        return {
            stdout: "",
            stderr: error.message || "Failed to reach execution API",
            code: 1,
        };
    }
};
