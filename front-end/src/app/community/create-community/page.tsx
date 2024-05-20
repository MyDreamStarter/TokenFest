"use client"
import Nav3 from '@/components/common/Nav/nav3'
import React from 'react'

const page = () => {
  return (
    <div>
      <Nav3 />
      <div
        className="flex flex-col items-center"
        style={{
          backgroundImage: `url('/communityback.png')`,
          backgroundSize: 'cover',
          minHeight: '1050px',
        }}
      >
        <div className='flex flex-col lg:flex-row h-auto lg:h-[480px] w-full lg:w-[790px] mt-8 mx-4 lg:mx-auto rounded-lg border border-black opacity-80 bg-blue-200 mix-blend-darken backdrop-blur-2 p-8'>
          <div
            className='opacity-100 bg-cover bg-center h-[250px] lg:h-[420px] w-full lg:w-[250px]'
            style={{
              backgroundImage: `url('/luffy.png')`,
            }}
          ></div>
          <div className='p-8 flex flex-col justify-center'>
            <h1 className='text-black font-space-mono text-2xl lg:text-4xl font-bold leading-tight lg:leading-72'>
              Start your own <br />voyage in web 3
            </h1>
            <h1 className='mt-4 lg:mt-8 text-black font-space-mono text-base lg:text-22 font-bold italic leading-normal lg:leading-32'>
              Explore Dapp with contribution and bounties.
            </h1>
            <div className='mt-4 lg:mt-8 flex flex-wrap gap-4'>
              <button className='text-yellow-400 font-space-mono text-base font-normal leading-6 rounded-lg bg-blue-800 shadow-lg backdrop-blur-sm p-2'>
                Meet new friends
              </button>
              <button className='text-yellow-400 font-space-mono text-base font-normal leading-6 rounded-lg bg-blue-800 shadow-lg backdrop-blur-sm p-2'>
                Earn rewards
              </button>
              <button className='text-yellow-400 font-space-mono text-base font-normal leading-6 rounded-lg bg-blue-800 shadow-lg backdrop-blur-sm p-2'>
                Collect NFTs
              </button>
            </div>
          </div>
        </div>

        <div className='flex flex-wrap justify-center lg:justify-start mt-12 lg:mt-24 gap-6 mx-4 lg:mx-96'>
          <div
            className='bg-cover bg-center h-[200px] w-[200px] lg:h-[330px] lg:w-[250px]'
            style={{
              backgroundImage: `url('/luffy2.png')`,
            }}
          ></div>
          <div
            className='bg-cover bg-center h-[200px] w-[200px] lg:h-[330px] lg:w-[250px]'
            style={{
              backgroundImage: `url('/game1.png')`,
            }}
          ></div>
          <div
            className='bg-cover bg-center h-[200px] w-[200px] lg:h-[330px] lg:w-[200px]'
            style={{
              backgroundImage: `url('/game2.png')`,
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default page