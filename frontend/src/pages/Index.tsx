
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { isHash, isFQDN, isIP } from "validator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useQueries } from "@/context/QueryContext";
import { ProgressSteps } from "@/components/wizard/ProgressSteps";
import { StepIndicators } from "@/components/wizard/StepIndicators";
import { StepMetadata } from "@/components/wizard/StepMetadata";
import { StepReview } from "@/components/wizard/StepReview";
import { DataTable } from "@/components/DataTable";
import { queryColumns } from "@/lib/columns";

const Index = () => {
    const navigate = useNavigate();
    const { queries, loading, refreshQueries } = useQueries();
    const [refreshing, setRefreshing] = useState(false);

    // Wizard state
    const [step, setStep] = useState(1);
    const [indicators, setIndicators] = useState<string[]>([]);
    const [analyst, setAnalyst] = useState("");
    const [caseName, setCaseName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step titles for progress bar
    const stepTitles = ["Indicators", "Metadata", "Review"];

    // Handle refresh button
    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshQueries();
        setRefreshing(false);
    };

    // Handle step transitions
    const nextStep = () => {
        setStep(s => s + 1);
    };

    const prevStep = () => {
        setStep(s => s - 1);
    };

    // Handle metadata step completion
    const handleMetadataNext = (data: { analyst: string; caseName: string }) => {
        setAnalyst(data.analyst);
        setCaseName(data.caseName);
        nextStep();
    };

    /**
     * Put every indicator in its matching bucket.
     * Returns an object with three plain arrays.
     */
    function categorizeIndicators(list: string[]) {
        const buckets = { hashes: [] as string[], ips: [] as string[], domains: [] as string[] };
    
        list.forEach((item) => {
            if (isHash(item, "md5") || isHash(item, "sha1") || isHash(item, "sha256")) {
                buckets.hashes.push(item); 
            } else if (isIP(item)) {
                buckets.ips.push(item);
            } else if (isFQDN(item)) {
                buckets.domains.push(item);
            }
        });
    
        return buckets;
    }

    // Handle form submission
    const handleSubmit = async () => {
        // Bail out early if the form is visibly incomplete
        if (indicators.length === 0 || !analyst.trim() || !caseName.trim()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const { hashes, ips, domains } = categorizeIndicators(indicators);
                        
            // Submit query to API
            const newQuery = await api.createQuery({
                query: {
                    query_analyst: analyst.trim(),
                    query_case_name: caseName.trim(),
                },
                hashes,
                ips,
                domains,
            });
            
            // Update context and redirect to new query page
            refreshQueries();
            navigate(`/queries/${newQuery.data.query.uuid}`);
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    // Render step components
    const renderStep = () => {
        switch (step) {
        case 1:
            return (
                <StepIndicators
                    indicators={indicators}
                    setIndicators={setIndicators}
                    onNext={nextStep}
                />
            );
        case 2:
            return (
                <StepMetadata
                    analyst={analyst}
                    caseName={caseName}
                    onNext={handleMetadataNext}
                    onBack={prevStep}
                />
            );
        case 3:
            return (
                <StepReview
                    indicators={indicators}
                    analyst={analyst}
                    caseName={caseName}
                    onSubmit={handleSubmit}
                    onBack={prevStep}
                    isSubmitting={isSubmitting}
                />
            );
        default:
            return null;
        }
    };

    return (
        <div className="space-y-6 max-w-full">
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Bulk Indicator Lookup</h1>
            <p className="text-muted-foreground">
                Create and manage threat intelligence queries
            </p>
        </div>

            <Tabs defaultValue="new">
                <TabsList className="mb-4">
                    <TabsTrigger value="new">New Query</TabsTrigger>
                    <TabsTrigger value="all">All Queries</TabsTrigger>
                </TabsList>
                
                {/* Create a new Slasher query */}
                <TabsContent value="new">
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl"><CardTitle>Create new Query</CardTitle></h2>
                        </CardHeader>
                        <CardContent>
                            {/* Based on the current step, renderStep() returns the corresponding wizward step card */}
                            <ProgressSteps 
                                currentStep={step}
                                totalSteps={3}
                                stepTitles={stepTitles}
                            />
                            {renderStep()}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Show all Slasher queries */}
                <TabsContent value="all">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <h2 className="text-xl"><CardTitle>Recent Queries</CardTitle></h2>
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="py-8 text-center">Loading queries...</div>
                            ) : queries.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    No queries found. Create one to get started.
                                </div>
                            ) : (
                                <DataTable 
                                    data={queries}
                                    columns={queryColumns}
                                    searchable={true}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Index;
