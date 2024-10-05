import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { HXHash } from '@/lib/HXTypes';
import { HXHashColumns } from '@/lib/HXHashTableColumns';
import { HashTable } from '@/components/HashTable';
import { fetchQueryHashes } from '@/api/HXAPI'

function Query() {

  const [hashes, setHashes] = useState<HXHash[]>([]);
  const routeParams = useParams();
  const navigate = useNavigate();

  const slhasherCSVDownloadURL = `http://127.0.0.1:8000/api/queries/${parseInt(routeParams.id, 10)}/hashes/download/`;

  useEffect(() => {
    async function fetchHashes() {

      // React router parameter validation
      // Must be updated in case the query priamry key changes
      const HXQueryID = routeParams.id ? parseInt(routeParams.id, 10) : NaN;

       if (isNaN(HXQueryID)) {
        navigate('/404');
        return;
      }
      
      try {
        const response = await fetchQueryHashes(HXQueryID);

        if (response.success) {setHashes(response.data.hashes)} 
        else {navigate('/404');}

      } 
      catch (err) {navigate('/404');}
    }

    fetchHashes();

  }, [routeParams.id, navigate])

  return (
    <div className="w-full">
      <h1 className='text-3xl mb-8'>Slhasher Query {routeParams.id}</h1>
      <HashTable slhasherCSVDownloadURL={slhasherCSVDownloadURL} columns={HXHashColumns} data={hashes} />
    </div>
  )
}

export default Query