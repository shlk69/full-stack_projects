const ProjectWorkspace = require('../models/ProjectWorkspace');
const AuditReport = require('../models/AuditReport');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.runAudit = async (req, res) => {
    try {
        const { projectId } = req.body;
        const workspace = await ProjectWorkspace.findOne({ _id: projectId, userId: req.user.userId });
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        let filesContext = workspace.files.map(f => `File: ${f.filePath}\nLanguage: ${f.language}\nContent:\n${f.content}\n`).join('\n---\n');

        const prompt = `
You are a Lead Software Architect and Static Security Auditor.
Inspect the provided multi-file code workspace, analyze cross-file imports, database query efficiency, and potential security leaks.
Return your evaluation STRICTLY as a JSON object matching the provided schema format without any Markdown wrapping (no \`\`\`json) or conversational text.

Schema:
{
  "overallScore": Number (0-100),
  "architectureSummary": String,
  "mermaidDiagramCode": String (Valid Mermaid.js graph string),
  "fileAudits": [
    {
      "filePath": String,
      "timeComplexity": String,
      "spaceComplexity": String,
      "issues": [
        {
          "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          "lineNumber": Number,
          "category": "SECURITY" | "PERFORMANCE" | "DB_QUERY" | "CLEAN_CODE",
          "description": String,
          "fixSuggestion": String
        }
      ],
      "refactoredContent": String
    }
  ],
  "dbOptimizationTips": [String]
}

Workspace Files:
${filesContext}
`;

        let generatedJsonStr = "";

        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            generatedJsonStr = text;
        } else {
            // Fallback for demonstration if API key is not set
            generatedJsonStr = JSON.stringify({
                overallScore: 85,
                architectureSummary: "Analyzed workspace structure successfully. Potential adjustments needed in routing and database schemas.",
                mermaidDiagramCode: "graph TD;\n A[Client] --> B[Server];",
                fileAudits: [],
                dbOptimizationTips: ["Consider indexing frequently queried fields."]
            });
        }

        const auditData = JSON.parse(generatedJsonStr);

        const report = new AuditReport({
            projectId: workspace._id,
            userId: req.user.userId,
            overallScore: auditData.overallScore,
            architectureSummary: auditData.architectureSummary,
            mermaidDiagramCode: auditData.mermaidDiagramCode,
            fileAudits: auditData.fileAudits,
            dbOptimizationTips: auditData.dbOptimizationTips,
            tokensConsumed: 100 // Mock value
        });

        await report.save();

        await User.findByIdAndUpdate(req.user.userId, {
            $inc: { 'usageMetrics.tokensConsumed': 100, 'usageMetrics.projectsAudited': 1 }
        });

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
