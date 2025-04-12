import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import User from "@/models/User.model"

const Profile = async () => {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value
        const user = cookieStore.get("user")?.value

        if (!token) {
            throw new Error("Token is undefined or missing");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload & { id?: string };

        if (!decodedToken.id) {
            throw new Error("Decoded token does not contain userId");
        }
        const userId = decodedToken.id
        const UserDB = await User.findById(userId)
        return UserDB
    } catch (error) {
        console.error("Error fetching user data:", error)
        return null
    }


}
export default Profile
