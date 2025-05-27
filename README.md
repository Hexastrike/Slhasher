# Slasher - Bulk VirusTotal Indicator Lookups

Slasher is a bulk IOC checker. Paste hashes, IPs or domains, let Slasher query VirusTotal in parallel, watch progress live, then export results as a CSV file — all from a single web interface.

## Features

- **Bulk look-ups**: Drop in MD5 / SHA-1 / SHA-256, FQDNs or IP v4/v6; all are queried concurrently.
- **Filter + search**: Text search, per-column filters and sorting help you find the needles fast.
- **Risk colouring**: Badges turn green / amber / red based on how many VT engines flagged the indicator.
- **One-click sample download**: If VT hosts the file you can fetch it straight from the table.
- **CSV export**: One button, ready-to-share CSV (server-side stream, no browser freeze).
- **Zero-friction setup**: `docker compose up --build`` brings up API & UI in one go.

## Getting started

### Clone

```bash
git clone https://github.com/hexastrike/slasher.git
cd slasher
```

### Create `.env``

```bash
cp template.env .env
```

Generate a Django secret:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Edit `.env` and set at least:

```dotenv
DJANGO_SECRET_KEY=<your-secret-key>
VIRUSTOTAL_API_KEY=<your-virustotal-key>
```

### Run

```bash
docker compose up --build # API on port 8000, UI on port 3000 by default
```

Navigate to http://127.0.0.1:3000.

## Demo

### Add indicators

![Add indicators](/assets/hx_slasher_query_indicators.png)

### Add metadata

![Add metadata](/assets/hx_slasher_query_metadata.png)

### Review querie details

![Review query details](/assets/hx_slasher_query_review.png)

### Hash results

![Hash results](/assets/hx_slasher_query_results.png)

### IP / Domain results

![IP / Domain results](/assets/hx_slasher_query_results_2.png)

## Roadmap

- [ ] XLSX export
- [ ] Use cached VirusTotal results
- [ ] Export / copy only selected rows
- [ ] Additional enrichment sources (Abuse-IPDB, URLhaus, Hybrid-Analysis …)
- [ ] Authentication
