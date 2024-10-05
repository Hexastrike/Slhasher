import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

import { fetchHashVTDownloadURL } from '@/api/HXAPI';
import { HXHash } from '@/lib/HXTypes';

export const HXHashColumns: ColumnDef<HXHash>[] = [
  {
    accessorKey: 'slhasher_hash',
    header: 'Slhasher Hash',
  },
  {
    accessorKey: 'vt_status',
    header: 'VT Status',
    cell: ({ row }) => {
      const vt_status = row.original.vt_status;

      let vtStatusClass = 'tag-grey';

      if (vt_status === 'success') {vtStatusClass = 'tag-green';} 
      else if (vt_status === 'unknown') {vtStatusClass = 'tag-grey';}
      else if (vt_status === 'pending') {vtStatusClass = 'tag-orange';}
      else if (vt_status === 'error') {vtStatusClass = 'tag-red';}

      return (
        <div className='w-[100px]'>
          <div className={vtStatusClass}>
            {/* Capitalize VirusTotal query status */}
            {vt_status.charAt(0).toUpperCase() + vt_status.slice(1)}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'vt_detections',
    header: 'VT Score',
    cell: ({ row }) => {
      const vtDetections = row.original.vt_detections;
      const vtVendors = row.original.vt_detections_vendors;
  
      let vtDetectionClass = 'tag-grey';
      let displayText = 'Unknown';
  
      if (row.original.vt_status === 'success') {
        if (vtDetections <= 3) {
          vtDetectionClass = 'tag-green';
          displayText = `${vtDetections} / ${vtVendors}`;
        } else if (vtDetections > 3 && vtDetections < 10) {
          vtDetectionClass = 'tag-orange';
          displayText = `${vtDetections} / ${vtVendors}`;
        } else if (vtDetections >= 10) {
          vtDetectionClass = 'tag-red';
          displayText = `${vtDetections} / ${vtVendors}`;
        }
      }
  
      return (
        <div className='w-[100px]'>
          <div className={vtDetectionClass}>
            {displayText}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'vt_meaningful_name',
    header: 'VT Filename',
  },
  {
    accessorKey: 'vt_filenames',
    header: 'VT Filenames',
  },
  {
    accessorKey: 'vt_md5',
    header: 'VT MD5',
  },
  {
    accessorKey: 'vt_sha1',
    header: 'VT SHA-1',
  },
  {
    accessorKey: 'vt_sha256',
    header: 'VT SHA-256',
  },
  {
    accessorKey: 'vt_filesize',
    header: 'VT Filesize',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      // Toast messages
      const { toast } = useToast()

      // Hash VT download action
      const handleHashVTDownload = async () => {
        try {
          const response = await fetchHashVTDownloadURL(row.original.slhasher_hash_id);
          if (response?.data) {
            // Open the URL in a new tab
            window.open(response.data, '_blank');
          } else if (response?.error) {
            toast({
              title: <div className='text-[#FF8C8C]'>Oops...</div>,
              description: response.error,
            })
          } else {
            console.error('Error while fetching VirusTotal download URL');
          }
        } catch (error) {
          console.error('Error while fetching VirusTotal download URL:', error);
        }
      };

      // Disable if hash query was not successful
      let disabled = true;
      if (row.original.vt_status === 'success') {disabled = false}
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem disabled={disabled} onClick={handleHashVTDownload}>Download from VirusTotal</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
]
