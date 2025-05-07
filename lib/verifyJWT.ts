import jwt, { Secret, JwtPayload as JWTBasePayload, SignOptions } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Define the payload structure that will be returned after verification
interface JWTPayload extends JWTBasePayload {
  userId: string;
  email?: string;
  username?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

/**
 * Verifies a JWT token and returns the decoded payload
 * 
 * @param token The JWT token to verify
 * @returns The decoded token payload
 * @throws Error if token is invalid or expired
 */
export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  try {
    // Get the JWT secret from environment variables
    const JWT_SECRET = process.env.JWT_SECRET as Secret;
    
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
};

/**
 * Extracts a token from the Authorization header or cookies
 * 
 * @param request The Next.js request object
 * @returns The extracted token or null if not found
 */
export const extractToken = (request: NextRequest): string | null => {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get token from cookie
  const cookies = request.cookies;
  const tokenFromCookie = cookies.get('token')?.value;
  
  return tokenFromCookie || null;
};

/**
 * Wrapper function that extracts and verifies a token from a request
 * 
 * @param request The Next.js request object
 * @returns The decoded token payload
 * @throws Error if token is missing, invalid, or expired
 */
export const authenticateRequest = async (request: NextRequest): Promise<JWTPayload> => {
  const token = extractToken(request);
  
  if (!token) {
    throw new Error('Authentication token is missing');
  }
  
  return await verifyJWT(token);
};

/**
 * Creates a new JWT token for a user
 * 
 * @param payload The data to encode in the token
 * @param expiresIn How long the token should be valid (default: '1d')
 * @returns The generated JWT token
 */
export const generateToken = (
  payload: Omit<JWTPayload, 'iat' | 'exp'>, 
  expiresIn: string = '1d'
): string => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET as Secret, options);
};