// /app/services/auth/login.ts

import { DataUser } from "@/types/dataUser"

export interface LoginPayload {
  username: string
  password: string
  remember?: boolean // chỉ dùng FE, không gửi lên API
}

export interface LoginResponse {
  token: string
  refresh_token: string
  user?: DataUser
  message?: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // Loại bỏ trường `remember` trước khi gửi request
  const { remember, ...sendPayload } = payload

  const res = await fetch("https://api-lkdt.thanhcom.site/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendPayload),
  })

  const data = await res.json()

  if (!res.ok) {
  throw new Error(
    data.Messenger || data.message || "Đăng nhập thất bại"
  )
}

  // trả về phần `data` chứa token + refresh_token
  return data.data
}
