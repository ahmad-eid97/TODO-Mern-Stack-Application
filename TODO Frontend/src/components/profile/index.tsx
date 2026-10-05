import ProfileCard from "./ProfileCard";
import ProfileStats from "./ProfileStats";
import CategoryBreakdown from "./CategoryBreakdown";

export default function Profile() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          View your account details
        </p>
      </div>

      <ProfileCard />
      <ProfileStats />
      <CategoryBreakdown />
    </div>
  );
}
