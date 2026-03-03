import mongoose, { Schema, Document, models } from 'mongoose';

export interface ITestCase {
    input: string;
    expectedOutput: string;
}

export interface IProblem extends Document {
    problemId: string; // url-friendly id
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    category: string;
    language: string;
    description: string;
    template: string;
    driverCode?: string;
    authorName?: string;
    companies?: string[];
    topics?: string[];
    testCases: ITestCase[];
}

const TestCaseSchema = new Schema<ITestCase>({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
}, { _id: false });

const ProblemSchema = new Schema<IProblem>(
    {
        problemId: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
        category: { type: String, default: "Custom" },
        language: { type: String, required: true },
        description: { type: String, required: true },
        template: { type: String, default: "" },
        driverCode: { type: String, default: "" },
        authorName: { type: String, default: "System" },
        companies: [{ type: String }],
        topics: [{ type: String }],
        testCases: [TestCaseSchema],
    },
    { timestamps: true }
);

export const Problem = models.Problem_v1 || mongoose.model<IProblem>('Problem_v1', ProblemSchema, 'problems');
