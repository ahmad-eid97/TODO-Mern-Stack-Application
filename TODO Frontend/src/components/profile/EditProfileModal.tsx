import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import { getErrorMessage } from "../../utils/errorUtils";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

type FormValues = z.infer<typeof schema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
}: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "" },
    values: { name: user?.name ?? "" },
  });

  const onSubmit = async (values: FormValues) => {
    setError("");
    try {
      await updateProfile({ name: values.name });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleClose = () => {
    reset({ name: user?.name ?? "" });
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            Save
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <Input
          label="Full Name"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="bg-slate-800/60 rounded-xl p-3 text-xs text-slate-500">
          Email address cannot be changed here. Add a change-email flow with
          verification in your backend.
        </div>
      </form>
    </Modal>
  );
}
