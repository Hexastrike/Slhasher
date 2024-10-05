export type HXHash = {
    slhasher_hash_id: number;
    slhasher_hash: string;
    vt_status: string;
    vt_detections: number;
    vt_detections_vendors: number;
    vt_meaningful_name: string;
    vt_filenames: string;
    vt_md5: string;
    vt_sha1: string;
    vt_sha256: string;
    vt_filesize: string;
  }

export type HXQueryHashesGetRes = {
    success: boolean;
    data: {
      hashes: HXHash[];
    }
  }
  
export type HXQueryPostRes = {
  success: boolean;
  data: {
    id: string;
    query_date: string;
    query_case_name: string;
    query_analyst: string;
    query_status: string;
  }
}

export type HXQueryPostReq = {
  query: {
    query_analyst: string;
    query_case_name: string;
  };
  hashes: string[];
}

// Union TypeScript type to account for both success and error cases
export type HXHashVTDownloadURLRes = 
  | { success: true; data: string }   // When success is true, data is present
  | { success: false; error: string }; // When success is false, error is present

export type HXQueryGetRes = {
  success: boolean;
  data: {
    queries: {
      id: string;
      query_status: string;
      query_analyst: string;
      query_case_name: string;
      query_date: string;
    }[];
  }
}