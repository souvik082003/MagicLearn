const axios = require('axios');

async function test(url) {
    try {
        const response = await axios.post(url + "/execute", {
            language: "c",
            source: "#include <stdio.h>\nint main() { printf(\"Hello\"); return 0; }",
            args: [],
            stdin: ""
        });
        console.log(`Success on ${url}:`, response.data);
    } catch (err) {
        console.error(`Error on ${url}:`, err.response ? err.response.data : err.message);
    }
}

test("https://emkc.org/api/v1/piston");
