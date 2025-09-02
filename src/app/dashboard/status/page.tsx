
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, FileText, Loader2 } from 'lucide-react';

export default function StatusPage() {

    // Mock data for now
    const registrationStatus = "Completed";
    const submissionStatus = "Not Started";


    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Registration & Submission Status</h1>
            <p className="text-muted-foreground mb-8">Track your progress in the Toycathon.</p>

            <div className="grid md:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <FileText /> Registration
                        </CardTitle>
                        <CardDescription>Your team's registration status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {registrationStatus === "Completed" && (
                            <div className="flex items-center gap-3 text-green-600">
                                <CheckCircle className="h-8 w-8" />
                                <span className="font-semibold text-lg">Completed</span>
                            </div>
                        )}
                        {registrationStatus === "Pending" && (
                             <div className="flex items-center gap-3 text-yellow-600">
                                <Clock className="h-8 w-8" />
                                <span className="font-semibold text-lg">Pending</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText /> Idea Submission
                        </CardTitle>
                         <CardDescription>Your idea submission status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submissionStatus === "Not Started" && (
                             <div className="flex items-center gap-3 text-muted-foreground">
                                <Clock className="h-8 w-8" />
                                <span className="font-semibold text-lg">Not Started</span>
                            </div>
                        )}
                        {submissionStatus === "In Progress" && (
                             <div className="flex items-center gap-3 text-blue-600">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="font-semibold text-lg">In Progress</span>
                            </div>
                        )}
                         {submissionStatus === "Submitted" && (
                             <div className="flex items-center gap-3 text-green-600">
                                <CheckCircle className="h-8 w-8" />
                                <span className="font-semibold text-lg">Submitted</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
