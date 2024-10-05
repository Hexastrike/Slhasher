from django.urls import path
from .views import (
    SlhasherHashView,
    SlhasherHashDetailView,
    SlhasherHashVTDownload,
    SlhasherQueryView,
    SlhasherQueryDetailView,
    QueryHashJoinView,
    QueryRelatedHashesView,
    QueryRelatedHashesDownloadCSVView,
)

urlpatterns = [
    # Endpoint to get all hashes or create a new hash
    # path('hashes/', SlhasherHashView.as_view(), name='hashes'),

    # Endpoint to retrieve hash details by hash value
    # path('hashes/<str:hash_id>/', SlhasherHashDetailView.as_view(), name='hash-detail'),

    # Endpoint to get a file's download URL
    path('hashes/<str:hash_id>/vt-download/', SlhasherHashVTDownload.as_view(), name='hash-vt-download'),

    # Endpoint to get all queries or create a new query
    path('queries/', SlhasherQueryView.as_view(), name='queries'),

    # Endpoint to retrieve query details by query ID
    path('queries/<str:query_id>/', SlhasherQueryDetailView.as_view(), name='query-detail'),

    # Endpoint to create a new query-hash join
    # path('query-hash-joins/', QueryHashJoinView.as_view(), name='query-hash-join-create'),

    # Endpoint to retrieve related hashes for a specific query ID
    path('queries/<str:query_id>/hashes/', QueryRelatedHashesView.as_view(), name='query-related-hashes'),

    # Endpoint to download related hashes for a specific query ID as CSV
    path('queries/<str:query_id>/hashes/download/', QueryRelatedHashesDownloadCSVView.as_view(), name='query-related-hashes'),
]
