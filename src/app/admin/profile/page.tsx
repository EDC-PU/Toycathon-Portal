
'use client';

import ProfileForm from "@/components/profile-form";

export default function AdminProfilePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Profile</h1>
            <p className="text-muted-foreground mb-8">This is your personal information as an administrator.</p>
            <ProfileForm />
        </div>
    )
}
