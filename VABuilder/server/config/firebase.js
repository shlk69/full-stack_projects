import jwt from 'jsonwebtoken';
export const createFirebaseVerifier = (projectId, fetchImpl = fetch) => {
  let certificates = null, expiresAt = 0;
  return async token => {
    if (!projectId) throw new Error('Firebase project is not configured');
    if (typeof token !== 'string' || token.length > 16000) throw new Error('Invalid Google identity token');
    const decoded = jwt.decode(token, { complete: true });
    if (decoded?.header?.alg !== 'RS256' || typeof decoded.header.kid !== 'string') throw new Error('Invalid token signature');
    if (!certificates || Date.now() >= expiresAt) {
      const response = await fetchImpl('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Google identity verification unavailable');
      certificates = await response.json();
      const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get('cache-control') || '')?.[1] || 300);
      expiresAt = Date.now() + Math.min(maxAge, 86400) * 1000;
    }
    if (!Object.hasOwn(certificates, decoded.header.kid)) throw new Error('Unknown token signing key');
    const claims = jwt.verify(token, certificates[decoded.header.kid], { algorithms: ['RS256'], audience: projectId, issuer: 'https://securetoken.google.com/' + projectId });
    const now = Math.floor(Date.now() / 1000);
    if (!claims.sub || claims.sub.length > 128 || !Number.isFinite(claims.exp) || !Number.isFinite(claims.iat) || claims.iat > now || !Number.isFinite(claims.auth_time) || claims.auth_time > now || !claims.email || claims.email_verified !== true || claims.firebase?.sign_in_provider !== 'google.com') throw new Error('Invalid Google identity');
    return claims;
  };
};
let verifier;
export const verifyGoogleIdentity = token => {
  verifier ||= createFirebaseVerifier(process.env.FIREBASE_PROJECT_ID);
  return verifier(token);
};
