from __future__ import annotations

from typing import Any

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import (
    ModelSlasherHash,
    ModelSlasherIP,
    ModelSlasherDomain,
)

# Helpers
URL = reverse("queries")

OK  = {
    "HASH_a": "a" * 64,
    "HASH_b": "b" * 64,
    "HASH_c": "c" * 64,
    "HASH_d": "d" * 64,
    "HASH_e": "e" * 64,
    "HASH_f": "f" * 64,
    "HASH_A": "A" * 64,
    "HASH_B": "B" * 64,
    "HASH_C": "C" * 64,
    "HASH_D": "D" * 64,
    "HASH_E": "E" * 64,
    "HASH_F": "F" * 64,
    "HASH_0": "0" * 64,
    "HASH_9": "9" * 64,
    "IPV4_0": "0.0.0.0",
    "IPV4_1": "1.1.1.1",
    "IPV4_2": "2.2.2.2",
    "IPV4_3": "3.3.3.3",
    "IPV4_4": "4.4.4.4",
    "IPV4_5": "5.5.5.5",
    "IPV4_6": "6.6.6.6",
    "IPV4_7": "7.7.7.7",
    "IPV4_8": "8.8.8.8",
    "IPV4_9": "9.9.9.9",
    "IPV4_MAX": "255.255.255.255",
    "IPV4_Loopback": "127.0.0.1",
}

BAD = { 
    "HASH":   "deadbeef",
    "IPV4":   "999.999.999.999",
    "IPV6":   "2001:db8:::1",
    "DOMAIN": "-bad-.com",
}

def base_body(**overrides: Any) -> dict[str, Any]:
    """Return a minimal valid payload with optional overrides."""
    body = {
        "query": {
            "query_analyst": "Alice",
            "query_case_name": "Case-1",
        },
        "hashes": [],
        "ips": [],
        "domains": [],
    }
    body.update(overrides)
    return body


class QueriesAPITests(APITestCase):
    # Utilities available to every test
    def _post(self, body: dict[str, Any]):
        """POST wrapper that returns (resp, data) with JSON parsed."""
        resp = self.client.post(URL, body, format="json")
        return resp, resp.json()

    def _get_by_uuid(self, uuid: str):
        resp = self.client.get(f"{URL}{uuid}")
        return resp, resp.json()

    # Positive scenarios
    def test_post__one_family_each__201_and_get(self):
        # Hash / IP / domain alone must succeed and appear in follow-up GET.
        cases = [
            ("hashes", [OK["HASH_a"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_b"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_c"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_d"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_e"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_f"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_A"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_B"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_C"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_D"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_E"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_F"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_0"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_9"]], ModelSlasherHash, 1),
            ("hashes", [OK["HASH_a"], OK["HASH_b"], OK["HASH_c"], OK["HASH_d"], OK["HASH_e"], OK["HASH_f"]], ModelSlasherHash, 6),
            ("hashes", [OK["HASH_A"], OK["HASH_B"], OK["HASH_C"], OK["HASH_D"], OK["HASH_E"], OK["HASH_F"]], ModelSlasherHash, 6),

            ("ips", [OK["IPV4_0"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_1"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_2"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_3"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_4"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_5"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_6"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_7"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_8"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_9"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_MAX"]], ModelSlasherIP, 1),
            ("ips", [OK["IPV4_Loopback"]], ModelSlasherIP, 1),
        ]
        for field, values, model, expected_cnt in cases:
            with self.subTest(field=field, values=values):
                body = base_body(**{field: values})
                post, pdata = self._post(body)

                self.assertEqual(post.status_code, status.HTTP_201_CREATED)

                uuid = pdata["data"]["uuid"]
                get, gdata = self._get_by_uuid(uuid)

                self.assertEqual(get.status_code, status.HTTP_200_OK)
                self.assertEqual(len(gdata["data"][field]), expected_cnt)

                # Sanity-check we got what we stored
                if field == "hashes":
                    self.assertEqual({obj["slasher_hash"] for obj in gdata["data"][field]}, set(values))
                if field == "ips":
                    self.assertEqual({obj["slasher_ip"] for obj in gdata["data"][field]}, set(values))
                if field == "domains":
                    self.assertEqual({obj["slasher_domain"] for obj in gdata["data"][field]}, set(values))

    # def test_post__mixed_indicators__201_and_all_echoed(self):
    #     body = base_body(
    #         hashes=[OK["HASH"]],
    #         ips=[OK["IPV4"], OK["IPV6"]],
    #         domains=[OK["DOMAIN"]],
    #     )
    #     post, pdata = self._post(body)
    #     self.assertEqual(post.status_code, status.HTTP_201_CREATED)
    #     uuid = pdata["data"]["uuid"]

    #     get, gdata = self._get_by_uuid(uuid)
    #     self.assertEqual(get.status_code, status.HTTP_200_OK)
    #     self.assertEqual(
    #         {h["slasher_hash"] for h in gdata["data"]["hashes"]},
    #         {OK["HASH"]},
    #     )
    #     self.assertEqual(
    #         {i["slasher_ip"] for i in gdata["data"]["ips"]},
    #         {OK["IPV4"], OK["IPV6"]},
    #     )
    #     self.assertEqual(
    #         {d["slasher_domain"] for d in gdata["data"]["domains"]},
    #         {OK["DOMAIN"]},
    #     )

    # # ---------------------------------------------------------------------
    # # 2️⃣  validation errors
    # # ---------------------------------------------------------------------
    # def test_post__invalid_indicator_literals__400(self):
    #     bad_cases = [
    #         ("hashes", [BAD["HASH"]]),
    #         ("ips",    [BAD["IPV4"]]),
    #         ("ips",    [BAD["IPV6"]]),
    #         ("domains",[BAD["DOMAIN"]]),
    #     ]
    #     for field, values in bad_cases:
    #         with self.subTest(bad=values):
    #             body = base_body(**{field: values})
    #             resp, data = self._post(body)
    #             self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
    #             self.assertIn(field, data["errors"])

    # def test_post__blank_analyst_case_matrix__400(self):
    #     for analyst, case, errkeys in [
    #         ("",   "",   {"query_analyst", "query_case_name"}),
    #         ("Bob","",   {"query_case_name"}),
    #         ("",  "Foo", {"query_analyst"}),
    #     ]:
    #         with self.subTest(analyst=analyst, case=case):
    #             body = base_body(
    #                 analyst=analyst,
    #                 case=case,
    #                 hashes=[OK["HASH"]],
    #             )
    #             resp, data = self._post(body)
    #             self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
    #             self.assertEqual(set(data["errors"].keys()), errkeys)

    # def test_post__unknown_top_level_key__400(self):
    #     body = base_body(extra="boom")
    #     resp, data = self._post(body)
    #     self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn("detail", data["errors"])

    # def test_post__missing_required_key__400(self):
    #     body = {"query": {"query_analyst": "A", "query_case_name": "C"}}
    #     resp, data = self._post(body)
    #     self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertEqual(set(data["errors"].keys()), {"ips", "domains", "hashes"})

    # # ---------------------------------------------------------------------
    # # 3️⃣  non-JSON & malformed payloads
    # # ---------------------------------------------------------------------
    # def test_post__malformed_json__400(self):
    #     raw = b'{"hashes": ["abcd"...}'
    #     resp = self.client.generic("POST", URL, raw, "application/json")
    #     self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # def test_post__wrong_content_type__400(self):
    #     resp = self.client.post(
    #         URL, data="hashes=abcd", content_type="application/x-www-form-urlencoded"
    #     )
    #     self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # # ---------------------------------------------------------------------
    # # 4️⃣  GET edge-cases
    # # ---------------------------------------------------------------------
    # def test_get__bad_uuid_format__400(self):
    #     resp = self.client.get(f"{URL}not-a-uuid/")
    #     self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # def test_get__unknown_uuid__404(self):
    #     resp = self.client.get(f"{URL}123e4567-e89b-12d3-a456-426614174000/")
    #     self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    # # ---------------------------------------------------------------------
    # # 5️⃣  CORS / OPTIONS sanity
    # # ---------------------------------------------------------------------
    # def test_options__allow_header_and_json_schema(self):
    #     resp = self.client.options(URL)
    #     self.assertEqual(resp.status_code, status.HTTP_200_OK)
    #     self.assertIn("GET", resp["Allow"])
    #     self.assertIn("POST", resp["Allow"])
    #     self.assertEqual(resp["Content-Type"], "application/json")