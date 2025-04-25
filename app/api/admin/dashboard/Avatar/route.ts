import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/DB_Connect";
import User from "@/models/User.model";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import rateLimit from "@/lib/rateLimit";

// Configure rate limiter for dashboard
const dashboardLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000, // Max 1000 users per minute
});

export async function POST(request: NextRequest) {
  await connect();
  
  try {
    // Apply rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await dashboardLimiter.check(30, ip); // Allow 30 requests per minute per IP

    const {Avatar} = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!decodedToken) {
      return NextResponse.json("Token is not valid", {status:404})
    }
    const user = await User.findById(decodedToken.id)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 402 });
    }
    
    user.avatar = Avatar;
    await user.save();

    return NextResponse.json({ message: "Avatar updated successfully" }, { status: 200 });

    
  } catch (error: any) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    
    console.error("Dashboard authentication error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}