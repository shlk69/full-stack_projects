import React from 'react';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';

export default function EditorPanel({ activeFile, onChange, onRunAudit, isAuditing }) {
    if (!activeFile) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-900 border-r border-gray-700">
                <div className="text-gray-500 text-center">
                    <p>Select a file to edit</p>
                </div>
            </div>
        );
    }

    // Determine Monaco language
    let language = 'javascript';
    if (activeFile.filePath.endsWith('.css')) language = 'css';
    if (activeFile.filePath.endsWith('.html')) language = 'html';
    if (activeFile.filePath.endsWith('.json')) language = 'json';
    if (activeFile.filePath.endsWith('.sql')) language = 'sql';
    if (activeFile.filePath.endsWith('.md')) language = 'markdown';

    return (
        <div className="flex-1 flex flex-col bg-gray-900 border-r border-gray-700 relative h-full">
            <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-800/50 backdrop-blur">
                <div className="flex gap-2 text-sm text-gray-300">
                    <span className="font-mono bg-gray-800 px-3 py-1 rounded border border-gray-700">
                        {activeFile.filePath}
                    </span>
                </div>
                <button
                    onClick={onRunAudit}
                    disabled={isAuditing}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg transition-all ${isAuditing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                        }`}
                >
                    {isAuditing ? (
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Play size={16} />
                    )}
                    {isAuditing ? 'Auditing...' : 'Run Audit'}
                </button>
            </div>

            <div className="flex-1 relative">
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={activeFile.content}
                    onChange={onChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                />
            </div>
        </div>
    );
}
