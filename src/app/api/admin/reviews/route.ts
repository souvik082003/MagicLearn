import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Problem } from "@/models/Problem";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET: Fetch all pending submissions for admin review
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const pending = await Problem.find({ status: "pending" }).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ problems: pending }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching pending reviews:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch" }, { status: 500 });
    }
}

// PUT: Approve or reject a submission
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const { problemId, action } = await req.json();

        if (!problemId || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid request. Provide problemId and action (approve/reject)." }, { status: 400 });
        }

        const newStatus = action === "approve" ? "approved" : "rejected";
        const problem = await Problem.findOneAndUpdate(
            { problemId },
            { status: newStatus },
            { new: true }
        );

        if (!problem) {
            return NextResponse.json({ error: "Problem not found" }, { status: 404 });
        }

        // --- Notification triggers ---
        try {
            // Notify the submitter about the decision
            if (problem.submittedBy) {
                const submitter = await User.findOne({ name: problem.submittedBy });
                if (submitter) {
                    await Notification.create({
                        userId: submitter._id,
                        type: action === "approve" ? "question_approved" : "question_rejected",
                        message: action === "approve"
                            ? `Your question "${problem.title}" has been approved and is now live!`
                            : `Your question "${problem.title}" was not approved.`,
                        link: action === "approve" ? `/problems/${problem.problemId}` : "/problems/submit",
                    });
                }
            }

            // If approved, notify all users about the new question
            if (action === "approve") {
                const allUsers = await User.find({ role: { $ne: "admin" } }).select("_id").lean();
                const notifs = allUsers.map((u: any) => ({
                    userId: u._id,
                    type: "new_question",
                    message: `New question available: "${problem.title}"`,
                    link: `/problems/${problem.problemId}`,
                }));
                if (notifs.length > 0) {
                    await Notification.insertMany(notifs);
                }
            }
        } catch (notifErr) {
            console.error("Non-fatal: notification creation failed", notifErr);
        }

        return NextResponse.json({ message: `Problem ${newStatus} successfully`, problem }, { status: 200 });
    } catch (error: any) {
        console.error("Error updating review:", error);
        return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
    }
}
