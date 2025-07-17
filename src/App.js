import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup'; // ✅ Corrected spelling
import Login from './components/Login';

import ParkingLot from './ParkingLot';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/parking"
          element={
            <ProtectedRoute>
              <ParkingLot />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
