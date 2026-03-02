const axios = require('axios');

async function test(url) {
    try {
        const response = await axios.post(url + "/execute", {
            language: "c",
            version: "10.2.0",
            files: [{ name: "main.c", content: "#include <stdio.h>\nint main() { printf(\"Hello\"); return 0; }" }],
            stdin: ""
        });
        console.log(`Success on ${url}`);
    } catch (err) {
        console.error(`Error on ${url}:`, err.response ? err.response.data : err.message);
    }
}

test("https://piston.srihash.org/api/v2/piston");
test("https://emkc.org/api/v2/piston");
