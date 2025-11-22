"use client";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import AuthGuard from "@/components/AuthGuard";
import { setUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Layout({ children }: { children: React.ReactNode }) {
   const dispatch = useDispatch();
  const reduxUser = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (!reduxUser) {
      const userJson = localStorage.getItem("user");
      if (userJson) dispatch(setUser(JSON.parse(userJson)));
    }
  }, [dispatch, reduxUser]);
  return (
    <AuthGuard>
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </AuthGuard>
  );
}
