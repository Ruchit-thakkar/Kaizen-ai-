import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import ErrorPage from './pages/Error/ErrorPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public authentication paths */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/error" element={<ErrorPage type="network" />} />

          {/* Protected application panel paths */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Fallback catcher for 404 Page Not Found */}
          <Route path="*" element={<ErrorPage type="404" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
