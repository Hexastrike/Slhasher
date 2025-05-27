
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface StepMetadataProps {
    analyst: string;
    caseName: string;
    onNext: (data: { analyst: string; caseName: string }) => void;
    onBack: () => void;
}

// Input vaidation using Zod
export const formSchema = z.object({
    analyst: z
        .string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(128, { message: "Name must be at most 128 characters" })
        .regex(
            /^[A-Za-z][A-Za-z0-9_\-\s]*$/,
            "Name must start with a letter and may contain letters, numbers, underscores, hyphens and spaces"
        ),
  
    caseName: z
        .string()
        .min(3, { message: "Case name must be at least 3 characters" })
        .max(256, { message: "Case name must be at most 256 characters" })
        .regex(
            /^[A-Za-z][A-Za-z0-9_\-\s]*$/,
            "Case name must start with a letter and may contain letters, numbers, underscores, hyphens and spaces"
        ),
  });

export function StepMetadata({ analyst, caseName, onNext, onBack }: StepMetadataProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        analyst,
        caseName,
        },
    });

    const handleSubmit = (data: z.infer<typeof formSchema>) => {
        onNext({
        analyst: data.analyst,
        caseName: data.caseName,
        });
    };

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl"><CardTitle>Query Metadata</CardTitle></h2>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="analyst"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Analyst Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your name" {...field} />
                                    </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="caseName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Case Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter case name" {...field} />
                                    </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={form.handleSubmit(handleSubmit)}>Next</Button>
            </CardFooter>
        </Card>
    );
}
