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
        const response = await axios.post("/api/execute", {
            language,
            code,
            stdin,
        });

        const data = response.data;

        return {
            stdout: data.stdout || "",
            stderr: data.stderr || "",
            compile_output: data.compile_output,
            code: data.code || 0,
        };
    } catch (error: any) {
        console.error("Execution failed:", error);
        return {
            stdout: "",
            stderr: error.response?.data?.error || error.message || "Failed to reach execution API",
            code: 1,
        };
    }
};
