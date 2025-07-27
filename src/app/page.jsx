"use client";
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import CountUp from "@/components/counter/page";
import Header from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import Link from 'next/link';

// Konfigurasi Supabase - pastikan sama dengan AuthForms
const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

export default function Homepage() {
  // Users state - TAMBAHKAN INI
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Courses state
  const [courses, setCourses] = useState([]);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourseStatus, setSelectedCourseStatus] = useState('all');
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, nama, role, status');
        
      if (error) {
        console.error('Error fetching users:', error);
        setUsersError(error.message);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setUsersError('An unexpected error occurred');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      setCoursesError(null);
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching courses:', error);
        setCoursesError(error.message);
      } else {
        setCourses(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setCoursesError('An unexpected error occurred');
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  // Rest of your component code...
  return (
    <>
    <Header/>
      <div className="flex flex-col md:flex-row justify-between w-screen max-w-screen-xl mx-auto px-4 gap-10 bg-white mt-10">
        <div>
          <h1 className="text-[45px] md:text-[50px] font-bold text-[#131313]">
            Belajar Lebih Mudah,<br className="hidden md:block"></br>
            <span className="text-[#0066FF] font-extrabold">
              Cepat & Terarah
            </span>
          </h1>
          <p className="text-[17px] MD:TEXT-[20px] text-[#505050] leading-[35px] md:leading-[48px] md:mt-5">
            Eduverse hadir untuk bantu kamu upgrade skill, baik buat karir,<br className="hidden md:block"></br> 
            bisnis, maupun pengembangan diri. Materi tersusun sistematis,<br className="hidden md:block"></br> 
            mudah dipahami, dan bisa diakses kapan pun di mana pun.<br className="hidden md:block"></br>
            Biar proses belajar jadi lebih menyenangkan dan nggak ngebosenin!
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
            Upgrade Ilmu, Tambah <br className="hidden md:block"></br>
            <span className="text-[#0066FF] font-extrabold">
              Value Diri Sekarang.
            </span>
          </h1>
          <p className="text-[17px] MD:TEXT-[20px] text-[#505050] leading-[35px] md:leading-[48px] md:mt-5">
            Eduverse bantu lo belajar secara fleksibel dan praktis.
            Akses ratusan materi edukasi mulai dari teknologi, bisnis, sampai skill karier masa kini.
            Semua bisa dipelajari langsung dari ahlinya kapan pun, di mana pun lo mau.
          </p>
        </div>
      </div>
            <div className="w-screen max-w-screen-xl md:mt-[80px] mx-auto px-4 gap-10">
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-center text-[40px] font-bold">Course</h2>
          <hr className="w-25 border-t-3 border-[#0066FF]" />
        </div>
        <Link href="/AuthForms">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white shadow-[0_6px_10px_rgba(0,0,0,0.08)] rounded-md p-4 flex flex-col"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="object-cover rounded-md w-[368px] h-[200px]"
                  />
                ) : (
                  <div className="h-[200px] bg-gray-200 flex items-center justify-center rounded-md text-gray-500">
                    No Image
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  <h2 className="text-[20px] font-bold text-[#131313]">
                    {course.title}
                  </h2>
                  <span className="text-[14px] font-semibold bg-[#0066FF] text-white py-1 px-3 rounded-md">
                    {course.level || "-"}
                  </span>
                </div>
                <p className="text-[#7D7D7D] text-[14px] mt-2 line-clamp-3">
                  {course.description || "No description available"}
                </p>
              </div>
            ))}
          </div>
        </Link>
      </div>
    <Footer/>
    </>
  );
}