# PocketBase Setup

1. **Download**: Download the PocketBase executable for Windows from [pocketbase.io](https://pocketbase.io/docs/).
2. **Place**: Extract `pocketbase.exe` into this folder (`apps/backend`).
3. **Run**: Open a terminal in this folder and run:

   ```powershell
   ./pocketbase serve --http=0.0.0.0:8090
   ```

4. **Access**: Open `http://127.0.0.1:8090/_/` in your browser to create the Admin account.

## Schema Setup

Create the following collections in the PocketBase Admin UI:

- **locations** (latitude, longitude, speed, heading, timestamp, user_id)
- **monitoring_logs** (type, data, timestamp, user_id)
