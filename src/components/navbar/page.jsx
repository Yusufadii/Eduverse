'use client'
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';

export default function Header() {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'courses', 'project', 'certificate'];
      const navbarHeight = 90;
      let currentActive = 'home';

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= navbarHeight && rect.bottom >= navbarHeight) {
            currentActive = sections[i];
            break;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 90;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      if (window.location.hash !== `#${sectionId}`) {
        window.history.pushState(null, '', `#${sectionId}`);
      }

      setMenuOpen(false);
    }
  };

  const navItemClass = (section) =>
    `text-[18px] font-medium transition-all ease-in-out duration-300 hover:text-[#0066FF] hover:font-semibold hover:scale-105 hover:tracking-wide ${
      activeSection === section
        ? 'text-[#0066FF] font-semibold scale-105 tracking-wide'
        : 'text-[#131313]'
    }`;

  return (
    <div className="shadow-[0_6px_10px_rgba(0,0,0,0.06)] bg-white">
      <div className="flex justify-between items-center max-w-screen-xl mx-auto py-6 px-4">
        <div>
          <Image src="/images/Logo.png" width={150} height={150} alt="Eduverse Logo" />
        </div>

        <div className="hidden md:flex gap-10 items-center">
          <button className={navItemClass('home')} onClick={() => scrollToSection('home')}>
            Home
          </button>
          <button className={navItemClass('about')} onClick={() => scrollToSection('about')}>
            About
          </button>
          <button className={navItemClass('courses')} onClick={() => scrollToSection('courses')}>
            Course
          </button>
          <Link href="/AuthForms">
            <button className="bg-[#0066FF] px-6 py-1 text-[18px] font-bold text-white rounded-lg hover:bg-[#0049B7] transition-all ease-in-out duration-500">
              Join Us!
            </button>
          </Link>
        </div>
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-3xl text-[#131313]">
            {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col items-start gap-5 pb-6 ps-5">
          <button className={navItemClass('home')} onClick={() => scrollToSection('home')}>
            Home
          </button>
          <button className={navItemClass('about')} onClick={() => scrollToSection('about')}>
            About
          </button>
          <button className={navItemClass('courses')} onClick={() => scrollToSection('courses')}>
            Courses
          </button>
          <button className="bg-[#0066FF] px-6 py-2 text-[18px] font-bold text-white rounded-lg hover:bg-[#0049B7] transition-all ease-in-out duration-500 w-fit">
            Join Us!
          </button>
        </div>
      )}
    </div>
  );
}