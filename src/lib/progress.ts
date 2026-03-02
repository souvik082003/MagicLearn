"use client";

import { useState, useEffect } from "react";

export function useProgress() {
    const [completedProblems, setCompletedProblems] = useState<string[]>([]);

    useEffect(() => {
        // Load from local storage on mount
        const saved = localStorage.getItem("c-learning-hub-progress");
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCompletedProblems(JSON.parse(saved));
            } catch (_e) {
                console.error("Failed to parse progress saving");
            }
        }
    }, []);

    const markProblemCompleted = (problemId: string) => {
        setCompletedProblems((prev) => {
            if (prev.includes(problemId)) return prev;
            const next = [...prev, problemId];
            localStorage.setItem("c-learning-hub-progress", JSON.stringify(next));
            return next;
        });
    };

    const isProblemCompleted = (problemId: string) => {
        return completedProblems.includes(problemId);
    };

    return {
        completedProblems,
        markProblemCompleted,
        isProblemCompleted,
    };
}
