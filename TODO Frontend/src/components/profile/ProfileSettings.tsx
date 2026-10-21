import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { authApi } from "../../api/authApi";
import { getErrorMessage } from "../../utils/errorUtils";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import type { ProfileUpdate } from "../../types/auth.types";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name must be at most 50 characters"),
  email: z.string().trim().email("Enter a valid email address"),

});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Enter your current password"),
  password: z.string().min(6, "New password must be at least 6 characters")
    .refine((value) => new TextEncoder().encode(value).length <= 72, {
      message: "Password must be at most 72 UTF-8 bytes",
    }),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((values) => values.oldPassword !== values.password, {
  message: "Choose a different password from your current password",
  path: ["password"],
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;
const sectionClass = "bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6";

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [profileError, setProfileError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    return () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); };
  }, [avatarPreview]);
  const clearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarError("");
    if (fileInput.current) fileInput.current.value = "";
  };
  const avatarChanged = Boolean(avatarFile);
  const [passwordError, setPasswordError] = useState("");
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });
  const previewName = useWatch({ control: profileForm.control, name: "name" });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { oldPassword: "", password: "", confirmPassword: "" },
  });

  const saveProfile = async (values: ProfileValues) => {
    setProfileError("");
    const changes: ProfileUpdate = {};
    if (values.name !== user?.name) changes.name = values.name;
    if (values.email !== user?.email) changes.email = values.email;
    if (avatarFile) changes.avatar = avatarFile;
    if (!Object.keys(changes).length) {
      profileForm.reset(values);
      return;
    }
    try {
      const savedUser = await updateProfile(changes);
      clearAvatarSelection();
      profileForm.reset({ name: savedUser.name, email: savedUser.email });
      toast.success("Profile updated");
    } catch (error) {
      setProfileError(getErrorMessage(error));
    }
  };

  const savePassword = async (values: PasswordValues) => {
    setPasswordError("");
    try {
      await authApi.changePassword(values);
      passwordForm.reset();
      toast.success("Password changed");
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    }
  };

  return (
    <>
      <section className={sectionClass} aria-labelledby="edit-profile-heading">
        <h2 id="edit-profile-heading" className="text-lg font-semibold text-white">Edit profile</h2>
        <p className="mt-1 mb-5 text-sm text-slate-400">Update your name, email, and avatar.</p>
        <form onSubmit={(event) => { void profileForm.handleSubmit(saveProfile)(event); }} className="space-y-4" noValidate>
          <fieldset disabled={profileForm.formState.isSubmitting} className="space-y-4 disabled:opacity-70">
            <Input id="profile-name" aria-label="Full name" label="Full name" autoComplete="name" error={profileForm.formState.errors.name?.message} {...profileForm.register("name")} />
            <Input id="profile-email" aria-label="Email" label="Email" type="email" autoComplete="email" error={profileForm.formState.errors.email?.message} {...profileForm.register("email")} />
            <div className="space-y-3">
              <label htmlFor="profile-avatar" className="block text-sm font-medium text-slate-300">Avatar image</label>
              <Avatar name={previewName} src={avatarFile ? avatarPreview : user?.avatar} size="xl" />
              <input
                ref={fileInput}
                id="profile-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-describedby="avatar-hint avatar-error"
                className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-700 file:px-4 file:py-2 file:text-slate-100"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
                    clearAvatarSelection();
                    setAvatarError("Choose a JPG, PNG, or WebP image up to 5 MB.");
                    event.target.value = "";
                    return;
                  }
                  setAvatarError("");
                  setAvatarPreview(URL.createObjectURL(file));
                  setAvatarFile(file);
                }}
              />
              <p id="avatar-hint" className="text-xs text-slate-400">Choose a JPG, PNG, or WebP image from your device, up to 5 MB.</p>
              <p id="avatar-error" role="alert" className="text-xs text-red-400">{avatarError}</p>
              {avatarFile && <Button type="button" variant="ghost" size="sm" onClick={() => {
                clearAvatarSelection();
              }}>Discard selected image</Button>}
            </div>
          </fieldset>
          {profileError && <p role="alert" className="text-sm text-red-400">{profileError}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={profileForm.formState.isSubmitting} disabled={!profileForm.formState.isDirty && !avatarChanged}>Save profile</Button>
            <Button type="button" variant="ghost" disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty && !avatarChanged} onClick={() => { profileForm.reset(); clearAvatarSelection(); setProfileError(""); }}>Cancel</Button>
          </div>
        </form>
      </section>
      <section className={sectionClass} aria-labelledby="change-password-heading">
        <h2 id="change-password-heading" className="text-lg font-semibold text-white">Change password</h2>
        <p className="mt-1 mb-5 text-sm text-slate-400">Enter your current password to choose a new one.</p>
        <form onSubmit={(event) => { void passwordForm.handleSubmit(savePassword)(event); }} className="space-y-4" noValidate>
          <fieldset disabled={passwordForm.formState.isSubmitting} className="space-y-4 disabled:opacity-70">
            <Input id="old-password" aria-label="Current password" label="Current password" type="password" autoComplete="current-password" error={passwordForm.formState.errors.oldPassword?.message} {...passwordForm.register("oldPassword")} />
            <Input id="new-password" aria-label="New password" label="New password" type="password" autoComplete="new-password" hint="At least 6 characters" error={passwordForm.formState.errors.password?.message} {...passwordForm.register("password", { deps: ["confirmPassword"] })} />
            <Input id="confirm-password" aria-label="Confirm new password" label="Confirm new password" type="password" autoComplete="new-password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register("confirmPassword", {
              onChange: () => { void passwordForm.trigger("confirmPassword"); },
            })} />
          </fieldset>
          {passwordError && <p role="alert" className="text-sm text-red-400">{passwordError}</p>}
          <Button type="submit" isLoading={passwordForm.formState.isSubmitting}>Change password</Button>
        </form>
      </section>
    </>
  );
}
