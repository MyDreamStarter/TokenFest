"use client"
import Nav3 from '@/components/common/Nav/nav3'
import React, { useState } from 'react'

const Page = () => {
  // const [showPayNow, setShowPayNow] = useState(false);

  return (
    <div>
      <Nav3 />
      <div className='min-h-[630px] bg-[#BDE3F0]'>
        <h1 className='p-6 text-black text-2xl mb-1 font-Raleway'>DE-Subscription</h1>
        <div className='flex flex-wrap mx-8 gap-6 my-4'>
          <div className='flex-grow sm:flex-none h-[450px] w-full sm:w-[350px] p-6 bg-amber-400'>
            <div className='bg-cover bg-center h-[260px] w-full sm:w-[300px]' style={{ backgroundImage: `url('/subscription.png')` }}>
            </div>
            <h1 className='text-black font-Raleway text-2xl font-semibold leading-normal capitalize py-4'>Your Secret Content</h1>
            <button className='p-4 bg-black text-white rounded-lg'>Subscribe Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page;
