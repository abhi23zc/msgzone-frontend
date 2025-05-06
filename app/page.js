"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

function App() {
  const router = useRouter();
  useEffect(() => {
    router.push("/dashboard")
  }, [router])
  
  return (  
    <></>
  )
}

export default App