import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function createTestUser() {
    try {
        console.log("Authenticating as admin...");
        try {
            await pb.collection('_superusers').authWithPassword('admin@fame.com', '1234567890');
        } catch (e) {
            await pb.admins.authWithPassword('admin@fame.com', '1234567890');
        }
        console.log("Authenticated.");

        const email = 'test_employee@fame.com';
        const password = 'password123';

        try {
            const existing = await pb.collection('users').getFirstListItem(`email="${email}"`);
            console.log(`User ${email} already exists. ID: ${existing.id}`);
            return existing.id;
        } catch (e) {
            console.log(`User ${email} not found. Creating...`);
            const newUser = await pb.collection('users').create({
                username: 'test_employee',
                email: email,
                emailVisibility: true,
                password: password,
                passwordConfirm: password,
                name: 'Test Employee'
            });
            console.log(`User created. ID: ${newUser.id}`);
            return newUser.id;
        }
    } catch (err) {
        console.error("Failed to create user:", err);
    }
}

createTestUser();
