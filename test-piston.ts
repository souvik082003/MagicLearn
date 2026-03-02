import { executeCode } from "./src/lib/piston";

async function run() {
    console.log("Testing Python Execution...");
    const res = await executeCode("python", "print('Hello Python!')", "");
    console.log("Python Result:", res);

    console.log("Testing JavaScript Execution...");
    const res2 = await executeCode("javascript", "console.log('Hello JS!')", "");
    console.log("JS Result:", res2);
}

run();
