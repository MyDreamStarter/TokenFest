import React, { FC, useState } from "react";
import Link from "next/link";


const Nav: FC = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navLinks = [
    {
      title: "Launch",
      subItems: [
        { title: "Create Proposal", path: "/launch/create-proposal" },
        { title: "Create Proposal through Frame", path: "/create-frame" },
        { title: "Convert Proposal", path: "/launch/convert-proposal" },
      ],
    },
    {
      title: "Explore",
      subItems: [
        { title: "Ongoing Proposals", path: "/explore/ongoing-proposals" },
        {
          title: "Crowdfunding Events",
          path: "/explore/crowdfunding-events",
        },
      ],
    },
   
  ];

  return (
    <div className="px-6 py-4 shadow-sm flex justify-between items-center">
      <div className="flex gap-2 items-center">
        <div className="text-2xl">
          <img
            src="/nav.png"
            alt="TokenFest logo"
            width="30px"
            height="10px"
          />
        </div>
        <div className="text-black text-xl font-semibold">
          <a href="/">TokenFest</a>
        </div>
      </div>

      <div className="flex md:hidden items-center">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-black focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
            ></path>
          </svg>
        </button>
      </div>

      <div className={`flex-col md:flex md:flex-row gap-4 items-center text-black ${menuOpen ? 'flex' : 'hidden'}`}>
        {navLinks.map((navItem) => (
          <div
            key={navItem.title}
            className="relative cursor-pointer"
            onMouseEnter={() => setActiveDropdown(navItem.title)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            {navItem.title}
            {navItem.subItems && (
              <div
                className={`absolute left-0 w-48 py-2 px-2 rounded-md shadow-xl bg-white ${activeDropdown === navItem.title ? 'block' : 'hidden'}`}
              >
                {navItem.subItems.map((subItem) => (
                  <Link
                    key={subItem.title}
                    href={subItem.path}
                    className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-500 rounded-md"
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <a href="/subscription" className="block md:inline">DeSubscription</a>
        <a href="/community/create-community" className="block md:inline">Community</a>
        <a href="/dashboard/crowdfunding-events" className="block md:inline">Dashboard</a>
      </div>
    </div>
  );
};

export default Nav;
