"use client"
import React from 'react'
import { Plus } from 'lucide-react'

import { ActionTooltip } from '@/components/action-tooltip'
import { useModal } from '@/hooks/use-model-store'

export default function NavigationAction() {

  const {onOpen} = useModal()
  
  return (
    <div>
    <ActionTooltip label="Add a server" side="right" align="center">
         <button onClick={()=>{
          onOpen("createServer")
         }} className='group flex items-center' title="Add">
            <div className='flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] group-hover:bg-emerald-500 transition-all items-center justify-center bg-background dark:bg-neutral-700 '>

            <Plus className='group-hover:text-white transition text-emerald-500' size={25} />
            </div>
         </button>
         </ActionTooltip>
    </div>
  )
}
