import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { ShieldAlert, Zap, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
});

function MermaidView({ chartCode }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (chartCode && containerRef.current) {
            containerRef.current.innerHTML = '';
            const id = `mermaid-${Date.now()}`;
            try {
                mermaid.render(id, chartCode).then((result) => {
                    containerRef.current.innerHTML = result.svg;
                });
            } catch (e) {
                console.error("Mermaid error:", e);
            }
        }
    }, [chartCode]);

    return <div ref={containerRef} className="mermaid-container w-full overflow-x-auto p-4 flex justify-center bg-gray-800 rounded-lg shadow-inner border border-gray-700/50"></div>;
}

export default function DashboardPanel({ auditResult }) {
    if (!auditResult) {
        return (
            <div className="w-[450px] bg-gray-900 p-6 flex flex-col justify-center items-center text-center">
                <ShieldAlert size={48} className="text-gray-700 mb-4" />
                <h3 className="text-xl font-medium text-gray-500">No Audit Data</h3>
                <p className="text-gray-600 text-sm mt-2">Run an audit to view architectural insights and issues.</p>
            </div>
        );
    }

    const { overallScore, architectureSummary, mermaidDiagramCode, fileAudits, dbOptimizationTips } = auditResult;

    // Determine score color
    let scoreColor = "text-green-500";
    if (overallScore < 70) scoreColor = "text-yellow-500";
    if (overallScore < 50) scoreColor = "text-red-500";

    return (
        <div className="w-[450px] bg-gray-800/50 backdrop-blur border-l border-gray-700 flex flex-col overflow-y-auto">
            <div className="p-5 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800/90 backdrop-blur z-10">
                <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                    <Zap className="text-yellow-400" size={20} /> Analysis Dashboard
                </h2>
                <div className={`text-2xl font-black ${scoreColor} drop-shadow-md`}>
                    {overallScore}/100
                </div>
            </div>

            <div className="p-5 space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Architecture Summary</h3>
                    <p className="text-gray-300 text-sm leading-relaxed bg-gray-800 p-4 rounded-lg border border-gray-700/50 text-justify">
                        {architectureSummary}
                    </p>
                </motion.div>

                {mermaidDiagramCode && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">System Flow</h3>
                        <MermaidView chartCode={mermaidDiagramCode} />
                    </motion.div>
                )}

                {dbOptimizationTips?.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Database size={16} /> Data Optimization
                        </h3>
                        <div className="bg-gray-800 p-3 rounded-lg border border-indigo-500/30">
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                                {dbOptimizationTips.map((tip, i) => <li key={i}>{tip}</li>)}
                            </ul>
                        </div>
                    </motion.div>
                )}

                <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">File Audits</h3>
                    {fileAudits.map((fileAudit, i) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.1) }} key={i} className="mb-4 bg-gray-800 rounded-lg p-3 border border-gray-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-mono text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded">{fileAudit.filePath}</span>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    <span title="Time Complexity">T: {fileAudit.timeComplexity || 'N/A'}</span>
                                    <span title="Space Complexity">S: {fileAudit.spaceComplexity || 'N/A'}</span>
                                </div>
                            </div>

                            {fileAudit.issues?.length > 0 ? (
                                <div className="space-y-2 mt-3">
                                    {fileAudit.issues.map((issue, j) => (
                                        <div key={j} className="bg-gray-900/50 p-2 text-sm rounded border-l-2 border-red-500">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <AlertTriangle size={14} className={issue.severity === 'CRITICAL' ? 'text-red-500' : 'text-orange-400'} />
                                                <span className="font-semibold text-gray-200">L{issue.lineNumber} : {issue.category}</span>
                                            </div>
                                            <p className="text-gray-400 text-xs mb-1">{issue.description}</p>
                                            <p className="text-green-400/90 text-xs"><span className="font-bold text-green-500">Fix:</span> {issue.fixSuggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-green-400 flex items-center gap-1 mt-2">
                                    <CheckCircle size={14} /> No issues detected
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
