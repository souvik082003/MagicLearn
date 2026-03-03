import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
    try {
        const { language, code, stdin } = await req.json();

        // Judge0 CE Language IDs
        const languageMap: Record<string, number> = {
            "c": 50, // C (GCC 9.2.0)
            "cpp": 54, // C++ (GCC 9.2.0)
            "java": 62, // Java (OpenJDK 13.0.1)
            "javascript": 93, // Node.js 18.15.0
            "python": 71  // Python 3.8.1
        };

        const languageId = languageMap[language];

        if (!languageId) {
            return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
        }

        const rapidApiKey = process.env.RAPIDAPI_KEY;
        const rapidApiHost = process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";

        if (!rapidApiKey) {
            return NextResponse.json({ error: "RapidAPI Key is missing in environment variables. Please configure RAPIDAPI_KEY in .env.local" }, { status: 500 });
        }

        const options = {
            method: 'POST',
            url: `https://${rapidApiHost}/submissions`,
            params: {
                base64_encoded: 'false',
                wait: 'true',
                fields: '*'
            },
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': rapidApiHost
            },
            data: {
                language_id: languageId,
                source_code: code,
                stdin: stdin || ""
            }
        };

        const response = await axios.request(options);
        const data = response.data;

        // Judge0 standard response parsing
        // status 3 is Accepted (successful run)
        // 6 is Compilation Error
        const isError = data.status?.id !== 3;

        return NextResponse.json({
            stdout: data.stdout || "",
            stderr: data.stderr || (isError && !data.compile_output ? data.status?.description : ""),
            compile_output: data.compile_output || undefined,
            code: isError ? 1 : 0
        });

    } catch (error: any) {
        console.error("Judge0 API execution error:", error?.response?.data || error.message);
        return NextResponse.json(
            { error: error?.response?.data?.message || "Failed to execute code via Judge0" },
            { status: 500 }
        );
    }
}
