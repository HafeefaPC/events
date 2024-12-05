"use client";

import Link from "next/link";
import type { FC } from "react";
import { useAccount } from "wagmi";


const Home: FC = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 bg-white ">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">KERIVAADA MAKAllE</h1>
        <div className="flex flex-col gap-10 justify-center">
          {/* View Events Button */}
          <Link href="/viewevents">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
              View Events
            </button>
          </Link>

          {/* Mark Events Button */}
          <Link href="/markevents">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
              Mark Events
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
