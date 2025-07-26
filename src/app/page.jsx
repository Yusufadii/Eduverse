"use client";
import Image from "next/image";
import Homepage from "./home/page";

export default function Home() {
  return (
    <div>
      <div
        id="home"
        className="flex flex-col items-center justify-center mt-[70px] sm:pt-8 sm:ps-8 sm:pe-8"
      >
        <Homepage />
      </div>
    </div>
  );
}
