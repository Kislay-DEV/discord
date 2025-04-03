import User from "@/models/User.model";
import { NextResponse } from "next/server";
import { connect } from "@/lib/DB_Connect";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    await connect();
    try {
        interface SignupRequestBody {
            username: string;
            email: string;
            password: string;
        }
        const { username, email, password }: SignupRequestBody = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                { message: "Please fill in all fields" },
                { status: 400 }
            );
        }
        
        // Check if user already exists
        const DB_User = await User.findOne({ username });
        if (DB_User) {
            return NextResponse.json({
                message: "User already exists"
            },
            { status: 400 });
        }

        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Define user details for token
        type UserDetails = {
            readonly id: string;
            username: string;
            email: string;
        };
        
        const tokenDetails: UserDetails = {
            id: user._id.toString(),
            username: user.username,
            email: user.email
        };
        
        // Generate JWT token with expiration
        const token = jwt.sign(tokenDetails, process.env.JWT_SECRET!, {
            expiresIn: '1h' // Add token expiration
        });

        // Set cookie with the actual JWT token (not user details)
        const cookieStore = await cookies();
        cookieStore.set("token", token, { 
            httpOnly: true, 
            sameSite: "strict",
            path: "/",
            maxAge: 3600 // 1 hour in seconds
        });

        // Return success response
        const response = {
            message: "User created successfully",
            user: {
                id: tokenDetails.id,
                username: tokenDetails.username,
                email: tokenDetails.email
            }
        };
        
        return NextResponse.json(response);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Signup error:", errorMessage);
        return NextResponse.json(
            { message: "An error occurred during signup", error: errorMessage },
            { status: 500 }
        );
    }
}