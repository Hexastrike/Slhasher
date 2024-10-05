from django.db import models

# Model to store metadata related to each SLHasher query.
# Each query is assigned its own page, displaying the results of the hash analysis.
# Empty queries are restricted at both the frontend and backend levels to ensure data integrity.
class SlhasherQuery(models.Model):
    QUERY_STATUS = {
        ("pending", "Pending"),
        ("success", "Success"),
        ("error", "Error"),
        ("unknown", "Unknown"),
    }
    # Query status, used to check if query is finished
    query_status = models.CharField(
        max_length=7, 
        choices=QUERY_STATUS, 
        default="pending", 
        blank = False, 
        null = False
    )
    # Name of the analyst who performed the query
    query_analyst = models.CharField(
        max_length=128,
        blank = False,
        null = False
    )
    # Name of the case associated with the query
    query_case_name = models.CharField(
        max_length=256,
        blank = False,
        null = False
    )
    # Date when the query was conducted
    # Updated to be set on the backend instead of frontend
    query_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return str(self.pk) + '-' + self.query_case_name

# Model to store metadata related to each hash entry
class SlhasherHash(models.Model):
    VT_STATUS = {
        ("pending", "Pending"),
        ("success", "Success"),
        ("error", "Error"),
        ("unknown", "Unknown"),
    }
    # Primary user input
    slhasher_hash = models.CharField(
        max_length=64,
        blank = False,
        null = False
    )
    vt_status = models.CharField(
        max_length=7,
        choices=VT_STATUS,
        default="pending",
        blank = False,
        null = False
    )
    # VirusTotal hash metadata
    vt_meta = models.TextField()

    def __str__(self):
        return self.slhasher_hash

# Intermediary model to establish a many-to-many relationship between Slhasher queries and hash entries
# This model links hash objects to multiple Slhasher queries if necessary
class QueryHashJoin(models.Model):
    # Foreign key linking to a SlhasherQuery
    query_id = models.CharField(
        max_length=64, 
        blank = False, 
        null = False
    )
    # Foreign key linking to a SlhasherHash
    hash_id = models.CharField(
        max_length=64, 
        blank = False, 
        null = False
    )

    def __str__(self):
        return str(self.pk) + '-' + self.query_id + '-' + self.hash_id