import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Problem } from "@/models/Problem";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // For production, check if the user is an admin here
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
        }

        await connectToDatabase();
        const data = await req.json();

        const toTitleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

        const problemData = {
            ...data,
            companies: (data.companies || []).map((c: string) => toTitleCase(c.trim())),
            topics: (data.topics || []).map((t: string) => toTitleCase(t.trim())),
            authorName: session.user?.name || "Anonymous",
        };

        const newProblem = new Problem(problemData);
        await newProblem.save();

        return NextResponse.json({ message: "Problem created successfully", problem: newProblem }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating problem:", error);
        return NextResponse.json({ error: error.message || "Failed to create problem" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const problems = await Problem.find({ status: { $nin: ["pending", "rejected"] } }).sort({ createdAt: -1 });

        return NextResponse.json({ problems }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching problems:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch problems" }, { status: 500 });
    }
}
