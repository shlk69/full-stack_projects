const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditReportSchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'ProjectWorkspace', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    overallScore: { type: Number, min: 0, max: 100 },
    architectureSummary: { type: String, required: true },
    mermaidDiagramCode: { type: String, required: true },
    fileAudits: [
        {
            filePath: { type: String, required: true },
            timeComplexity: { type: String },
            spaceComplexity: { type: String },
            issues: [
                {
                    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                    lineNumber: { type: Number },
                    category: { type: String, enum: ['SECURITY', 'PERFORMANCE', 'DB_QUERY', 'CLEAN_CODE'] },
                    description: { type: String },
                    fixSuggestion: { type: String }
                }
            ],
            refactoredContent: { type: String }
        }
    ],
    dbOptimizationTips: [{ type: String }],
    tokensConsumed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditReport', auditReportSchema);
