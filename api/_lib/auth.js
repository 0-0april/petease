import jwt from 'jsonwebtoken';

/**
 * Verifies the Bearer token from the Authorization header.
 * Returns the decoded payload or sends a 401/403 response.
 */
export function getUser(req, res) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied' });
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(403).json({ error: 'Invalid token' });
    return null;
  }
}

/**
 * Like getUser, but also checks that the user has one of the allowed roles.
 */
export function getUserWithRole(req, res, ...roles) {
  const user = getUser(req, res);
  if (!user) return null;

  if (roles.length > 0 && !roles.includes(user.role)) {
    res.status(403).json({ error: 'Access forbidden' });
    return null;
  }

  return user;
}
