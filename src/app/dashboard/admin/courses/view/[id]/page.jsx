'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign,
  BookOpen,
  Video,
  FileText,
  Download,
  Eye,
  EyeOff,
  Play,
  Image,
  File
} from 'lucide-react';

export default function CourseViewPage({ params }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [course, setCourse] = useState(null);
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourseData();
    fetchCourseContent();
  }, [params.id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course data from courses table
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', params.id)
        .single();

      if (courseError) {
        throw courseError;
      }

      setCourse(courseData);
    } catch (err) {
      setError('Failed to load course data');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContent = async () => {
    try {
      // Fetch course content ordered by order_index
      const { data: contentData, error: contentError } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', params.id)
        .order('order_index', { ascending: true });

      if (contentError) {
        throw contentError;
      }

      setCourseContent(contentData || []);
    } catch (err) {
      console.error('Error fetching course content:', err);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/courses/edit/${params.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this course? This will also delete all course content.')) {
      try {
        setLoading(true);
        
        // Delete course content first (foreign key constraint)
        const { error: contentError } = await supabase
          .from('course_content')
          .delete()
          .eq('course_id', params.id);

        if (contentError) {
          throw contentError;
        }

        // Then delete the course
        const { error: courseError } = await supabase
          .from('courses')
          .delete()
          .eq('id', params.id);

        if (courseError) {
          throw courseError;
        }

        router.push('/admin/courses');
      } catch (err) {
        alert('Failed to delete course: ' + err.message);
        console.error('Delete error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleStatus = async () => {
    try {
      const newStatus = course.status === 'published' ? 'draft' : 'published';
      
      const { error } = await supabase
        .from('courses')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) {
        throw error;
      }

      setCourse(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Failed to update course status: ' + err.message);
      console.error('Status update error:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContentTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'document':
        return <File className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    // If duration is in minutes, convert to readable format
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    return duration;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Courses
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
                <div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course?.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course?.status}
                  </span>
                  <span className="text-sm text-gray-500 ml-4">
                    Updated {formatDate(course?.updated_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleStatus}
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                  course?.status === 'published'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {course?.status === 'published' ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <img
                src={course?.thumbnail || '/api/placeholder/800/400'}
                alt={course?.title}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'curriculum', label: 'Content' },
                    { id: 'analytics', label: 'Analytics' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {course?.description || 'No description available.'}
                      </p>
                    </div>

                    {course?.what_you_will_learn && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                        <ul className="space-y-2">
                          {course.what_you_will_learn.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {course?.requirements && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                        <ul className="space-y-2">
                          {course.requirements.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {course?.tags && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Course Content</h3>
                      <button
                        onClick={() => router.push(`/admin/courses/${params.id}/content/create`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                      >
                        Add Content
                      </button>
                    </div>
                    
                    {courseContent.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No content added yet.</p>
                        <button
                          onClick={() => router.push(`/admin/courses/${params.id}/content/create`)}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Add First Content
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {courseContent.map((content, index) => (
                          <div key={content.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
                                  {content.order_index}
                                </div>
                                <div className="flex items-center space-x-2 text-gray-500">
                                  {getContentTypeIcon(content.type)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {content.title}
                                  </h4>
                                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                    <span className="capitalize">{content.type}</span>
                                    {content.duration && (
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {formatDuration(content.duration)}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                      Created {formatDate(content.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => router.push(`/admin/courses/${params.id}/content/${content.id}/edit`)}
                                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this content?')) {
                                      // Handle delete content
                                    }
                                  }}
                                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {content.content && (
                              <div className="mt-3 pl-11">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {typeof content.content === 'string' ? 
                                    content.content.substring(0, 100) + '...' : 
                                    'Content available'
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Course Analytics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Eye className="w-8 h-8 text-blue-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Total Content</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {courseContent.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <BookOpen className="w-8 h-8 text-green-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {course?.total_students || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold">★</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Average Rating</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {course?.rating || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="w-8 h-8 text-purple-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="text-lg font-bold text-gray-900">
                              {course?.price ? formatCurrency(course.price) : 'Free'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">{course?.total_students?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-medium">
                    {course?.rating ? `${course.rating} ★` : 'No rating'} 
                    {course?.total_reviews ? ` (${course.total_reviews})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Content Items</span>
                  <span className="font-medium">{courseContent.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium">{course?.level || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{course?.category || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Course Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Instructor</label>
                  <p className="font-medium">{course?.instructor || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <p className="font-medium">{course?.category || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Price</label>
                  <div>
                    {course?.price ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-600">
                          {formatCurrency(course.price)}
                        </span>
                        {course?.discount_price && course.discount_price < course.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(course.discount_price)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium text-green-600">Free</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <p className="font-medium">{formatDate(course?.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Updated</label>
                  <p className="font-medium">{formatDate(course?.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push(`/admin/courses/${params.id}/content`)}
                  className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <BookOpen className="w-4 h-4 mr-3" />
                  Manage Content
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Download className="w-4 h-4 mr-3" />
                  Export Course Data
                </button>
                <button 
                  onClick={() => router.push(`/admin/courses/${params.id}/students`)}
                  className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Users className="w-4 h-4 mr-3" />
                  View Students
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 mr-3" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}