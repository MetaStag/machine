"use client";

import { useState } from "react";
import FetchData from "./fetchData";

export default function Analysis() {
  const [flag, setFlag] = useState(false);
  return (
    <div className="p-8">
      <button
        className="border-none p-2 rounded-md bg-black text-white hover:bg-gray-700 mb-2"
        onClick={() => setFlag(true)}
      >
        Analyze with AI
      </button>
      {flag && <FetchData />}
    </div>
  );
}
