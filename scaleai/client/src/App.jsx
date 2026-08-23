import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import CalendarPage from './pages/CalendarPage';
import BrandVoicePage from './pages/BrandVoicePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/auth" element={<AuthPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/editor" element={<EditorPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/brand-voice" element={<BrandVoicePage />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
