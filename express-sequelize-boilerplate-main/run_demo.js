const { spawn, execSync } = require('child_process');

console.log("Starting Splitwise MVP Backend...");
// Use npm with shell:true on Windows
const server = spawn('npm', ['run', 'dev'], { stdio: 'pipe', shell: true });
let started = false;

server.stdout.on('data', (data) => {
    const out = data.toString();
    console.log("[SERVER]", out.trim());

    // Look for both express listening and db syncing
    if (out.includes('force-synced') || (out.includes('initialized') && !started)) {
        if (!started) {
            started = true;
            console.log("\nServer started successfully. Waiting 10 seconds for database ready state...");
            setTimeout(() => {
                console.log("\n================ RUNNING API TESTS ================\n");
                try {
                    execSync('node test_api.js', { stdio: 'inherit' });
                } catch (e) {
                    console.error("Test execution failed.");
                }
                console.log("\n================ DEMO COMPLETE ================\n");
                server.kill();
                process.exit(0);
            }, 10000);
        }
    }
});

server.stderr.on('data', (data) => {
    console.error("[SERVER ERR]", data.toString().trim());
});

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});
