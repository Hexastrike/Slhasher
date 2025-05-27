import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-primary">Coming soon...</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
                Additional functionality will be implemented in the following Slasher versions.
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
                Return to Dashboard
            </Button>
        </div>
    </div>
  );
};

export default NotFound;
