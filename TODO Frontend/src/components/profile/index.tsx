import { useState } from "react";
import ProfileCard from "./ProfileCard";
import ProfileStats from "./ProfileStats";
import CategoryBreakdown from "./CategoryBreakdown";
import EditProfileModal from "./EditProfileModal";

export default function Profile() {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage your account details
        </p>
      </div>

      <ProfileCard onEdit={() => setShowEdit(true)} />
      <ProfileStats />
      <CategoryBreakdown />

      <EditProfileModal isOpen={showEdit} onClose={() => setShowEdit(false)} />
    </div>
  );
}
