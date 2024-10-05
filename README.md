# Slhasher - Bulk VirusTotal Hash Lookups

Slhasher is a collaborative tool designed to perform bulk SHA256 hash lookups through a graphical user interface. It integrates with VirusTotal to fetch hash metadata and supports exporting results for easy sharing and analysis.

## Demo

https://github.com/user-attachments/assets/bdae680f-8260-4fdb-a562-cce9aeac4886

## Features

- Perform bulk SHA256 hash lookups via VirusTotal
- Download files directly from VirusTotal through Slhasher
- Export hash lookup results as CSV files

## Getting Started

To get started with Slhasher, follow the steps below:

### 1. Set up your environment

- Copy the `template.env` file and rename it to `.env`:

    ```bash
    cp template.env .env
    ```

- Edit the `.env` file to configure the following variables:

    ```bash
    # ...
    SLHASHER_API_SECRET_KEY=<your-secret-key>
    # ...
    VIRUSTOTAL_API_KEY=<your-virustotal-api-key>
    # ...
    ```

### 2. Build and start the application using Docker

- Build the Docker images:

    ```bash
    docker-compose build
    ```

- Start the application:

    ```bash
    docker-compose up
    ```

### 3. Access the application

- Open your web browser and navigate to `http://127.0.0.1:3000` to start using Slhasher.

## To-Do List

- [ ] Option to use cached hash values instead of querying VirusTotal for each lookup
- [ ] Filter and search functionalities to improve result navigation
- [ ] Additional export file formats (e.g., JSON, XML)
- [ ] Parsing and displaying all VirusTotal result fields
- [ ] Support for creating exports for selected hash values only
- [ ] Integration with HybridAnalysis as additional or alternative hash analysis
- [ ] Support for MD5 and SHA1 hash values
