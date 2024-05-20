"use client"
import DashboardNav from '@/components/common/Nav/dashboardnav'
import React, { useState } from 'react'

const page = () => {
const [showPayNow, setShowPayNow] = useState(false);
  return (
    <div>
      <DashboardNav />
      <div className='min-h-[630px] bg-[#BDE3F0]'>
        <h1 className='p-6 text-black text-2xl mb-1 font-Raleway'>Started Events</h1>
        <div className='flex flex-wrap mx-8 gap-6 my-4'>
          <button className='inline-flex px-6 py-3 rounded-full bg-amber-400 text-black text-center font-Raleway text-base font-medium capitalize'>
            Your Events
          </button>
          {!showPayNow && (
            <button 
              onClick={() => setShowPayNow(true)} 
              className='inline-flex px-6 py-3 justify-center items-center rounded-full bg-blue-800 text-white'>
              Pay Now
            </button>
          )}
          {showPayNow && (
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
              <div className='bg-blue-800 p-8 rounded-lg shadow-md text-white'>
                <h2 className='text-xl font-semibold mb-4'>Choose Payment Method</h2>
                <h2 className='text-white text-center font-Raleway text-sm font-light leading-normal capitalize'>
                  Select the convenience of email payments or the <br /> security of Espro to complete your transaction.
                </h2>
                <a href="/pay">
                  <button className='block mx-auto px-16 py-2 bg-white text-black rounded-full mt-4'>
                    Pay by email
                  </button>
                </a>
                <button className='block mx-auto px-16 py-2 bg-white text-black rounded-full mt-4'>
                  Pay by espro
                </button>
                <button 
                  onClick={() => setShowPayNow(false)} 
                  className='block mx-auto px-4 py-2 bg-white text-black rounded-lg mt-2'>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        <div className='flex flex-wrap mx-8 gap-6 my-4'>
          <div className='h-[400px] w-full sm:w-[350px] p-6 bg-amber-400'>
            <div className='bg-cover bg-center h-[260px] w-full' style={{ backgroundImage: `url('/startedevents.png')` }}>
            </div>
            <h1 className='text-black font-Raleway text-2xl font-semibold leading-normal capitalize py-4'>
              NFT Details
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page