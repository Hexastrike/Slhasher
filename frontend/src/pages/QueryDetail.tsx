import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RefreshCw, ArrowLeft, CheckCircle, Clock, XCircle, Download, MoreHorizontal  } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Tag } from "@/components/Tag";
import { DataTable } from "@/components/DataTable";
import { api, QueryResults, formatDate } from "@/lib/api";
import { hashColumns, ipColumns, domainColumns } from "@/lib/columns";

const QueryDetail = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const [query, setQuery] = useState<QueryResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);
    
    // Fetch query details
    const fetchQuery = async () => {
        if (!uuid) return;
        setLoading(true);

        try {
            const data = await api.fetchQueryByUuid(uuid);
            setQuery(data);
        } catch (err: any) {
            switch (err?.status) {       
                default: 
                    setQuery(null);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle refresh button
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchQuery();
        setRefreshing(false);
    };

    // Handle CSV export
    const handleCSVExport = async () => {
        // Can't export if query does not exist
        if(!query) return;

        try {
            setExporting(true);

            const blob = await api.downloadCSV(query.data.query.uuid);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `slasher_query_${query.data.query.uuid}.csv`;
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Export started");

        } catch (err) {
            toast.error("Export failed");
        } finally {
            setExporting(false);
        }
    };

    // Initial data fetch, guard against empty uuid
    useEffect(() => {
        if (uuid) fetchQuery();
        else setLoading(false);
    }, [uuid]);

    // Handle status indicator
    const renderStatusBadge = () => {
        if (!query) return null;
        
        switch (query.data.query.query_status) {
        case "completed":
            return (
                <Tag 
                    value={
                        <>
                            <CheckCircle className="h-3 w-3 inline mr-2" />
                            Completed
                        </>
                    }
                    variant="tag_green" 
                />
            );
        case "pending":
            return (
                <Tag 
                    value={
                        <>
                            <Clock className="h-3 w-3 inline mr-2" />
                            Pending
                        </>
                    }
                    variant="tag_orange"
                />
            );
        case "error":
            return (
                <Tag 
                    value={
                        <>
                            <XCircle className="h-3 w-3 inline mr-2" />
                            Error
                        </>
                    }
                    variant="tag_red"
                />
            );
        default:
            return null;
        }
    };

    // If loading, show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2">Loading query details...</p>
                </div>
            </div>
        );
    }

    // If query not found
    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <h2 className="text-2xl font-bold mb-2">Query Not Found</h2>
                <p className="text-muted-foreground mb-6">
                    The requested query could not be found
                </p>
                <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate("/")}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{query.data.query.query_case_name}</h1>
                        <p className="text-muted-foreground">
                            Query ID: {query.data.query.uuid}
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {(query.data.query.query_status === "completed") && (
                        <Button
                            onClick={handleCSVExport}
                            disabled={exporting}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                        <Download className="h-4 w-4" />
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                    )}
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
                </div>
            </div>

            {/* Query metadata */}
            <Card>
                 <CardHeader>                    
                    <h2 className="text-xl"><CardTitle>Query Details</CardTitle></h2>
                    <div className="flex items-center justify-between">
                        <CardDescription>Submitted by {query.data.query.query_analyst} on {formatDate(query.data.query.query_date)}</CardDescription>
                        {renderStatusBadge()}
                    </div>
                    </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 gap-6">
                    {/* Hashes section */}
                    <div>
                        <h3 className="font-medium mb-2 text-lg">Hashes ({query.data.hashes.length})</h3>
                        <div className="flex flex-wrap gap-2">
                            {query.data.hashes.length > 0 ? (
                                query.data.hashes.slice(0,16).map((hash, i) => (
                                    <Tag key={i} value={hash.slasher_hash} variant="indicator" />
                                ))
                                ) : (
                                <p className="text-sm text-muted-foreground">None</p>
                            )}
                        </div>
                    </div>
                    
                    {/* IPs section */}
                    <div>
                        <h3 className="font-medium mb-2 text-lg">IP Addresses ({query.data.ips.length})</h3>
                        <div className="flex flex-wrap gap-2">
                            {query.data.ips.length > 0 ? (
                                query.data.ips.slice(0,16).map((ip, i) => (
                                    <Tag key={i} value={ip.slasher_ip} variant="indicator" />
                                ))
                                ) : (
                                <p className="text-sm text-muted-foreground">None</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Domains section */}
                    <div>
                        <h3 className="font-medium mb-2 text-lg">Domains ({query.data.domains.length})</h3>
                        <div className="flex flex-wrap gap-2">
                            {query.data.domains.length > 0 ? (
                                query.data.domains.slice(0,16).map((domain, i) => (
                                    <Tag key={i} value={domain.slasher_domain} variant="indicator" />
                                ))
                                ) : (
                                <p className="text-sm text-muted-foreground">None</p>
                            )}
                        </div>
                    </div>
                </div>
                </CardContent> 
            </Card>

            {/* Hash Results */}
            {query.data.hashes.length > 0 && (
                <Card>
                    <CardHeader>
                        <h2 className="text-xl"><CardTitle>Hash Analysis Results</CardTitle></h2>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            data={query.data.hashes}
                            columns={hashColumns}
                            searchable={true}
                            title="Hash Analysis"
                        />
                    </CardContent>
                </Card>
            )}

            {/* IP Results */}
            {query.data.ips.length > 0 && (
                <Card>
                    <CardHeader>
                        <h2 className="text-xl"><CardTitle>IP Analysis Results</CardTitle></h2>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            data={query.data.ips}
                            columns={ipColumns}
                            searchable={true}
                            title="IP Analysis"
                        />
                    </CardContent>
                </Card>
            )}

            {/* DOmain Results */}
            {query.data.domains.length > 0 && (
                <Card>
                    <CardHeader>
                        <h2 className="text-xl"><CardTitle>Domains Analysis Results</CardTitle></h2>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            data={query.data.domains}
                            columns={domainColumns}
                            searchable={true}
                            title="Domains Analysis"
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default QueryDetail;
