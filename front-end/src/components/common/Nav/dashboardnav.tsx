import React, { FC, useState } from "react";


const DashboardNav: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };


  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="px-6 py-4 shadow-sm flex justify-between items-center"
    style={{ background: "#0F4C81" }}>
 <div className="flex gap-2 items-center">
   <div className="text-2xl">
     <img
       src="/nav.png"
       alt="TokenFest Logo"
       width="30px"
       height="10px"
     />
   </div>
   <div className="text-white text-xl font-semibold">
     <a href="/">TokenFest</a>
   </div>
 </div>

 <div className="hidden md:flex gap-4 items-center text-white">
   <a href="/dashboard/crowdfunding-events">Crowd funding events</a>
   <a href="/dashboard/started-events">Started Events</a>
   <a href="/dashboard/yourpoaps">Your poaps</a>
   <w3m-button/>
 </div>

 <div className="md:hidden flex items-center">
   <button onClick={toggleMenu} className="text-white focus:outline-none">
     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
     </svg>
   </button>
 </div>

 {menuOpen && (
   <div className="md:hidden absolute top-16 right-0 bg-white w-full shadow-lg py-4">
     <a href="/dashboard/crowdfunding-events" className="block px-4 py-2 text-black">Crowd funding events</a>
     <a href="/dashboard/started-events" className="block px-4 py-2 text-black">Started Events</a>
     <a href="/dashboard/yourpoaps" className="block px-4 py-2 text-black">Your poaps</a>
     <w3m-button/>
   </div>
 )}
</div>
  );
};

export default DashboardNav;