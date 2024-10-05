import re

from rest_framework import serializers
from .models import SlhasherHash, SlhasherQuery, QueryHashJoin


# Serializer for SlhasherHash objects
class SlhasherHashSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlhasherHash
        fields = '__all__'

    def validate_slhasher_hash(self, hash):
        # Ensure hash is a SHA256 hash
        if not re.match(r'^[A-Fa-f0-9]{64}$', hash):
            raise serializers.ValidationError('Hash must be a SHA256 hash.')
        return hash


# Serializer for SlhasherQuery objects
class SlhasherQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = SlhasherQuery
        fields = '__all__'

    def validate(self, request):
        # Ensure query case name and case analyst contain only alphanumeric characters and spaces
        query_case_name = request.get('query_case_name', '')
        query_analyst = request.get('query_analyst', '')

        # Check if query_case_name and query_analyst contain only alphanumeric characters or spaces
        if not re.match(r'^[A-Za-z0-9\s]+$', query_case_name):
            raise serializers.ValidationError('Case name must only contain alphanumeric characters and spaces.')

        if not re.match(r'^[A-Za-z0-9\s]+$', query_analyst):
            raise serializers.ValidationError('Analyst name must only contain alphanumeric characters and spaces.')
        return request


# Serializer for QueryHashJoin objects
class QueryHashJoinSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueryHashJoin
        fields = '__all__'

