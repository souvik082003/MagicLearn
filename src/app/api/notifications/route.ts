import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ notifications: [] }, { status: 200 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ notifications: [] }, { status: 200 });
        }

        const notifications = await Notification.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(30)
            .lean();

        const unreadCount = await Notification.countDocuments({ userId: user._id, read: false });

        return NextResponse.json({ notifications, unreadCount }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { notificationId, markAllRead } = await req.json();

        if (markAllRead) {
            await Notification.updateMany({ userId: user._id, read: false }, { $set: { read: true } });
        } else if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, userId: user._id },
                { $set: { read: true } }
            );
        }

        return NextResponse.json({ message: "Updated" }, { status: 200 });
    } catch (error: any) {
        console.error("Error updating notifications:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
