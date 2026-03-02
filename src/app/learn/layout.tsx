import Link from "next/link";
import { getTopicsList } from "@/data/topics";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";

export default function LearnLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const topics = getTopicsList();

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
                <div className="p-4 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Learning Paths
                    </h2>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        <div>
                            <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">Topics</h3>
                            <div className="space-y-1">
                                {topics.map((topic) => (
                                    <Link
                                        key={topic.id}
                                        href={`/learn/c?topic=${topic.id}`}
                                        className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted hover:text-foreground text-foreground/80 transition-colors"
                                    >
                                        {topic.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </aside>
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-background">
                {children}
            </main>
        </div>
    );
}
