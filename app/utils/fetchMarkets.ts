import {
  Connection,
  PublicKey,
  Message,
  TransactionMessage,
  VersionedTransactionResponse,
  TransactionResponse,
  MessageAccountKeys,
} from "@solana/web3.js";
import { struct, u8, blob } from "@solana/buffer-layout";
import { publicKey, bool, option } from "@solana/buffer-layout-utils";
import { programId, discriminators } from "@/utils/solanaMarket"; // Ensure you have your program ID and discriminators
import { Layout } from "@solana/buffer-layout";
import { Buffer } from "buffer";
import { parse } from "path";

// Helper function to read u64 from a buffer
function readU64LE(buffer: Buffer, offset: number): bigint {
  return buffer.readBigUInt64LE(offset);
}

// Helper function to read s64 from a buffer
function readS64LE(buffer: Buffer, offset: number): bigint {
  return buffer.readBigInt64LE(offset);
}



// const SOLANA_RPC_URL = "https://api.devnet.solana.com"; // Change to mainnet-beta if needed
const SOLANA_ANKR_URL = "https://rpc.ankr.com/solana_devnet";

const connection = new Connection(SOLANA_ANKR_URL, "confirmed");

// Helper function to parse the asset field from u8
function parseAsset(assetValue: number): string {
    switch (assetValue) {
      case 1: return "BTC";
      case 2: return "SOL";
      case 3: return "ETH";
      default: return assetValue.toString();
    }
  }
function parseOutcome(outcome: number): string {
    switch(outcome){
        case 1: return "YES";
        case 2: return "NO";
        default: return "NO OUTCOME FOR THE MOMENT";
    }
}

export interface MarketMinimal {
  marketPda: string;
  authority: string;
  strike: bigint;
  expiry: bigint,
  asset: string,
  resolved: boolean,
  outcome: string
}

export async function fetchAvailableMarkets(): Promise<MarketMinimal[]> {
  const marketAccounts = await connection.getProgramAccounts(programId, {
    filters: [{ dataSize: 60 }], // Match Market PDA size
  });

  const markets: MarketMinimal[] = marketAccounts
    .map(({ pubkey, account }) => {
      try {
        const buffer = Buffer.from(account.data);
        console.log("Buffer 40-49 ", buffer.slice(40,60));
        return {
          marketPda: pubkey.toBase58(), // Convert Market PDA to string
          authority: new PublicKey(account.data.slice(8, 40)).toBase58(), // You need to start parsing at the 8th bytes, not 0
          strike: readU64LE(buffer, 40),
          expiry: readS64LE(buffer, 48),
          asset: parseAsset(buffer.readUInt8(56)),
          resolved: buffer.readUInt8(57) == 1,
          outcome: parseOutcome(buffer.readUInt8(59))

          //resolved code goes here

        };
      } catch (error) {
        console.error(
          `Failed to process market account ${pubkey.toBase58()}:`,
          error
        );
        return null;
      }
    })
    .filter((market): market is MarketMinimal => market !== null);

  return markets;
}

