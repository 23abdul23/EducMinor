import React, { useEffect, useState } from "react";
import { NFTStorage, File } from "nft.storage";
import { ethers } from "ethers";
import axios from "axios";
import { saveAs } from "file-saver";
import { FaDownload, FaEthereum, FaUserAlt } from "react-icons/fa";
import { AiFillEye, AiOutlineLoading, AiFillHeart, AiOutlineSwap } from "react-icons/ai";
import { MdVerifiedUser, MdOutlineSell } from "react-icons/md";
import "../global.css";

const NFT_STORAGE_API_KEY = import.meta.env.VITE_NFT_STORAGE_API_KEY;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractABI = import.meta.env.VITE_CONTRACT_ABI;

const Marketplace = () => {
  const [walletAddress, setWalletAddress] = useState(
    "0x431954fdf19a4e81FA4c2c0c192e223A09e7a851"
  );
  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [tokenUri, setTokenUri] = useState("");
  const [tokenId, setTokenId] = useState(null);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#6c5ce7");
  const [accentColor, setAccentColor] = useState("#00cec9");

  const contract = new ethers.Contract(
    contractAddress,
    contractABI,
    new ethers.providers.JsonRpcProvider(
      "https://eth-sepolia.g.alchemy.com/v2/zEotRHIHt762GqCfnaj6tDD0ZH-GswVB"
    )
  );

  useEffect(() => {
    if (walletAddress) {
      fetchNFTs();
    }
  }, [walletAddress]);

  const fetchMetadata = async (uri) => {
    try {
      const response = await axios.get(uri);
      return response.data;
    } catch (error) {
      console.error("Error fetching metadata:", error);
      return null;
    }
  };

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const balance = await contract.balanceOf(walletAddress);
      const nftData = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
        const tokenUri = await contract.tokenURI(tokenId);
        const metadata = await fetchMetadata(tokenUri);

        if (metadata) {
          nftData.push({
            tokenId: tokenId.toString(),
            metadata,
          });
        }
      }

      setNFTs(nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
    setLoading(false);
  };

  const handleDownload = async (ipfsHash) => {
    try {
      const response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`, {
        responseType: "blob",
      });
      saveAs(response.data, "certificate.pdf");
    } catch (error) {
      console.error("Error downloading certificate:", error);
    }
  };

  const openNFTDetails = (nft) => {
    setSelectedNFT(nft);
    setTokenUri(nft.metadata.image || "");
    setTokenMetadata(nft.metadata);
    setTokenId(nft.tokenId);
  };

  const closeModal = () => {
    setSelectedNFT(null);
  };

  const mintNFT = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const metadata = {
        name: tokenMetadata?.name || "New Certificate",
        description:
          tokenMetadata?.description || "Certificate of participation.",
        image: tokenUri,
        attributes: tokenMetadata?.attributes || [],
      };

      const nftstorage = new NFTStorage({ token: NFT_STORAGE_API_KEY });
      const metadataResponse = await nftstorage.store(metadata);

      const mintTransaction = await contractWithSigner.mintNFT(
        walletAddress,
        metadataResponse.url
      );
      await mintTransaction.wait();

      alert("NFT minted successfully!");
      fetchNFTs();
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-8"
      style={{
        backgroundImage:
          "radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent)",
      }}
    >
      <header className="flex flex-col md:flex-row justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold">Web3 Certificates Marketplace</h1>
          <p className="text-gray-300 mt-2">
            Explore and manage blockchain-verified academic credentials.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center mt-4 md:mt-0">
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <p className="text-sm text-gray-300">Connected Wallet</p>
            <p className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-6 py-2 cursor-pointer hover:opacity-90">
            Connect Wallet
          </div>
        </div>
      </header>

      <section className="mb-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Your NFT Certificates</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <AiOutlineLoading className="animate-spin text-4xl text-purple-400" />
              </div>
            ) : nfts.length === 0 ? (
              <p className="text-gray-400">No certificates found for this wallet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {nfts.map((nft) => (
                  <article
                    key={nft.tokenId}
                    className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-400 transition-all"
                    onClick={() => openNFTDetails(nft)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={nft.metadata.image}
                        alt={nft.metadata.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MdVerifiedUser className="text-green-400" />
                        <p className="text-sm text-gray-400">Verified on-chain</p>
                      </div>
                      <h3 className="text-xl font-semibold">{nft.metadata.name}</h3>
                      <p className="text-gray-400 text-sm">Token ID: {nft.tokenId}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-full px-4 py-1 text-sm">
                      {nft.metadata?.attributes?.[0]?.value || "Certified"}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl py-4 font-semibold flex items-center justify-center gap-3"
              >
                <AiFillEye className="text-2xl" />
                Verify Certificate
              </button>
              <button
                className="w-full bg-white/10 rounded-xl py-4 font-semibold flex items-center justify-center gap-3"
                onClick={mintNFT}
              >
                <MdOutlineSell className="text-2xl" />
                Mint New Certificate
              </button>
              <button
                className="w-full bg-white/10 rounded-xl py-4 font-semibold flex items-center justify-center gap-3"
                onClick={() => handleDownload(selectedNFT?.metadata?.CertificateCID)}
                disabled={!selectedNFT}
              >
                <FaDownload className="text-2xl" />
                Download Certificate PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedNFT && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full overflow-hidden border border-white/10">
            <div className="grid md:grid-cols-2">
              <div className="bg-black/40 p-6">
                <img
                  src={selectedNFT.metadata.image}
                  alt={selectedNFT.metadata.name}
                  className="rounded-xl shadow-lg"
                />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400">Token ID</p>
                    <p className="text-xl font-semibold">{selectedNFT.tokenId}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400">Issued To</p>
                    <div className="flex items-center gap-2">
                      <FaUserAlt className="text-purple-400" />
                      <p>{selectedNFT.metadata.name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Certificate Details</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-white">×</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Issuer</p>
                    <p className="font-mono text-sm">
                      {selectedNFT.metadata.issuer || "Verified Organization"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-gray-300">
                      {selectedNFT.metadata.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Skills Verified</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedNFT.metadata.attributes?.map((attr, index) => (
                        <span
                          key={index}
                          className="bg-white/10 px-3 py-1 rounded-full text-sm"
                        >
                          {attr.trait_type}: {attr.value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400">Owner</p>
                    <p className="font-mono text-sm">
                      {ownerAddress || walletAddress}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-4">
                    <p className="text-sm text-white/80">Market Value</p>
                    <p className="text-3xl font-bold flex items-center gap-2">
                      <FaEthereum />
                      {selectedNFT.metadata.value || "0.25"}
                      <span className="text-lg">ETH</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
