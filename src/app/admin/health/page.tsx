
"use client";

import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Status = 'checking' | 'ok' | 'error';

interface ServiceStatus {
    name: string;
    status: Status;
    message: string;
}

export default function SystemHealthPage() {
    const [services, setServices] = useState<ServiceStatus[]>([
        { name: 'Firebase Authentication', status: 'checking', message: 'Verifying auth status...' },
        { name: 'Firestore Database', status: 'checking', message: 'Pinging database...' },
    ]);

    const runHealthChecks = useCallback(async () => {
        // Reset statuses to checking
        setServices([
            { name: 'Firebase Authentication', status: 'checking', message: 'Verifying auth status...' },
            { name: 'Firestore Database', status: 'checking', message: 'Pinging database...' },
        ]);

        // Check Auth
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const token = await currentUser.getIdTokenResult();
                if (token.claims.admin) {
                     setServices(prev => prev.map(s => s.name === 'Firebase Authentication' ? { ...s, status: 'ok', message: 'Authenticated as Admin.' } : s));
                } else {
                     setServices(prev => prev.map(s => s.name === 'Firebase Authentication' ? { ...s, status: 'error', message: 'User is not an admin.' } : s));
                }
            } else {
                 setServices(prev => prev.map(s => s.name === 'Firebase Authentication' ? { ...s, status: 'error', message: 'No authenticated user found.' } : s));
            }
        } catch (error: any) {
            setServices(prev => prev.map(s => s.name === 'Firebase Authentication' ? { ...s, status: 'error', message: error.message } : s));
        }

        // Check Firestore
        try {
            const testCollection = collection(db, "users");
            await getCountFromServer(testCollection);
             setServices(prev => prev.map(s => s.name === 'Firestore Database' ? { ...s, status: 'ok', message: 'Connection successful.' } : s));
        } catch (error: any) {
            setServices(prev => prev.map(s => s.name === 'Firestore Database' ? { ...s, status: 'error', message: `Connection failed: ${error.code || error.message}` } : s));
        }
    }, []);

    useEffect(() => {
        runHealthChecks();
    }, [runHealthChecks]);


    const getStatusIcon = (status: Status) => {
        switch (status) {
            case 'checking':
                return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
            case 'ok':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-destructive" />;
            default:
                return null;
        }
    };
     const getStatusVariant = (status: Status) => {
        switch (status) {
            case 'ok':
                return 'default';
            case 'error':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const isAllOk = services.every(s => s.status === 'ok');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">System Health</h1>
                <p className="text-muted-foreground">Check the status of all connected Firebase services.</p>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Service Status</CardTitle>
                        <CardDescription>Last checked: {new Date().toLocaleTimeString()}</CardDescription>
                    </div>
                     <Button onClick={runHealthChecks} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Re-run Checks
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className={`p-4 rounded-md flex items-center gap-4 ${isAllOk ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'} border`}>
                        {isAllOk ? <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" /> : <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
                        <div className="flex-1">
                            <h3 className={`font-semibold ${isAllOk ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                                {isAllOk ? 'All Systems Operational' : 'Some services may have issues'}
                            </h3>
                            <p className={`text-sm ${isAllOk ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                                {isAllOk ? 'All services are connected and running smoothly.' : 'One or more services are experiencing issues. See details below.'}
                            </p>
                        </div>
                    </div>

                    <div className="border rounded-lg p-2">
                    {services.map((service) => (
                        <div key={service.name} className="flex items-center p-3 justify-between hover:bg-secondary/50 rounded-md">
                            <div className="flex items-center gap-4">
                                {getStatusIcon(service.status)}
                                <div>
                                    <p className="font-semibold">{service.name}</p>
                                    <p className="text-sm text-muted-foreground">{service.message}</p>
                                </div>
                            </div>
                            <Badge variant={getStatusVariant(service.status)} className="capitalize">{service.status}</Badge>
                        </div>
                    ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
