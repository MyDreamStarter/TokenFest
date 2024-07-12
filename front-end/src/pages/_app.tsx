import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import React from "react";
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
