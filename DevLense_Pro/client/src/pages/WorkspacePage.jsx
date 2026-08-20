import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import EditorPanel from '../components/EditorPanel';
import DashboardPanel from '../components/DashboardPanel';
import axios from 'axios';

// Mock initial files
const initialFiles = [
    {
        filePath: 'server.js',
        language: 'javascript',
        content: `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Hello World');\n});\n\napp.listen(3000, () => console.log('Server running'));`
    },
    {
        filePath: 'db.js',
        language: 'javascript',
        content: `const mongoose = require('mongoose');\nmongoose.connect('mongodb://localhost/test');\n\nconst UserSchema = new mongoose.Schema({ name: String });\nmodule.exports = mongoose.model('User', UserSchema);`
    }
];

export default function WorkspacePage() {
    const [files, setFiles] = useState(initialFiles);
    const [activeFile, setActiveFile] = useState(initialFiles[0]);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState(null);

    const handleSelectFile = (file) => {
        setActiveFile(file);
    };

    const handleEditorChange = (newContent) => {
        setActiveFile(prev => ({ ...prev, content: newContent }));
        setFiles(prev => prev.map(f => f.filePath === activeFile.filePath ? { ...f, content: newContent } : f));
    };

    const handleAddFile = () => {
        const filename = prompt('Enter filename (e.g., config.json):');
        if (filename) {
            const newFile = { filePath: filename, language: 'javascript', content: '// New file' };
            setFiles([...files, newFile]);
            setActiveFile(newFile);
        }
    };

    const runAudit = async () => {
        setIsAuditing(true);
        try {
            // Since we are not doing a full DB flow in this mock, we will mock the API response behavior 
            // but in a real app this hits POST /api/v1/audit/run-full-audit with projectId.

            // Fallback mock test instead of actual DB
            setTimeout(() => {
                setAuditResult({
                    overallScore: 78,
                    architectureSummary: "The application uses an Express server with Mongoose for MongoDB. Database connection logic is separated, which is a good practice. However, there are potential bottlenecks in scalability.",
                    mermaidDiagramCode: "graph TD;\n  Client-->Express_Router;\n  Express_Router-->DB_Connection;\n  DB_Connection-->MongoDB;",
                    dbOptimizationTips: [
                        "Enable connection pooling for MongoDB to avoid exhaustion.",
                        "Add appropriate indexing to UserSchema if queries grow."
                    ],
                    fileAudits: files.map(f => ({
                        filePath: f.filePath,
                        timeComplexity: "O(1)",
                        spaceComplexity: "O(1)",
                        issues: f.filePath === 'db.js' ? [{
                            severity: "MEDIUM",
                            lineNumber: 2,
                            category: "PERFORMANCE",
                            description: "Synchronous connection without await/catch block.",
                            fixSuggestion: "Wrap mongoose.connect inside an async function and add a catch block."
                        }] : []
                    }))
                });
                setIsAuditing(false);
            }, 2000);

        } catch (err) {
            console.error("Audit failed", err);
            setIsAuditing(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
            <Sidebar
                files={files}
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                onAddFile={handleAddFile}
            />

            <div className="flex-1 flex overflow-hidden">
                <EditorPanel
                    activeFile={activeFile}
                    onChange={handleEditorChange}
                    onRunAudit={runAudit}
                    isAuditing={isAuditing}
                />

                <DashboardPanel auditResult={auditResult} />
            </div>
        </div>
    );
}
