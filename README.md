# Axiom – Blockchain Credential Issuance Platform

Axiom (a.k.a. **EducMinor**) is a full-stack system that lets institutions issue tamper-proof academic or professional certificates as ERC‑721 NFTs. Certificates are uploaded as PDFs, summarized automatically through an OCR + Groq agent, pinned to IPFS (Pinata), and minted to the recipient’s wallet on Sepolia. Web3Auth secures both admin and learner flows with familiar OAuth logins, while a lightweight Express + Mongo backend keeps an email→wallet registry in sync. Recipients can view all of their credentials in one place, and anyone can verify authenticity through a shareable `/verify/:tokenId` route.

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Repository Layout](#repository-layout)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Environment Variables](#environment-variables)
8. [Running the Stack](#running-the-stack)
9. [How to Use](#how-to-use)
10. [Smart Contracts](#smart-contracts)
11. [Backend & OCR APIs](#backend--ocr-apis)
12. [Troubleshooting](#troubleshooting)

---

## Features
- **Self-serve admin console** – Issue certificates by uploading merged PDFs, tagging the event/organization, and entering the recipient’s email.
- **On-chain minting** – Every issuance stores the certificate + metadata CID on IPFS and mints an ERC‑721 (Axiom/Axiom contracts) on Sepolia.
- **Web3Auth-powered access** – Admins and recipients log in with Google (or any supported OAuth provider) via Web3Auth, and wallets are managed automatically.
- **Email ↔ wallet registry** – Express/Mongo backend persists the mapping so admins only need an email address; wallet addresses are synced once the learner signs in.
- **Automated OCR summaries** – FastAPI service extracts/summarizes the PDF (Groq Llama‑3.1) and embeds the synopsis into the metadata for richer verification.
- **User dashboard** – Learners can see all NFTs minted to their wallet, download PDFs, and copy shareable `/verify/:tokenId` URLs.
- **Public verification** – Verifiers can inspect metadata, summaries, issue dates, and on-chain owners, and compare metadata wallet vs. current owner.
- **Modular smart contracts** – Solidity contracts (Axiom / Axiom) deployed with Hardhat; easily extend revocation or custom attributes.

---

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind, Redux Toolkit, React Router, Wagmi, Web3Auth.
- **Web3 / Storage**: ethers.js (v5), Web3Auth modal, Pinata (IPFS), NFT.Storage (optional marketplace view), Sepolia RPC via Alchemy.
- **Backend**: Node.js, Express, Mongoose, Multer, pdf-lib.
- **OCR Microservice**: FastAPI, PyPDF2, LangChain Groq, uvicorn.
- **Smart Contracts**: Solidity 0.8.x, Hardhat, OpenZeppelin ERC721URIStorage.

---

## Architecture
1. **Admin issuance flow**
   - Admin logs in with Web3Auth → wallet address stored in session state.
   - Admin uploads merged PDF + recipient email. Backend resolves the email to a wallet (or asks the user to sign in first).
   - File is uploaded to Pinata, OCR service summarizes the PDF, metadata JSON is pinned, and `mintNFT` is invoked against the Sepolia contract.
2. **User sync**
   - When a user signs in, the frontend posts `email + wallet` to `/addUser`; Mongo stores the mapping.
   - Redux pulls all tokens from the contract via ethers, fetches metadata from IPFS, and filters by wallet/issuer for user/admin dashboards.
3. **Verification**
   - `/verify/:tokenId` fetches metadata from the backend proxy (`/getjsondata/:cid`), compares stored vs. on-chain owner, and embeds the PDF via IPFS gateway.
4. **OCR agent**
   - FastAPI endpoint `/ocr` accepts PDFs, stores a temp copy, extracts text with PyPDF2, summarizes via Groq (LangChain wrapper), returns summary → stored in metadata.

---

## Repository Layout
```
EducMinor/
├── Backend/                # Express + Mongo API for wallet/email mapping & metadata proxy
├── contracts/              # Axiom.sol ERC-721 contract (Hardhat)
├── src/
│   ├── SmartContract/      # Frontend ABI, ethers helpers, legacy solidity ref
│   ├── components/, views/ # React UI, admin/user portals, verification screens
│   ├── providers/          # Web3Auth context + Wagmi bridge
│   └── store/              # Redux Toolkit slices
├── ocr/                    # FastAPI OCR + Groq summarizer service
├── scripts/                # Hardhat deployment scripts
├── hardhat.config.js
├── package.json            # Frontend workspace (Vite)
└── README.md               # You are here
```

---

## Prerequisites
- **Node.js 18+** and npm (tested with npm 9).
- **Python 3.10+** with `pip`, plus system dependencies for OCR (Tesseract, Poppler if using `pdf2image`).
- **MongoDB Atlas or local MongoDB** instance reachable from the backend.
- **MetaMask or any injected wallet** for Sepolia interactions.
- **Pinata API key/secret** (or update the upload logic to your storage provider).
- **Groq API key** for PDF summarization.
- **Alchemy/Infura RPC URLs** for Sepolia if you redeploy the contracts.

---

## Installation
Clone and install dependencies for each service.

```bash
git clone <repo-url>
cd EducMinor

# Frontend (root)
npm install

# Backend API
cd Backend
npm install

# OCR microservice
cd ../ocr
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

---

## Environment Variables
Create the following files (sample values shown). Never commit secrets.

### `./.env` (Hardhat + shared Web3)
```ini
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<alchemy-key>
SEPOLIA_PRIVATE_KEY=0xabc123...
ETHERSCAN_API_KEY=<optional>
```

### `./.env.local` or `./.env` inside `EducMinor` (Vite)
```ini
VITE_WEB3AUTH_CLIENT_ID=<web3auth-key>
VITE_BACKEND_URL=http://localhost:4000
VITE_API_KEY=<pinata-key>
VITE_SECRET_KEY=<pinata-secret>
VITE_NFT_STORAGE_API_KEY=<optional for marketplace view>
VITE_CONTRACT_ADDRESS=<deployed-contract-address>
VITE_CONTRACT_ABI=<JSON-string or switch SmartContract/index.js to import from abi.json>
```

> **Note:** `src/SmartContract/index.js` currently hardcodes the contract address and Alchemy RPC endpoint. Update both the file and `src/SmartContract/abi.json` after every redeploy.

### `Backend/.env`
```ini
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/Axiom
PORT=4000
```

### `ocr/.env`
```ini
GROQ_KEY=<groq-api-key>
```

---

## Running the Stack
Open three terminal windows (frontend, backend, OCR). Commands assume you are inside `EducMinor/`.

1. **Backend (Express + Mongo)**
   ```bash
   cd Backend
   node index.js
   ```

2. **OCR + Summarization service**
   ```bash
   cd ocr
   source .venv/bin/activate
   uvicorn app:app --reload --port 8000
   ```

3. **Frontend (Vite dev server on http://localhost:5173)**
   ```bash
   cd ..
   npm run dev
   ```

4. **Optional** – Run Smart Contract tooling
   ```bash
   npx hardhat test
   npx hardhat run scripts/deploy.js --network sepolia
   ```

---

## How to Use
### 1. Admin onboarding & issuance
- Visit `/sign-in` → click “Login with Google (Web3Auth)”. Once authenticated, Web3Auth generates/loads your wallet and stores the role as `admin`.
- Navigate to **Issue Certificate**, fill out the organization/event/participant data, provide the recipient’s email, and upload a merged PDF of certificates.
- On submit the UI:
  1. Looks up the recipient’s wallet via `/getAddress`.
  2. Sends the PDF to the OCR FastAPI service to generate a textual summary.
  3. Uploads the PDF and metadata JSON to Pinata.
  4. Calls `mintNFT(jsonCID, pdfCID, wallet)` using ethers + Web3 (browser).
- Once mined, the certificate is immediately visible under **Certificates** (filter by organization/event) and in the learner dashboard.

### 2. Learner dashboard
- Learners sign in through `/user-sign-in`. Their wallet/email pair is POSTed to `/addUser`, so future issuances can target only the email.
- `/user` shows all NFTs minted to the connected wallet, lets the learner download PDFs, and provides “Copy link” buttons that point to `/verify/:tokenId`.

### 3. Public verification
- Anyone with the share URL can view metadata, issuance summary, issuer wallet, current owner, and inline PDF preview via IPFS.
- Ownership mismatch warnings surface when the NFT was transferred away from the original wallet encoded in metadata.

---

## Smart Contracts
- **Contracts**: `contracts/Axiom.sol` (current Hardhat build) and `src/SmartContract/Certificate.sol` (original reference).
- **Compilation/Test**
  ```bash
  npx hardhat compile
  npx hardhat test
  ```
- **Deployment**
  ```bash
  npx hardhat run scripts/deploy.js --network sepolia
  ```
- Update `src/SmartContract/abi.json` and the contract address constant in `src/SmartContract/index.js` after deployment.
- The frontend enforces Sepolia via `wallet_switchEthereumChain`; ensure MetaMask has the network added.

---

## Backend & OCR APIs
### Express (`Backend/index.js`)
| Method | Route | Purpose |
| ------ | ----- | ------- |
| `POST` | `/addUser` | Store or update `{ email, address }` mapping in Mongo. |
| `POST` | `/getAddress` | Resolve an email to a wallet address for issuance. |
| `GET`  | `/getjsondata/:cid` | Proxy IPFS metadata (used by verifier to avoid CORS issues). |
| `POST` | `/upload` | Placeholder for future PDF merge/upload logic. |
| `GET`  | `/api/status` | Health check. |

### OCR FastAPI (`ocr/app.py`)
| Method | Route | Purpose |
| ------ | ----- | ------- |
| `POST` | `/ocr` | Accepts PDF, stores temporary copy, extracts text, summarizes via Groq, returns JSON with `summary`. |
| `GET`  | `/ocr/files` | Lists PDF files stored during testing. |

---

## Troubleshooting
- **“Missing Pinata API credentials”** – Ensure `VITE_API_KEY` / `VITE_SECRET_KEY` are defined before issuing certificates.
- **No wallet found for email** – Ask the learner to log in once (user portal) so `/addUser` can sync their wallet, or manually add the record via Mongo.
- **Minting fails / wrong network** – MetaMask must be on Sepolia. The app auto-prompts via `wallet_switchEthereumChain`, but rejected requests will abort the mint.
- **OCR summary unavailable** – Verify the FastAPI server is running and `GROQ_KEY` is valid; the UI gracefully continues without a summary if the OCR call fails.
- **IPFS embeds blocked** – Some browsers block Pinata’s gateway in iframes. Use the “open in new tab” link or switch to `https://ipfs.io/ipfs/<cid>`.
- **Redux shows zero certificates** – Confirm the connected wallet (admin/user) matches the one used during minting; data is filtered server-side by issuer or owner.

---

Happy building! Mint a credential, share the `/verify/{tokenId}` link, and show how effortless trustworthy credentials can be. If you enhance the flow (e.g., revocation UI, multi-tenant orgs, notifications), document the changes here to keep the hand-off smooth.
