"use client";
import { SiWebmoney } from "react-icons/si";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import { BsTelegram } from "react-icons/bs";
import Nav from "@/components/common/Nav";
import { lightTheme } from "@thirdweb-dev/react";


export default function Home() {
  return (

    <>
      <main className="flex flex-col md:flex-row" style={{
        backgroundImage: `url('/home.png')`, backgroundSize: 'cover',
        height: '710px',
      }}>
        <div className="flex justify-center items-center h-[50px] w-[150px] my-10 mx-10">
          <button>
            <w3m-button/>
          </button>
        </div>

        <div className="bg-cyan-100 h-[650px] w-full md:w-[750px] my-6 md:my-0 absolute  bottom-4 md:bottom-4 right-8 md:right-8 rounded-lg p-4 md:p-8">
          <Nav />
          <div className="h-[300px] w-full md:w-[700px] my-20 mt-30 mx-6">
            <div className="flex flex-wrap">
              <div className="border border-black rounded-full p-2 mr-2 mb-2 md:mb-0">
                <h1 className="text-black font-raleway font-medium text-5xl">Innovate. &nbsp;</h1>
              </div>
              <div className="border border-black rounded-full p-2 mb-2 md:mb-0">
                <h1 className="text-black font-raleway font-medium text-5xl">Funds.</h1>
              </div>
            </div>
            <div className="flex flex-wrap mt-2">
              <div className="border border-black rounded-full p-2 mr-2 mb-2 md:mb-0">
                <h1 className="text-black font-raleway font-medium text-5xl">Build. &nbsp;</h1>
              </div>
              <div className="border border-black rounded-full p-2">
                <h1 className="text-black font-raleway font-medium text-5xl">Collaborate.</h1>
              </div>
            </div>

            <h1 className="p-6 text-black font-raleway font-medium text-lg">Crowdfund Your Next Big Event with Us</h1>

            <button className="mx-6">
              <w3m-button/>
            </button>

            <div className="my-20 mx-6">
              <h1 className="text-black font-raleway font-medium text-xl">Where Dreams Meet Reality</h1>
            </div>
          </div>
        </div>
      </main>

      <div className="flex flex-col items-center p-12 md:p-36">
        <h1 className="text-black font-raleway font-medium text-3xl md:text-5xl leading-none text-center">
          We help local Communities to <span className="text-purple-600">Crowdfund</span> <br />
          and <span className="text-purple-600">Launch</span> Events Successfully
        </h1>
      </div>

      <div className="flex flex-col md:flex-row mx-8 md:mx-28 space-y-6 md:space-y-0 md:space-x-6">
        <div className="rounded-xl" style={{
          backgroundImage: `url('/build.png')`, backgroundSize: 'cover',
          height: '400px',
          width: '100%',
          maxWidth: '400px',
        }}>
          <div className="bg-white h-[40px] w-[200px] m-4 flex-shrink-0 rounded-full">
            <h1 className="p-2 text-black font-raleway font-semibold text-base">1.Build Your Community</h1>
          </div>
          <h1 className="text-white font-raleway font-semibold text-base p-6 mt-60">Shape a digital community where you and like-minded individuals govern together.</h1>
        </div>

        <div className="rounded-xl" style={{
          backgroundImage: `url('/plan.png')`, backgroundSize: 'cover',
          height: '400px',
          width: '100%',
          maxWidth: '400px',
        }}>
          <div className="bg-white h-[40px] w-[200px] m-4 flex-shrink-0 rounded-full">
            <h1 className="p-2 text-black font-raleway font-semibold text-base">2.Plan your Events</h1>
          </div>
          <h1 className="text-white font-raleway font-semibold text-base p-6 mt-60">Easily organize, manage, and spread the word about your gatherings.</h1>
        </div>

        <div className="rounded-xl" style={{
          backgroundImage: `url('/earn.png')`, backgroundSize: 'cover',
          height: '400px',
          width: '100%',
          maxWidth: '400px',
        }}>
          <div className="bg-white h-[40px] w-[200px] m-4 flex-shrink-0 rounded-full">
            <h1 className="p-2 text-black font-raleway font-semibold text-base">3.Earn with Events</h1>
          </div>
          <h1 className="text-white font-raleway font-semibold text-base p-6 mt-60">Enjoy a portion of event earnings by holding relevant NFTs.</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mx-8 md:mx-48">
        <div className="bg-blue-200 h-[400px] w-full md:w-[700px] mt-16 md:mt-44 p-4 md:p-8">
          <h1 className="text-black font-raleway font-medium text-3xl md:text-4xl mt-12 md:mt-28 mx-4 md:mx-20">Create Communities, <br />Launch Events Effortlessly</h1>
          <button className="mx-4 md:mx-20 mt-8">
          <w3m-button/>
          </button>
        </div>
        <div className="h-[400px] w-full md:w-[450px] mt-16 md:mt-44" style={{
          backgroundImage: `url('/create.png')`, backgroundSize: 'cover'
        }}></div>
      </div>

      <footer className="mt-20">
        <div className="py-4 text-black text-center">
          <p className="text-black font-raleway font-medium text-4xl capitalize">Connect with us</p>
        </div>
        <div className="container mx-auto py-10 px-6">
          <div className="flex justify-center">
            <a href="#" className="text-blue-900 mx-5">
              <FaDiscord size={40} />
            </a>
            <a href="#" className="text-blue-900 mx-5">
              <FaXTwitter size={40} />
            </a>
            <a href="#" className="text-blue-900 mx-2">
              <BsTelegram size={40} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
