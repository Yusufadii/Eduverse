"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Download,
  FileText,
  Video,
  CheckCircle,
  Circle,
  User,
  Calendar,
  Award
} from 'lucide-react';

// Konfigurasi Supabase
const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CourseDetailView = ({ courseId = 1 }) => {
  const [course, setCourse] = useState(null);
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [completedContent, setCompletedContent] = useState([]);

  useEffect(() => {
    checkUser();
    fetchCourseDetail();
    fetchCourseContent();
  }, [courseId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      checkEnrollment(user.id);
      fetchCompletedContent(user.id);
    }
  };

  const checkEnrollment = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (!error && data) {
        setIsEnrolled(true);
      }
    } catch (error) {
      console.log('Not enrolled or error checking enrollment');
    }
  };

  const fetchCourseDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchCourseContent = async () => {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCourseContent(data || []);
      
      // Set first content as selected by default
      if (data && data.length > 0) {
        setSelectedContent(data[0]);
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedContent = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('content_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);

      if (!error && data) {
        setCompletedContent(data.map(item => item.content_id));
      }
    } catch (error) {
      console.log('Error fetching progress:', error);
    }
  };

  const markContentComplete = async (contentId) => {
    if (!user || !isEnrolled) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert([
          {
            user_id: user.id,
            course_id: courseId,
            content_id: contentId,
            completed: true,
            completed_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      
      setCompletedContent(prev => [...prev.filter(id => id !== contentId), contentId]);
    } catch (error) {
      console.error('Error marking content complete:', error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-500">The requested course could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-500">by {course.instructor_name}</p>
              </div>
            </div>
            
            {isEnrolled && (
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
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Course Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{course.instructor_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{course.students_count || 0} students</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                      <span>{course.rating || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {course.level && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                          {course.level}
                        </span>
                      )}
                      {isEnrolled && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Enrolled
                        </span>
                      )}
                    </div>
                    
                    {course.price && (
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(course.price)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {!isEnrolled && (
                <div className="mt-6 pt-6 border-t">
                  <button
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Enroll in Course
                  </button>
                </div>
              )}
            </div>

            {/* Selected Content Display */}
            {selectedContent && isEnrolled && (
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
                    <div className="mb-4">
                      <video 
                        controls 
                        className="w-full rounded-lg"
                        src={selectedContent.content}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  
                  {selectedContent.type === 'text' && (
                    <div className="text-gray-700 leading-relaxed">
                      {selectedContent.content}
                    </div>
                  )}
                  
                  {selectedContent.type === 'document' && selectedContent.content && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Document available for download</p>
                      <a 
                        href={selectedContent.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download Document
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isEnrolled && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Award className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enroll to Access Course Content</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of students and start learning today. Get access to all course materials and track your progress.
                </p>
                <button
                  className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Enroll Now
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Course Content List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Course Content ({courseContent.length} items)
              </h3>
              
              <div className="space-y-2">
                {courseContent.map((content, index) => (
                  <div
                    key={content.id}
                    onClick={() => isEnrolled && setSelectedContent(content)}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedContent?.id === content.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isEnrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
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
                      
                      {isEnrolled && (
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
};

export default CourseDetailView;