import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkspacePage from './pages/WorkspacePage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/workspace/1" />} />
                <Route path="/workspace/:id" element={<WorkspacePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
