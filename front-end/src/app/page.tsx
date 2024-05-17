"use client";
import { ConnectWallet, lightTheme } from "@thirdweb-dev/react";
import { SiWebmoney } from "react-icons/si";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import { BsTelegram } from "react-icons/bs";
import Nav from "@/components/common/Nav";


export default function Home() {
  return (

    <>
      <main className="flex" style={{
        backgroundImage: `url('/home.png')`, backgroundSize: 'cover',
        height: '710px',
        width: '1515px',
      }}>
         <div className="justify-center items-center h-[50px] w-[150px] my-10 mx-10   ">
          <button ><ConnectWallet 
          theme={lightTheme({
            colors: { primaryButtonBg: "white" },
          })}
          style={{ color: "black" ,borderRadius: '9999px' }}
          className="hover:bg-sky-500"
          /></button>
        </div>

        <div className="bg-cyan-100 h-[650px] w-[750px] my-6 absolute bottom-4 right-8 rounded-lg ">
          <Nav />
          <div className="h-[300px] w-[700px] my-20 mt-44 mx-6">
            <div className="flex">
              <div className="border border-black rounded-full p-2">
                <h1 className="text-black font-raleway font-medium text-5xl">
                  Innovate. &nbsp;
                </h1>
              </div>
              <div className="border border-black rounded-full p-2">
                <h1 className="text-black font-raleway font-medium text-5xl">
                  Funds.
                </h1>
              </div>
            </div>
            <div className="flex">
              <div className="border border-black rounded-full p-2">
                <h1 className="text-black font-raleway font-medium text-5xl">
                  Build. &nbsp;
                </h1>
              </div>
              <div className="border border-black rounded-full p-2">
                <h1 className="text-black font-raleway font-medium text-5xl">
                  Collaborate.
                </h1>
              </div>
            </div>

            <h1 className="p-6 text-black font-raleway font-medium text-lg ">Crowdfund Your Next Big Event with Us</h1>

            <button className="mx-6"><ConnectWallet
              theme={lightTheme({
                colors: { primaryButtonBg: "none" },
              })}
              style={{ color: "black", borderRadius: '9999px', border: '1.5px solid black' }}
              className="hover:bg-sky-500"
            /></button>

            <div className="my-20 mx-6">
              <h1 className="text-black font-raleway font-medium text-xl">Where Dreams Meet Reality</h1>
            </div>
          </div>
        </div>
      </main>

      <div className="flex p-36">
        <h1 className="text-black font-raleway font-medium text-5xl leading-none">
          We help local Communities to <span className="text-purple-600">Crowdfund</span>  <br />
          and <span className="text-purple-600">Launch</span>  Events Successfully
        </h1>
      </div>

      <div className="flex mx-28">
        <div className="mx-6 rounded-xl" style={{
          backgroundImage: `url('/build.png')`, backgroundSize: 'cover',
          height: '400px',
          width: '400px',
        }}>
          <div className="bg-white h-[40px] w-[200px] m-4 flex-shrink-0 rounded-full bg-white">
            <h1 className="p-2 text-black font-raleway font-semibold text-base">1.Build Your Community</h1>
          </div>
          <h1 className="text-white font-raleway font-semibold text-base p-6 mt-60">Shape a digital community where you and like-mindedindividuals govern together.</h1>
        </div>

        <div className="mx-6 rounded-xl" style={{
          backgroundImage: `url('/plan.png')`, backgroundSize: 'cover',
          height: '400px',
          width: '400px',
        }}>
          <div className="bg-white h-[40px] w-[200px] m-4 flex-shrink-0 rounded-full bg-white">
            <h1 className="p-2 text-black font-raleway font-semibold text-base">2.Plan your Events</h1>
          </div>
          <h1 className="text-white font-raleway font-semibold text-base p-6 mt-60">Easily organize, manage, and spread the word about your gatherings.</h1>
        </div>

        <div className="mx-6 rounded-xl" style={{
          backgroundImage: `url('/earn.png')`, backgroundSize: 'cover',
          height: '400px',
          width: '400px',
        }}>
          <div className="bg-white h-[40px] w-[200px] m-4 flex-shrink-0 rounded-full bg-white">
            <h1 className="p-2 text-black font-raleway font-semibold text-base">3.Earn with Events</h1>
          </div>
          <h1 className="text-white font-raleway font-semibold text-base p-6 mt-60">Enjoy a portion of event earnings by holding relevant NFTs.</h1>
        </div>
      </div>


      <div className="flex mx-48">
        <div className="bg-blue-200 h-[400px] w-[700px] mt-44 ">
          <h1 className="text-black font-raleway font-medium text-4xl mt-28 mx-20">Create Communities, <br />Launch Events Effortlessly</h1>
          <button className="mx-20 mt-8"><ConnectWallet
            theme={lightTheme({
              colors: { primaryButtonBg: "#0F4C81" },
            })}
            style={{ color: "white", borderRadius: '9999px' }}
            className="hover:bg-sky-500"
          /></button>
        </div>
        <div className="h-[400px] w-[450px] mt-44" style={{
          backgroundImage: `url('/create.png')`, backgroundSize: 'cover'
        }}>
        </div>
      </div>

      <footer className=" mt-20">
        <div className=" py-4 text-black text-center">
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
