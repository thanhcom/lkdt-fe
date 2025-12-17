"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Lấy token từ URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const res = await fetch(
        "https://api-lkdt.thanhcom.site/account/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMessage("Đặt lại mật khẩu thành công!");
      } else {
        setMessage(data.message || "Đặt lại mật khẩu thất bại.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  if (!token) {
    return <p>Token không hợp lệ.</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#1e88e5",
            color: "#fff",
            border: "none",
            borderRadius: 5,
          }}
        >
          Đặt lại mật khẩu
        </button>
      </form>
      {message && <p style={{ marginTop: 15, color: "red" }}>{message}</p>}
    </div>
  );
}
