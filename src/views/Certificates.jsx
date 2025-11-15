import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAccount } from "wagmi";
import { fetchCertificates } from "../store/certificate-slice";
import CertificateCard from "../components/CertificateCard";
import Nav from "../components/Nav";

const Certificates = () => {
    const dispatch = useDispatch();
    const { address } = useAccount(); // <-- Admin wallet
    const normalizedWallet = address?.toLowerCase();

    const [selectedOrg, setSelectedOrg] = useState("Organizations");
    const [selectedEvent, setSelectedEvent] = useState("Events");

    const { organizations, certificates, events, status, error } = useSelector(
        (state) => state.CertificateSlice
    );

    // Load certificates once
    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchCertificates());
        }
    }, [dispatch, status]);

    // 🔥 Step 1 — Filter only certificates issued by *this admin*
    const adminCertificates = useMemo(() => {
        if (!normalizedWallet) return [];
        return certificates.filter((cert) => {
            const issuer = cert?.metadata?.issuerWallet;
            return (
                typeof issuer === "string" &&
                issuer.toLowerCase() === normalizedWallet
            );
        });
    }, [certificates, normalizedWallet]);

    // 🔥 Step 2 — Apply Org + Event filters on top
    const finalCertificates = useMemo(() => {
        return adminCertificates.filter((cert) => {
            // Org filter
            if (
                selectedOrg !== "Organizations" &&
                cert.metadata.organization !== selectedOrg
            )
                return false;

            // Event filter
            if (
                selectedEvent !== "Events" &&
                cert.metadata.event !== selectedEvent
            )
                return false;

            return true;
        });
    }, [adminCertificates, selectedOrg, selectedEvent]);

    const handleOrgChange = (e) => {
        setSelectedOrg(e.target.value);
        setSelectedEvent("Events");
    };

    const handleEventChange = (e) => {
        setSelectedEvent(e.target.value);
    };

    if (!address) {
        return (
            <p className="text-center mt-10 text-gray-600">
                Connect your admin wallet to view issued certificates.
            </p>
        );
    }

    if (status === "loading") {
        return <p className="text-center mt-10">Loading certificates…</p>;
    }

    if (status === "failed") {
        return <p className="text-center mt-10 text-red-500">{error}</p>;
    }

    return (
        <div className="w-full">
            <Nav cmp={"certificates"} />

            <div className="w-full px-10 flex justify-center mt-2">
                {/* Organization Filter */}
                <select
                    name="organization"
                    value={selectedOrg}
                    onChange={handleOrgChange}
                    className="p-2 w-80 rounded-lg outline-my-purple mr-4 bg-white"
                >
                    <option value="Organizations">Organizations</option>
                    {organizations.map((org) => (
                        <option key={org} value={org}>{org}</option>
                    ))}
                </select>

                {/* Event Filter */}
                <select
                    name="events"
                    value={selectedEvent}
                    onChange={handleEventChange}
                    className="p-2 w-80 rounded-lg outline-my-purple mr-4 bg-white"
                >
                    <option value="Events">Events</option>
                    {selectedOrg !== "Organizations" &&
                        events[selectedOrg]?.map((eve) => (
                            <option key={eve} value={eve}>{eve}</option>
                        ))}
                </select>
            </div>

            {/* Certificate Grid */}
            <div className="flex justify-center mt-4 flex-wrap gap-4">
                {finalCertificates.length === 0 ? (
                    <p className="text-gray-600 mt-10">
                        No certificates found for your filters.
                    </p>
                ) : (
                    finalCertificates.map((cert) => (
                        <div key={cert.id}>
                            <CertificateCard
                                certificateCID={cert.CertificateCID}
                                metaData={cert.metadata}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Certificates;
