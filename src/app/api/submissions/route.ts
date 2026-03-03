import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Submission } from "@/models/Submission";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ submissions: [] }, { status: 200 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ submissions: [] }, { status: 200 });
        }

        const url = new URL(req.url);
        const problemId = url.searchParams.get("problemId");

        const query: any = { userId: user._id };
        if (problemId) query.problemId = problemId;

        const submissions = await Submission.find(query)
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({ submissions }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching submissions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Allow anonymous submissions, but don't track progress
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Anonymous submission tracked" }, { status: 200 });
        }

        await connectToDatabase();
        const data = await req.json();
        const { problemId, code, status, language } = data;

        // Find user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Create submission record
        const newSubmission = new Submission({
            userId: user._id,
            problemId,
            code,
            status,
            language
        });
        await newSubmission.save();

        // If accepted, update user progress
        if (status === "Accepted") {
            if (!user.solvedProblems.includes(problemId)) {
                user.solvedProblems.push(problemId);
                user.xp += 50; // Award 50 XP per coding challenge solved
                await user.save();
            }
        }

        return NextResponse.json({ message: "Submission recorded", submission: newSubmission }, { status: 201 });
    } catch (error: any) {
        console.error("Error saving submission:", error);
        return NextResponse.json({ error: error.message || "Failed to record submission" }, { status: 500 });
    }
}
