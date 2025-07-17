import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/parking');
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create Your ParkGenius Account</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        /><br/><br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        /><br/><br/>
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="/">Login here</a></p>
    </div>
  );
}

export default Signup;
