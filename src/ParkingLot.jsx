import React, { useEffect, useState } from 'react';
import './ParkingLot.css';
import { db, auth } from './firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { signOut } from 'firebase/auth';
import LicenseReader from './components/LicenseReader';

const totalSpots = 10;

export default function ParkingLot() {
  const [spots, setSpots] = useState(Array(totalSpots).fill({ occupied: false, timestamp: null }));
  const [elapsedTimes, setElapsedTimes] = useState(Array(totalSpots).fill(null));
  const [assignMessage, setAssignMessage] = useState(null);
  const [analytics, setAnalytics] = useState({ entries: 0, exits: 0, durations: {} });

  // 🔄 Fetch spot + analytics data from Firebase
  useEffect(() => {
    const spotsRef = ref(db, 'spots');
    const analyticsRef = ref(db, 'analytics');

    onValue(spotsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setSpots(data);
    });

    onValue(analyticsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setAnalytics(data);
    });
  }, []);

  // ⏱️ Update live timers
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = spots.map((spot) => {
        if (spot.occupied && spot.timestamp) {
          const ms = Date.now() - spot.timestamp;
          const mins = Math.floor(ms / 60000);
          const secs = Math.floor((ms % 60000) / 1000);
          return `${mins}m ${secs}s`;
        }
        return null;
      });
      setElapsedTimes(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [spots]);

  // 🅿️ Entry simulation
  const handleEnter = () => {
    const index = spots.findIndex((spot) => !spot.occupied);
    if (index !== -1) {
      const newSpots = [...spots];
      newSpots[index] = { occupied: true, timestamp: Date.now() };
      set(ref(db, 'spots'), newSpots);

      const lane = Math.floor(index / 5) + 1;
      setAssignMessage(`✅ Assigned to Spot ${index + 1} (Lane ${lane})`);
      setTimeout(() => setAssignMessage(null), 5000);

      // 🔢 Update analytics
      update(ref(db, 'analytics'), {
        entries: (analytics.entries || 0) + 1,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      alert('🚫 No spots available!');
    }
  };

  // 🚪 Exit simulation
  const handleLeave = () => {
    const index = spots.map((s) => s.occupied).lastIndexOf(true);
    if (index !== -1) {
      const exitTime = Date.now();
      const durationMs = exitTime - spots[index].timestamp;
      const minutes = Math.floor(durationMs / 60000);
      const durationStr = `${minutes} min`;

      const newSpots = [...spots];
      newSpots[index] = { occupied: false, timestamp: null };
      set(ref(db, 'spots'), newSpots);

      // 📊 Update analytics
      const updatedAnalytics = {
        exits: (analytics.exits || 0) + 1,
        lastUpdated: new Date().toISOString(),
        durations: {
          ...analytics.durations,
          [index]: durationStr,
        },
      };
      update(ref(db, 'analytics'), updatedAnalytics);
    } else {
      alert('All spots are already empty!');
    }
  };

  // 🔄 Reset spots
  const handleReset = () => {
    const resetSpots = Array(totalSpots).fill({ occupied: false, timestamp: null });
    set(ref(db, 'spots'), resetSpots);
    setAssignMessage('🧼 Parking lot reset.');
    setTimeout(() => setAssignMessage(null), 3000);
  };

  // 🚪 Logout
  const handleLogout = () => {
    signOut(auth).then(() => {
      window.location.href = '/';
    });
  };

  return (
    <div className="parking-container">
      <h2>🚗 ParkGenius: Smart Parking</h2>

      {assignMessage && <div className="notification">{assignMessage}</div>}

      {/* 📊 Analytics */}
      <div className="analytics">
        <p><strong>Entries:</strong> {analytics.entries || 0}</p>
        <p><strong>Exits:</strong> {analytics.exits || 0}</p>
        <p><strong>Last Update:</strong> {analytics.lastUpdated?.slice(0, 19).replace('T', ' ') || '—'}</p>
      </div>

      <div className="grid">
        {spots.map((spot, i) => (
          <div key={i} className={`spot ${spot.occupied ? 'occupied' : 'available'}`}>
            {spot.occupied ? '🟥' : '🟩'} Spot {i + 1}
            {spot.occupied && <div className="timer">⏱ {elapsedTimes[i]}</div>}
            {!spot.occupied && analytics.durations?.[i] && (
              <div className="timer">🕓 Last: {analytics.durations[i]}</div>
            )}
          </div>
        ))}
      </div>

      {/* 🔘 Controls */}
      <div className="controls">
        <button onClick={handleEnter}>Simulate Entry</button>
        <button onClick={handleLeave}>Simulate Exit</button>
        <button onClick={handleReset} style={{ backgroundColor: '#555', color: '#fff' }}>Reset Lot</button>
        <button onClick={handleLogout} style={{ backgroundColor: '#b02a2a', color: '#fff' }}>Logout</button>
      </div>

      {/* 📷 OCR Integration */}
      <div style={{ marginTop: '30px' }}>
        <h3>📸 License Plate Reader</h3>
        <LicenseReader />
      </div>
    </div>
  );
}
