import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super_secret_jwt_key_2026_community_board"
);

export interface JWTPayload {
  userId?: string;
  email: string;
  name?: string;
  role: "user" | "admin";
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}


export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);
    if (decoded && decoded.role === "user") return decoded;
  }

  const cookieToken = req.cookies.get("token")?.value;
  if (cookieToken) {
    const decoded = await verifyToken(cookieToken);
    if (decoded && decoded.role === "user") return decoded;
  }

  return null;
}


export async function verifyAdminRequest(req: NextRequest): Promise<JWTPayload | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);
    if (decoded && decoded.role === "admin") return decoded;
  }

  const cookieToken = req.cookies.get("admin_token")?.value;
  if (cookieToken) {
    const decoded = await verifyToken(cookieToken);
    if (decoded && decoded.role === "admin") return decoded;
  }

  return null;
}