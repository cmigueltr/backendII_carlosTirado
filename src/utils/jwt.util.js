import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES_IN || '1h';

export function generateToken(user) {
  // payload minimal: sub = user id, role
  const payload = { sub: user._id, role: user.role };
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}
