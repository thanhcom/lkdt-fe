export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch("http://localhost:8084/account/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Đặt lại mật khẩu thất bại.");
  }

  return data;
}
