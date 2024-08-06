// src/App.tsx
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './utils/apollo-client';
import VaultList from './VaultList';
import MetaMaskConnector from './components/MetaMaskConnector'; // Import the new component

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">Superform Vaults</h1>
          <MetaMaskConnector /> {/* Include the MetaMaskConnector component */}
          <VaultList />
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;
