"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, BookOpen, Clock, Users, Star, Play, Filter, Grid, List, User, LogOut } from 'lucide-react';

// Konfigurasi Supabase
const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('all-courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [user, setUser] = useState(null);

  // Levels untuk filter
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    checkUser();
    fetchCourses();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch semua courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      setCourses(coursesData || []);

      // Jika user sudah login, fetch course yang diikuti user
      if (user) {
        const { data: enrolledData, error: enrolledError } = await supabase
          .from('course_enrollments')
          .select('course_id, courses(*)')
          .eq('user_id', user.id);

        if (!enrolledError && enrolledData) {
          const enrolledCourses = enrolledData.map(enrollment => enrollment.courses);
          setMyCourses(enrolledCourses);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMyCourses([]);
  };

  const filteredCourses = () => {
    let coursesToFilter = activeTab === 'my-courses' ? myCourses : courses;
    
    if (searchTerm) {
      coursesToFilter = coursesToFilter.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedLevel !== 'all') {
      coursesToFilter = coursesToFilter.filter(course => 
        course.level && course.level.toLowerCase() === selectedLevel
      );
    }
    
    return coursesToFilter;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDuration = (duration) => {
    if (!duration) return 'Duration not specified';
    return duration;
  };

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white" />
          </div>
        )}
        
        {activeTab === 'my-courses' && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Enrolled
          </div>
        )}
        
        {course.level && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium capitalize">
            {course.level}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-800">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <User className="w-4 h-4 mr-1" />
          <span className="mr-4">{course.instructor_name}</span>
          <Clock className="w-4 h-4 mr-1" />
          <span>{formatDuration(course.duration)}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium">{course.rating || 'N/A'}</span>
            <span className="text-xs text-gray-500 ml-1">
              ({course.students_count || 0} students)
            </span>
          </div>
          
          {course.price && (
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(course.price)}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {activeTab === 'my-courses' ? (
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
              <Play className="w-4 h-4 mr-2" />
              Continue Learning
            </button>
          ) : (
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const CourseListItem = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <User className="w-4 h-4 mr-1" />
            <span className="mr-4">{course.instructor_name}</span>
            <Clock className="w-4 h-4 mr-1" />
            <span className="mr-4">{formatDuration(course.duration)}</span>
            {course.level && (
              <>
                <span className="bg-gray-200 px-2 py-1 rounded text-xs capitalize">
                  {course.level}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium">{course.rating || 'N/A'}</span>
              <span className="text-xs text-gray-500 ml-1">
                ({course.students_count || 0} students)
              </span>
            </div>
            
            {course.price && (
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(course.price)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0 flex flex-col justify-center">
          {activeTab === 'my-courses' ? (
            <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <Play className="w-4 h-4 mr-2" />
              Continue
            </button>
          ) : (
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('all-courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all-courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Courses ({courses.length})
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('my-courses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-courses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Courses ({myCourses.length})
              </button>
            )}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
              >
                {levels.map(level => (
                  <option key={level} value={level} className="capitalize">
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        {filteredCourses().length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">
              {activeTab === 'my-courses' 
                ? "You haven't enrolled in any courses yet." 
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredCourses().map((course) => (
              viewMode === 'grid' ? (
                <CourseCard key={course.id} course={course} />
              ) : (
                <CourseListItem key={course.id} course={course} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;