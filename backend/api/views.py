import ast
import threading
import csv

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.http import HttpResponse

from .models import SlhasherHash, SlhasherQuery, QueryHashJoin
from .serializers import SlhasherHashSerializer, SlhasherQuerySerializer, QueryHashJoinSerializer

from .lib.proc_vt import vt_proc_ha, vt_proc_df

class SlhasherHashView(APIView):
    """
    View to retrieve all hashes and create a new hash entry.
    """

    def get(self, request):
        hashes = SlhasherHash.objects.all()
        serializer = SlhasherHashSerializer(hashes, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class SlhasherHashDetailView(APIView):
    """
    View to retrieve hash details by hash value.
    """

    def get(self, request, hash_id):
        try:
            hash_obj = SlhasherHash.objects.get(pk=hash_id)
            serializer = SlhasherHashSerializer(hash_obj)
            return Response({
                'success': True,
                'data': serializer.data
            })
        
        except SlhasherHash.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Hash not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        except ValueError:
            return Response({
                'success': False,
                'error': 'Failed to retrieve hash'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SlhasherQueryView(APIView):
    """
    View to retrieve all queries and create a new query entry.
    """

    def get(self, request):
        queries = SlhasherQuery.objects.all()
        serializer = SlhasherQuerySerializer(queries, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def post(self, request):
        with transaction.atomic():
            try:
                # Extract the data from the request
                query_details = request.data.get('query', {}) 
                hashes = request.data.get('hashes', []) 

                # Hash deduplication
                hashes = list(set(hashes))

                # Serialize Slhasher query
                query_serializer = SlhasherQuerySerializer(data=query_details)

                if query_serializer.is_valid():
                    query = query_serializer.save()
                else:
                    return Response({
                        'success': False,
                        'errors': query_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

                valid_hashes = []
                
                # Validate hashes
                for hash in hashes:
                    hash_serializer = SlhasherHashSerializer(data={
                        'slhasher_hash': hash, 
                        'vt_meta': '{}'
                    })
                    # Save the hash object but leave further processing for later
                    if hash_serializer.is_valid():
                        hash_obj = hash_serializer.save()
                        valid_hashes.append(hash_obj)
                    else:
                        return Response({
                            'success': False,
                            'errors': hash_serializer.errors
                        }, status=status.HTTP_400_BAD_REQUEST)

                # Create QueryHashJoin entries for valid hashes only
                for hash_obj in valid_hashes:
                    join_serializer = QueryHashJoinSerializer(data={
                        'query_id': query.pk,
                        'hash_id': hash_obj.pk
                    })

                    if join_serializer.is_valid():
                        join_serializer.save()
                    else:
                        # Delete related hash entry and skip to next hash value
                        hash_obj.delete()
                        continue

                # Perform VirusTotal asynchronusly on valid hashes only
                threading.Thread(target=vt_proc_ha, args=(valid_hashes,)).start()

                # Return immediate response, processing will be done in the background
                return Response({
                    'success': True,
                    'data': {
                        'id': query_serializer.data.get('id'),
                        'query_date': query_serializer.data.get('query_date'),
                        'query_case_name': query_serializer.data.get('query_case_name'),
                        'query_analyst': query_serializer.data.get('query_analyst'),
                        'query_status': query_serializer.data.get('query_status'),
                    },
                }, status=status.HTTP_201_CREATED)
            
            except Exception as e:
                # If any exception occurs, return a 500 response
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SlhasherQueryDetailView(APIView):
    """
    View to retrieve query details by query ID.
    """

    def get(self, request, query_id):
        try:
            query_obj = SlhasherQuery.objects.get(pk=query_id)
            serializer = SlhasherQuerySerializer(query_obj)
            return Response({
                'success': True,
                'data': serializer.data
            })

        except SlhasherQuery.DoesNotExist:
            return Response({
                'success': False,
                'error': "Query not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except ValueError:
            return Response({
                'success': False,
                'error': 'Failed to retrieve query'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, query_id):
        try:
            # Ensure database operations are treated as a single transaction
            # If part of the transaction failrs, all operations within the block are rolled back
            with transaction.atomic():
                # Delete both the Slhasher query and the corresponding joining table entries
                query_obj = SlhasherQuery.objects.get(pk=query_id).delete()
                QueryHashJoin.objects.filter(pk=query_id).delete()

                return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)

        except SlhasherQuery.DoesNotExist:
            return Response({
                'success': False,
                'error': "Query not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except ValueError:
            return Response({
                'success': False,
                'error': 'Failed to retrieve query'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QueryHashJoinView(APIView):
    """
    View to create a new query-hash join entry.
    """

    def get(self, request):
        joins = QueryHashJoin.objects.all()
        joins_serializer = QueryHashJoinSerializer(joins, many=True)
        return Response({
            'success': True,
            'data': joins_serializer.data
        })

class QueryRelatedHashesView(APIView):
    """
    View to retrieve hashes related to a specific query ID.
    """

    def get(self, request, query_id):
        try:
            # Get query detailst for error handling
            query_obj = SlhasherQuery.objects.get(pk=query_id)

            # Get query joins where query_id equals the given id
            join_entries = QueryHashJoin.objects.filter(query_id=query_id)

            # Get all hash ids the previously collected join ids reference
            slhasher_hash_ids = [entry.hash_id for entry in join_entries]

            # Get all hash objects
            slhasher_hashes = SlhasherHash.objects.filter(pk__in=slhasher_hash_ids)

            # Serialize the hash objects into a JSON response using the SlhasherHashSerializer
            serialized_hashes = SlhasherHashSerializer(slhasher_hashes, many=True)

            # Manually format the serialized data
            formatted_hashes = []
            for hash_obj in serialized_hashes.data:
                # Parse VT_meta
                vt_meta = hash_obj.get('vt_meta', {})
                vt_meta = ast.literal_eval(vt_meta)

                # Helpers
                vt_meta_attributes = vt_meta.get('data', {}).get('attributes', {})
                vt_meta_last_analysis_stats = vt_meta.get('data', {}).get('attributes', {}).get('last_analysis_stats', {})
            
                formatted_hashes.append({
                    'slhasher_hash_id': hash_obj.get('id'),
                    'slhasher_hash': hash_obj.get('slhasher_hash'),
                    'vt_status': hash_obj.get('vt_status'),
                    'vt_detections': 
                        int(
                            vt_meta_last_analysis_stats.get('malicious', 0) + 
                            vt_meta_last_analysis_stats.get('suspicious', 0)
                        ),
                    'vt_detections_vendors': 
                        int(
                            vt_meta_last_analysis_stats.get('malicious', 0) + 
                            vt_meta_last_analysis_stats.get('suspicious', 0) + 
                            vt_meta_last_analysis_stats.get('undetected', 0)
                        ),
                    'vt_meaningful_name': vt_meta_attributes.get('meaningful_name', ''),
                    'vt_filenames': ' '.join(vt_meta_attributes.get('names', [])),
                    'vt_md5': vt_meta_attributes.get('md5', ''),
                    'vt_sha1': vt_meta_attributes.get('sha1', ''),
                    'vt_sha256': vt_meta_attributes.get('sha256', ''),
                    'vt_filesize': str(vt_meta_attributes.get('size', '')),

                })

            return Response({
                'success': True,
                'data': {
                    'hashes': formatted_hashes
                }
            })

        except SlhasherQuery.DoesNotExist:
            return Response({
                'success': False,
                'error': "Query not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        except ValueError:
            return Response({
                'success': False,
                'error': 'Failed to retrieve hashes'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SlhasherHashVTDownload(APIView):
    """
    View to retrieve a file's download URL from VirusTotal
    """

    def get(self, request, hash_id):
        try:
            hash_obj = SlhasherHash.objects.get(pk=hash_id)

            # If VT status is not 'success' return a 404
            if hash_obj.vt_status != 'success':
                return Response({
                    'success': False,
                    'error': 'Failed to retrieve download URL'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Get download URL
            # Use slhasher_hash value as input value
            (vt_proc_df_status_code, vt_proc_df_payload) = vt_proc_df(hash_obj.slhasher_hash)

            if vt_proc_df_status_code == 200:
                return Response({
                    'success': True,
                    'data': vt_proc_df_payload
                })
            elif vt_proc_df_status_code == 401:
                return Response({
                    'success': False,
                    'error': vt_proc_df_payload
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Fallback error in case of any status code other than 200 or 401
            return Response({
                'success': False,
                'error': vt_proc_df_payload
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except SlhasherHash.DoesNotExist:
            return Response({
                'success': False,
                'error': "Hash not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except ValueError:
            return Response({
                'success': False,
                'error': 'Failed to retrieve download URL'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class QueryRelatedHashesDownloadCSVView(APIView):
    """
    View to export hashes related to a specific query as a CSV file.
    """

    def get(self, request, query_id):
        try:
            # Get query detailst for error handling
            query_obj = SlhasherQuery.objects.get(pk=query_id)

            # Get query joins where query_id equals the given id
            join_entries = QueryHashJoin.objects.filter(query_id=query_id)

            # Get all hash ids the previously collected join ids reference
            slhasher_hash_ids = [entry.hash_id for entry in join_entries]

            # Get all hash objects
            slhasher_hashes = SlhasherHash.objects.filter(pk__in=slhasher_hash_ids)

            # Serialize the hash objects into a JSON response using the SlhasherHashSerializer
            serialized_hashes = SlhasherHashSerializer(slhasher_hashes, many=True)

            # Create the HttpResponse object with CSV header
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="hashes_query_{query_id}.csv"'

            # Create a CSV writer object
            writer = csv.writer(response)

            # Write CSV headers
            writer.writerow(['Hash ID', 'Hash', 'VT Detection Rate', 'VT Meaningful Name'])

            # Write hash data to CSV
            for hash_obj in serialized_hashes.data:

                # Helpers
                vt_meta = hash_obj.get('vt_meta', {})
                vt_meta = ast.literal_eval(vt_meta)

                vt_meta_attributes = vt_meta.get('data', {}).get('attributes', {})
                vt_meta_last_analysis_stats = vt_meta.get('data', {}).get('attributes', {}).get('last_analysis_stats', {})

                writer.writerow([
                    hash_obj.get('id'),
                    hash_obj.get('slhasher_hash'),
                    f'{int(vt_meta_last_analysis_stats.get("malicious", 0) + vt_meta_last_analysis_stats.get("suspicious", 0))} / {int(vt_meta_last_analysis_stats.get("malicious", 0) +  vt_meta_last_analysis_stats.get("suspicious", 0) + vt_meta_last_analysis_stats.get("undetected", 0) )}',
                    vt_meta_attributes.get('meaningful_name', '')
                ])

            return response

        except SlhasherQuery.DoesNotExist:
            return Response({
                'success': False,
                'error': "Query not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        except ValueError:
            return Response({
                'success': False,
                'error': 'Failed to retrieve hashes for CSV export'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)