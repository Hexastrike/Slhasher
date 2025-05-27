
import React, { useState } from "react";
import { isFQDN, isIP } from "validator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/Tag";
// import { categorizeIndicators } from "@/lib/api";
import { Badge } from "../ui/badge";

interface StepIndicatorsProps {
    indicators: string[];
    // State-setter function: const [indicators, setIndicators] = useState<string[]>([]);
    setIndicators: React.Dispatch<React.SetStateAction<string[]>>;
    onNext: () => void;
}

export function StepIndicators({ 
indicators, 
setIndicators, 
onNext,
}: StepIndicatorsProps) {

    // State for the indicator input field
    const [inputValue, setInputValue] = useState("");

    // Indicator validation helpers
    const HEX   = "[0-9a-fA-F]";
    const MD5   = new RegExp(`^${HEX}{32}$`);
    const SHA1  = new RegExp(`^${HEX}{40}$`);
    const SHA256= new RegExp(`^${HEX}{64}$`);

    const isValidIndicator = (s: string) =>
        MD5.test(s) ||
        SHA1.test(s) ||
        SHA256.test(s) ||
        isFQDN(s) ||
        isIP(s);

    // Handle adding indicators from input
    const handleAddIndicators = () => {
        // Return if no indicator entered
        if (!inputValue.trim()) return;
        
        // Split input by whitespace and commas
        const newIndicators = inputValue
            // Split values into an array
            .split(/[\s,]+/)
            // Transform items, remove surrounding spaces
            .map(item => item.trim())
            // Drop empty items
            .filter(item => item !== "")
            // Keep only valid indicators
            .filter(isValidIndicator)
        
        // Add new indicators and remove duplicates
        setIndicators(prev => {
            // Destructure arrays
            const combined = [...prev, ...newIndicators];
            // Remove duplicates
            return [...new Set(combined)];
        });
        
        // Clear input, enables adding additional values after adding
        setInputValue("");
    };

    // Handle removing an indicator
    const handleRemoveIndicator = (index: number) => {
        // Keep every element except the one whose index matches the one we want to delete
        setIndicators(prev => prev.filter((_, i) => i !== index));
    };

    // Determine if we can proceed to next step
    const canProceed = indicators.length > 0;

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl"><CardTitle>Add Indicators</CardTitle></h2>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">
                            Enter hashes, IP addresses, or domains (separated by spaces or commas)
                        </p>
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Example: 44d88612fea8a8f36de82e1278abb02f, 192.168.1.1, malicious-domain.com"
                            rows={8}
                            className="resize-none min-h-[192px]"
                            onKeyDown={(e) => {
                                // Allow pressing Shift + Enter to add line breaks to the input
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddIndicators();
                                }
                            }}
                        />
                    </div>
                
                    <div className="flex items-center justify-end">
                        <Button onClick={handleAddIndicators}>Add</Button>
                    </div>
                
                    {indicators.length > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-2">Added Indicators ({indicators.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {indicators.map((indicator, index) => (
                                    <Tag
                                        key={index}
                                        value={indicator}
                                        variant="indicator"
                                        onRemove={() => handleRemoveIndicator(index)}
                                    />
                                ))}
                            </div> 
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={onNext} disabled={!canProceed}>Next</Button>
            </CardFooter>
        </Card>
    );
}
