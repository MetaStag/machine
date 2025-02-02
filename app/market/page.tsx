"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import Widget from "@/app/components/graph";
import TickerWidget from "@/app/components/ticker";
import SummaryWidget from "@/app/components/summary";
import HeatmapWidget from "@/app/components/heatmap";
import NewsWidget from "@/app/components/news";
import "react-datepicker/dist/react-datepicker.css";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"], // Select weights (400 = normal, 700 = bold)
  style: ["normal", "italic"], // Optional: Include italics
  display: "swap",
});

export default function Market() {
  const router = useRouter();
  return (
    <div className={`flex flex-col gap-y-4 m-8 ${roboto.className}`}>
      <div className="flex flex-row gap-x-2 max-h-20 justify-center">
        <span className="text-center text-2xl font-bold border-r-2 border-r-gray-400 border-opacity-25">
          Machine Minds
        </span>
        <TickerWidget />
      </div>
      <div className="flex flex-row gap-x-8">
        <Widget />
        <div className="flex flex-col mt-12">
          <button
            className="border-none p-2 rounded-md bg-black text-white hover:bg-gray-700 mb-2"
            onClick={() => router.push("/analysis")}
          >
            Analyze with AI
          </button>
          <SummaryWidget />
          <HeatmapWidget />
        </div>
      </div>
      <NewsWidget />
    </div>
  );
}
