import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import ParkingLot from './ParkingLot';
import ProtectedRoute from './ProtectedRoute';
import LicenseReader from './components/LicenseReader'; // 📸 NEW

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* 🔒 Protected Routes */}
        <Route
          path="/parking"
          element={
            <ProtectedRoute>
              <ParkingLot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reader"
          element={
            <ProtectedRoute>
              <LicenseReader />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
