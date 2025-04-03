"use client"
import React from 'react'
import axios from 'axios'

export default function page() {
  const click = async () => {
    const res = await axios.get('/api/admin/dashboard')
    console.log(res.data)
  }
  return (
    <div>
      <button onClick={click}>
        Click me
      </button>
    </div>
  )
}
