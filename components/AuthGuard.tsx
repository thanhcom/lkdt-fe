// app/components/AuthGuard.tsx
"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter} from "next/navigation"

interface AuthGuardProps {
  children: ReactNode
  redirectIfUnauthenticatedTo?: string
}

function parseJwt(token: string) {
  try {
    const base64Payload = token.split(".")[1]
    const payload = atob(base64Payload)
    return JSON.parse(payload)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token)
  if (!payload?.exp) return true
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

export default function AuthGuard({
  children,
  redirectIfUnauthenticatedTo = "/login",
}: AuthGuardProps) {
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "ok">("checking")

  const getToken = () => localStorage.getItem("token")
  const getRefreshToken = () => localStorage.getItem("refreshToken")

  useEffect(() => {
    let active = true

    const checkAuth = async () => {
      const token = getToken()
      const refreshToken = getRefreshToken()

      // Nếu không có token hoặc token hết hạn
      if (!token || isTokenExpired(token)) {
        if (refreshToken) {
          try {
            const res = await fetch(
              "https://api-lkdt.thanhcom.site/auth/refresh-token",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
              }
            )
            const data = await res.json()
            if (!res.ok || !data.data?.token) throw new Error("Refresh token hết hạn")

            localStorage.setItem("token", data.data.token)
            // refreshToken vẫn giữ nguyên
            if (active) setStatus("ok")
            return
          } catch {
            // refreshToken cũng hết hạn → xóa tất cả
            localStorage.removeItem("token")
            localStorage.removeItem("refreshToken")
            router.replace(redirectIfUnauthenticatedTo)
            return
          }
        } else {
          // Không có token và không có refreshToken
          localStorage.removeItem("token")
          router.replace(redirectIfUnauthenticatedTo)
          return
        }
      }

      // Token còn hạn → render bình thường
      if (active) setStatus("ok")
    }

    checkAuth()

    return () => {
      active = false
    }
  }, [redirectIfUnauthenticatedTo, router])

  if (status === "checking") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Đang kiểm tra đăng nhập...</div>
      </div>
    )
  }

  return <>{children}</>
}
