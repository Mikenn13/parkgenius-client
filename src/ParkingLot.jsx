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
  const [analytics, setAnalytics] = useState({
    entries: 0,
    exits: 0,
    durations: {},
    lastUpdated: null
  });

  // 🔄 Sync Spots + Analytics from Firebase
  useEffect(() => {
    onValue(ref(db, 'spots'), (snapshot) => {
      const data = snapshot.val();
      if (data) setSpots(data);
    });

    onValue(ref(db, 'analytics'), (snapshot) => {
      const data = snapshot.val();
      if (data) setAnalytics(data);
    });
  }, []);

  // ⏱️ Update Elapsed Times Every Second
  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsed = spots.map((spot) => {
        if (spot.occupied && spot.timestamp) {
          const ms = Date.now() - spot.timestamp;
          const mins = Math.floor(ms / 60000);
          const secs = Math.floor((ms % 60000) / 1000);
          return `${mins}m ${secs}s`;
        }
        return null;
      });
      setElapsedTimes(newElapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [spots]);

  // 🅿️ Handle Entry
  const handleEnter = () => {
    const index = spots.findIndex((spot) => !spot.occupied);
    if (index !== -1) {
      const newSpots = [...spots];
      const now = Date.now();
      newSpots[index] = { occupied: true, timestamp: now };
      set(ref(db, 'spots'), newSpots);

      // Update analytics
      update(ref(db, 'analytics'), {
        entries: (analytics.entries || 0) + 1,
        lastUpdated: new Date().toISOString()
      });

      const lane = Math.floor(index / 5) + 1;
      setAssignMessage(`✅ Assigned to Spot ${index + 1} (Lane ${lane})`);
      setTimeout(() => setAssignMessage(null), 4000);
    } else {
      setAssignMessage('🚫 No available spots!');
      setTimeout(() => setAssignMessage(null), 4000);
    }
  };

  // 🚪 Handle Exit
  const handleLeave = () => {
    const index = spots.map((s) => s.occupied).lastIndexOf(true);
    if (index !== -1) {
      const now = Date.now();
      const duration = now - spots[index].timestamp;
      const mins = Math.floor(duration / 60000);
      const secs = Math.floor((duration % 60000) / 1000);
      const durationStr = `${mins}m ${secs}s`;

      const newSpots = [...spots];
      newSpots[index] = { occupied: false, timestamp: null };
      set(ref(db, 'spots'), newSpots);

      // Update analytics
      const newDurations = { ...analytics.durations, [index]: durationStr };
      update(ref(db, 'analytics'), {
        exits: (analytics.exits || 0) + 1,
        durations: newDurations,
        lastUpdated: new Date().toISOString()
      });

      setAssignMessage(`👋 Car exited from Spot ${index + 1}`);
      setTimeout(() => setAssignMessage(null), 4000);
    } else {
      alert('All spots are empty!');
    }
  };

  // 🧼 Full Reset
  const handleReset = () => {
    const resetData = {
      spots: Array(totalSpots).fill({ occupied: false, timestamp: null }),
      analytics: {
        entries: 0,
        exits: 0,
        lastUpdated: new Date().toISOString(),
        durations: {}
      }
    };

    set(ref(db), resetData);
    setAssignMessage('🧼 Full system reset (spots + analytics)');
    setTimeout(() => setAssignMessage(null), 4000);
  };

  // 🔓 Logout
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="parking-container">
      <h2>🚗 ParkGenius: Smart Parking System</h2>

      {/* 🔔 Notifications */}
      {assignMessage && <div className="notification">{assignMessage}</div>}

      {/* 🧠 Analytics Summary */}
      <div className="analytics">
        <p>🚗 Total Entries: {analytics.entries || 0}</p>
        <p>🚪 Total Exits: {analytics.exits || 0}</p>
        <p>📅 Last Updated: {analytics.lastUpdated?.split('T')[0]}</p>
      </div>

      {/* 🔢 Spot Grid */}
      <div className="grid">
        {spots.map((spot, i) => (
          <div
            key={i}
            className={`spot ${spot.occupied ? 'occupied' : 'available'}`}
          >
            {spot.occupied ? '🟥' : '🟩'} Spot {i + 1}
            {spot.occupied && <div className="timer">⏱ {elapsedTimes[i]}</div>}
            {analytics.durations?.[i] && !spot.occupied && (
              <div className="duration">🕒 {analytics.durations[i]}</div>
            )}
          </div>
        ))}
      </div>

      {/* 🎛️ Buttons */}
      <div className="controls">
        <button onClick={handleEnter}>Simulate Entry</button>
        <button onClick={handleLeave}>Simulate Exit</button>
        <button onClick={handleReset} style={{ backgroundColor: '#333', color: '#fff' }}>
          Reset All
        </button>
        <button onClick={handleLogout} style={{ backgroundColor: 'crimson', color: '#fff' }}>
          Logout
        </button>
      </div>

      {/* 📸 Embedded Plate Reader */}
      <div style={{ marginTop: '30px' }}>
        <h3>🔍 License Plate Scanner (OCR)</h3>
        <LicenseReader />
      </div>
    </div>
  );
}
