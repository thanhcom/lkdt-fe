"use client"

import React from "react"

export default function Loading({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 h-screen w-screen">
      {/* Bouncing dots */}
      <div className="flex space-x-2 justify-center items-center mb-4">
        <span className="sr-only">Loading...</span>
        <div className="h-6 w-6 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-6 w-6 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-6 w-6 bg-black dark:bg-white rounded-full animate-bounce"></div>
      </div>

      {/* Optional text */}
      {message && <span className="text-gray-700 dark:text-gray-200 text-xl font-medium">{message}</span>}
    </div>
  )
}
