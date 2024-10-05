import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

function Layout() {
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const [refreshQueries, setRefreshQueries] = useState(false);

    const triggerSidebarRefresh = () => {
        setRefreshQueries(prevState => !prevState);
    };

    return (
        <div>
            <div className='flex'>
                <Sidebar 
                    refreshQueries={refreshQueries} 
                    setIsSidebarHovered={setIsSidebarHovered} 
                    isSidebarHovered={isSidebarHovered} 
                />
                <div className={`max-w-full w-full overflow-x-hidden ${isSidebarHovered ? 'lg:ml-96' : 'lg:ml-72'}`}>
                    <div className='px-24 h-[100px] flex items-center'>
                        <Header />
                    </div>
                    <div className='dark:text-white min-h-[calc(100vh-100px)] px-24 py-8'>
                        <div className="max-w-full mx-auto">
                            <Outlet context={{ triggerSidebarRefresh }} />
                            <Toaster />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout