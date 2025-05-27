
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/Tag";

interface StepReviewProps {
    indicators: string[];
    analyst: string;
    caseName: string;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

export function StepReview({
indicators,
analyst,
caseName,
onSubmit,
onBack,
isSubmitting,
}: StepReviewProps) {    
    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl"><CardTitle>Review & Submit</CardTitle></h2>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium">Query Details</h3>
                        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Analyst</p>
                            <p className="text-base">{analyst}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Case Name</p>
                            <p className="text-base">{caseName}</p>
                        </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium">Indicators ({indicators.length})</h3>
                        {indicators.length > 0 && (
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    {indicators.map((indicator, index) => (
                                        <Tag
                                            key={index}
                                            value={indicator}
                                            variant="indicator"
                                        />
                                    ))}
                                </div> 
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
                <Button 
                    onClick={onSubmit}
                    disabled={isSubmitting || indicators.length === 0}
                >
                    {isSubmitting ? "Submitting..." : "Submit Query"}
                </Button>
            </CardFooter>
        </Card>
    );
}
