import { 
  HXQueryPostRes, 
  HXQueryPostReq, 
  HXQueryGetRes, 
  HXQueryHashesGetRes,
  HXHashVTDownloadURLRes,
} from '@/lib/HXTypes';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchQueries = async (): Promise<HXQueryGetRes> => {
  try {
    const response = await fetch(`${API_BASE_URL}/queries/` , {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!response.ok) {}
    const responseData = await response.json();
    return responseData;
  } catch (error) {throw error;}
}

export const submitQuery = async (slhasherQuery: HXQueryPostReq): Promise<HXQueryPostRes> => {
  try {
    const response = await fetch(`${API_BASE_URL}/queries/` , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slhasherQuery),
    })
    if (!response.ok) {}
    const responseData = await response.json();
    return responseData;
  } catch (error) {throw error;}
}

export const fetchQueryHashes = async (slhasherQuery: number): Promise<HXQueryHashesGetRes> => {
  try {
    const response = await fetch(`${API_BASE_URL}/queries/${slhasherQuery}/hashes/` , {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!response.ok) {}
    const responseData = await response.json();
    return responseData;
  } catch (error) {throw error;}
}

export const fetchHashVTDownloadURL = async (slhasherHashID: number): Promise<HXHashVTDownloadURLRes> => {
  try {
    const response = await fetch(`${API_BASE_URL}/hashes/${slhasherHashID}/vt-download/` , {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!response.ok) {}
    const responseData = await response.json();
    return responseData;
  } catch (error) {throw error;}
}