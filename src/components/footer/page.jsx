import React from 'react'

export default function Footer() {
  const FooterClass = (section) =>
    `text-[16px] font-semibold transition-all ease-in-out duration-300 hover:text-[#0066FF] text-[#0066FF]' : 'text-[#131313]'
  }`;
  return (
    <div className='flex justify-between items-center max-w-screen-xl mx-auto py-3 px-5 shadow-[0_6px_10px_rgba(0,0,0,0.06)] bg-white rounded-3xl mt-10 text-[#131313]'>
      <div>
        <p className={FooterClass('home')}>@Eduverse 2025</p>
      </div>
      <div className='flex gap-10 items-center'>
          <button className={FooterClass('home')}>
            Home
          </button>
          <button className={FooterClass('about')}>
            About
          </button>
          <button className={FooterClass('course')}>
            Course
          </button>
        </div>
    </div>
  )
}
