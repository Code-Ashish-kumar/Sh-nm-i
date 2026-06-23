import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  // Extract token directly from the cookie
  // console.log('Auth middleware called.');
  const token = req.cookies?.jwt || req.header("Authorization")?.replace("Bearer ","");

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload to request

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Not authorized, invalid token.' });
  }
};