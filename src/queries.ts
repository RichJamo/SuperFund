// src/queries.ts
import { gql } from '@apollo/client';

// Existing query for vaultBasics
export const GET_VAULT_BASICS = gql`
  query GetVaultBasics($first: Int!) {
    vaultBasics(first: $first) {
      id
      name
      symbol
      decimals
    }
  }
`;

// New query for vaultDatas
export const GET_VAULT_DATAS = gql`
  query GetVaultDatas($first: Int!) {
    vaultDatas(first: $first) {
      id
      totalAssets
      formBalance
      previewPPS
      pricePerVaultShare
    }
  }
`;
