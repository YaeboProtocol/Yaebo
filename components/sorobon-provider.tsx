"use client";

import { ReactNode } from 'react'
import {SorobanReactProvider} from '@soroban-react/core';
import {testnet} from '@soroban-react/chains';
import {freighter} from '@soroban-react/freighter';
import type {ChainMetadata, Connector} from "@soroban-react/types";

import deployments from "../contract-deployments.json";

const chains: ChainMetadata[] = [testnet];
const connectors: Connector[] = [freighter()];

interface Props {
  children: ReactNode
}

const SorobanProvider = ({ children }: Props) => {
  return (
    <SorobanReactProvider
      chains={chains}
      appName={"STD Protocol Interface"}
      activeChain={testnet}
      connectors={connectors}
      deployments={deployments}
    >
      {children}
    </SorobanReactProvider>
  );
}

export default SorobanProvider;