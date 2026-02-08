# FAME System Setup Guide

## 1. Start the Backend (PocketBase)

The backend handles all data storage (locations, photos, logs).

1. Open a terminal in `apps/backend`.
2. Run:

   ```powershell
   ./pocketbase serve --http=0.0.0.0:8090
   ```

3. Go to <http://127.0.0.1:8090/_/> and create your Admin account.
4. **Important**: Go to Collections -> "New Collection" and create:
   - `locations` (Fields: latitude, longitude, speed, heading, timestamp)
   - `monitoring_logs` (Fields: type, file)
   - `commands` (Fields: type, target_user_id, status)

## 2. Start the Admin Panel

The web dashboard for monitoring.

1. Open a new terminal in `apps/web`.
2. Run:

   ```powershell
   npm run dev
   ```

3. Open <http://localhost:5173>

## 3. Run the Mobile App

The Android app for employees.

1. Open a new terminal in `apps/mobile`.
2. Connect an Android device or start an Emulator.
3. Run:

   ```powershell
   npx expo run:android
   ```

4. On the device, grant all permissions (Location "Allow all the time", Camera).

## Troubleshooting

- **Mobile not connecting to backend?**
  - If using **Emulator**: use `http://10.0.2.2:8090` in `apps/mobile/src/services/pocketbase.ts` (Default).
  - If using **Physical Device**: change it to your PC's IP, e.g., `http://192.168.1.5:8090`.
