import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { IconContext } from 'react-icons';
import { CiCirclePlus } from 'react-icons/ci';

import { fetchQueries } from '@/api/HXAPI';
import { HXQueryPostRes } from '@/lib/HXTypes';
import './Sidebar.css';

// Define the props type for the Sidebar component
interface SidebarProps {
  setIsSidebarHovered: (hovered: boolean) => void;
  isSidebarHovered: boolean;
  refreshQueries: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ setIsSidebarHovered, isSidebarHovered, refreshQueries }) => {

  const [slhasherQueries, setslhasherQueries] = useState<HXQueryPostRes['data'][]>([]);

  useEffect(() => {
    const getQueries = async () => {
      const queries = await fetchQueries();
      setslhasherQueries(queries.data.reverse());
    };

    getQueries();
  }, [refreshQueries]);

  return (
    <div 
      className={`hx-sidebar fixed left-0 top-0 z-10 h-screen py-8 px-4 bg-secondary flex flex-col space-y-4 overflow-y-scrll overflow-x-hidden ${isSidebarHovered ? 'lg:w-96' : 'lg:w-72'} transition-all duration-600 ease-in-out`}
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
    >
      <div className='flex flex-col space-y-1'>
        <h3 className='text-3xl px-4 uppercase font-semibold'>Slhasher</h3>
        <h3 className='text-xs px-4 text-secondary-foreground'>by Maurice Fielenbach</h3>
      </div>
      <ul>
        <li>
          <NavLink to='/' className='py-2 px-4 hover:bg-background rounded-md block'>
            <div className='flex items-center lg:space-x-4'>
              <IconContext.Provider value={{ color: '#4fe2b5', className: 'text-xl' }}>
                <div>
                  <CiCirclePlus />
                </div>
              </IconContext.Provider>
              <span>New Bulk Hash Lookup</span>  
            </div>
          </NavLink>
        </li>
      </ul>
      <h3 className='text-lg py-2 px-4'>Recent Queries</h3>
      <ul>
        {slhasherQueries.length !== 0 ? (
          slhasherQueries.map((query) => (
            <li key={query.id}>
              <NavLink to={`/queries/${query.id}`} className='my-2 py-2 px-4 text-secondary-foreground hover:bg-background hover:text-foreground rounded-md block'>
                <div className='flex items-center lg:space-x-4'>
                  <div className='flex flex-col w-full'>
                    <span className='block truncate'>{query.query_date} - {query.query_case_name}</span>
                    <span className='block text-xs truncate'>{query.query_analyst}</span>
                  </div>
                </div>
              </NavLink>
            </li>
          ))
        ) : (
          <li className='py-2 px-4'>No queries available yet...</li>
        )}
      </ul>
    </div>
  )
}

export default Sidebar