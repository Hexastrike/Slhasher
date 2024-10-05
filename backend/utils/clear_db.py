import utils_setup
from api.models import SlhasherHash, SlhasherQuery, QueryHashJoin

SlhasherHash.objects.all().delete()
SlhasherQuery.objects.all().delete()
QueryHashJoin.objects.all().delete()

print("DB cleared...")