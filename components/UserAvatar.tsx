import {Avatar, AvatarImage} from "@/components/ui/avatar"; 

interface UserAvatarProps {
    src?:string;
    className?:string;
    name?:string
}

export const UserAvatar= ({
    src,
    className
}:UserAvatarProps) =>{
    return(
        <Avatar>
            <AvatarImage src={src} className={className}/>
        </Avatar>
    )
}
