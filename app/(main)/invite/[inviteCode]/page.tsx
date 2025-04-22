"use client"
import axios from 'axios'
import { redirect } from 'next/navigation'
import React, { useEffect } from 'react'

interface InviteCodePageProps {
  params: Promise<{ inviteCode: string }>
}

const InviteCodePage = ({
  params
}: InviteCodePageProps) => {
  // Unwrap params using React.use()
  const { inviteCode } = React.use(params);

  if (!inviteCode) {
    return redirect("/dashboard")
  }

  useEffect(() => {
    const res = axios.patch(`/api/admin/server/invite/${inviteCode}`)
    console.log(res)
  }, [inviteCode])

  return (
    <div>
      Hello Invite
    </div>
  )
}

export default InviteCodePage