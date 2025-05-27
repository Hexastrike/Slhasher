import utils_setup
from api.models import SlasherHash, SlasherQuery, QueryHashJoin

SlasherHash.objects.all().delete()
SlasherQuery.objects.all().delete()
QueryHashJoin.objects.all().delete()

print("DB cleared...")