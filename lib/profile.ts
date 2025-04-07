import axios from "axios"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const Profile = async () => {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) {
            throw new Error("Token is undefined or missing");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload & { userId?: string };

        if (!decodedToken.userId) {
            throw new Error("Decoded token does not contain userId");
        }
        const userId = decodedToken.userId
        const response = await axios.get(`/app/api/admin/server/${userId}`)
        const server = response.data.server
        return server
    } catch (error) {
        console.error("Error fetching user data:", error)
        return null
    }


}
export default Profile
