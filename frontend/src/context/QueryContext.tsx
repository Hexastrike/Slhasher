
import React, { createContext, useContext, useState, useEffect } from "react";
import { api, Query } from "@/lib/api";
import { toast } from "sonner"

interface QueryContextType {
  queries: Query[];
  loading: boolean;
  refreshQueries: () => Promise<void>;
  addNewQuery: (query: Query) => void;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshQueries = async () => {
    setLoading(true);
    try {
      const data = await api.fetchQueries();
      setQueries(data['data'].reverse());
    } catch (error) {
      console.error("Failed to fetch queries:", error);
      toast.error("Failed to load recent queries");
    } finally {
      setLoading(false);
    }
  };

  const addNewQuery = (query: Query) => {
    setQueries(prev => [query, ...prev]);
  };

  useEffect(() => {
    refreshQueries();
  }, []);

  return (
    <QueryContext.Provider value={{ queries, loading, refreshQueries, addNewQuery }}>
      {children}
    </QueryContext.Provider>
  );
};

export const useQueries = () => {
  const context = useContext(QueryContext);
  if (context === undefined) {
    throw new Error("useQueries must be used within a QueryProvider");
  }
  return context;
};
