"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Code2, Rocket, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20">
              <Terminal className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Master <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">C & C++</span> Like a Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive learning, real-time code execution, and gamified challenges to take your programming skills from zero to advanced.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full" asChild>
              <Link href="/learn/c">
                Start Learning Now <Rocket className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full" asChild>
              <Link href="/problems">
                Practice Problems <Code2 className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Why Choose C Learning Hub?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide a complete environment to deeply understand the core of computer science.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BrainCircuit className="w-8 h-8 text-blue-500" />,
                title: "Structured Learning",
                description: "Carefully designed paths from basic syntax, pointers, to advanced OOPs concepts.",
              },
              {
                icon: <Terminal className="w-8 h-8 text-green-500" />,
                title: "In-Browser Execution",
                description: "Write, compile, and run C/C++ code directly in your browser without any setup.",
              },
              {
                icon: <Code2 className="w-8 h-8 text-purple-500" />,
                title: "LeetCode Style Practice",
                description: "Solve problems, pass test cases, and track your progress in real-time.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-card p-8 rounded-3xl border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="mb-6 p-3 bg-secondary/50 w-fit rounded-xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
