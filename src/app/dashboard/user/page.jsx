"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Grid, 
  List, 
  User, 
  ArrowLeft,
  Video,
  FileText,
  Download,
  CheckCircle,
  Circle,
  Award
} from 'lucide-react';

// Konfigurasi Supabase dengan session management yang lebih baik
const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const extractYouTubeId = (url) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/
  );
  return match ? match[1] : '';
};


const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('all-courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [user, setUser] = useState(null);
  
  // Course Detail State
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'course-detail'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseContent, setCourseContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [completedContent, setCompletedContent] = useState([]);

  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    console.log('Component mounted, initializing...');
    
    // Check custom auth dari localStorage DULU
    const initializeAuth = async () => {
      try {
        // Cek localStorage untuk custom auth
        const currentUserStr = localStorage.getItem('currentUser');
        console.log('LocalStorage currentUser:', currentUserStr);
        
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          console.log('Found currentUser in localStorage:', currentUser);
          
          // Convert custom user ke format Supabase-like
          const supabaseUser = {
            id: currentUser.id,
            email: currentUser.email,
            user_metadata: {
              name: currentUser.nama,
              role: currentUser.role
            },
            role: currentUser.role,
            status: currentUser.status
          };
          
          setUser(supabaseUser);
          console.log('Set user from localStorage:', supabaseUser);
        } else {
          console.log('No currentUser in localStorage, checking Supabase session...');
          
          // Fallback ke Supabase session (jika ada)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          console.log('Supabase session check:', { session, sessionError });
          
          if (session?.user) {
            console.log('Found Supabase session, setting user:', session.user);
            setUser(session.user);
          } else {
            console.log('No auth found anywhere');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      }
    };

    initializeAuth();
    fetchCoursesInitial();
    
    // Listen untuk auth state changes (Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth state changed:', { event, user: session?.user });
      
      // Jika ada session Supabase, gunakan itu
      if (session?.user) {
        setUser(session.user);
      }
      // Jika tidak ada session dan tidak ada localStorage, set null
      else if (!localStorage.getItem('currentUser')) {
        setUser(null);
      }
    });

    return () => {
      console.log('Cleanup auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      console.log('User detected, fetching my courses for:', user.id);
      fetchMyCourses();
    } else {
      console.log('No user, clearing my courses');
      setMyCourses([]);
    }
  }, [user]);

  const checkUser = async () => {
    try {
      console.log('Manual checking user...');
      
      // Check localStorage first (custom auth)
      const currentUserStr = localStorage.getItem('currentUser');
      console.log('localStorage currentUser:', currentUserStr);
      
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        console.log('Found custom user:', currentUser);
        
        // Convert ke format Supabase-like
        const supabaseUser = {
          id: currentUser.id,
          email: currentUser.email,
          user_metadata: {
            name: currentUser.nama,
            role: currentUser.role
          },
          role: currentUser.role,
          status: currentUser.status
        };
        
        setUser(supabaseUser);
        return;
      }
      
      // Fallback ke Supabase auth
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Supabase user check result:', { user, error });
      
      if (error) {
        console.error('Error getting user:', error);
        setUser(null);
        return;
      }
      
      if (user) {
        console.log('Supabase user found:', { 
          id: user.id, 
          email: user.email,
          role: user.role,
          aud: user.aud 
        });
        setUser(user);
      } else {
        console.log('No user found anywhere');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    }
  };

  const fetchCoursesInitial = async () => {
    try {
      setLoading(true);
      console.log('Fetching courses...');
      
      // Test koneksi dasar dulu
      const { data: testData, error: testError } = await supabase
        .from('courses')
        .select('count', { count: 'exact' });
      
      console.log('Test connection - Count:', testData, 'Error:', testError);
      
      // Fetch semua courses tanpa filter dulu
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');

      console.log('Courses data:', coursesData, 'Error:', coursesError);

      if (coursesError) {
        console.error('Courses error:', coursesError);
        // Jangan throw error, set empty array
        setCourses([]);
      } else {
        setCourses(coursesData || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      console.log('Fetching my courses for user:', user.id);
      
      const { data: enrolledData, error: enrolledError } = await supabase
        .from('enrollments')
        .select('course_id, courses(*)')
        .eq('user_id', user.id);

      console.log('Enrolled data:', enrolledData, 'Error:', enrolledError);

      if (!enrolledError && enrolledData) {
        const enrolledCourses = enrolledData.map(enrollment => enrollment.courses);
        setMyCourses(enrolledCourses);
      }
    } catch (error) {
      console.error('Error fetching my courses:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      
      // Clear custom auth data
      localStorage.removeItem('currentUser');
      
      // Clear Supabase session jika ada
      await supabase.auth.signOut();
      
      // Clear state
      setUser(null);
      setMyCourses([]);
      setCurrentView('dashboard');
      setSelectedCourse(null);
      setCourseContent([]);
      setSelectedContent(null);
      setCompletedContent([]);
      
      // Redirect ke auth page
      window.location.href = '/home';
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Tetap clear state meskipun ada error
      setUser(null);
      setMyCourses([]);
      window.location.href = '/home';
    }
  };

  const createSampleCourse = async () => {
    try {
      const sampleCourse = {
        title: 'Sample React Course',
        description: 'Learn React.js from beginner to advanced level. This is a sample course for testing purposes.',
        instructor_name: 'John Doe',
        level: 'beginner',
        duration: '10 hours',
        price: 299000,
        thumbnail: null,
        status: 'published',
        created_by: user?.id || null,
        students_count: 0,
        rating: 4.5
      };

      const { data, error } = await supabase
        .from('courses')
        .insert([sampleCourse])
        .select();

      if (error) {
        console.error('Error creating sample course:', error);
        alert('Error creating sample course: ' + error.message);
      } else {
        console.log('Sample course created:', data);
        setCourses(prev => [...prev, ...data]);
        alert('Sample course created successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating sample course');
    }
  };

  const handleAddToMyCourse = async (courseId) => {
    console.log('Adding course to My Courses:', courseId);

    try {
      // Jika user belum terdeteksi, coba ambil dari session
      let currentUser = user;
      if (!currentUser) {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        currentUser = sessionUser;
        if (sessionUser) {
          setUser(sessionUser);
        }
      }

      // Jika masih tidak ada user, kemungkinan ada masalah session
      if (!currentUser) {
        alert('Session expired. Please refresh the page and login again.');
        return;
      }

      // Check if already enrolled
      console.log('Checking existing enrollment...');
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('course_id', courseId)
        .single();

      console.log('Existing enrollment check:', { existingEnrollment, checkError });

      if (existingEnrollment) {
        alert('You are already enrolled in this course');
        return;
      }

      // Add course to enrollments - sesuaikan dengan struktur tabel Anda
      console.log('Adding course to enrollments...');
      const enrollmentData = {
        user_id: currentUser.id,
        course_id: courseId
      };

      // Tambah field optional jika ada di tabel
      if (enrollmentData.enrolled_at !== undefined) {
        enrollmentData.enrolled_at = new Date().toISOString();
      }
      if (enrollmentData.progress !== undefined) {
        enrollmentData.progress = 0;
      }

      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([enrollmentData]);

      console.log('Enrollment result:', { enrollError });

      if (enrollError) {
        console.error('Enrollment error:', enrollError);
        throw enrollError;
      }

      // Find the course and add to myCourses
      const courseToAdd = courses.find(course => course.id === courseId);
      console.log('Course to add:', courseToAdd);
      
      if (courseToAdd) {
        setMyCourses(prev => {
          const updated = [...prev, courseToAdd];
          console.log('Updated myCourses:', updated);
          return updated;
        });
        alert('Course added to My Courses successfully!');
      }

    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course: ' + error.message);
    }
  };

  const isEnrolled = (courseId) => {
    return myCourses.some(course => course.id === courseId);
  };

  const handleOpenCourse = async (course) => {
    setSelectedCourse(course);
    setCurrentView('course-detail');
    
    // Fetch course content
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', course.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCourseContent(data || []);
      
      if (data && data.length > 0) {
        setSelectedContent(data[0]);
      }

      // Fetch user progress if enrolled
      if (isEnrolled(course.id)) {
        // Ambil user dari session jika belum ada
        let currentUser = user;
        if (!currentUser) {
          const { data: { user: sessionUser } } = await supabase.auth.getUser();
          currentUser = sessionUser;
        }

        if (currentUser) {
          console.log('=== LOADING PROGRESS START ===');
          console.log('Loading progress for user:', currentUser.id, 'course:', course.id);
          
          // Langsung gunakan localStorage untuk simplicity
          const storageKey = `progress_${currentUser.id}_${course.id}`;
          console.log('Loading from storage key:', storageKey);
          
          const localProgress = JSON.parse(localStorage.getItem(storageKey) || '[]');
          console.log('Loaded progress from localStorage:', localProgress);
          
          setCompletedContent(localProgress);
          console.log('=== LOADING PROGRESS END ===');
        }
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCourse(null);
    setCourseContent([]);
    setSelectedContent(null);
    setCompletedContent([]);
  };

  const markContentComplete = async (contentId) => {
    console.log('=== MARK CONTENT COMPLETE START ===');
    console.log('Content ID:', contentId);
    console.log('Selected Course:', selectedCourse?.id);
    console.log('User:', user?.id);
    
    // Sama seperti handleAddToMyCourse, ambil user dari session jika belum ada
    let currentUser = user;
    if (!currentUser) {
      console.log('No user in state, getting from session...');
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      currentUser = sessionUser;
      if (sessionUser) {
        setUser(sessionUser);
        console.log('Got user from session:', sessionUser.id);
      }
    }

    if (!currentUser) {
      console.log('❌ No user found');
      alert('Please login to mark content as complete');
      return;
    }

    if (!isEnrolled(selectedCourse.id)) {
      console.log('❌ User not enrolled in course');
      alert('You must be enrolled in this course to mark content as complete');
      return;
    }

    console.log('✅ User and enrollment checks passed');
    console.log('Current user ID:', currentUser.id);
    console.log('Course ID:', selectedCourse.id);
    console.log('Content ID:', contentId);

    try {
      // Langsung gunakan localStorage untuk simplicity
      console.log('📱 Using localStorage for progress tracking');
      
      const storageKey = `progress_${currentUser.id}_${selectedCourse.id}`;
      console.log('Storage key:', storageKey);
      
      const existingProgress = JSON.parse(localStorage.getItem(storageKey) || '[]');
      console.log('Existing progress:', existingProgress);
      
      if (!existingProgress.includes(contentId)) {
        existingProgress.push(contentId);
        localStorage.setItem(storageKey, JSON.stringify(existingProgress));
        console.log('✅ Progress saved to localStorage:', existingProgress);
      } else {
        console.log('ℹ️ Content already marked as complete');
      }
      
      setCompletedContent(existingProgress);
      console.log('✅ State updated successfully');
      
    } catch (error) {
      console.error('❌ Error in markContentComplete:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      alert('Error saving progress: ' + (error.message || 'Unknown error'));
    }
    
    console.log('=== MARK CONTENT COMPLETE END ===');
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

  const getContentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'text':
        return <FileText className="w-5 h-5" />;
      case 'document':
        return <Download className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const calculateProgress = () => {
    if (courseContent.length === 0) return 0;
    return Math.round((completedContent.length / courseContent.length) * 100);
  };

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div 
        className="cursor-pointer"
        onClick={() => handleOpenCourse(course)}
      >
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
            <span>{course.duration || 'No duration'}</span>
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
        </div>
      </div>
      
      <div className="px-4 pb-4">
        {activeTab === 'my-courses' ? (
          <button 
            onClick={() => handleOpenCourse(course)}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Continue Learning
          </button>
        ) : (
          <>
            {isEnrolled(course.id) ? (
              <button 
                onClick={() => handleOpenCourse(course)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Open Course
              </button>
            ) : (
              <button 
                onClick={() => handleAddToMyCourse(course.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to My Course
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Course Detail View
  if (currentView === 'course-detail' && selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button 
                  onClick={handleBackToDashboard}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{selectedCourse.title}</h1>
                  <p className="text-sm text-gray-500">by {selectedCourse.instructor_name}</p>
                </div>
              </div>
              
              {isEnrolled(selectedCourse.id) && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-lg font-semibold text-green-600">{calculateProgress()}%</p>
                  </div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {selectedContent && isEnrolled(selectedCourse.id) ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedContent.title}</h3>
                    <button
                      onClick={() => markContentComplete(selectedContent.id)}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        completedContent.includes(selectedContent.id)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {completedContent.includes(selectedContent.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="prose max-w-none">
                    {selectedContent.type === 'video' && selectedContent.content && (
                      <div className="aspect-video mb-4">
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeId(selectedContent.content)}`}
                          title={selectedContent.title}
                          className="w-full h-full rounded-lg"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    
                    {selectedContent.type === 'text' && (
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedContent.content}
                      </div>
                    )}
                    
                    {['document', 'pdf'].includes(selectedContent.type?.toLowerCase()) && selectedContent.content && (() => {
                      let contentObj = selectedContent.content;
                      if (typeof contentObj === 'string') {
                        try {
                          contentObj = JSON.parse(contentObj);
                        } catch (e) {
                          console.warn('Content bukan JSON:', selectedContent.content);
                        }
                      }

                      if (contentObj?.pdf_url) {
                        return (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">
                              {contentObj.description || 'Dokumen siap diunduh'}
                            </p>
                            <a 
                              href={contentObj.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {contentObj.pdf_filename || 'Download PDF'}
                            </a>
                          </div>
                        );
                      }

                      return <p className="text-gray-500">❌ Dokumen tidak ditemukan.</p>;
                    })()}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Award className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isEnrolled(selectedCourse.id) ? 'No Content Available' : 'Add Course to Access Content'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isEnrolled(selectedCourse.id) 
                      ? 'This course doesn\'t have any content yet.'
                      : 'Add this course to your collection to access all materials and track your progress.'
                    }
                  </p>
                  {!isEnrolled(selectedCourse.id) && (
                    <button
                      onClick={() => handleAddToMyCourse(selectedCourse.id)}
                      className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add to My Course
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Course Content ({courseContent.length} items)
                </h3>
                
                <div className="space-y-2">
                  {courseContent.map((content, index) => (
                    <div
                      key={content.id}
                      onClick={() => isEnrolled(selectedCourse.id) && setSelectedContent(content)}
                      className={`p-3 rounded-lg border transition-colors ${
                        selectedContent?.id === content.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isEnrolled(selectedCourse.id) ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="text-xs text-gray-500 mr-2">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            {getContentIcon(content.type)}
                            <span className="ml-2 text-xs text-gray-500 capitalize">
                              {content.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {content.title}
                          </h4>
                          {content.duration && (
                            <p className="text-xs text-gray-500">
                              {content.duration}
                            </p>
                          )}
                        </div>
                        
                        {isEnrolled(selectedCourse.id) && (
                          <div className="ml-2">
                            {completedContent.includes(content.id) ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {courseContent.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No content available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between h-16">
            <div className="flex gap-5 text-[50px] font-bold ">
              <p className="text-[#131313]">Welcome back!</p>
              <p className="text-[#0066FF] capitalize">
                {user?.user_metadata?.name || user?.email || 'User'}
              </p>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">

                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
        </div>
        {/* Navigation Tabs */}
        <div className="my-8">
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
            </div>
          </div>
        </div>

        {/* Course Content */}
        {filteredCourses().length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {courses.length === 0 ? 'No courses in database' : 'No courses found'}
            </h3>
            <p className="text-gray-500">
              {courses.length === 0 
                ? 'Please add some courses to the database first.' 
                : activeTab === 'my-courses' 
                  ? "You haven't added any courses yet." 
                  : "Try adjusting your search or filters."
              }
            </p>
            
            {/* Add test button to create sample course */}
            {courses.length === 0 && (
              <button
                onClick={createSampleCourse}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Sample Course (for testing)
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses().map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;