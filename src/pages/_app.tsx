import React, { useMemo } from "react";
import type { AppProps } from "next/app";
import {
  ConnectionProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import WalletProvider from "../contexts/ClientWalletProvider";
import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import "../styles/App.css";
import { JupiterProvider } from "@jup-ag/react-hook";
import { getPlatformFeeAccounts } from "@jup-ag/core";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

export const SECOND_TO_REFRESH = 30 * 1000;

function MyApp({ Component, pageProps }: AppProps) {
  const endpoint = useMemo(() => "https://ssc-dao.genesysgo.net/", []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider>
        <JupiterWrapper>
          <Component {...pageProps} />
        </JupiterWrapper>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const JupiterWrapper: React.FC = ({ children }) => {
  const [platformFeesAccount, setPlatformFeesAccount] = useState<{ feeBps: number, feeAccounts: Map<string, PublicKey> }>();
  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    const setFeeAccount = async () => {
      let platformFeeAndAccounts = {
        feeBps: 255,
        feeAccounts: await getPlatformFeeAccounts(
          connection, new PublicKey("5mfkNCR8Fo5p3DLHYBW6knuArGEgj8Ui2Lm4qnWEWUFh") // The platform fee account owner
        ) // map of mint to token account pubkey
      };
      console.log(platformFeeAndAccounts.feeAccounts);

      setPlatformFeesAccount(platformFeeAndAccounts);
    };
    setFeeAccount();
  }, [])
  return (
    <JupiterProvider
      cluster="mainnet-beta"
      connection={connection}
      userPublicKey={wallet.publicKey || undefined}
      routeCacheDuration={SECOND_TO_REFRESH}
      platformFeeAndAccounts={platformFeesAccount}
    >
      {children}
    </JupiterProvider>
  );
};

export default MyApp;
