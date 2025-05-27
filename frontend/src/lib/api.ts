import { API_BASE } from '@/lib/config';
import { unknown } from 'zod';

// Define data structures
export interface Query {
    id: number;
    uuid: string;
    query_status: string;
    query_analyst: string;
    query_case_name: string;
    query_date: string;
}

export interface HashResult {
    id: number;
    uuid: string;
    slasher_hash: string;
    vt_status: string;
    vt_meta: any
}

export interface IPResult {
    id: number;
    uuid: string;
    slasher_ip: string;
    vt_status: string;
    vt_meta: any
}

export interface DomainResult {
    id: number;
    uuid: string;
    slasher_domain: string;
    vt_status: string;
    vt_meta: any
}

export interface QueryResults {
  success: boolean;
  data: {
    query: Query,
    hashes?: HashResult[],
    domains?: DomainResult[],
    ips?: IPResult[],
  };
}

export interface QueryInput {
    query: {
        query_analyst: string,
        query_case_name: string,
    },
    hashes: string[],
    ips: string[],
    domains: string[],
}

// Helper functions
export function formatDate(iso: string): string {
    // JS Date accepts the ISO string; fractional seconds are rounded to ms.
    const date = new Date(iso);

    // Combine date *and* time; toLocaleDateString would drop the time fields.
    return date.toLocaleString("en-GB", {
        timeZone: "UTC",
        year:   "numeric",
        month:  "long",
        day:    "numeric",
        hour:   "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

async function safeFetch<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(url, init);

    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`) as Error & { status?: number };
        err.status = res.status;
        throw err;
    }
    
    const ctype = res.headers.get("content-type") ?? "";

    if (ctype.includes("application/json")) {
        return (await res.json()) as T;
    }

    // Anything else - return raw blob (CSV, XLSX, PDF, …)
    return (await res.blob()) as unknown as T;
}

// API public surface
const fetchQueries = () => safeFetch<Query[]>(`${API_BASE}/queries/`, { headers: { Accept: "application/json" } });

const fetchQueryByUuid = (queryUuid: string) =>
    safeFetch<QueryResults>(`${API_BASE}/queries/${queryUuid}/`, { headers: { Accept: "application/json" } });

const downloadHashFromVT = (hashUuid: string) =>
    safeFetch<{ success: boolean; data: string }>(`${API_BASE}/hashes/${hashUuid}/download/`, { headers: { Accept: "application/json" } }).then(res => res.data);

const downloadCSV = (queryUuid: string) => 
    safeFetch<Promise<Blob>>(`${API_BASE}/queries/${queryUuid}/export/csv/`, { headers: { Accept: "text/csv" } });

export async function createQuery(
body: QueryInput,
): Promise<QueryResults> {
    const res = await fetch(`${API_BASE}/queries/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`) as Error & { status?: number };
        err.status = res.status;
        throw err;
    }

    return res.json() as Promise<QueryResults>;
}

export const api = {
    createQuery,
    fetchQueries,
    fetchQueryByUuid,
    downloadHashFromVT,
    downloadCSV,
};