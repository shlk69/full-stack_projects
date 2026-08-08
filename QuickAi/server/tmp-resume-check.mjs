import 'dotenv/config';
import fs from 'fs';
import { resumeReview } from './controllers/aiController.js';

const filePath = './tmp-sample.pdf';
fs.writeFileSync(filePath, Buffer.from('%PDF-1.4\n%test\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 18 Tf 72 72 Td (Hello Resume) Tj ET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000062 00000 n \n0000000119 00000 n \n0000000206 00000 n \n0000000300 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n0\n%%EOF\n'));

const stat = fs.statSync(filePath);
const req = {
    auth: { userId: 'test-user' },
    plan: 'premium',
    file: { path: filePath, size: stat.size }
};
const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { console.log(JSON.stringify(payload, null, 2)); },
    send(payload) { console.log(payload); }
};

await resumeReview(req, res);
