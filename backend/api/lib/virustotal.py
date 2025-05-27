import os
import requests

from dotenv import load_dotenv
from django.db import transaction

from ..models import (
    ModelQueryDomainJoin,
    ModelQueryHashJoin,
    ModelQueryIPJoin,
    ModelSlasherDomain,
    ModelSlasherHash,
    ModelSlasherIP,
    ModelSlasherQuery,
)

load_dotenv()

VT_HEADERS = {
    "accept": "application/json",
    "x-apikey": os.getenv('VIRUSTOTAL_API_KEY'),
}

# Process IPs, domains and file hash values
def enrich_indicators_with_vt(query_id: int, indicators: dict) -> bool:
    """!
    @brief Process IPs, domains and file hash values against VirusTotal.

    Iterates over three indicator families hashes, ips and domains and
    enriches each ORM-like object with VirusTotal status and metadata, saving
    results back to the database.  
    A private helper, _vt_get_response(), wraps the VirusTotal v3 REST calls.

    Reference: https://docs.virustotal.com/reference/ip-info
    Reference: https://docs.virustotal.com/reference/domain-info
    Reference: https://virustotal.readme.io/reference/file-info

    Each indicator object must expose  
      - a value attribute named in indicator_cfg (e.g. slasher_hash)  
      - writable attributes vt_status and vt_meta  
      - a save() method.

    @param indicators: Dictionary mapping indicator-family keys
                       ('hashes', 'ips', 'domains') to
                       lists of indicator objects.
    @return True when the routine completes; individual objects may still
            contain "error" in vt_status if look-ups failed.
    """

    # Hit the VirusTotal v3 API and normalise the outcome.
    def _vt_get_response(api_endpoint: str, indicator: str):

        response = requests.get(
            "https://www.virustotal.com/api" + f"{api_endpoint}{indicator}", 
            headers=VT_HEADERS
        )

        if response.status_code == 200:
            return ('completed', response.json())
        elif response.status_code == 404 and response.json().get('error').get('code') == 'NotFoundError':
            return ('unknown', {})
        else:
            return ('error', {})

    # Populate vt_status / vt_meta for all objects in one indicator family.
    def _enrich_group(indicator_list: list, vt_endpoint: str, value_attr: str) -> None:
        for obj in indicator_list:
            try:
                value = getattr(obj, value_attr)
                obj.vt_status, obj.vt_meta = _vt_get_response(vt_endpoint, value)
            except Exception:
                obj.vt_status = "error"
            finally:
                obj.save()

    indicator_cfg = {
        "hashes": { "endpoint": "/v3/files/","attr": "slasher_hash" },
        "ips": { "endpoint": "/v3/ip_addresses/","attr": "slasher_ip"},
        "domains": { "endpoint": "/v3/domains/", "attr": "slasher_domain"},
    }

    try:
        # Run enrichment for hashes, IPs, and domains
        for key, cfg in indicator_cfg.items():
            _enrich_group(
                indicators.get(key, []),
                cfg["endpoint"],
                cfg["attr"]
            )

        with transaction.atomic():
            q = ModelSlasherQuery.objects.select_for_update().get(pk=query_id)

            # Fetch all hash, IP and domain join entries where the query_id matches the provided ID.
            hash_join_entries = ModelQueryHashJoin.objects.filter(query_id=query_id)
            domain_join_entries = ModelQueryDomainJoin.objects.filter(query_id=query_id)
            ip_join_entries = ModelQueryIPJoin.objects.filter(query_id=query_id)

            # Are any indicators still pending?
            pending_exists = (
                ModelSlasherHash.objects.filter(pk__in=[entry.hash_id for entry in hash_join_entries], vt_status="pending").exists() or
                ModelSlasherDomain.objects.filter(pk__in=[entry.domain_id for entry in domain_join_entries], vt_status="pending").exists() or
                ModelSlasherIP.objects.filter(pk__in=[entry.ip_id for entry in ip_join_entries], vt_status="pending").exists()
            )

            if not pending_exists:
                any_error = (
                    ModelSlasherHash.objects.filter(pk__in=[entry.hash_id for entry in hash_join_entries], vt_status="error").exists() or
                    ModelSlasherDomain.objects.filter(pk__in=[entry.domain_id for entry in domain_join_entries], vt_status="error").exists() or
                    ModelSlasherIP.objects.filter(pk__in=[entry.ip_id for entry in ip_join_entries], vt_status="error").exists()
                )
                q.query_status = "error" if any_error else "completed"
                q.save(update_fields=["query_status"])

    except Exception:
        # Failure, mark the query as error
        ModelSlasherQuery.objects.filter(pk=query_id).update(query_status="error")
        raise
    
    return True


def fetch_vt_download_url(hash_value: str) -> tuple[int, str]:
    """!
    @brief Ask VT for a sample download URL.

    Rference: https://virustotal.readme.io/reference/files-download-url

    @return (status_code, message_or_url)
    """
    try:
        resp = requests.get(
            f"https://www.virustotal.com/api/v3/files/{hash_value}/download_url",
            headers=VT_HEADERS,
        )

        if resp.status_code == 200:
            return 200, resp.json().get("data")

        if resp.json().get("error", {}).get("code") == "ForbiddenError":
            msg = resp.json()["error"]["message"]
            return 401, f"{msg} (free public API key)"

        return 500, "VirusTotal returned an unknown response."

    except Exception:
        return 500, "Unexpected error while querying VirusTotal."
