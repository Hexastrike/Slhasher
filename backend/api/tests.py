from rest_framework.test import APITestCase
from rest_framework import status

from .models import SlhasherHash

# Integration tests
class SlhasherHashAPITest(APITestCase):
    def setUp(self):
        self.api_endpoint = '/api/hashes/'
        SlhasherHash.objects.create(hash_sha256='BADF4752413CB0CBDC03FB95820CA167F0CDC63B597CCDB5EF43111180E088B0', vt_meta='Testing metadata for cmd.exe.')

    def test_get_all_hashes(self):
        response = self.client.get(self.api_endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_specific_hash(self):
        response = self.client.get(self.api_endpoint + 'BADF4752413CB0CBDC03FB95820CA167F0CDC63B597CCDB5EF43111180E088B0/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_nonexisting_hash(self):
        response = self.client.get(self.api_endpoint + 'some_random_nonexisting_hash_value/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_hash(self):
        sample_hash = {'hash_sha256': '36FFFAB256A48C6FB76A4D1199193195E7707E9019414AC87572C3DBC810BC6C', 'vt_meta': 'Testing metadata for 32 bit cmd.exe.'}
        response = self.client.post(self.api_endpoint, sample_hash)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)