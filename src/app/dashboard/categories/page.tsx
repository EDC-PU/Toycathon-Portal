
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Tag, BookOpen } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters."),
});

const themeSchema = z.object({
  name: z.string().min(3, "Theme name must be at least 3 characters."),
});

interface FirestoreDocument extends DocumentData {
    id: string;
    name: string;
}

export default function CategoriesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<FirestoreDocument[]>([]);
    const [themes, setThemes] = useState<FirestoreDocument[]>([]);

    const categoryForm = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "" },
    });

    const themeForm = useForm<z.infer<typeof themeSchema>>({
        resolver: zodResolver(themeSchema),
        defaultValues: { name: "" },
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const tokenResult = await currentUser.getIdTokenResult();
                if (tokenResult.claims.admin) {
                    setIsAdmin(true);
                    fetchCategories();
                    fetchThemes();
                } else {
                    router.push('/dashboard');
                }
            } else {
                router.push('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const fetchCategories = async () => {
        const q = query(collection(db, "categories"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreDocument));
        setCategories(fetched);
    }
    
    const fetchThemes = async () => {
        const q = query(collection(db, "themes"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreDocument));
        setThemes(fetched);
    }

    const onCategorySubmit = async (values: z.infer<typeof categorySchema>) => {
        try {
            await addDoc(collection(db, "categories"), values);
            toast({ title: 'Category Added!' });
            categoryForm.reset();
            fetchCategories();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add category.', variant: 'destructive' });
        }
    };
    
    const onThemeSubmit = async (values: z.infer<typeof themeSchema>) => {
        try {
            await addDoc(collection(db, "themes"), values);
            toast({ title: 'Theme Added!' });
            themeForm.reset();
            fetchThemes();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add theme.', variant: 'destructive' });
        }
    };
    
    const deleteItem = async (collectionName: string, id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteDoc(doc(db, collectionName, id));
            toast({ title: 'Item Deleted' });
            if (collectionName === 'categories') fetchCategories();
            if (collectionName === 'themes') fetchThemes();
        } catch (error) {
             toast({ title: 'Error', description: 'Failed to delete item.', variant: 'destructive' });
        }
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Checking permissions...</div>;
    }
    
    if (!isAdmin) {
        return null;
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Categories & Themes</h1>
                <p className="text-muted-foreground">Add or remove categories and themes for idea submissions.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Tag /> Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...categoryForm}>
                            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="flex items-center gap-4">
                                <FormField
                                    control={categoryForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input placeholder="e.g., Physical Toy" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={categoryForm.formState.isSubmitting}>
                                    {categoryForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                                </Button>
                            </form>
                        </Form>
                         <div className="mt-6 space-y-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                                    <span className="font-medium">{cat.name}</span>
                                    <Button variant="ghost" size="icon" onClick={() => deleteItem('categories', cat.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen /> Themes</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Form {...themeForm}>
                            <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="flex items-center gap-4">
                                <FormField
                                    control={themeForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input placeholder="e.g., Indian Culture" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={themeForm.formState.isSubmitting}>
                                     {themeForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                                </Button>
                            </form>
                        </Form>
                         <div className="mt-6 space-y-2">
                            {themes.map(theme => (
                                <div key={theme.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                                    <span className="font-medium">{theme.name}</span>
                                    <Button variant="ghost" size="icon" onClick={() => deleteItem('themes', theme.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
