import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/models/User";
import { Submission } from "@/models/Submission";
import { Problem } from "@/models/Problem";
import { Solution } from "@/models/Solution";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const user = await User.findOne({ email: session.user.email }).lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch recent submissions
        const submissions = await Submission.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Map problems to get titles
        const problemIds = [...new Set(submissions.map(s => s.problemId))];
        const problems = await Problem.find({ problemId: { $in: problemIds } }).select("problemId title difficulty").lean();
        const problemMap = problems.reduce((acc: any, p: any) => {
            acc[p.problemId] = { title: p.title, difficulty: p.difficulty };
            return acc;
        }, {});

        const enrichedSubmissions = submissions.map(s => ({
            ...s,
            problemTitle: problemMap[s.problemId]?.title || s.problemId,
            difficulty: problemMap[s.problemId]?.difficulty || "Unknown"
        }));

        // Calculate difficulty breakdown
        // Easy, Medium, Hard solved counts based on user.solvedProblems
        const solvedProblemsDetails = await Problem.find({ problemId: { $in: user.solvedProblems } }).select("difficulty").lean();
        const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
        solvedProblemsDetails.forEach(p => {
            if (p.difficulty === 'Easy') difficultyCounts.Easy++;
            else if (p.difficulty === 'Medium') difficultyCounts.Medium++;
            else if (p.difficulty === 'Hard') difficultyCounts.Hard++;
        });

        // Total problems per difficulty for "X / Y" display
        const totalEasy = await Problem.countDocuments({ difficulty: "Easy" });
        const totalMedium = await Problem.countDocuments({ difficulty: "Medium" });
        const totalHard = await Problem.countDocuments({ difficulty: "Hard" });
        const totalCounts = { Easy: totalEasy, Medium: totalMedium, Hard: totalHard };

        // Compute Achievement Badges dynamically
        const solutionCount = await Solution.countDocuments({ userId: user._id });
        const solvedCount = user.solvedProblems?.length || 0;
        const badges = [];

        if (solvedCount >= 1) badges.push({ id: "first_steps", name: "First Steps", description: "Solved 1 problem" });
        if (solvedCount >= 10) badges.push({ id: "dedicated", name: "Dedicated", description: "Solved 10 problems" });
        if (solvedCount >= 50) badges.push({ id: "master", name: "Master", description: "Solved 50 problems" });
        if (solutionCount >= 1) badges.push({ id: "contributor", name: "Contributor", description: "Published a community solution" });

        return NextResponse.json({
            user: {
                name: user.name,
                email: user.email,
                xp: user.xp,
                solvedCount,
                solvedProblems: user.solvedProblems || [],
                difficultyCounts,
                totalCounts,
                badges
            },
            recentSubmissions: enrichedSubmissions
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 500 });
    }
}
