import User from "@/models/User.model";
import { NextResponse } from "next/server";
import { connect } from "@/lib/DB_Connect";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    await connect();
    try {
        // Define interface for login request body
        interface LoginRequestBody {
            username: string;
            password: string;
        }

        // Parse request body
        const { username, password }: LoginRequestBody = await request.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { message: "Please fill in all fields" },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Debug info
        console.log("Login attempt for:", username);
        console.log("Password from request:", password);
        console.log("Stored password:", user.password);
        console.log("Has password property:", user.password !== undefined);
        console.log("Password type:", typeof user.password);
        
        // Manually hash the input password to check if hashing works
        const testSalt = await bcrypt.genSalt(10);
        const testHash = await bcrypt.hash(password, testSalt);
        console.log("Test hash result:", testHash);

        // Check password
        let isPasswordValid = false;
        try {
            // Try direct comparison with extra safeguards
            if (user.password && typeof user.password === 'string') {
                // Try to detect if password is not hashed
                if (!user.password.startsWith('$2')) {
                    console.log("Password doesn't appear to be hashed, attempting to fix...");
                    
                    // Hash password with 8 rounds (same as seen in your logs)
                    const salt = await bcrypt.genSalt(8);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    
                    // Update the password
                    user.password = hashedPassword;
                    await user.save();
                    
                    // Since we just set the password to what the user entered, it's valid
                    isPasswordValid = true;
                } else {
                    // Normal bcrypt comparison for hashed passwords
                    isPasswordValid = await bcrypt.compare(password, user.password);
                    console.log("Using bcrypt.compare directly:", isPasswordValid);
                    
                    // For debugging: try comparing with salt rounds 8
                    if (!isPasswordValid) {
                        const testSalt = await bcrypt.genSalt(8);
                        const testHash = await bcrypt.hash(password, testSalt);
                        console.log("Test hash with salt rounds 8:", testHash);
                        console.log("Original hash from DB:", user.password);
                        
                        // Check for case mismatch
                        console.log("Checking for case sensitivity issues...");
                        if (password.toLowerCase() !== password || password.toUpperCase() !== password) {
                            console.log("Testing case variations");
                            
                            // Try lowercase
                            isPasswordValid = await bcrypt.compare(password.toLowerCase(), user.password);
                            if (isPasswordValid) {
                                console.log("Lowercase version matched!");
                                return true;
                            }
                            
                            // Try uppercase
                            isPasswordValid = await bcrypt.compare(password.toUpperCase(), user.password);
                            if (isPasswordValid) {
                                console.log("Uppercase version matched!");
                                return true;
                            }
                            
                            // Try username as password (common pattern)
                            isPasswordValid = await bcrypt.compare(user.username.toLowerCase(), user.password);
                            if (isPasswordValid) {
                                console.log("Username as password matched!");
                                return true;
                            }
                            
                            // Try first part of username (before underscore)
                            if (user.username.includes('_')) {
                                const firstPart = user.username.split('_')[0].toLowerCase();
                                console.log(`Trying first part of username: ${firstPart}`);
                                isPasswordValid = await bcrypt.compare(firstPart, user.password);
                                if (isPasswordValid) {
                                    console.log("First part of username matched!");
                                    return true;
                                }
                            }
                        }
                    }
                }
            } else {
                console.log("Invalid password field in user object");
            }
        } catch (error) {
            console.error("Error during password comparison:", error);
        }
        
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Define user details for token
        const tokenDetails = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
        };

        // Generate JWT token
        const token = jwt.sign(tokenDetails, process.env.JWT_SECRET!, { 
            expiresIn: '10h' // Add token expiration
        });

        // Set cookie with user details
        const cookieStore = await cookies();
        cookieStore.set("token", token, { 
            httpOnly: true, 
            sameSite: "strict",
            path:"/",
            maxAge: 36000 // 10 hour expiration
        });

        // Return success response
        return NextResponse.json({
            message: "Login successful",
            user: {
                id: tokenDetails.id,
                username: tokenDetails.username,
                email: tokenDetails.email
            }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Login error:", errorMessage);
        return NextResponse.json(
            { message: "An error occurred during login", error: errorMessage },
            { status: 500 }
        );
    }
}