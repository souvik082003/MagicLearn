<div align="center">
  <img src="public/logo.png" alt="MagicCode Logo" width="120" />
  <h1>MagicCode</h1>
  <p><strong>A Gamified, Open-Source Platform for Mastering Computer Science</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/MongoDB-9-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/NextAuth-v4-black?style=for-the-badge&logo=passport" alt="NextAuth" />
  </p>
</div>

---

## 🌟 What is MagicCode?

Learning to code is often isolated and overwhelming. Most platforms either drop you into an intimidating blank text editor or bore you with static, unstructured articles. 

**MagicCode** bridges that gap. We’ve designed a vibrant, interactive sandbox that turns complex low-level programming operations and algorithms into a gamified, visual, and socially competitive experience. It is the perfect blend of modern UI aesthetics and hardcore competitive programming algorithms.

---

## ⚡ Key Features

- **🎮 Gamified Learning Paths:** Experience curriculum like a video game. Navigate through our "Candy Crush" inspired winding SVG maps to unlock concepts in C, C++, and Data Structures & Algorithms.
- **💻 Interactive Browser Workspace:** A split-pane, robust, and highly responsive code editor built directly into the browser. Test, compile, and execute code in real-time.
- **🌐 Multi-Language Support:** Solve complex challenges using C, C++, and Java with real-time compilation feedback.
- **🏆 Global Leaderboards & XP:** Every problem solved earns XP based on difficulty. Climb the ranks on the socially competitive global leaderboard.
- **📊 Comprehensive User Profiles:** Track your total solved problems, daily streaks, difficulty breakdown, and recent submission history.
- **🛡️ Admin Dashboard:** A dedicated interface to manage the platform, upload Custom Problems, assign tags/companies, and curate the Daily Coding Challenge.
- **💬 Community Solutions:** Publish your successful code, view peer solutions, upvote the cleanest algorithms, and engage in threaded discussions.

---

## �️ Technology Stack

MagicCode is built on a modern, bleeding-edge full-stack ecosystem to ensure maximum performance, security, and developer experience.

### **Frontend Architecture**
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) serving React Server Components.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) combined with [Shadcn UI](https://ui.shadcn.com/) for beautiful, deeply customizable, and accessible components.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) powering the stunning interactions, transitions, and gamified UI micro-moments.
- **Icons:** [Lucide React](https://lucide.dev/).

### **Backend Infrastructure**
- **API Runtime:** Next.js Serverless Route Handlers (`src/app/api/...`).
- **Database:** [MongoDB](https://www.mongodb.com/) (using Mongoose ODM) for storing User Profiles, Submissions, Leaderboards, and Problem Data.
- **Authentication:** [NextAuth.js (Auth.js)](https://next-auth.js.org/) for highly secure, seamless User Authentication sessions and OAuth capabilities.

### **Execution Engine**
- **Compiler API:** Powered by the open-source **Piston API** to safely compile and execute user-submitted C, C++, and Java code in isolated docker environments inside fractions of a second.

---

## ⚙️ How It Works (The Internal Algorithm)

Behind the scenes, MagicCode orchestrates a complex, highly reliable pipeline every time a user interacts with the platform:

### 1. Curriculum Engine (Static to Dynamic Generation)
Instead of forcing curriculum data into an expensive database, the learning nodes (topics, code syntax, definitions) are defined in highly extensible JSON structures (`public/data/learning-paths.json`). 
**Algorithm:** The frontend parses this JSON, calculates the X/Y coordinates for the SVG path curve, and deterministically renders interactive level nodes.

### 2. The Code Execution Pipeline
When a user clicks "Submit Code" inside the workspace:
1. **Sanitization:** The raw text code is gathered from the browser editor.
2. **Wrapping:** The code is injected into a secure `driver` payload containing hidden `main()` blocks to accurately execute underlying test cases without exposing the logic to the user.
3. **Execution:** The payload is securely POSTed to the Piston API where it runs in a sandboxed, containerized environment.
4. **Validation:** The returned `stdout` buffer is parsed on the Next.js server and strictly compared against the database `expected_output` strings for every hidden test case.

### 3. Gamification Progression System
Once the Next.js API confidently determines the parsed test cases have passed successfully:
1. **Transaction Triggered:** A Mongoose session updates the `Submission` ledger to track the user's solution time and language.
2. **XP Calculation:** The algorithm checks the difficulty rating (`Easy = 10xp`, `Medium = 20xp`, `Hard = 30xp`) and increments the target profile in MongoDB simultaneously.
3. **Leaderboard Swap:** Changes instantly propagate through the platform, meaning Leaderboard ranks mathematically shift in real-time.

---

## 🤝 Contributing to the Curriculum

We highly encourage developers to contribute to our JSON-based curriculum paths. For detailed instructions on how to add topics, chapters, and rich Markdown content to the platform without touching the React code, please see our [**CONTRIBUTING.md**](./CONTRIBUTING.md) guide.

---

## 👨‍💻 Innovation & Creation

MagicCode is the brainchild and solo innovation of **Souvik Samanta**. Driven by a deep passion for system architecture, algorithmic design, and educational technology, engineered this full-stack platform from the ground up to revolutionize exactly how we learn, code, and grow.

<div align="center">
  <sub>Built with ❤️ by Souvik Samanta</sub>
</div>
