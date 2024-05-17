import React, { FC, useState } from "react";
import { SiWebmoney } from "react-icons/si";
import Button from "@/components/common/Button";
import Link from "next/link";
import { ConnectWallet, lightTheme } from "@thirdweb-dev/react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import List from "@mui/material/List";
// import { useRouter } from 'next/navigation';

const DashboardNav: FC = () => {
  // const router = useRouter();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const path = event.target.value;
  //   if (path) {
  //     router.push(path);
  //   }
  // };

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
//   const navLinks = [
//     {
//       title: "Launch",
//       subItems: [
//         { title: "Create Proposal", path: "/launch/create-proposal" },
//         { title: "Convert Proposal", path: "/launch/convert-proposal" },
//       ],
//     },

//   ];

  return (
    <div className="px-6 py-4 shadow-sm flex justify-between items-center"
      style={{ background: "#0F4C81" }}>
      <div className="flex gap-2 items-center">
        <div className="text-2xl">
          <img
            src="/nav.png"
            alt=""
            width="30px"
            height="10px"
          />
        </div>
        <div className="text-white text-xl font-semibold">
          <a href="/">SprkHaus</a>
        </div>
      </div>

      <div className="flex gap-4 items-center text-white">
        <a href="/dashboard/crowdfunding-events">Crowd funding events</a>
        <a href="/dashboard/started-events">Started Events</a>
        <a href="/dashboard/yourpoaps">Your poaps</a>
        <ConnectWallet
          theme={lightTheme({
            colors: { primaryButtonBg: "white" },
          })}
          style={{ color: "black", borderRadius: '9999px' }}
          className="hover:bg-sky-500"
          switchToActiveChain={true}
          modalSize={"wide"}
          welcomeScreen={{ title: "TokenFest" }}
        />
      </div>
    </div>
  );
};

export default DashboardNav;