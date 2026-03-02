import { executeCode } from "./src/lib/piston";

executeCode("python", "print('Hello Python!')", "").then(r => console.log("Python:", r));
executeCode("javascript", "console.log('Hello JS!')", "").then(r => console.log("JS:", r));
