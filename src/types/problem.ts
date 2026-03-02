export interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
}

export type SupportedLanguage = "c" | "cpp" | "java" | "javascript" | "python";

export interface ProblemDefinition {
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    category: string;
    language: SupportedLanguage;
    description: React.ReactNode | string;
    template: string;
    testCases: TestCase[];
    isCustom?: boolean;
}

