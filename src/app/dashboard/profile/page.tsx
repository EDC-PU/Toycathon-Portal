
'use client';

import ProfileForm from "@/components/profile-form";

export default function DashboardProfilePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Your Profile</h1>
            <p className="text-muted-foreground mb-8">This is your personal information as a participant or team creator.</p>
            <ProfileForm />
        </div>
    )
}
