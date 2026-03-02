import { ProblemDefinition } from "@/types/problem";

const STORAGE_KEY = "custom_problems";

export function getCustomProblems(): ProblemDefinition[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse custom problems", e);
        return [];
    }
}

export function saveCustomProblem(problem: ProblemDefinition) {
    if (typeof window === "undefined") return;

    const existing = getCustomProblems();
    // Check if updating or adding new
    const index = existing.findIndex(p => p.id === problem.id);

    if (index >= 0) {
        existing[index] = problem;
    } else {
        existing.push(problem);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getProblemById(id: string): ProblemDefinition | undefined {
    // We will need to merge this with default problems later in the component
    // But this specifically fetches from local storage
    const custom = getCustomProblems();
    return custom.find(p => p.id === id);
}
