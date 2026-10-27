import type { Metadata } from "next";
import ProfileManager from "@/components/admin/ProfileManager";

export const metadata: Metadata = { title: "My profile | Admin" };

export default function ProfilePage() {
  return <ProfileManager />;
}