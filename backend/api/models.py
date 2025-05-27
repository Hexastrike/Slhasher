import uuid

from django.db import models


class ModelSlasherIOC(models.Model):
    """
    @brief Abstract base model for metadata related to VirusTotal (VT) queries.

    This model provides common fields for handling the status and metadata
    of VirusTotal analysis results. It is used as a base for other models
    such as SlasherHash, SlasherIP, and SlasherDomain.
    """

    # Status values for VirusTotal query results
    VT_STATUS = {
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("error", "Error"),
        ("unknown", "Unknown"),
    }

    vt_status = models.CharField(
        max_length=9,
        choices=VT_STATUS,
        default="pending",
        blank=False,
        null=False,
        help_text="The current status of the VirusTotal query.",
    )

    vt_meta = models.TextField(
        help_text="Metadata returned by VirusTotal after query execution."
    )

    uuid = models.UUIDField(default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True  # Mark as abstract to be inherited by other models


class ModelSlasherQuery(models.Model):
    """
    @brief Model to store metadata for Slasher queries.

    This model tracks the status, analyst, and associated case information
    for each query performed within the Slasher system.
    """

    uuid = models.UUIDField(default=uuid.uuid4, editable=False)

    # Status values for Slasher queries
    QUERY_STATUS = {
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("error", "Error"),
        ("unknown", "Unknown"),
    }

    query_status = models.CharField(
        max_length=9,
        choices=QUERY_STATUS,
        default="pending",
        blank=False,
        null=False,
        help_text="The current status of the query (e.g., pending, success).",
    )

    query_analyst = models.CharField(
        max_length=128,
        blank=False,
        null=False,
        help_text="The name of the analyst who initiated the query.",
    )

    query_case_name = models.CharField(
        max_length=256,
        blank=False,
        null=False,
        help_text="The name of the case linked to this query.",
    )

    query_date = models.DateTimeField(
        auto_now_add=True,
        help_text="The date and time when the query was executed. Set automatically.",
    )

    # TODO:
    # query_cached_values = models.BooleanField(
    #     default=True,
    #     help_text="When true we reuse cached VirusTotal results. When false every indicator is re-queried.",
    # )


class ModelSlasherHash(ModelSlasherIOC):
    """
    @brief Model to store metadata for hash entries.

    Inherits from ModelSlasherIOC and adds a field to store hash values for analysis.
    """

    slasher_hash = models.CharField(
        max_length=64,
        blank=False,
        null=False,
        help_text="The hash value provided by the user for analysis.",
    )


class ModelSlasherIP(ModelSlasherIOC):
    """
    @brief Model to store metadata for IP entries.

    Inherits from ModelSlasherIOC and adds a field to store IP addresses. Supports
    IPv4 and IPv6 formats.
    """

    slasher_ip = models.CharField(
        max_length=39,
        blank=False,
        null=False,
        help_text="The IP address provided by the user (IPv4 or IPv6).",
    )


class ModelSlasherDomain(ModelSlasherIOC):
    """
    @brief Model to store metadata for domain entries.

    Inherits from ModelSlasherIOC and adds a field to store domain names.
    """

    slasher_domain = models.CharField(
        max_length=256,
        blank=False,
        null=False,
        help_text="The domain name provided by the user.",
    )


class ModelQueryHashJoin(models.Model):
    """
    @brief Intermediary model for many-to-many relationships between
           Slasher queries and hash entries.

    This model links multiple hashes to a single query or allows a single
    hash to be associated with multiple queries.
    """

    query_id = models.CharField(
        max_length=64,
        blank=False,
        null=False,
        help_text="Foreign key linking to a SlasherQuery.",
    )

    hash_id = models.CharField(
        max_length=64,
        blank=False,
        null=False,
        help_text="Foreign key linking to a SlasherHash.",
    )


class ModelQueryDomainJoin(models.Model):
    """
    @brief Intermediary model for many-to-many relationships between
           Slasher queries and domain entries.

    This model links multiple domains to a single query or allows a single
    domain to be associated with multiple queries.
    """

    query_id = models.CharField(
        max_length=64,
        blank=False,
        null=False,
        help_text="Foreign key linking to a SlasherQuery.",
    )

    domain_id = models.CharField(
        max_length=64,
        blank=False,
        null=False,
        help_text="Foreign key linking to a SlasherDomain.",
    )


class ModelQueryIPJoin(models.Model):
    """
    @brief Intermediary model for many-to-many relationships between
           Slasher queries and ip entries.

    This model links multiple IPs to a single query or allows a single
    IP to be associated with multiple queries.
    """

    query_id = models.CharField(
        max_length=64,
        blank=False,
        null=False,
        help_text="Foreign key linking to a SlasherQuery.",
    )

    ip_id = models.CharField(
        max_length=64,
        blank=False,
        null=False,
        help_text="Foreign key linking to a SlasherIP.",
    )
