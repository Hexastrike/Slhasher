import django
import random
import string

from datetime import datetime
from django.utils.crypto import get_random_string

import utils_setup
from api.models import SlhasherHash, SlhasherQuery, QueryHashJoin

# Create 30 hashes and 5 queries
# Attach 10 random hashes to each query
NUM_HASHES = 30
NUM_QUERIES = 5
NUM_JOINS = 10

def create_hashes(num_hashes=NUM_HASHES):
    """Create and save a specified number of SlhasherHash entries with error handling."""
    hashes = []
    for _ in range(num_hashes):
        hash_value = get_random_string(64, allowed_chars=string.ascii_lowercase + string.digits)
        vt_meta = f"Metadata for {hash_value}"
        slhasher_hash = SlhasherHash(hash_sha256=hash_value, vt_meta=vt_meta)

        slhasher_hash.save()
        hashes.append(slhasher_hash)

    return hashes

def create_queries(num_queries=NUM_QUERIES):
    queries = []
    for i in range(num_queries):
        query_analyst = f"Analyst {i + 1}"
        query_case_name = f"Case {i + 1}"
        query_date = datetime.now().date()
        slhasher_query = SlhasherQuery(
            query_analyst=query_analyst, 
            query_case_name=query_case_name, 
            query_date=query_date
        )

        slhasher_query.save()
        queries.append(slhasher_query)

    return queries

def create_query_hash_joins(queries, hashes, num_joins=NUM_JOINS):
    for query in queries:
        selected_hashes = random.sample(hashes, NUM_JOINS)
        for hash_obj in selected_hashes:
            query_hash_join = QueryHashJoin(
                query_id=query.pk, 
                hash_id=hash_obj.hash_sha256
            )

            query_hash_join.save()

def populate_database():
    print("Creating hashes...")
    hashes = create_hashes()

    print("Creating queries...")
    queries = create_queries()

    print("Creating query-hash joins...")
    create_query_hash_joins(queries, hashes)

    print("Database population complete.")

if __name__ == "__main__":
    populate_database()
