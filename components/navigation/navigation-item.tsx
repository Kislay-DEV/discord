"use client"
import React from 'react'
import Image from 'next/image'
import { useRouter,useParams } from 'next/navigation'

import { cn } from '@/lib/utils'

import { ActionTooltip } from '../action-tooltip'
import { Button } from '../ui/button'

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
}

export default function NavigationItem({
    id,
    imageUrl,
    name
}: NavigationItemProps) {
    const params = useParams()
    const router = useRouter()

    const onClick = () => {
        router.push(`/server/${id}`)
    }
  return (
    <ActionTooltip side="right" label={name} align='center'>
        <button onClick={onClick} className='group relative flex items-center mb-4' title={name}>

        <div className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.serverId !== id && "group-hover:h-8",
            params?.serverId === id ? "h-[36px]": "h-3",
        )}/>
        <div className={cn(
            "relatetive group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            params?.serverId === id && "bg-primary/10 text-primary rounded-[16px] ",
        )}>
            <div className="relative h-full w-full">
                <Image
                    fill
                    src={imageUrl}
                    alt={name}
                    className='object-cover '
                />
            </div>
        </div>
        </button>
    </ActionTooltip>
  )
}
