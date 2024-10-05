import os
import requests
from dotenv import load_dotenv

load_dotenv()

VIRUSTOTAL_API_HEADERS = {
    "accept": "application/json",
    "x-apikey": os.getenv('VIRUSTOTAL_API_KEY'),
}

# Reference: https://virustotal.readme.io/reference/file-info
def vt_proc_ha(hashes: list):
    def vt_api_ha(api_url: str, hash: str, api_headers: dict):

        response = requests.get(
            api_url + f"/v3/files/{hash}", 
            headers=api_headers
        )

        # Hash known to VirusTotal database
        if response.status_code == 200:
            return ('success', response.json())
        elif response.status_code == 404 and response.json().get('error').get('code') == 'NotFoundError':
            return ('unknown', {})
        else:
            return ('error', {})

    for hash_obj in hashes:
        try:
            # Extract the hash value from the hash object
            hash_value = hash_obj.slhasher_hash
            
            vt_ha_response = vt_api_ha(
                os.getenv('VIRUSTOTAL_API_ENDPOINT_URL'), 
                hash_value, 
                VIRUSTOTAL_API_HEADERS
            )

            hash_obj.vt_status = vt_ha_response[0]
            hash_obj.vt_meta = vt_ha_response[1]  
            hash_obj.save()

        except Exception:
            hash_obj.vt_status = "error"
            hash_obj.save()

    return True

# Reference: https://virustotal.readme.io/reference/files-download-url
# Return HTTP status code based on VirusTotal response 
# Return download url if available
def vt_proc_df(hash_value: str) -> tuple:
    try: 
        response = requests.get(
            os.getenv('VIRUSTOTAL_API_ENDPOINT_URL') + f"/v3/files/{hash_value}/download_url", 
            headers=VIRUSTOTAL_API_HEADERS
        )
        
        # Hash known to VirusTotal database
        if response.status_code == 200:
            return (200, response.json().get('data'))
        # Unauthorized due to standard free public API
        elif response.json().get('error').get('code') == 'ForbiddenError':
            return (401, f"{response.json().get('error').get('message')}. This happens when using the free public API.")
        else:
            return (500, 'VirusTotal returned an unknown response.')

    except Exception as e:
        return (500, 'Something went wrong.')
