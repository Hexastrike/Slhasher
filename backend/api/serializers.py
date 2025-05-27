import re
import validators

from rest_framework import serializers

from .models import (
    ModelQueryDomainJoin,
    ModelQueryHashJoin,
    ModelQueryIPJoin,
    ModelSlasherDomain,
    ModelSlasherHash,
    ModelSlasherIP,
    ModelSlasherQuery,
)


class SerializerQueryDomainJoin(serializers.ModelSerializer):
    class Meta:
        model = ModelQueryDomainJoin
        fields = "__all__"


class SerializerQueryHashJoin(serializers.ModelSerializer):
    class Meta:
        model = ModelQueryHashJoin
        fields = "__all__"


class SerializerQueryIPJoin(serializers.ModelSerializer):
    class Meta:
        model = ModelQueryIPJoin
        fields = "__all__"


class SerializerSlasherDomain(serializers.ModelSerializer):
    class Meta:
        model = ModelSlasherDomain
        fields = "__all__"

    
    def validate_slasher_domain(self, domain: str) -> str:
        """!
        @brief Validates the format of a domain value to ensure it is plain domain name, without protocol, path, parameters or authentication.

        @param domain: The domain value to be validated.

        @return The validated domain value if it matches the required format.
        """
        if not validators.domain(domain):
            raise serializers.ValidationError(
                "Domain format invalid."
            )
        return domain


class SerializerSlasherHash(serializers.ModelSerializer):
    class Meta:
        model = ModelSlasherHash
        fields = "__all__"

    def validate_slasher_hash(self, hash: str) -> str:
        """!
        @brief Validates the format of a hash value to ensure it is an MD5, SHA1, or SHA256 hash.

        @param hash: The hash value to be validated.

        @return The validated hash value if it matches the required format.
        """
        if not validators.md5(hash) and not validators.sha1(hash) and not validators.sha256(hash):
            raise serializers.ValidationError(
                "The hash value must be an MD5, SHA1 or SHA256 hash value."
            )
        return hash


class SerializerSlasherIP(serializers.ModelSerializer):
    class Meta:
        model = ModelSlasherIP
        fields = "__all__"

    def validate_slasher_ip(self, ip: str) -> str:
        """!
        @brief Validates the format of a IP address to ensure it is a valid IPv4 or IPv6.

        @param ip: The IP address value to be validated.

        @return The validated ip value if it matches the required format.
        """

        if not validators.ipv4(ip) and not validators.ipv6(ip):
            raise serializers.ValidationError(
                "IP format invalid."
            )
        return ip


class SerializerSlasherQuery(serializers.ModelSerializer):
    class Meta:
        model = ModelSlasherQuery
        fields = "__all__"

    def validate(self, request: dict) -> dict:
        """!
        @brief Validates the query case name and analyst to ensure they only contain alphanumeric characters and spaces.

        @param request: The request data dictionary containing the query case name and analyst.

        @return request: The validated request data.
        """

        query_case_name = request.get("query_case_name", "")
        query_analyst = request.get("query_analyst", "")

        # Ensure query case name and case analyst contain only alphanumeric characters, hyphens, underscores and spaces
        if not re.match(r"^[A-Za-z]+[A-Za-z0-9\-\_\s]*$", query_case_name):
            raise serializers.ValidationError(
                "Case name must only contain alphanumeric characters, underscores, hyphens, spaces and must start with a letter."
            )

        if not re.match(r"^[A-Za-z]+[A-Za-z0-9\-\_\s]*$", query_analyst):
            raise serializers.ValidationError(
                "Analyst name must only contain alphanumeric characters, underscores, hyphens, spaces and must start with a letter."
            )
        return request


class SerializersQueryEnvelope(serializers.Serializer):
    """!
    @brief Top-level envelope. Any missing or extra key triggers a 400.
    """
    query = SerializerSlasherQuery()
    ips = serializers.ListField(child=serializers.CharField(max_length=39), required=True,)
    domains = serializers.ListField(child=serializers.CharField(max_length=256), required=True,)
    hashes  = serializers.ListField(child=serializers.CharField(max_length=64),required=True,)

    # Disallow unexpected keys
    def to_internal_value(self, data):
        unknown = set(data.keys()) - set(self.fields.keys())
        if unknown:
            raise serializers.ValidationError(
                {"detail": [f"Unknown field(s): {', '.join(unknown)}"]}
            )
        return super().to_internal_value(data)