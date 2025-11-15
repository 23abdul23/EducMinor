import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMetaData, getOwnerOf } from "../SmartContract";
import Nav from "../components/Nav";

const gatewayUrl = (cid) => `https://ipfs.io/ipfs/${cid}`;
const backendBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000";

const VerifyCertificate = () => {
  const { tokenId } = useParams();
  const [metadata, setMetadata] = useState(null);
  const [certificateCID, setCertificateCID] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    const loadCertificate = async () => {
      if (!tokenId) {
        setError("Missing certificate id.");
        setStatus("error");
        return;
      }
      setStatus("loading");
      setError("");
      try {
        const combined = await getMetaData(Number(tokenId));
        if (!combined) {
          throw new Error("No metadata found for this token.");
        }
        const [jsonCID, certificateCIDFromChain] = combined.split(",");
        if (!jsonCID || !certificateCIDFromChain) {
          throw new Error(
            "Certificate is missing required IPFS references. Please contact the issuer."
          );
        }

        const response = await fetch(
          `${backendBaseUrl}/getjsondata/${jsonCID}`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          throw new Error("Certificate metadata is unavailable right now.");
        }
        const jsonRes = await response.json();
        const ownerAddress = await getOwnerOf(Number(tokenId));

        if (cancel) return;
        setCertificateCID(certificateCIDFromChain);
        setMetadata(jsonRes);
        setOwner(ownerAddress?.toLowerCase() || "");
        setStatus("ready");
      } catch (err) {
        console.error("Failed to verify certificate:", err);
        if (cancel) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load certificate details."
        );
        setStatus("error");
      }
    };

    loadCertificate();
    return () => {
      cancel = true;
    };
  }, [tokenId]);

  const issuedWallet = metadata?.walletAddress?.toLowerCase();
  const ownershipMatches =
    issuedWallet && owner ? issuedWallet === owner : true;
  const formattedIssueDate = useMemo(() => {
    if (!metadata?.issue_date) return "";
    const d = new Date(metadata.issue_date);
    return isNaN(d.valueOf()) ? metadata.issue_date : d.toLocaleString();
  }, [metadata?.issue_date]);

  const shareUrl = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/verify/${tokenId}`
        : `/verify/${tokenId}`,
    [tokenId]
  );

  return (
    <div className="w-full min-h-screen bg-gray-100">
    
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Certificate Verification
            </h1>
            <p className="text-sm text-gray-600">
              Token ID: <span className="font-mono">{tokenId}</span>
            </p>
          </div>

          <div className="text-xs text-gray-500">
            <p>Shareable link:</p>
            <p className="font-mono break-all">{shareUrl}</p>
          </div>
        </div>

        {status === "loading" && (
          <div className="bg-white p-6 rounded-xl shadow text-gray-600">
            Looking up certificate on-chain...
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl">
            <p className="font-semibold mb-2">Unable to verify certificate.</p>
            <p>{error}</p>
          </div>
        )}

        {status === "ready" && metadata && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Certificate Details
              </h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Recipient</dt>
                  <dd className="text-gray-900 font-medium">
                    {metadata.name || "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Organization</dt>
                  <dd className="text-gray-900">
                    {metadata.organization || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Event</dt>
                  <dd className="text-gray-900">
                    {metadata.event || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Issue Date</dt>
                  <dd className="text-gray-900">
                    {formattedIssueDate || "Unknown"}
                  </dd>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <dt className="text-gray-500">Issued to (metadata)</dt>
                  <dd className="font-mono text-xs text-gray-900 break-all">
                    {issuedWallet || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Current owner (on-chain)</dt>
                  <dd className="font-mono text-xs text-gray-900 break-all">
                    {owner || "Unavailable"}
                  </dd>
                </div>
                {!ownershipMatches && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded mt-3">
                    This NFT has been transferred. Please confirm with the
                    issuer.
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-white p-4 rounded-xl shadow flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Certificate Preview
              </h2>
              {certificateCID ? (
                <iframe
                  title="certificate-preview"
                  src={`${gatewayUrl(certificateCID)}#toolbar=0&view=Fit`}
                  className="flex-1 w-full rounded-lg border border-gray-200"
                />
              ) : (
                <p className="text-sm text-gray-500">
                  Unable to load certificate file.
                </p>
              )}
              <p className="text-xs text-gray-500 mt-3">
                If the PDF does not load,{" "}
                <a
                  className="text-my-blue underline"
                  href={gatewayUrl(certificateCID)}
                  target="_blank"
                  rel="noreferrer"
                >
                  open in a new tab
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {status === "ready" && !metadata && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-xl">
            Metadata is missing for this token. Contact the issuer for help.
          </div>
        )}

        <div className="mt-10 text-sm text-gray-500">
          <p>
            Need help?{" "}
            <Link to="/" className="text-my-blue underline">
              Return home
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
