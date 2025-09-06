
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";

const editThemeSchema = z.object({
  name: z.string().min(3, "Theme name must be at least 3 characters."),
  targetCustomerGroup: z.string().min(3, "Target customer group is required."),
  concept: z.string().min(10, "Concept description is required."),
});

export default function EditThemePage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const themeId = params.id as string;
    
    const form = useForm<z.infer<typeof editThemeSchema>>({
        resolver: zodResolver(editThemeSchema),
        defaultValues: {},
    });

    useEffect(() => {
        const fetchThemeData = async () => {
             if (themeId) {
                const themeDocRef = doc(db, "themes", themeId);
                try {
                    const themeDocSnap = await getDoc(themeDocRef);
                    if (themeDocSnap.exists()) {
                        const themeData = themeDocSnap.data();
                        form.reset(themeData);
                    } else {
                        setError("Theme not found.");
                    }
                } catch (err) {
                    setError("Failed to fetch theme data.");
                } finally {
                    setIsFetching(false);
                }
            }
        }
       
       fetchThemeData();

    }, [router, themeId, form]);

    const onSubmit = async (values: z.infer<typeof editThemeSchema>) => {
        if (!themeId) {
            toast({ title: "Error", description: "No theme ID provided.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const themeRef = doc(db, "themes", themeId);
            await updateDoc(themeRef, values);

            toast({
                title: 'Theme Updated!',
                description: 'The theme details have been successfully updated.',
            });
            
            router.push('/admin/categories');
            
        } catch (error) {
            console.error("Error updating theme:", error);
            toast({
                title: 'Error',
                description: 'Failed to update the theme. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isFetching) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Loading theme details...</div>;
    }

    if (error) {
         return <div className="flex h-screen items-center justify-center text-destructive">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Theme</h1>
                <p className="text-muted-foreground">Update the information for this theme.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Theme Details</CardTitle>
                    <CardDescription>Changes will be reflected on the main page and in submission forms.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                           <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Theme Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Indian Culture" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="targetCustomerGroup"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Customer Group</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Ages 5-8" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="concept"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Concept</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the concept..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
