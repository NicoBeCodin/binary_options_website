import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Connection,
  clusterApiUrl,
  Signer,
  sendAndConfirmTransaction,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Buffer } from "buffer";
export const discriminators = {
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
  initializeOutcomeMints: [223, 167, 202, 135, 111, 93, 151, 249],
  initializeTreasuryTokenAccounts: [237, 12, 117, 222, 94, 228, 160, 55],
  mintOutcomeTokens: [27, 243, 237, 46, 2, 226, 144, 209],
  createMint: [69, 44, 215, 132, 253, 214, 41, 45],
  mintMetadataTokens: [117, 160, 226, 215, 175, 109, 84, 91],
};

export const programId = new PublicKey("ENeicYASniyR5oHnrp5pxq7UtUMLqmCJKqu5Er8ChNtP");

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
    data: instructionData,
  });

  const transaction = new Transaction().add(instruction);

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  const signature = await sendTransactionWithLogs(
    connection,
    transaction,
    wallet
  );
  console.log(`Market created! Tx Signature: ${signature}`);
  return marketPda;
}

const METADATA_SEED = "metadata";
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const associatedTokenProgramId = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
const tokenProgramId = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export async function createMetadataTokens(
  marketPda: PublicKey,
  wallet: WalletContextState
) {
  try {
    console.log("Initializing outcome mints for market:", marketPda.toString());

    if (!wallet.publicKey) {
      throw new Error("No payer found. Something went wrong with the wallet!");
    }

    const [yesMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("yes_mint"), marketPda.toBuffer()],
      programId
    );

    const [noMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("no_mint"), marketPda.toBuffer()],
      programId
    );

    const [yesMetadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(METADATA_SEED),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        yesMintPda.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [noMetadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(METADATA_SEED),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        noMintPda.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [treasuryYesTokenAccount] = PublicKey.findProgramAddressSync(
      [marketPda.toBuffer(), tokenProgramId.toBuffer(), yesMintPda.toBuffer()],
      associatedTokenProgramId
    );

    const [treasuryNoTokenAccount] = PublicKey.findProgramAddressSync(
      [marketPda.toBuffer(), tokenProgramId.toBuffer(), noMintPda.toBuffer()],
      associatedTokenProgramId
    );

    console.log("yesMintPda:", yesMintPda.toString());
    console.log("noMintPda:", noMintPda.toString());
    console.log("yesMetadataAccount", yesMetadataAddress.toString());
    console.log("noMetadataAccount", noMetadataAddress.toString());    

    const checkMintAlreadyCreated = await connection.getAccountInfo(yesMintPda);

    if (checkMintAlreadyCreated) {
      console.log("Metadata account already exists, skipping mint creation.");
    } else {
      const createMintIx = new TransactionInstruction({
        keys: [
          { pubkey: marketPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: yesMintPda, isSigner: false, isWritable: true },
          { pubkey: noMintPda, isSigner: false, isWritable: true },
          { pubkey: yesMetadataAddress, isSigner: false, isWritable: true },
          { pubkey: noMetadataAddress, isSigner: false, isWritable: true },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
          {
            pubkey: TOKEN_METADATA_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId,
        data: Buffer.from(discriminators.createMint),
      });

      const transaction1 = new Transaction().add(createMintIx);

      const { blockhash } = await connection.getLatestBlockhash();
      transaction1.recentBlockhash = blockhash;
      transaction1.feePayer = wallet.publicKey;
      await sendTransactionWithLogs(connection, transaction1, wallet);
      console.log("Transaction for createMint sent");
    }

    const mintMetadataTokensIx = new TransactionInstruction({
      keys: [
        { pubkey: marketPda, isSigner: false, isWritable: true },
        { pubkey: yesMintPda, isSigner: false, isWritable: true },
        { pubkey: noMintPda, isSigner: false, isWritable: true },
        { pubkey: treasuryYesTokenAccount, isSigner: false, isWritable: true },
        { pubkey: treasuryNoTokenAccount, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        {
          pubkey: associatedTokenProgramId,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId,
      data: Buffer.from(discriminators.mintMetadataTokens),
    });

    const transaction2 = new Transaction().add(mintMetadataTokensIx);

    const { blockhash } = await connection.getLatestBlockhash();
    transaction2.recentBlockhash = blockhash;
    transaction2.feePayer = wallet.publicKey;
    await sendTransactionWithLogs(connection, transaction2, wallet);
    console.log("Transaction for mintMetadataTokens sent");
    return {yesMintPda, noMintPda}
  } catch (error) {
    console.error("Error creating metadata tokens:", error);
    throw error;
  }
  
}


export async function lockFunds(
  marketPda: PublicKey,
  amount: number,
  wallet: WalletContextState
) {
  const PRICE_PER_TOKEN = 100000;
  const lamportsToLock = amount * PRICE_PER_TOKEN;

  if (!wallet.publicKey) {
    throw new Error("Wallet not connected!");
  }

  const instructionData = Buffer.alloc(16);
  Buffer.from(discriminators.lockFunds).copy(instructionData, 0)
  instructionData.writeBigUInt64LE(BigInt(amount), 8);

  // Derive Mint PDAs
  const [yesMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), marketPda.toBuffer()],
    programId
  );

  const [noMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), marketPda.toBuffer()],
    programId
  );

  // Derive Associated Token Accounts
  const [treasuryYesTokenAccount] = PublicKey.findProgramAddressSync(
    [marketPda.toBuffer(), tokenProgramId.toBuffer(), yesMintPda.toBuffer()],
    associatedTokenProgramId
  );

  const [treasuryNoTokenAccount] = PublicKey.findProgramAddressSync(
    [marketPda.toBuffer(), tokenProgramId.toBuffer(), noMintPda.toBuffer()],
    associatedTokenProgramId
  );

  const [userYesTokenAccount] = PublicKey.findProgramAddressSync(
    [wallet.publicKey.toBuffer(), tokenProgramId.toBuffer(), yesMintPda.toBuffer()],
    associatedTokenProgramId
  );

  const [userNoTokenAccount] = PublicKey.findProgramAddressSync(
    [wallet.publicKey.toBuffer(), tokenProgramId.toBuffer(), noMintPda.toBuffer()],
    associatedTokenProgramId
  );

  // Create Transaction Instruction
  const lockFundsIx = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      { pubkey: marketPda, isSigner: false, isWritable: true },
      { pubkey: yesMintPda, isSigner: false, isWritable: true },
      { pubkey: noMintPda, isSigner: false, isWritable: true },
      { pubkey: treasuryYesTokenAccount, isSigner: false, isWritable: true },
      { pubkey: treasuryNoTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userYesTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userNoTokenAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: tokenProgramId, isSigner: false, isWritable: false },
      { pubkey: associatedTokenProgramId, isSigner: false, isWritable: false },
    ],
    programId,
    data: instructionData,
  });

  const transaction = new Transaction().add(lockFundsIx);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  await sendTransactionWithLogs(connection, transaction, wallet);

  console.log(`Locked ${lamportsToLock} lamports in market vault`);
}

export async function resolveMarket(
  marketPda: PublicKey,
  priceAccount: PublicKey,
  wallet: WalletContextState
) {
  if (!wallet.publicKey) {
    throw new Error("Wallet not connected!");
  }

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      { pubkey: marketPda, isSigner: false, isWritable: true },
      { pubkey: priceAccount, isSigner: false, isWritable: false },
    ],
    programId,
    data: Buffer.concat([
      Buffer.from(discriminators.resolveMarket),
      Buffer.alloc(0),
    ]),
  });

  const transaction = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  await sendTransactionWithLogs(connection, transaction, wallet);

  console.log(`Market resolved successfully: ${marketPda.toString()}`);
}

export async function redeemFunds(
  marketPda: PublicKey,
  wallet: WalletContextState
) {
  if (!wallet.publicKey) {
    throw new Error("Wallet not connected!");
  }

  // ✅ Derive Mint PDAs
  const [yesMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), marketPda.toBuffer()],
    programId
  );

  const [noMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), marketPda.toBuffer()],
    programId
  );

  // ✅ Derive Associated Token Accounts
  const [treasuryYesTokenAccount] = PublicKey.findProgramAddressSync(
    [marketPda.toBuffer(), tokenProgramId.toBuffer(), yesMintPda.toBuffer()],
    associatedTokenProgramId
  );

  const [treasuryNoTokenAccount] = PublicKey.findProgramAddressSync(
    [marketPda.toBuffer(), tokenProgramId.toBuffer(), noMintPda.toBuffer()],
    associatedTokenProgramId
  );

  const [userYesTokenAccount] = PublicKey.findProgramAddressSync(
    [wallet.publicKey.toBuffer(), tokenProgramId.toBuffer(), yesMintPda.toBuffer()],
    associatedTokenProgramId
  );

  const [userNoTokenAccount] = PublicKey.findProgramAddressSync(
    [wallet.publicKey.toBuffer(), tokenProgramId.toBuffer(), noMintPda.toBuffer()],
    associatedTokenProgramId
  );

  // Create Transaction Instruction
  const redeemIx = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      { pubkey: marketPda, isSigner: false, isWritable: true },
      { pubkey: yesMintPda, isSigner: false, isWritable: true },
      { pubkey: noMintPda, isSigner: false, isWritable: true },
      { pubkey: treasuryYesTokenAccount, isSigner: false, isWritable: true },
      { pubkey: treasuryNoTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userYesTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userNoTokenAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: tokenProgramId, isSigner: false, isWritable: false },
    ],
    programId,
    data: Buffer.concat([
      Buffer.from(discriminators.redeem),
      Buffer.alloc(0),
    ]),
  });

  const transaction = new Transaction().add(redeemIx);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  await sendTransactionWithLogs(connection,transaction,wallet);

  console.log(`Redeemed funds from market: ${marketPda.toString()}`);
}