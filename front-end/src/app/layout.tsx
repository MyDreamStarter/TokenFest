"use client";
import "./globals.css";
import { ProposalProvider } from "@/ContextProviders/ProposalProvider";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { IoClose } from "react-icons/io5";
import Web3ModalProvider from "./Web3ModalProvider";
import Providers from "./Web3ModalProvider";
import './globals.css'
import './globals.css'

import { cookieToInitialState } from 'wagmi'
import { config } from "./wagmi";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <title>TokenFest</title>
      <Providers>
      <ProposalProvider>
          <SnackbarProvider
            action={(snackbarId) => (
              <button onClick={() => closeSnackbar(snackbarId)}>
                <IoClose className="h-6 w-6 pr-2 text-xl" />
              </button>
            )}
          >
            <body className="font-raleway text-sm text-gray-800">
            <Web3ModalProvider>{children}</Web3ModalProvider>
            </body>
          </SnackbarProvider>
      </ProposalProvider>
      </Providers>
    </html>
  );
}