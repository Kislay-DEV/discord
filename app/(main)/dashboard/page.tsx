"use client"
import React, { useState } from 'react'
import axios from 'axios'

export default function Dashboard() {

  interface Profile {
    username: string;
    email: string;
    // Add other properties as needed
  }

  const [profile, setProfile] = useState<Profile | null>(null)
  const click = async () => {
    const res = await axios.get('/api/admin/dashboard')
    setProfile(res.data.user)
    console.log(profile)
  }
  return (
    <div>
      <button onClick={click} className='p-2 bg-transparent backdrop-blur-2xl border-2 border-slate-500'>
        Fetch Profile
      </button>
      {profile && (
        <div className="mt-4">
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          {/* Add more fields as needed */}
        </div>
      )}
    </div>
  )
}
