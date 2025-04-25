"use client"
import { X } from 'lucide-react';
import Image from 'next/image';
import { UploadDropzone } from '@/lib/uploadthing';
import "@uploadthing/react/styles.css"
import React from 'react'

import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onchange: (url?: string) => void;
  value?: string;
  endpoint: "messageFile" | "serverImage" | "Avatar";
}

export default function File({
  onchange,
  value,
  endpoint
}: FileUploadProps) {
  const filetype = value?.split(".").pop()
  if (value && filetype) {
    return (
      <div className='relative w-20 h-20 mt-4 mb-2'>
        <Image src={value} fill alt="upload" className='object-cover rounded-full ' />
        <button onClick={() => onchange(undefined)} title="Remove file" className='absolute top-0 right-0 p-1 bg-red-500 rounded-full'>
          <X className='h-4 w-4' color='white' />
        </button>
      </div>
    )
  }
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onchange(res?.[0]?.ufsUrl)
      }}
      onUploadError={(error: Error) => {
        console.log("Upload Error", error)

      }} />
  )
}
