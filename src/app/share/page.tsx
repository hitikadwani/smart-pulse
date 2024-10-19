"use client"
import Link from "next/link";
import React, { useState } from "react";

const metadata = {
    title: "Share | Smart-Pulse",
};

const Share = () => {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.origin) // This will copy the main website URL
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000); // Reset the message after 2 seconds
            })
            .catch((err) => console.error("Failed to copy: ", err));
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 mt-6">
            <Link href="/" className="flex items-center gap-2 mb-4 mt-20">
                <p className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white">
                    Smart-Pulse
                </p>
            </Link>
            <button
                onClick={handleCopy}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-all"
            >
                {copySuccess ? "Link Copied!" : "Copy Link to Share"}
            </button>
        </div>
    );
};

export default Share;
