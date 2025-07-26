'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { HiPlus, HiAcademicCap, HiUsers, HiEye, HiPencil, HiTrash, HiUser } from 'react-icons/hi';

// Konfigurasi Supabase - pastikan sama dengan AuthForms
const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

export default function AdminDashboard() {
  // Users state
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Courses state
  const [courses, setCourses] = useState([]);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourseStatus, setSelectedCourseStatus] = useState('all');
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('users');

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

  // Delete User
  const handleDeleteUser = async (id) => {
    const confirmDelete = confirm('Yakin mau hapus user ini?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Gagal hapus user:', error);
        alert('Gagal menghapus user: ' + error.message);
      } else {
        alert('User berhasil dihapus!');
        fetchUsers();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Terjadi kesalahan yang tidak terduga');
    }
  };

  const handleLogout = async () => {
  try {
    // Hapus session di localStorage (kalau lo pake custom user)
    localStorage.removeItem('currentUser');

    // Logout Supabase session
    await supabase.auth.signOut();

    // Redirect ke halaman login atau landing page
    window.location.href = '/home'; // ubah sesuai routing lo
  } catch (error) {
    console.error('Logout gagal:', error);
    alert('Terjadi kesalahan saat logout');
  }
};

  // Delete Course
  const handleDeleteCourse = async (id, title) => {
    const confirmDelete = confirm(`Yakin mau hapus course "${title}"?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Gagal hapus course:', error);
        alert('Gagal menghapus course: ' + error.message);
      } else {
        alert('Course berhasil dihapus!');
        fetchCourses();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Terjadi kesalahan yang tidak terduga');
    }
  };

  // Filter Users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user?.nama?.toLowerCase().includes(userSearchTerm.toLowerCase()) || '') ||
      (user?.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) || '');

    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filter Courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course?.title?.toLowerCase().includes(courseSearchTerm.toLowerCase()) || '') ||
      (course?.instructor_name?.toLowerCase().includes(courseSearchTerm.toLowerCase()) || '');

    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesStatus = selectedCourseStatus === 'all' || course.status === selectedCourseStatus;
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Format Price
  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  return (
    <div className="w-screen max-w-screen-xl mx-auto px-4 gap-10 bg-white mt-10 text-[#131313]">
      {/* Header */}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[40px] font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and courses for Eduverse platform</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-semibold transition-all"
        >
          Logout
        </button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <HiUsers className="text-blue-600 text-2xl" />
            <div>
              <h3 className="text-blue-800 font-semibold">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <HiUser className="text-green-600 text-2xl" />
            <div>
              <h3 className="text-green-800 font-semibold">Active Users</h3>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(user => user.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <HiAcademicCap className="text-purple-600 text-2xl" />
            <div>
              <h3 className="text-purple-800 font-semibold">Total Courses</h3>
              <p className="text-2xl font-bold text-purple-600">{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <HiAcademicCap className="text-orange-600 text-2xl" />
            <div>
              <h3 className="text-orange-800 font-semibold">Published Courses</h3>
              <p className="text-2xl font-bold text-orange-600">
                {courses.filter(course => course.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HiUsers className="inline mr-2" />
              Users Management ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HiAcademicCap className="inline mr-2" />
              Courses Management ({courses.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Users Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full border border-[#ccc] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label htmlFor="role" className="text-[16px] whitespace-nowrap">Role:</label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border border-[#ccc] rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              
              <label htmlFor="status" className="text-[16px] whitespace-nowrap">Status:</label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-[#ccc] rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <Link href="/dashboard/admin/adduser">
              <button className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white px-6 py-2 rounded-md font-semibold hover:from-[#0052CC] hover:to-[#003D99] transition-all duration-300 flex items-center gap-2">
                <HiPlus className="text-lg" />
                Add User
              </button>
            </Link>
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-xl">Loading users...</div>
            </div>
          ) : usersError ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-xl text-red-600">Error: {usersError}</div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden shadow-md border border-[#dadada] p-4 mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#dadada]">
                    <tr>
                      <th className="p-5 text-[22px] font-semibold text-center">ID</th>
                      <th className="p-5 text-[22px] font-semibold text-start">Nama</th>
                      <th className="p-5 text-[22px] font-semibold text-center">Status</th>
                      <th className="p-5 text-[22px] font-semibold text-center">Role</th>
                      <th className="p-5 text-[22px] font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-5 text-center text-[18px]">{user.id}</td>
                        <td className="p-5">
                          <div className="flex flex-col">
                            <div className="font-bold text-[18px] capitalize">{user.nama || 'N/A'}</div>
                            <div className="text-sm text-gray-500 text-[16px]">{user.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="p-5 text-center text-[18px] capitalize font-semibold">
                          <span className={`px-4 py-2 rounded-2xl ${
                            user.status === 'active' 
                              ? 'bg-[#D1FAE5] text-[#065F46]' 
                              : 'bg-[#FEE2E2] text-[#991B1B]'
                          }`}>
                            {user.status || 'N/A'}
                          </span>
                        </td>
                        <td className="p-5 text-center text-[18px] capitalize font-semibold">
                          {user.role || 'N/A'}
                        </td>
                        <td className="p-5 capitalize">
                          <div className="flex justify-center gap-4 items-center">
                            <Link href={`/dashboard/admin/edituser/${user.id}`}>
                              <button className="bg-[#FFD941] px-5 py-1 rounded-md text-[#131313] font-semibold hover:bg-[#FFD020] transition-colors">
                                Edit
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-[#AA0000] px-5 py-1 rounded-md text-white font-semibold hover:bg-[#CC0000] transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 && !usersLoading && (
                      <tr>
                        <td colSpan="5" className="p-5 text-center text-gray-400 italic">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          {/* Courses Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by title or instructor..."
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
                className="w-full border border-[#ccc] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              
              <label htmlFor="level" className="text-[16px] whitespace-nowrap">Level:</label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-[#ccc] rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              
              <label htmlFor="courseStatus" className="text-[16px] whitespace-nowrap">Status:</label>
              <select
                id="courseStatus"
                value={selectedCourseStatus}
                onChange={(e) => setSelectedCourseStatus(e.target.value)}
                className="border border-[#ccc] rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <Link href="/dashboard/admin/courses/add">
              <button className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white px-6 py-2 rounded-md font-semibold hover:from-[#0052CC] hover:to-[#003D99] transition-all duration-300 flex items-center gap-2">
                <HiPlus className="text-lg" />
                Add Course
              </button>
            </Link>
          </div>

          {/* Courses Table */}
          {coursesLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-xl">Loading courses...</div>
            </div>
          ) : coursesError ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-xl text-red-600">Error: {coursesError}</div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden shadow-md border border-[#dadada] p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#dadada]">
                    <tr>
                      <th className="p-5 text-[22px] font-semibold text-start">Course</th>
                      <th className="p-5 text-[22px] font-semibold text-center">Level</th>
                      <th className="p-5 text-[22px] font-semibold text-center">Duration</th>
                      <th className="p-5 text-[22px] font-semibold text-center">Price</th>
                      <th className="p-5 text-[22px] font-semibold text-center">Students</th>
                      <th className="p-5 text-[22px] font-semibold text-center">Status</th>
                      <th className="p-5 text-[22px] font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            {course.thumbnail ? (
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-16 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <HiAcademicCap className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <div className="font-bold text-[18px] line-clamp-2">{course.title || 'N/A'}</div>
                              <div className="text-sm text-gray-500 text-[14px]">by {course.instructor_name || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-center text-[16px] capitalize">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                            course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            course.level === 'advanced' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {course.level || 'N/A'}
                          </span>
                        </td>
                        <td className="p-5 text-center text-[16px]">{course.duration || 'N/A'}</td>
                        <td className="p-5 text-center text-[16px] font-semibold">
                          {course.price !== null ? formatPrice(course.price) : 'N/A'}
                        </td>
                        <td className="p-5 text-center text-[16px]">{course.students_count || 0}</td>
                        <td className="p-5 text-center text-[16px]">
                          <span className={`px-4 py-2 rounded-2xl font-semibold ${
                            course.status === 'published' ? 'bg-[#D1FAE5] text-[#065F46]' :
                            course.status === 'draft' ? 'bg-[#FEF3C7] text-[#92400E]' :
                            'bg-[#F3F4F6] text-[#374151]'
                          }`}>
                            {course.status || 'N/A'}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex justify-center gap-2 items-center">
                            <Link href={`/dashboard/admin/courses/content/${course.id}`}>
                              <button className="bg-blue-500 p-2 rounded-md text-white hover:bg-blue-600 transition-colors" title="View Course">
                                <HiEye className="text-sm" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDeleteCourse(course.id, course.title)}
                              className="bg-[#AA0000] p-2 rounded-md text-white hover:bg-[#CC0000] transition-colors"
                              title="Delete Course"
                            >
                              <HiTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredCourses.length === 0 && !coursesLoading && (
                      <tr>
                        <td colSpan="7" className="p-10 text-center text-gray-400">
                          <div className="flex flex-col items-center gap-4">
                            <HiAcademicCap className="text-6xl text-gray-300" />
                            <div>
                              <p className="text-xl font-medium">No courses found</p>
                              <p className="text-sm">Create your first course to get started</p>
                            </div>
                            <Link href="/dashboard/admin/courses/add">
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Create Course
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}