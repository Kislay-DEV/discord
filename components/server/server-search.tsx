"use client"

interface ServerSearchProps {
    data:{
        label:string;
        type:"channel" | "user" | "member";
        data:{
            icon:React.ReactNode;
            name:string;
            id:string;
        }[] |undefined
    }[]
}

export const ServerSearch = ({data}
    :ServerSearchProps
) => {
    return (
        <div>Search</div>
    )
}