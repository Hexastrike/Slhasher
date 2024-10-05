from django.contrib import admin
from .models import SlhasherQuery, SlhasherHash, QueryHashJoin

admin.site.register(SlhasherQuery)
admin.site.register(SlhasherHash)
admin.site.register(QueryHashJoin)