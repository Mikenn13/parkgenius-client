import React, { useEffect, useState } from 'react';
import './ParkingLot.css';
import { db } from './firebase';
import { ref, onValue, set } from 'firebase/database';

const totalSpots = 10;

export default function ParkingLot() {
  const [spots, setSpots] = useState(Array(totalSpots).fill({ occupied: false, timestamp: null }));
  const [elapsedTimes, setElapsedTimes] = useState(Array(totalSpots).fill(null));
  const [assignMessage, setAssignMessage] = useState(null); // 🔔 NEW

  // 🔄 Sync from Firebase
  useEffect(() => {
    const spotsRef = ref(db, 'spots');
    onValue(spotsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSpots(data);
      }
    });
  }, []);

  // ⏱️ Update timers every second
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

  // 🅿️ Simulate Entry + Assign Spot with Message
  const handleEnter = () => {
    const index = spots.findIndex((spot) => !spot.occupied);
    if (index !== -1) {
      const newSpots = [...spots];
      newSpots[index] = { occupied: true, timestamp: Date.now() };
      set(ref(db, 'spots'), newSpots);

      // ✨ Show assignment message (Lane based on spot number)
      const lane = Math.floor(index / 5) + 1;
      const spotNum = (index % 5) + 1;
      setAssignMessage(`✅ Assigned to Spot ${index + 1} (Lane ${lane})`);
      setTimeout(() => setAssignMessage(null), 5000); // auto-hide after 5 sec
    } else {
      alert('🚫 No spots available!');
    }
  };

  // 🚪 Simulate Exit
  const handleLeave = () => {
    const index = spots.map((s) => s.occupied).lastIndexOf(true);
    if (index !== -1) {
      const newSpots = [...spots];
      newSpots[index] = { occupied: false, timestamp: null };
      set(ref(db, 'spots'), newSpots);
    } else {
      alert('All spots are already empty!');
    }
  };

  // 🔄 Reset Lot
  const handleReset = () => {
    const resetSpots = Array(totalSpots).fill({ occupied: false, timestamp: null });
    set(ref(db, 'spots'), resetSpots);
    setAssignMessage('🧼 Parking lot reset.');
    setTimeout(() => setAssignMessage(null), 3000);
  };

  return (
    <div className="parking-container">
      <h2>🚗 ParkGenius: Smart Parking</h2>

      {/* 🎉 Notification Banner */}
      {assignMessage && (
        <div className="notification">{assignMessage}</div>
      )}

      <div className="grid">
        {spots.map((spot, i) => (
          <div
            key={i}
            className={`spot ${spot.occupied ? 'occupied' : 'available'}`}
          >
            {spot.occupied ? '🟥' : '🟩'} Spot {i + 1}
            {spot.occupied && (
              <div className="timer">⏱ {elapsedTimes[i]}</div>
            )}
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={handleEnter}>Simulate Entry</button>
        <button onClick={handleLeave}>Simulate Exit</button>
        <button onClick={handleReset} style={{ backgroundColor: '#333', color: '#fff' }}>
          Reset All
        </button>
      </div>
    </div>
  );
}
