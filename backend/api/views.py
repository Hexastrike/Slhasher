import ast
import csv
import threading
from datetime import datetime

from django.db import transaction
from django.http import StreamingHttpResponse
from rest_framework import (status, exceptions)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.generics import get_object_or_404
from rest_framework.renderers import JSONRenderer

from .lib.virustotal import (
    enrich_indicators_with_vt, 
    fetch_vt_download_url
)
from .models import (
    ModelQueryDomainJoin,
    ModelQueryHashJoin,
    ModelQueryIPJoin,
    ModelSlasherDomain,
    ModelSlasherHash,
    ModelSlasherIP,
    ModelSlasherQuery,
)
from .serializers import (
    SerializerQueryDomainJoin,
    SerializerQueryHashJoin,
    SerializerQueryIPJoin,
    SerializerSlasherDomain,
    SerializerSlasherHash,
    SerializerSlasherIP,
    SerializerSlasherQuery,
    SerializersQueryEnvelope,
)
from .renderers import CSVRenderer


class ViewSlasherQueries(APIView):
    """!
    @brief API view to handle retrieval and creation of Slasher queries.

    This view allows fetching all existing queries using the GET method and 
    creating a new query with associated IPs, domains, and hashes using the POST method.
    If a uuid is provided, the Slasher query details for that specific query are returned.
    """

    def get(self, request: Request, uuid: str = None):
        """!
        @brief Retrieve all or specific Slasher query results.

        @param request: Incoming HTTP request.
        @param uuid: The Slasher query uuid.

        @return Response: JSON response either showing a specific query result or all available query results.
        """

        # If a uuid is provided, fetch the query details and related hashes, IPs and domains
        if uuid:
            # Attempt to retrieve the query object by its uuid
            # If the query does not exist, this will raise a ModelSlasherQuery.DoesNotExist exception
            query = get_object_or_404(ModelSlasherQuery, uuid=uuid)
            query_serializer = SerializerSlasherQuery(query)

            # Fetch all hash, IP and domain join entries where the query_id matches the provided ID
            hash_join_entries = ModelQueryHashJoin.objects.filter(query_id=query.pk)
            domain_join_entries = ModelQueryDomainJoin.objects.filter(query_id=query.pk)
            ip_join_entries = ModelQueryIPJoin.objects.filter(query_id=query.pk)

            # Retrieve all hash, IP and domain objects using the id fields from the join entries
            slasher_hashes = ModelSlasherHash.objects.filter(pk__in=[entry.hash_id for entry in hash_join_entries])
            slasher_domains = ModelSlasherDomain.objects.filter(pk__in=[entry.domain_id for entry in domain_join_entries])
            slasher_ips = ModelSlasherIP.objects.filter(pk__in=[entry.ip_id for entry in ip_join_entries])

            # Serialize the list of hash, IP and domain objects into JSON format
            serialized_hashes = SerializerSlasherHash(slasher_hashes, many=True)
            serialized_domains = SerializerSlasherDomain(slasher_domains, many=True)
            serialized_ips = SerializerSlasherIP(slasher_ips, many=True)

            # Manually format the serialized data
            formatted_hashes = []
            for hash_obj in serialized_hashes.data:
                # Parse VT_meta
                vt_meta = hash_obj.get("vt_meta", {})
                # Parse abstract syntax tree output from VirusTotal to use default JSON methods
                vt_meta = ast.literal_eval(vt_meta)

                formatted_hashes.append(
                    {
                        "id": hash_obj.get("id"),
                        "uuid": hash_obj.get("uuid"),
                        "slasher_hash": hash_obj.get("slasher_hash"),
                        "vt_status": hash_obj.get("vt_status"),
                        "vt_meta": vt_meta,
                    }
                )

            formatted_domains = []
            for domain_obj in serialized_domains.data:
                # Parse VT_meta
                vt_meta = domain_obj.get("vt_meta", {})
                # Parse abstract syntax tree output from VirusTotal to use default JSON methods
                vt_meta = ast.literal_eval(vt_meta)

                formatted_domains.append(
                    {
                        "id": domain_obj.get("id"),
                        "uuid": domain_obj.get("uuid"),
                        "slasher_domain": domain_obj.get("slasher_domain"),
                        "vt_status": domain_obj.get("vt_status"),
                        "vt_meta": vt_meta,
                    }
                )

            formatted_ips = []
            for ip_object in serialized_ips.data:
                # Parse VT_meta
                vt_meta = ip_object.get("vt_meta", {})
                # Parse abstract syntax tree output from VirusTotal to use default JSON methods
                vt_meta = ast.literal_eval(vt_meta)

                formatted_ips.append(
                    {
                        "id": ip_object.get("id"),
                        "uuid": ip_object.get("uuid"),
                        "slasher_ip": ip_object.get("slasher_ip"),
                        "vt_status": ip_object.get("vt_status"),
                        "vt_meta": vt_meta,
                    }
                )

            # Return a success response with the serialized data of related hashes.
            return Response(
                {
                    "success": True,
                    "data": {
                        "query": query_serializer.data,
                        "hashes": formatted_hashes,
                        "domains": formatted_domains,
                        "ips": formatted_ips,
                    },
                }
            )

        queries = ModelSlasherQuery.objects.all()
        serializer = SerializerSlasherQuery(queries, many=True)
        return Response({"success": True, "data": serializer.data,}, status.HTTP_200_OK)

    def post(self, request: Request):
        """!
        @brief Create a new Slasher query with associated IPs, domains, and hashes.

        @param request: The HTTP request object containing query details.

        @return Response: A JSON response indicating success or failure.
        """

        # Validate the whole envelope first
        env_ser = SerializersQueryEnvelope(data=request.data)
        env_ser.is_valid(raise_exception=True)
        data = env_ser.validated_data

        def validate_and_save_values(values, serializer_class, data_key):
            """!
            @brief Validate and save a list of values.

            @param values: List of user-provided values.
            @param serializer_class: Serializer class for validation.
            @param data_key: Key to identify the value field in the serializer.

            @return list: A list of valid saved objects.
            """
            valid_objects = []
            for value in values:
                serializer = serializer_class(data={data_key: value, "vt_meta": "{}"})
                if serializer.is_valid():
                    valid_objects.append(serializer.save())
                # Invalid values are skipped silently

            return valid_objects

        def associate_values_with_query(
            values, join_serializer_class, value_key, query
        ):
            """!
            @brief Associate validated values with the query using join models.

            @param values: List of valid objects to associate.
            @param join_serializer_class: Serializer class for the join model.
            @param value_key: Key for the related field in the join serializer.
            @param query: The query object to associate with.

            @return None
            """
            for value in values:
                serializer = join_serializer_class(
                    data={"query_id": query.pk, value_key: value.pk}
                )
                if serializer.is_valid():
                    serializer.save()
                else:
                    # Rollback value association if join fails
                    value.delete()

        # Ensure atomicity of the entire operation
        with transaction.atomic():
            # Validate and save the query details like analyst, case name and date
            q_ser = SerializerSlasherQuery(data=data["query"])
            q_ser.is_valid(raise_exception=True)
            query = q_ser.save()

            # TODO: use_cached = q_ser.query_cached_values

            # Extract and deduplicate data from the request
            provided_ips = list(set(request.data.get("ips", [])))
            provided_domains = list(set(request.data.get("domains", [])))
            provided_hashes = list(set(request.data.get("hashes", [])))

            # Validate and save IPs, Domains, and Hashes
            valid_ips = validate_and_save_values(
                provided_ips, SerializerSlasherIP, "slasher_ip"
            )
            valid_domains = validate_and_save_values(
                provided_domains, SerializerSlasherDomain, "slasher_domain"
            )
            valid_hashes = validate_and_save_values(
                provided_hashes, SerializerSlasherHash, "slasher_hash"
            )

            # Associate IPs, Domains, and Hashes with the query
            associate_values_with_query(
                valid_ips, SerializerQueryIPJoin, "ip_id", query
            )
            associate_values_with_query(
                valid_domains, SerializerQueryDomainJoin, "domain_id", query
            )
            associate_values_with_query(
                valid_hashes, SerializerQueryHashJoin, "hash_id", query
            )

            # Perform VirusTotal lookups asynchronusly on valid IOCs only
            indicators = {
                "ips": valid_ips,
                "domains": valid_domains,
                "hashes": valid_hashes
            }
            threading.Thread(target=enrich_indicators_with_vt, args=(query.pk, indicators)).start()

            # Return success response with query details
            return Response(
                {
                    "success": True,
                    "data": {
                        "query": {
                            "id": query.pk,
                            "uuid": query.uuid,
                            "query_date": query.query_date,
                            "query_case_name": query.query_case_name,
                            "query_analyst": query.query_analyst,
                            "query_status": query.query_status,
                        }
                        # TODO: "query_cached_values": query.query_cached_values,
                    },
                },
                status=status.HTTP_201_CREATED,
            )


class ViewSlasherHashVTDownload(APIView):
    """!
    @brief API view to handle VirusTotal sample downloads.
    """

    def get(self, request: Request, uuid: str):
        """!
        @brief Return VirusTotal`s sample-download URL for a given hash.

        @param request: Incoming HTTP request.
        @param uuid: UUID of the ModelSlasherHash entry.

        @return Response: JSON containing data on success, otherwise an exception handled by the global DRF exception handler.
        """

        # Make sure the hash exists
        hash_obj = get_object_or_404(ModelSlasherHash, uuid=uuid)
        
        if hash_obj.vt_status != "completed":
            raise exceptions.NotFound(
                detail="No VirusTotal download URL available for this hash."
            )

        status_code, payload = fetch_vt_download_url(hash_obj.slasher_hash)

        if status_code == 200:
            return Response({"success": True, "data": payload})

        if status_code == 401:
            raise exceptions.PermissionDenied(detail=payload)

        raise exceptions.APIException(detail=payload)

class ViewSlasherQueryCSVExport(APIView):
    """!
    @brief Stream a CSV export of all indicators belonging to a query.
    """

    # CSV advertised
    renderer_classes = [CSVRenderer, JSONRenderer]

    def get(self, request: Request, uuid: str):
        """!
        @param uuid  UUID of the ``ModelSlasherQuery`` to export.

        @return StreamingHttpResponse with ``text/csv`` attachment.
        """

        # Attempt to retrieve the query object by its uuid
        query = get_object_or_404(ModelSlasherQuery, uuid=uuid)

        # Fetch all indicators
        hash_ids = ModelQueryHashJoin.objects.filter(query_id=query.pk).values_list("hash_id", flat=True)
        domain_ids = ModelQueryDomainJoin .objects.filter(query_id=query.pk).values_list("domain_id", flat=True)
        ip_ids = ModelQueryIPJoin.objects.filter(query_id=query.pk).values_list("ip_id", flat=True)

        hashes = ModelSlasherHash.objects.filter(pk__in=hash_ids)
        domains = ModelSlasherDomain.objects.filter(pk__in=domain_ids)
        ips = ModelSlasherIP.objects.filter(pk__in=ip_ids)

        if not (hashes.exists() or domains.exists() or ips.exists()):
            raise exceptions.NotFound("Query contains no indicators to export.")

        # Helper: compute “malicious + suspicious / total” from vt_meta
        def _vt_rate(meta: str) -> str:
            try:
                meta_stats = ast.literal_eval(meta)["data"]["attributes"]["last_analysis_stats"]
                detected = meta_stats.get("malicious", 0) + meta_stats.get("suspicious", 0)
                total  = detected + meta_stats.get("undetected", 0) + meta_stats.get("harmless", 0)
                return f"{detected}/{total}"
            except Exception:
                return "n/a"

        # Stream rows as we generate them (constant memory)
        def _rows():
            yield ("indicator", "type", "vt_rate")
            for h in hashes:
                yield (h.slasher_hash, "hash", _vt_rate(h.vt_meta))
            for ip in ips:
                yield (ip.slasher_ip, "ip", _vt_rate(ip.vt_meta))
            for d in domains:
                yield (d.slasher_domain, "domain", _vt_rate(d.vt_meta))

        class Echo:
            """Minimal write-only buffer for csv.writer + StreamingHttpResponse."""
            def write(self, value): return value

        writer   = csv.writer(Echo())
        filename = f"slasher_query_{uuid}_{datetime.utcnow():%Y%m%dT%H%M%SZ}.csv"

        response = StreamingHttpResponse(
            (writer.writerow(row) for row in _rows()),
            content_type="text/csv",
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
