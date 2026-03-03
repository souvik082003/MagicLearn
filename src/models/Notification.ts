import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: "question_approved" | "question_rejected" | "new_question" | "review_needed";
    message: string;
    link?: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: ["question_approved", "question_rejected", "new_question", "review_needed"],
        required: true
    },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
