import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Problem } from "@/models/Problem";
import { Submission } from "@/models/Submission";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        await connectToDatabase();

        // Ensure models are registered
        User.find().limit(1).catch(() => { });

        const mongoose = require("mongoose");
        const query = mongoose.Types.ObjectId.isValid(id)
            ? { $or: [{ problemId: id }, { _id: id }] }
            : { problemId: id };

        const problem = await Problem.findOne(query).lean();

        if (!problem) {
            return NextResponse.json({ error: "Problem not found" }, { status: 404 });
        }

        // Fetch successful submissions to get solvers list
        const successfulSubmissions = await Submission.find({
            problemId: id,
            status: "Accepted"
        }).populate("userId", "name").lean();

        // Extract unique solver names
        const uniqueSolvers = new Set<string>();
        successfulSubmissions.forEach((sub: any) => {
            if (sub.userId && sub.userId.name) {
                uniqueSolvers.add(sub.userId.name);
            }
        });

        const mappedProblem = {
            ...problem,
            id: problem.problemId || problem._id,
            solvers: Array.from(uniqueSolvers),
            authorName: problem.authorName || "System"
        };

        return NextResponse.json({ problem: mappedProblem }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching problem:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch problem" }, { status: 500 });
    }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
        }

        const { id } = await context.params;
        const data = await req.json();

        await connectToDatabase();

        const mongoose = require("mongoose");
        const query = mongoose.Types.ObjectId.isValid(id)
            ? { $or: [{ problemId: id }, { _id: id }] }
            : { problemId: id };

        const toTitleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        if (data.companies) data.companies = data.companies.map((c: string) => toTitleCase(c.trim()));
        if (data.topics) data.topics = data.topics.map((t: string) => toTitleCase(t.trim()));

        const updatedProblem = await Problem.findOneAndUpdate(
            query,
            { $set: data },
            { new: true }
        );

        if (!updatedProblem) {
            return NextResponse.json({ error: "Problem not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Problem updated successfully", problem: updatedProblem }, { status: 200 });
    } catch (error: any) {
        console.error("Error updating problem:", error);
        return NextResponse.json({ error: error.message || "Failed to update problem" }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
        }

        const { id } = await context.params;

        await connectToDatabase();

        const mongoose = require("mongoose");
        const query = mongoose.Types.ObjectId.isValid(id)
            ? { $or: [{ problemId: id }, { _id: id }] }
            : { problemId: id };

        const deletedProblem = await Problem.findOneAndDelete(query);

        if (!deletedProblem) {
            return NextResponse.json({ error: "Problem not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Problem deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting problem:", error);
        return NextResponse.json({ error: error.message || "Failed to delete problem" }, { status: 500 });
    }
}
