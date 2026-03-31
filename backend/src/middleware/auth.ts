import { Request, Response, NextFunction } from "express";
import { supabasePublic } from "../supabaseClient";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token or unauthorized" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Auth processing error" });
  }
};

// Optional auth - doesn't block if not logged in, but attaches user if token exists
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const { data: { user } } = await supabasePublic.auth.getUser(token);
    if (user) {
      req.user = user;
      req.token = token;
    }
  }
  
  next();
}
