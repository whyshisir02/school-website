import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default function SettingsSecurityPage() {
  return (
    <div>
      <h2 className="text-xl font-bold">Account security</h2>
      <p className="mt-1 text-sm text-slate-500">
        Change the password you use to sign in to the admin panel.
      </p>
      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
