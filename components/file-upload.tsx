"use client"
import { UploadDropzone } from '@/lib/uploadthing';
import "@uploadthing/react/styles.css"
import React from 'react'

interface FileUploadProps {
  onchange:(url?:string)=>void;
  value?:string;
  endpoint:"messageFile"|"serverImage";
}

export default function File({
  onchange,
  value,
  endpoint
}:FileUploadProps
){
  return (
    <UploadDropzone
    endpoint={endpoint}
    onClientUploadComplete={(res)=>{
      onchange(res?.[0]?.url) // Assuming 'url' is the correct property name
    }}
    onUploadError={(error:Error)=>{
      console.log("Upload Error", error)

    }}/>
  )
}
