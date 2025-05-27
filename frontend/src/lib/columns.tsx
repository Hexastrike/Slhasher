import { Link } from "react-router-dom";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/Tag";
import type { HashResult } from "@/lib/api";
import { calculateDetectionRate } from "@/lib/utils";
import { api, formatDate } from "@/lib/api";

// Column configuration used by <DataTable<HashResult>
export const hashColumns = [
    {
        id: "slasher_hash",
        header: "Hash",
        accessorKey: "slasher_hash" as const,
        enableSorting: true,
        enableHiding: false,
        enableFiltering: false,
    },

    {
        id: "vt_detections",
        header: "VT Detection Rate",

        accessorFn: (row: HashResult) => {
        const { rate, total } = calculateDetectionRate(row);
        return { rate, total };
        },

        cell: ({ rate, total }: { rate: number; total: number }) =>
            total === 0 ? (<Tag value="Unknown" variant="tag_grey" />) : (
                <Tag
                    value={`${rate}/${total}`}
                    variant={
                        rate === 0 ? "tag_green" : rate < 6 ? "tag_orange" : "tag_red"
                    }
                />
            )
        ,
        enableSorting: false,
        enableHiding: true,
        enableFiltering: false,
    },
    {
        id: "vt_md5",
        header: "VT MD5",
        accessorFn: (r: HashResult) => r.vt_meta?.data?.attributes?.md5 ?? null,
        cell: (v: string | null) => <span>{v ?? "Unknown"}</span>,
        enableSorting: true,
        enableHiding: true,
        enableFiltering: false,
        isVisible: false,
    },
    {
        id: "vt_sha1",
        header: "VT SHA1",
        accessorFn: (r: HashResult) => r.vt_meta?.data?.attributes?.sha1 ?? null,
        cell: (v: string | null) => <span>{v ?? "Unknown"}</span>,
        enableSorting: true,
        enableHiding: true,
        enableFiltering: false,
        isVisible: false,
    },
    {
        id: "vt_sha256",
        header: "VT SHA256",
        accessorFn: (r: HashResult) => r.vt_meta?.data?.attributes?.sha256 ?? null,
        cell: (v: string | null) => <span>{v ?? "Unknown"}</span>,
        enableSorting: true,
        enableHiding: true,
        enableFiltering: false,
        isVisible: false,
    },
    {
        id: "vt_name",
        header: "VT Meaningful Name",
        accessorFn: (r: HashResult) =>
        r.vt_meta?.data?.attributes?.meaningful_name ?? null,
        cell: (v: string | null) => <span>{v ?? "Unknown"}</span>,
        enableSorting: true,
        enableHiding: true,
        enableFiltering: true,
        isVisible: false,
    },

    {
        id: "vt_tags",
        header: "VT Tags",

        accessorFn: (r: HashResult) => r.vt_meta?.data?.attributes?.tags ?? [],

        cell: (tags: string[]) =>
        tags.length === 0 ? null : (
            <div className="flex flex-wrap gap-1">
            {tags.map((t, i) => (
                <Tag key={i} value={t} variant="indicator" />
            ))}
            </div>
        ),

        enableSorting: false,
        enableHiding: true,
        enableFiltering: false,
        isVisible: true,
    },
    {
        id: "actions",
        header: "",
        accessorFn: (row: HashResult) => row,

        cell: (row: HashResult) => {
        const sha256 =
            row.vt_meta?.data?.attributes?.sha256 || row.slasher_hash || "";

        const vtUrl = `https://www.virustotal.com/gui/file/${sha256}`;
        const bazaarUrl = `https://bazaar.abuse.ch/sample/${sha256}`;

        const triggerDownload = async () => {
            try {
            const url = await api.downloadHashFromVT(row.uuid);
            window.open(url, "_blank", "noopener,noreferrer");
            } catch {}
        };

        return (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="z-50 w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem asChild>
                <a href={vtUrl} target="_blank" rel="noopener noreferrer">
                    Search on VirusTotal
                </a>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                <a href={bazaarUrl} target="_blank" rel="noopener noreferrer">
                    Search on MalwareBazaar
                </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={triggerDownload}>
                Download file from VirusTotal
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        );
        },

        enableSorting: false,
        enableHiding: false,
        enableFiltering: false,
        isVisible: true,
    },
];

// Column configuration used by <DataTable<IPResult>
export const ipColumns = [
    { 
        id: "slasher_ip", 
        header: "IP", 
        accessorKey: "slasher_ip" as const, 
        enableSorting: true,
        enableHiding: false, 
        enableFiltering: false,
    },
    {
        id: "vt_detections",
        header: "VT Detection Rate",
    
        // expose { rate, total } so cell & filters get a primitive
        accessorFn: (row) => {
          const { rate, total } = calculateDetectionRate(row);
          return { rate, total };
        },
    
        cell: ({ rate, total }: { rate: number; total: number }) => {
          if (total === 0) {
            return <Tag value="Unknown" variant="tag_grey" />;
          }
          const value = `${rate}/${total}`;
          const variant = rate === 0 ? "tag_green" : rate < 6  ? "tag_orange" : "tag_red";
          return <Tag value={value} variant={variant} />;
        },
    
        enableSorting: false,
        enableHiding: true,
        enableFiltering: false,
    },
    {
        id: "vt_country",
        header: "VT Country",
        accessorFn: row => row.vt_meta?.data?.attributes?.country ?? null,
        cell: (country: string | null) => <span>{country ?? "Unknown"}</span>,
        enableSorting: true,
        enableHiding: true,
        enableFiltering: true,
        isVisible: true,
    },
    {
        id: "vt_asn",
        header: "VT ASN (Owner)",

        accessorFn: row => {
            const asn = row.vt_meta?.data?.attributes?.asn;
            const owner = row.vt_meta?.data?.attributes?.as_owner;
            if (asn == null && owner == null) return null;
            return owner ? `${asn} (${owner})` : String(asn ?? owner);
        },

        cell: (value: string | null) => <span>{value ?? "Unknown"}</span>,

        enableSorting: true,
        enableHiding: true,
        enableFiltering: true,
        isVisible: true,
    },
    {
        id: "vt_vendor_analysis",
        header: "VT Vendor Analysis",

        accessorFn: row => {
            type Engine = { category?: string; result?: string };
            
            const analysis: Record<string, Engine> =
                row.vt_meta?.data?.attributes?.last_analysis_results ?? {};
            
            // Array<[vendor, category, result]>
            return Object.entries(analysis).filter(([, v]) => {
                const r = v.result?.toLowerCase();
                return r && r !== "clean" && r !== "unrated";
                })
                .map(
                ([vendor, v]) => [vendor, v.category ?? "unknown", v.result ?? "unknown"] as [
                    string,
                    string,
                    string
                ]
            );
        },

        cell: (hits: [string, string, string][]) => {
            return (
                hits.length === 0 ? null : (
                    <div className="flex flex-wrap gap-1">
                        {hits.map(([vendor, category, result], i) => {
                            const variant =
                                category === "malicious"
                                ? "tag_red"
                                : category === "suspicious"
                                ? "tag_orange"
                                : category === "harmless" || category === "undetected"
                                ? "tag_green"
                                : "tag_grey";

                            return (
                                <Tag
                                key={i}
                                value={`${vendor}: ${result}`}
                                variant={variant}
                                />
                            );
                        })}
                    </div>   
                )
            )
        },
        enableSorting: false,
        enableHiding: true,
        enableFiltering: false,
        isVisible: true,
    },
    {
        id: "vt_tags",
        header: "VT Tags",
    
        accessorFn: row => row.vt_meta?.data?.attributes?.tags ?? [],
    
        cell: (tags: string[]) =>
            tags.length === 0 ? null : (
            <div className="flex flex-wrap gap-1">
                {tags.map((t, i) => (
                <Tag key={i} value={t} variant="indicator" />
                ))}
            </div>
            ),
    
        enableSorting: false,
        enableHiding: true,
        enableFiltering: false,
        isVisible: true,
    }
];

// Column configuration used by <DataTable<DomainResult>
export const domainColumns = [

    { 
        id: "slasher_domain", 
        header: "IP", 
        accessorKey: "slasher_domain" as const, 
        enableSorting: true,
        enableHiding: false, 
        enableFiltering: false,
    },
    {
        id: "vt_detections",
        header: "VT Detection Rate",
    
        // expose { rate, total } so cell & filters get a primitive
        accessorFn: (row) => {
          const { rate, total } = calculateDetectionRate(row);
          return { rate, total };
        },
    
        cell: ({ rate, total }: { rate: number; total: number }) => {
          if (total === 0) {
            return <Tag value="Unknown" variant="tag_grey" />;
          }
          const value = `${rate}/${total}`;
          const variant = rate === 0 ? "tag_green" : rate < 6  ? "tag_orange" : "tag_red";
          return <Tag value={value} variant={variant} />;
        },
    
        enableSorting: false,
        enableHiding: true,
        enableFiltering: false,
    },
    {
        id: "vt_vendor_analysis",
        header: "VT Vendor Analysis",

        accessorFn: row => {
            type Engine = { category?: string; result?: string };
            
            const analysis: Record<string, Engine> =
                row.vt_meta?.data?.attributes?.last_analysis_results ?? {};
            
            // Array<[vendor, category, result]>
            return Object.entries(analysis).filter(([, v]) => {
                const r = v.result?.toLowerCase();
                return r && r !== "clean" && r !== "unrated";
                })
                .map(
                ([vendor, v]) => [vendor, v.category ?? "unknown", v.result ?? "unknown"] as [
                    string,
                    string,
                    string
                ]
            );
        },

        cell: (hits: [string, string, string][]) => {
            return (
                hits.length === 0 ? null : (
                    <div className="flex flex-wrap gap-1">
                        {hits.map(([vendor, category, result], i) => {
                            const variant =
                                category === "malicious"
                                ? "tag_red"
                                : category === "suspicious"
                                ? "tag_orange"
                                : category === "harmless" || category === "undetected"
                                ? "tag_green"
                                : "tag_grey";

                            return (
                                <Tag
                                key={i}
                                value={`${vendor}: ${result}`}
                                variant={variant}
                                />
                            );
                        })}
                    </div>   
                )
            )
        },
        enableSorting: false,
        enableHiding: true,
        enableFiltering: false,
        isVisible: true,
    },
    {
        id: "vt_tags",
        header: "VT Tags",
    
        accessorFn: row => row.vt_meta?.data?.attributes?.tags ?? [],
    
        cell: (tags: string[]) =>
            tags.length === 0 ? null : (
            <div className="flex flex-wrap gap-1">
                {tags.map((t, i) => (
                <Tag key={i} value={t} variant="indicator" />
                ))}
            </div>
            ),
    
        enableSorting: false,
        enableHiding: true,
        enableFiltering: false,
        isVisible: true,
    },
    {
        id: "vt_registrar",
        header: "VT Registrar",
        accessorFn: row => row.vt_meta?.data?.attributes?.registrar ?? null,
        cell: (registrar: string | null) => <span>{registrar ?? "Unknown"}</span>,
        enableSorting: true,
        enableHiding: true,
        enableFiltering: true,
        isVisible: true,
    },
    {
        id: "vt_creation",
        header: "VT Creation Date",
        accessorFn: row => {
            const creationDate = new Date(row.vt_meta?.data?.attributes?.creation_date * 1000).toString() ?? null;
            return creationDate;
        },
        cell: (creation_date: string | null) => 
            creation_date === null ? null : (
                <span>{creation_date}</span>
            ),
        enableSorting: true,
        enableHiding: true,
        enableFiltering: true,
        isVisible: false,
    },
];

// Column configuration used by <DataTable<Query[]>
export const queryColumns = [
    { 
        id: "query_case_name", 
        header: "Case Name", 
        accessorKey: "query_case_name" as const, 
        enableSorting: true,
        enableHiding: false,
        enableFiltering: false,
        isVisible: true,
    },
    { 
        id: "query_analyst", 
        header: "Analyst", 
        accessorKey: "query_analyst" as const, 
        enableSorting: true,
        enableHiding: true, 
        enableFiltering: true,
        isVisible: true,
    },
    { 
        id: "query_date", 
        header: "Date", 
        accessorKey: "query_date" as const,
        cell: ( query_date: string ) => formatDate(query_date),
        enableSorting: true,
        enableHiding: true, 
        enableFiltering: true,
        isVisible: true,
    },
    {
        id: "query_status",
        header: "Status",
        accessorKey: "query_status" as const, 
        cell: ( query_status: string | null ) => {
            if (!query_status) {
                return <Tag value="Unknown" variant="tag_grey" />;
            }

            const variant =
            query_status === "completed"
                ? "tag_green"
                : query_status === "pending"
                ? "tag_orange"
                : "tag_red";

            return <Tag value={query_status} variant={variant} />;
        },

        enableSorting: true,
        enableHiding: true,
        enableFiltering: true,
        isVisible: true,
    },
    {
        id: "query_action",
        header: "",
        accessorKey: "uuid" as const,
        cell: ( uuid: string ) => {
            return (
                <Link to={`/queries/${uuid}`}>
                    <Button variant="ghost" size="sm">
                        View <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            )
        },
        enableSorting: false,
        enableHiding: false,
        enableFiltering: false,
        isVisible: true,
    }
];