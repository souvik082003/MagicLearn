"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useProgress() {
    const { data: session, status } = useSession();
    const [completedProblems, setCompletedProblems] = useState<string[]>([]);

    useEffect(() => {
        if (status === "loading") return;

        if (session?.user) {
            // Logged in: fetch solved problems from server
            fetch("/api/profile")
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.user?.solvedProblems) {
                        setCompletedProblems(data.user.solvedProblems);
                        // Also sync to localStorage as cache
                        localStorage.setItem("c-learning-hub-progress", JSON.stringify(data.user.solvedProblems));
                    }
                })
                .catch(() => {
                    // Fallback to localStorage
                    const saved = localStorage.getItem("c-learning-hub-progress");
                    if (saved) {
                        try { setCompletedProblems(JSON.parse(saved)); } catch { }
                    }
                });
        } else {
            // Not logged in: use localStorage
            const saved = localStorage.getItem("c-learning-hub-progress");
            if (saved) {
                try { setCompletedProblems(JSON.parse(saved)); } catch { }
            }
        }
    }, [session, status]);

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
