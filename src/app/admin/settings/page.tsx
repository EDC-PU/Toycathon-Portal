
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';


const settingsSchema = z.object({
  registrationCloseDate: z.date({ required_error: "A registration close date is required." }),
  registrationCloseTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  ideaSubmissionDeadlineDate: z.date({ required_error: "An idea submission deadline is required." }),
  ideaSubmissionDeadlineTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
}).refine((data) => {
    const regDate = new Date(data.registrationCloseDate);
    const [regHours, regMinutes] = data.registrationCloseTime.split(':').map(Number);
    regDate.setHours(regHours, regMinutes);

    const subDate = new Date(data.ideaSubmissionDeadlineDate);
    const [subHours, subMinutes] = data.ideaSubmissionDeadlineTime.split(':').map(Number);
    subDate.setHours(subHours, subMinutes);

    return subDate > regDate;
}, {
  message: "Idea submission deadline must be after the registration close deadline.",
  path: ["ideaSubmissionDeadlineDate"],
});


export default function SettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setIsFetching(true);
            try {
                const settingsDocRef = doc(db, "settings", "config");
                const docSnap = await getDoc(settingsDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const regDate = data.registrationCloseDate?.toDate();
                    const subDate = data.ideaSubmissionDeadline?.toDate();
                    
                    form.reset({
                        registrationCloseDate: regDate,
                        registrationCloseTime: regDate ? format(regDate, "HH:mm") : '23:59',
                        ideaSubmissionDeadlineDate: subDate,
                        ideaSubmissionDeadlineTime: subDate ? format(subDate, "HH:mm") : '23:59',
                    });
                }
            } catch (error) {
                toast({ title: "Error", description: "Failed to fetch settings.", variant: "destructive" });
            } finally {
                setIsFetching(false);
            }
        };

        fetchSettings();
    }, [form, toast]);
    

    const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
        setIsLoading(true);
        try {
            const combineDateTime = (date: Date, time: string) => {
                const newDate = new Date(date);
                const [hours, minutes] = time.split(':').map(Number);
                newDate.setHours(hours, minutes, 0, 0);
                return newDate;
            };

            const registrationCloseTimestamp = combineDateTime(values.registrationCloseDate, values.registrationCloseTime);
            const ideaSubmissionDeadlineTimestamp = combineDateTime(values.ideaSubmissionDeadlineDate, values.ideaSubmissionDeadlineTime);

            const settingsDocRef = doc(db, "settings", "config");
            await setDoc(settingsDocRef, {
                registrationCloseDate: registrationCloseTimestamp,
                ideaSubmissionDeadline: ideaSubmissionDeadlineTimestamp,
            });

            toast({ title: 'Settings Saved!', description: 'Your new deadlines have been saved.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading settings...</div>;
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Event Settings</h1>
                <p className="text-muted-foreground">Configure important deadlines for the event.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Event Deadlines</CardTitle>
                    <CardDescription>These dates will control when users can register and submit ideas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="registrationCloseDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Registration Close Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="registrationCloseTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registration Close Time (24h)</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                           </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="ideaSubmissionDeadlineDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Idea Submission Deadline</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ideaSubmissionDeadlineTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Submission Deadline Time (24h)</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" disabled={isLoading || isFetching}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Settings'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

        </div>
    )
}

    