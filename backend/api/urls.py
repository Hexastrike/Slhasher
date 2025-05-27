# api/urls.py
from django.urls import re_path, path

from .views import (
    ViewSlasherQueries,
    ViewSlasherHashVTDownload,
    ViewSlasherQueryCSVExport,
)

UUID_REGEX = r"(?P<uuid>[0-9a-fA-F-]{36})"

urlpatterns = [
    # List all queries - /queries/
    re_path(r"^queries/?$", ViewSlasherQueries.as_view(), name="query-list"),

    # Single-query detail - /queries/<uuid>/
    re_path(
        rf"^queries/{UUID_REGEX}/?$",
        ViewSlasherQueries.as_view(),
        name="query-detail",
    ),

    # CSV export - /queries/<uuid>/export/csv/
    re_path(
        rf"^queries/{UUID_REGEX}/export/csv/?$",
        ViewSlasherQueryCSVExport.as_view(),
        name="query-export-csv",
    ),

    # VirusTotal download - /hashes/<uuid>/download/
    re_path(
        rf"^hashes/{UUID_REGEX}/download/?$",
        ViewSlasherHashVTDownload.as_view(),
        name="hash-download",
    ),
]
