"use client"
import React from 'react'

import CreateServerModal from "@/components/modals/create-server-modal"

import InviteModal from '../modals/invite-modal'
import EditServer from '../modals/edit-server-modal'
import MembersModal from '../modals/members-modal'
import CreateChannel from '../modals/create-channel-modal'
import LeaveServer from '../modals/leave-server-modal'
import DeleteServer from '../modals/delete-server-modal'

export const ModalProvider = () => {
    const [isMounted , setIsMounted] = React.useState(false)
    React.useEffect(() => {
        setIsMounted(true)
    },[])
    if (!isMounted) return null
  return (
    <>
      <CreateServerModal />
      <InviteModal/>
      <EditServer/>
      <MembersModal/>
      <CreateChannel/>
      <LeaveServer/>
      <DeleteServer/>
    </>
  )
}