import { createUploadthing, type FileRouter } from "uploadthing/next";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connect } from "@/lib/DB_Connect";
import User from "@/models/User.model";

const f = createUploadthing();

interface Metadata {
  userId: string;
}
 
const handleAuth = async ()=>{
    try {
        await connect();
        
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
          throw new Error("No authentication token found");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        
        if (typeof decoded === "string" || !decoded?.id) {
          throw new Error("Invalid token structure");
        }

        const user = await User.findById(decoded.id);
        if (!user) {
          throw new Error("User not found in database");
        }

        return { userId: user._id.toString() };
      } catch (error) {
        console.error("Uploadthing authentication failed:", error);
        throw new Error("Authentication failed");
      }
}
export const ourFileRouter ={
    serverImage:f({ image:{maxFileCount:1, maxFileSize:"4MB"}})
    .middleware(()=>handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("File URL:", file.url); // Changed from ufsUrl to url
  
        return { uploadedBy: metadata.userId };
      }),
      messageFile:f(["image", "pdf"])
      .middleware(()=>handleAuth())
      .onUploadComplete(()=>{})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;