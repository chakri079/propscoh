const http = require('http');

const request = (method, path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(body || '{}');
                } catch (e) {
                    parsed = { message: body };
                }
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

(async () => {
    try {
        console.log("Getting or Creating Users...");

        const getOrCreateUser = async (user) => {
            let res = await request('POST', '/users', user);
            if (res.status === 400 && res.body.message === "User already exists") {
                const usersRes = await request('GET', '/users');
                const existing = usersRes.body.find(u => u.email === user.email);
                return { body: existing };
            }
            return res;
        };

        const alice = await getOrCreateUser({ name: 'Alice', email: 'alice@test.com', password: 'password', default_currency: 'INR' });
        console.log("Alice:", alice.body.id);

        const bob = await getOrCreateUser({ name: 'Bob', email: 'bob@test.com', password: 'password', default_currency: 'INR' });
        console.log("Bob:", bob.body.id);

        const charlie = await getOrCreateUser({ name: 'Charlie', email: 'charlie@test.com', password: 'password', default_currency: 'INR' });
        console.log("Charlie:", charlie.body.id);

        console.log("\nCreating Expense (Alice paid 900 for Alice, Bob, Charlie)...");
        const expense = await request('POST', '/expenses', {
            name: 'Lunch',
            value: 900,
            currency: 'INR',
            date: new Date().toISOString(),
            created_by: alice.body.id,
            members: [alice.body.id, bob.body.id, charlie.body.id]
        });
        console.log("Expense:", JSON.stringify(expense.body, null, 2));

        console.log("\nGetting Balances for Alice...");
        const aliceBals = await request('GET', `/balances/${alice.body.id}`);
        console.log("Alice Balances:", JSON.stringify(aliceBals.body, null, 2));

        console.log("\nGetting Balances for Bob...");
        const bobBals = await request('GET', `/balances/${bob.body.id}`);
        console.log("Bob Balances:", JSON.stringify(bobBals.body, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
