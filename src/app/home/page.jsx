"use client";
import React from "react";
import Image from "next/image";
import CountUp from "@/components/counter/page";

export default function Homepage() {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between w-screen max-w-screen-xl mx-auto px-4 gap-10 bg-white">
        <div>
          <h1 className="text-[45px] md:text-[50px] font-bold text-[#131313]">
            Lorem Ipsum{" "}
            <span className="text-[#0066FF] font-extrabold">
              Dolor Sit<br className="hidden md:block"></br> Amet
            </span>{" "}
            Orci Sit Nibh
          </h1>
          <p className="text-[17px] MD:TEXT-[20px] text-[#505050] leading-[35px] md:leading-[48px] md:mt-5">
            Lorem ipsum dolor sit amet consectetur. Tincidunt
            <br className="hidden md:block"></br> tempor tincidunt adipiscing
            lacus in nisl nisi pharetra.<br className="hidden md:block"></br>{" "}
            Commodo accumsan volutpat leo et.
          </p>
        </div>
        <div>
          <Image
            src="/images/homepages-laptop.png"
            width={550}
            height={550}
            alt="homepage"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-[500px_600px] justify-between w-screen max-w-screen-xl md:mt-[80px] mx-auto px-4 gap-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.06)] rounded-md md:px-[20px] flex flex-col items-center justify-center">
            <h2 className="text-[25px] text-[#131313]">Active User</h2>
            <div className="flex gap-3 font-extrabold text-[40px] md:text-[50px] text-[#131313]">
                <CountUp
                from={0}
                to={1000}
                separator=","
                direction="up"
                duration={2}
                className="count-up-text"
              />
              <span className="text-[#0066FF]">+</span>
            </div>
          </div>
          <div className="bg-[#131313] shadow-[0_6px_10px_rgba(0,0,0,0.06)] rounded-md md:px-[20px] flex flex-col items-center justify-center text-[#fff]">
            <h2 className="text-[25px] text-[#ffffff]">Course</h2>
            <div className="flex gap-3 font-extrabold text-[40px] md:text-[50px] text-[#ffffff]">
              <CountUp
                from={0}
                to={30}
                separator=","
                direction="up"
                duration={2}
                className="count-up-text"
              />
              <span className="text-[#0066FF]">+</span>
            </div>
          </div>
          <div className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.06)] rounded-md md:px-[20px] flex flex-col items-center justify-center">
            <h2 className="text-[25px] text-[#131313]">Partners</h2>
            <div className="flex gap-3 font-extrabold text-[40px] md:text-[50px] text-[#131313]">
              <CountUp
                from={0}
                to={50}
                separator=","
                direction="up"
                duration={2}
                className="count-up-text"
              />
              <span className="text-[#0066FF]">+</span>
            </div>
          </div>
          <div className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.06)] rounded-md md:px-[20px] flex flex-col items-center justify-center">
            <h2 className="text-[25px] text-[#131313]">Reviews</h2>
            <div className="flex gap-3 font-extrabold text-[40px] md:text-[50px] text-[#131313]">
              <CountUp
                from={0}
                to={300}
                separator=","
                direction="up"
                duration={2}
                className="count-up-text"
              />
              <span className="text-[#0066FF]">+</span>
            </div>
          </div>
        </div>
        <div className="order-first md:order-last">
          <h1 className="text-[45px] md:text-[50px] font-bold text-[#131313] mt-10 md:mt-0">
            Lorem Ipsum{" "}
            <span className="text-[#0066FF] font-extrabold">
              Dolor Sit<br className="hidden md:block"></br> Amet
            </span>{" "}
            Orci Sit Nibh
          </h1>
          <p className="text-[17px] MD:TEXT-[20px] text-[#505050] leading-[35px] md:leading-[48px] md:mt-5">
            Lorem ipsum dolor sit amet consectetur. Tincidunt
            <br className="hidden md:block"></br> tempor tincidunt adipiscing
            lacus in nisl nisi pharetra.<br className="hidden md:block"></br>{" "}
            Commodo accumsan volutpat leo et.
          </p>
        </div>
      </div>
      <div className="w-screen max-w-screen-xl md:mt-[80px] mx-auto px-4 gap-10">
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-center text-[40px] font-bold">Course</h2>
          <hr className="w-25 border-t-3 border-[#0066FF]" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-10">
          <div className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.08)] rounded-md md:p-[20px] flex flex-col items-center justify-center">
            <Image
              src="/images/course-image.png"
              width={1000}
              height={1000}
              alt="course"
            />
            <div className="flex flex-row justify-between items-center mt-5 w-full">
              <div>
                <h2 className="text-[25px] text-[#131313] font-bold">
                  Lorem ipsum
                </h2>
              </div>
              <div>
                <h3 className="text-[16px] text-[#ffffff] font-bold bg-[#0066FF] rounded-lg py-1 px-3">
                  Techno
                </h3>
              </div>
            </div>
            <p className="mt-3 text-[16px] text-[#7D7D7D]">
              Lorem ipsum dolor sit amet consectetur. Tincidunt tempor tincidunt
              adipiscing lacus in
            </p>
          </div>
          <div className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.08)] rounded-md md:p-[20px] flex flex-col items-center justify-center">
            <Image
              src="/images/course-image.png"
              width={1000}
              height={1000}
              alt="course"
            />
            <div className="flex flex-row justify-between items-center mt-5 w-full">
              <div>
                <h2 className="text-[25px] text-[#131313] font-bold">
                  Lorem ipsum
                </h2>
              </div>
              <div>
                <h3 className="text-[16px] text-[#ffffff] font-bold bg-[#0066FF] rounded-lg py-1 px-3">
                  Techno
                </h3>
              </div>
            </div>
            <p className="mt-3 text-[16px] text-[#7D7D7D]">
              Lorem ipsum dolor sit amet consectetur. Tincidunt tempor tincidunt
              adipiscing lacus in
            </p>
          </div>
          <div className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.08)] rounded-md md:p-[20px] flex flex-col items-center justify-center">
            <Image
              src="/images/course-image.png"
              width={1000}
              height={1000}
              alt="course"
            />
            <div className="flex flex-row justify-between items-center mt-5 w-full">
              <div>
                <h2 className="text-[25px] text-[#131313] font-bold">
                  Lorem ipsum
                </h2>
              </div>
              <div>
                <h3 className="text-[16px] text-[#ffffff] font-bold bg-[#0066FF] rounded-lg py-1 px-3">
                  Techno
                </h3>
              </div>
            </div>
            <p className="mt-3 text-[16px] text-[#7D7D7D]">
              Lorem ipsum dolor sit amet consectetur. Tincidunt tempor tincidunt
              adipiscing lacus in
            </p>
          </div>
          <div className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.08)] rounded-md md:p-[20px] flex flex-col items-center justify-center">
            <Image
              src="/images/course-image.png"
              width={1000}
              height={1000}
              alt="course"
            />
            <div className="flex flex-row justify-between items-center mt-5 w-full">
              <div>
                <h2 className="text-[25px] text-[#131313] font-bold">
                  Lorem ipsum
                </h2>
              </div>
              <div>
                <h3 className="text-[16px] text-[#ffffff] font-bold bg-[#0066FF] rounded-lg py-1 px-3">
                  Techno
                </h3>
              </div>
            </div>
            <p className="mt-3 text-[16px] text-[#7D7D7D]">
              Lorem ipsum dolor sit amet consectetur. Tincidunt tempor tincidunt
              adipiscing lacus in
            </p>
          </div>
          <div className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.08)] rounded-md md:p-[20px] flex flex-col items-center justify-center">
            <Image
              src="/images/course-image.png"
              width={1000}
              height={1000}
              alt="course"
            />
            <div className="flex flex-row justify-between items-center mt-5 w-full">
              <div>
                <h2 className="text-[25px] text-[#131313] font-bold">
                  Lorem ipsum
                </h2>
              </div>
              <div>
                <h3 className="text-[16px] text-[#ffffff] font-bold bg-[#0066FF] rounded-lg py-1 px-3">
                  Techno
                </h3>
              </div>
            </div>
            <p className="mt-3 text-[16px] text-[#7D7D7D]">
              Lorem ipsum dolor sit amet consectetur. Tincidunt tempor tincidunt
              adipiscing lacus in
            </p>
          </div>
          <div className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.08)] rounded-md md:p-[20px] flex flex-col items-center justify-center">
            <Image
              src="/images/course-image.png"
              width={1000}
              height={1000}
              alt="course"
            />
            <div className="flex flex-row justify-between items-center mt-5 w-full">
              <div>
                <h2 className="text-[25px] text-[#131313] font-bold">
                  Lorem ipsum
                </h2>
              </div>
              <div>
                <h3 className="text-[16px] text-[#ffffff] font-bold bg-[#0066FF] rounded-lg py-1 px-3">
                  Techno
                </h3>
              </div>
            </div>
            <p className="mt-3 text-[16px] text-[#7D7D7D]">
              Lorem ipsum dolor sit amet consectetur. Tincidunt tempor tincidunt
              adipiscing lacus in
            </p>
          </div>
        </div>
      </div>
    </>
  );
}