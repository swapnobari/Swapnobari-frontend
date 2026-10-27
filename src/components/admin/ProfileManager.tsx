"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin/api";
import { SubmitError } from "@/lib/client";
import { mediaUrl } from "@/lib/media";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";
import ImageField, { type ImageValue } from "./ImageField";
import { btnPrimary, inputCls } from "./styles";

type Profile = { email?: string; full_name?: string; phone?: string; avatar?: string | null };

const labelCls = "mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-muted";

function Err({ text }: { text?: string }) {
  return text ? (
    <span role="alert" className="mt-1 block text-sm text-accent">
      {text}
    </span>
  ) : null;
}

function Notice({ kind, text }: { kind: "ok" | "error"; text: string }) {
  return (
    <p
      role={kind === "ok" ? "status" : "alert"}
      className={`rounded-md border px-4 py-3 text-sm ${
        kind === "ok" ? "border-brand/30 bg-brand/5 text-brand" : "border-accent/30 bg-accent/5 text-accent"
      }`}
    >
      {text}
    </p>
  );
}

function DetailsCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<ImageValue>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi<Profile>("GET", "/auth/profile")
      .then((p) => {
        setProfile(p);
        setFullName(p.full_name ?? "");
        setPhone(p.phone ?? "");
      })
      .catch(() => setLoadError("Could not load your profile."));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.full_name = "Please enter your name.";
    if (phone.trim() && !/^[+\d][\d\s-]{6,19}$/.test(phone.trim())) {
      errs.phone = "Enter a valid phone number.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const fd = new FormData();
    fd.append("full_name", fullName.trim());
    fd.append("phone", phone.trim());
    if (avatar) fd.append("avatar", avatar.prepared.file);

    setSaving(true);
    try {
      const updated = await adminApi<Profile>("PATCH", "/auth/profile", fd);
      setProfile((p) => ({ ...p, ...updated }));
      setAvatar(null);
      setNotice({ kind: "ok", text: "Profile updated." });
      window.dispatchEvent(new Event("admin-profile-updated"));
    } catch (err) {
      const fe: Record<string, string> = {};
      const extra: string[] = [];
      if (err instanceof SubmitError) {
        if (err.detail) extra.push(err.detail);
        for (const [k, m] of Object.entries(err.fields)) {
          if (["full_name", "phone", "avatar"].includes(k)) fe[k] = m[0];
          else extra.push(`${k}: ${m[0]}`);
        }
      } else {
        extra.push("Something went wrong. Please try again.");
      }
      setErrors(fe);
      if (extra.length) setNotice({ kind: "error", text: extra.join(" ") });
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <Notice kind="error" text={loadError} />;
  if (!profile) return <div className="h-72 animate-pulse rounded-lg bg-line/60" aria-busy="true" />;

  return (
    <form onSubmit={save} noValidate className="space-y-6 rounded-lg border border-line bg-white p-6">
      <h2 className="font-display text-2xl text-brand">Your details</h2>

      <ImageField
        label="Profile picture"
        spec={IMAGE_SPECS.avatar.spec}
        existingUrl={mediaUrl(profile.avatar)}
        value={avatar}
        onChange={setAvatar}
        error={errors.avatar}
      />

      <label className="block">
        <span className={labelCls}>Full name</span>
        <input
          className={inputCls}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          aria-invalid={!!errors.full_name}
          autoComplete="name"
        />
        <Err text={errors.full_name} />
      </label>

      <label className="block">
        <span className={labelCls}>Email</span>
        <input className={`${inputCls} bg-bg`} value={profile.email ?? ""} readOnly disabled />
        <span className="mt-1 block text-xs text-muted">This is your sign-in email and cannot be changed here.</span>
      </label>

      <label className="block">
        <span className={labelCls}>Phone</span>
        <input
          className={inputCls}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={!!errors.phone}
          autoComplete="tel"
        />
        <Err text={errors.phone} />
      </label>

      {notice && <Notice {...notice} />}

      <button type="submit" className={btnPrimary} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function PasswordCard() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    const errs: Record<string, string> = {};
    if (!oldPw) errs.old_password = "Enter your current password.";
    if (newPw.length < 8) errs.new_password = "Use at least 8 characters.";
    else if (newPw === oldPw) errs.new_password = "The new password must be different.";
    if (confirm !== newPw) errs.confirm = "The passwords do not match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await adminApi("POST", "/auth/change-password", {
        old_password: oldPw,
        new_password: newPw,
        confirm_password: confirm,
      });
      setOldPw("");
      setNewPw("");
      setConfirm("");
      setNotice({ kind: "ok", text: "Password changed. Use the new password next time you sign in." });
    } catch (err) {
      const fe: Record<string, string> = {};
      const extra: string[] = [];
      if (err instanceof SubmitError) {
        if (err.detail) extra.push(err.detail);
        for (const [k, m] of Object.entries(err.fields)) {
          if (k === "old_password" || k === "new_password") fe[k] = m[0];
          else extra.push(`${k}: ${m[0]}`);
        }
      } else {
        extra.push("Something went wrong. Please try again.");
      }
      setErrors(fe);
      if (extra.length) setNotice({ kind: "error", text: extra.join(" ") });
    } finally {
      setSaving(false);
    }
  }

  const type = show ? "text" : "password";

  return (
    <form onSubmit={save} noValidate className="space-y-6 rounded-lg border border-line bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-brand">Change password</h2>
        <button type="button" onClick={() => setShow((s) => !s)} className="text-xs text-muted hover:text-fg">
          {show ? "Hide passwords" : "Show passwords"}
        </button>
      </div>

      <label className="block">
        <span className={labelCls}>Current password</span>
        <input
          className={inputCls}
          type={type}
          value={oldPw}
          onChange={(e) => setOldPw(e.target.value)}
          aria-invalid={!!errors.old_password}
          autoComplete="current-password"
        />
        <Err text={errors.old_password} />
      </label>

      <label className="block">
        <span className={labelCls}>New password</span>
        <input
          className={inputCls}
          type={type}
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          aria-invalid={!!errors.new_password}
          autoComplete="new-password"
        />
        <Err text={errors.new_password} />
        <span className="mt-1 block text-xs text-muted">At least 8 characters. Avoid common words and only numbers.</span>
      </label>

      <label className="block">
        <span className={labelCls}>Confirm new password</span>
        <input
          className={inputCls}
          type={type}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-invalid={!!errors.confirm}
          autoComplete="new-password"
        />
        <Err text={errors.confirm} />
      </label>

      {notice && <Notice {...notice} />}

      <button type="submit" className={btnPrimary} disabled={saving}>
        {saving ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

export default function ProfileManager() {
  return (
    <div>
      <h1 className="font-display text-4xl text-brand">My profile</h1>
      <p className="mt-1 text-sm text-muted">Update your name, picture and password.</p>
      <div className="mt-8 grid items-start gap-8 xl:grid-cols-2">
        <DetailsCard />
        <PasswordCard />
      </div>
    </div>
  );
}