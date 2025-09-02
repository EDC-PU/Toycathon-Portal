
'use client';

import ProfileForm from "@/components/profile-form";

export default function DashboardProfilePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Your Profile</h1>
            <p className="text-muted-foreground mb-8">Manage your team and personal information.</p>
            <ProfileForm />
        </div>
    )
}
