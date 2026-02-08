import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function test() {
    try {
        console.log("Authenticating...");
        try {
            await pb.collection('_superusers').authWithPassword('admin@fame.com', '1234567890');
        } catch (e) {
            await pb.admins.authWithPassword('admin@fame.com', '1234567890');
        }
        console.log("Authenticated.");

        // Test Locations - Minimal
        console.log("\n--- Testing Locations: Default List ---");
        try {
            const res = await pb.collection('locations').getList(1, 5);
            console.log("Success (Minimal):", res.items.length, "items");
        } catch (e) {
            console.error("Failed (Minimal):", e.data || e.message);
        }

        // Test Locations - Sort
        console.log("\n--- Testing Locations: Sort List ---");
        try {
            const res = await pb.collection('locations').getList(1, 5, { sort: '-timestamp' });
            console.log("Success (Sort -timestamp):", res.items.length, "items");
        } catch (e) {
            console.error("Failed (Sort -timestamp):", e.data || e.message);
        }

        // Test Locations - Sort -id
        try {
            const res = await pb.collection('locations').getList(1, 5, { sort: '-id' });
            console.log("Success (Sort -id):", res.items.length, "items");
        } catch (e) {
            console.error("Failed (Sort -id):", e.data || e.message);
        }

        // Test Locations - Expand
        console.log("\n--- Testing Locations: Expand List ---");
        try {
            const res = await pb.collection('locations').getList(1, 5, { expand: 'user_id' });
            console.log("Success (Expand):", res.items.length, "items");
        } catch (e) {
            console.error("Failed (Expand):", e.data || e.message);
        }

        // Test Locations - Full
        console.log("\n--- Testing Locations: Full List ---");
        try {
            const res = await pb.collection('locations').getList(1, 20, { sort: '-created', expand: 'user_id' });
            console.log("Success (Full):", res.items.length, "items");
        } catch (e) {
            // Log full error details
            console.dir(e, { depth: null });
            console.error("Failed (Full):", e.data || e.message);
        }

        // Test Monitoring Logs
        console.log("\n--- Testing Monitoring Logs ---");
        try {
            // Basic fetch
            const res = await pb.collection('monitoring_logs').getList(1, 5);
            console.log("Success (Minimal):", res.items.length, "items");

            // Sort fetch
            const resSort = await pb.collection('monitoring_logs').getList(1, 5, { sort: '-created' });
            console.log("Success (Sort):", resSort.items.length, "items");

            // Full fetch (like App.tsx)
            const resFull = await pb.collection('monitoring_logs').getList(1, 20, {
                sort: '-created',
                expand: 'user_id'
            });
            console.log("Success (Full):", resFull.items.length, "items");

        } catch (e) {
            console.dir(e, { depth: null });
            console.error("Failed:", e.data || e.message);
        }

    } catch (err) {
        console.error("Global Error:", err);
    }
}

test();
