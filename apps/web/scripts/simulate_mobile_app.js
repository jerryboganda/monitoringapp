import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function simulateApp() {
    try {
        console.log("--- Starting Mobile App Simulation ---");

        // 1. Authenticate (Employee Login)
        console.log("📲 Logging in as test_employee...");
        try {
            await pb.collection('users').authWithPassword('test_employee@fame.com', 'password123');
            console.log("✅ Custom user login successful.");
        } catch (authErr) {
            console.error("❌ Login failed:", authErr.message);
            return;
        }

        const userId = pb.authStore.model.id;
        console.log(`👤 User ID: ${userId}`);

        // 2. Post Location (Background Task)
        console.log("📍 Posting location update...");
        try {
            const loc = await pb.collection('locations').create({
                user_id: userId,
                latitude: 40.7128,
                longitude: -74.0060,
                timestamp: new Date().toISOString()
            });
            console.log("✅ Location posted:", loc.id);
        } catch (locErr) {
            console.error("❌ Location post failed:", locErr.message);
        }

        // 3. Post Monitoring Log (Hidden Mic Event)
        console.log("🎤 Posting hidden mic log...");
        try {
            const log = await pb.collection('monitoring_logs').create({
                user_id: userId,
                type: 'hidden_mic',
                // timestamp will be auto-created
            });
            console.log("✅ Mic log posted:", log.id);
        } catch (logErr) {
            console.error("❌ Mic log post failed:", logErr.message);
        }

        console.log("--- Simulation Complete ---");

    } catch (err) {
        console.error("Simulation Error:", err);
    }
}

simulateApp();
