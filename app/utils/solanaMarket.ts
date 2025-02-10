import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Connection,
  clusterApiUrl,
  Signer,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import {Buffer} from "buffer";
const discriminators = {
    initializeMarket: [35, 35, 189, 193, 155, 48, 170, 203],
    placeBet: [222, 62, 67, 220, 63, 166, 126, 33],
    resolveMarket: [155, 23, 80, 173, 46, 74, 23, 239],
    getPriceFeed: [110, 252, 205, 111, 43, 23, 155, 134],
    fetchBtcPrice: [218, 72, 78, 5, 219, 85, 91, 157],
    fetchCoinPrice: [173, 85, 70, 71, 109, 106, 163, 31],
    createOutcomeTokens: [20, 255, 41, 64, 32, 77, 240, 93],
    redeem: [184, 12, 86, 149, 70, 196, 97, 225],
    initializeTreasury: [124, 186, 211, 195, 85, 165, 129, 166],
    lockFunds: [171, 49, 9, 86, 156, 155, 2, 88],
    initializeOutcomeMints: [223,167,202,135,111,93,151,249],
    initializeTreasuryTokenAccounts: [237,12,117,222,94,228,160,55],
    mintOutcomeTokens: [27,243,237,46,2,226,144,209],
    createMint: [69,44,215,132,253,214,41,45],
    mintMetadataTokens :[117,160,226,215,175,109,84,91] 
};

const programId = new PublicKey("ENeicYASniyR5oHnrp5pxq7UtUMLqmCJKqu5Er8ChNtP");

function writeBigUInt64LE(buffer: Buffer, value: bigint, offset: number) {
    let temp = value;
    for (let i = 0; i < 8; i++) {
      buffer[offset + i] = Number(temp & BigInt(0xff)); // Mask out lowest byte
      temp >>= BigInt(8); // Shift right
    }
  }

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
// Function to get onchain timestamp and align expiry time
async function getExpiryTimestamp(timeDelta: number) {
  console.log("Fetching onchain time...");
  const slot = await connection.getSlot();

  const timestamp = await connection.getBlockTime(slot);
  if (!timestamp) {
    throw new Error("Can't get onchain time.");
  }
  console.log("Onchain unix timestamp:", timestamp);
  return timestamp + timeDelta * 60;
}

async function sendTransactionWithLogs(
  connection: Connection,
  transaction: Transaction,
  wallet: WalletContextState
) {
  try {
    if (!wallet.signTransaction) {
      throw new Error("Wallet does not support signing transactions.");
    }

    // Sign the transaction with the wallet
    const signedTransaction = await wallet.signTransaction(transaction);

    // Send the signed transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    await connection.confirmTransaction(signature, "confirmed");
    console.log("Transaction confirmed with signature:", signature);
    return signature;
  } catch (err) {
    console.error("Error during transaction:", err);

    // // Fetch logs if transaction fails
    // if ('signature' in err) {
    //   const failedTxDetails = await connection.getTransaction(err.signature, {
    //     commitment: "confirmed",
    //   });

    //   if (failedTxDetails?.meta?.logMessages) {
    //     console.error("Transaction Logs:");
    //     failedTxDetails.meta.logMessages.forEach((log) => console.error(log));

    throw err;
  }
}

// Function to initialize a market
export async function initializeMarket(
  strike: number,
  asset: number,
  expiryMinutes: number,
  wallet: WalletContextState
) {
  const expiry = await getExpiryTimestamp(expiryMinutes);
  console.log("Final expiry timestamp:", expiry);
  if (!wallet.publicKey) {
    throw new Error("No payer found. Something went wrong with the wallet!");
  }

  const [marketPda, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("market"),
      wallet.publicKey.toBuffer(),
      (() => {
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE(BigInt(strike), 0);
        // writeBigUInt64LE(buffer, BigInt(strike), 0);
        return buffer;
      })(),
      (() => {
        const buffer = Buffer.alloc(8);
        buffer.writeBigInt64LE(BigInt(expiry), 0);
        // writeBigUInt64LE(buffer, BigInt(strike), 0);
        return buffer;
      })(),
    ],
    programId
  );

  console.log("Market PDA:", marketPda.toString());

  // Check if account exists
  const accountExists = await connection.getAccountInfo(marketPda);
  if (accountExists) {
    console.log("Market already exists");
    return marketPda;
  }

  const instructionData = Buffer.alloc(8 + 8 + 8 + 1); // Discriminator (8), Strike (8), Expiry (8), Asset (1)
  Buffer.from(discriminators.initializeMarket).copy(instructionData, 0); // Write discriminator
  instructionData.writeBigUInt64LE(BigInt(strike), 8); // Write strike price
  instructionData.writeBigInt64LE(BigInt(expiry), 16); // Write expiry timestamp
  instructionData.writeUInt8(asset, 24); // Write asset (BTC=1, SOL=2, ETH=3)


  // Create the transaction instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: marketPda, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data: instructionData
  });

  const transaction = new Transaction().add(instruction);

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  const signature = await sendTransactionWithLogs(connection, transaction,wallet,);
  console.log(`Market created! Tx Signature: ${signature}`);
  return marketPda;
}
