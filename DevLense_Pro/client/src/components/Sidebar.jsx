import { FileCode, File, FolderGit2, Plus, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ files, activeFile, onSelectFile, onAddFile }) {
    return (
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/80 backdrop-blur">
                <h2 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    <FolderGit2 className="text-blue-500" /> DevLense Pro
                </h2>
            </div>

            <div className="p-2 flex-grow overflow-y-auto space-y-1">
                <div className="text-xs uppercase text-gray-500 font-semibold mb-2 px-2 mt-4 flex justify-between items-center">
                    Workspace Files
                    <button onClick={onAddFile} className="hover:text-blue-400 transition-colors">
                        <Plus size={16} />
                    </button>
                </div>

                {files.map((file, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={file.filePath}
                        onClick={() => onSelectFile(file)}
                        className={`cursor-pointer px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${activeFile?.filePath === file.filePath
                            ? 'bg-blue-600/20 text-blue-400 font-medium'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                            }`}
                    >
                        <FileCode size={18} className={activeFile?.filePath === file.filePath ? 'text-blue-400' : 'text-gray-500'} />
                        <span className="truncate text-sm">{file.filePath}</span>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-700/50">
                <button
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors w-full"
                    onClick={() => {
                        if (window.confirm('Are you sure you want to log out?')) {
                            // Clear token/session if implemented
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }
                    }}
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );
}
