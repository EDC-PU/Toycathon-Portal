
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Tag, BookOpen, Edit } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

const themeSchema = z.object({
  name: z.string().min(3, "Theme name must be at least 3 characters."),
  targetCustomerGroup: z.string().min(3, "Target customer group is required."),
  concept: z.string().min(10, "Concept description is required."),
});

const categorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters."),
});

interface FirestoreDocument extends DocumentData {
    id: string;
    name: string;
    targetCustomerGroup?: string;
    concept?: string;
}

export default function CategoriesPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<FirestoreDocument[]>([]);
    const [themes, setThemes] = useState<FirestoreDocument[]>([]);

    const themeForm = useForm<z.infer<typeof themeSchema>>({
        resolver: zodResolver(themeSchema),
        defaultValues: { name: "", targetCustomerGroup: "", concept: "" },
    });

    const categoryForm = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "" },
    });

    useEffect(() => {
        fetchCategories();
        fetchThemes();
    }, []);

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
                            <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-4">
                                <FormField
                                    control={themeForm.control}
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
                                    control={themeForm.control}
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
                                    control={themeForm.control}
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
                                <Button type="submit" disabled={themeForm.formState.isSubmitting}>
                                    {themeForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Theme'}
                                </Button>
                            </form>
                        </Form>
                         <div className="mt-6 space-y-2">
                            {themes.map(theme => (
                                <div key={theme.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/30">
                                    <div className="flex-1">
                                        <p className="font-bold text-primary">{theme.name}</p>
                                        <p className="text-sm"><span className="font-semibold">Target:</span> {theme.targetCustomerGroup}</p>
                                        <p className="text-sm mt-1"><span className="font-semibold">Concept:</span> {theme.concept}</p>
                                    </div>
                                    <div className="flex-shrink-0 ml-4 flex items-center gap-1">
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/admin/themes/edit/${theme.id}`}><Edit className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteItem('themes', theme.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
