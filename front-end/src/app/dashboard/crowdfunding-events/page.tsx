"use client"
import DashboardNav from '@/components/common/Nav/dashboardnav'
import React, { useState } from 'react'

const Page = () => {
  // const [showPayNow, setShowPayNow] = useState(false);

  return (
    <div>
      <DashboardNav />
      <div className='min-h-[630px] bg-[#BDE3F0]'>
        <h1 className='p-6 text-black text-2xl mb-1 font-Raleway'>Crowdfunding-Events</h1>
        <div className='flex flex-wrap mx-8 gap-6 my-4'>
          <div className='flex-grow sm:flex-none h-[400px] w-full sm:w-[350px] p-6 bg-amber-400'>
            <div className='bg-cover bg-center h-[260px] w-full sm:w-[300px]' style={{ backgroundImage: `url('/crowdfund.png')` }}>
            </div>
            <h1 className='text-black font-Raleway text-2xl font-semibold leading-normal capitalize py-4'>Your Music Collection</h1>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page;
