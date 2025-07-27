"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  HiArrowLeft, 
  HiPlus, 
  HiAcademicCap, 
  HiDocument, 
  HiPlay, 
  HiCollection, 
  HiPencil,
  HiTrash,
  HiEye,
  HiClock,
  HiArrowUp,
  HiArrowDown,
  HiDuplicate
} from 'react-icons/hi';

const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ManageContentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchCourseContent();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        setError('Course not found: ' + error.message);
        return;
      }

      setCourse(data);
    } catch (err) {
      setError('Error fetching course: ' + err.message);
    }
  };

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) {
        setError('Error fetching content: ' + error.message);
      } else {
        setContents(data || []);
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete content "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('course_content')
        .delete()
        .eq('id', id);

      if (error) {
        showMessage('Error deleting content: ' + error.message, 'error');
        return;
      }

      showMessage('Content deleted successfully!', 'success');
      fetchCourseContent();
    } catch (err) {
      showMessage('Error: ' + err.message, 'error');
    }
  };

  const handleReorder = async (id, newOrderIndex) => {
    try {
      const { error } = await supabase
        .from('course_content')
        .update({ order_index: newOrderIndex, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        showMessage('Error reordering content: ' + error.message, 'error');
        return;
      }

      fetchCourseContent();
    } catch (err) {
      showMessage('Error: ' + err.message, 'error');
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const currentContent = filteredContents[index];
    const previousContent = filteredContents[index - 1];
    
    handleReorder(currentContent.id, previousContent.order_index);
    handleReorder(previousContent.id, currentContent.order_index);
  };

  const moveDown = (index) => {
    if (index === filteredContents.length - 1) return;
    const currentContent = filteredContents[index];
    const nextContent = filteredContents[index + 1];
    
    handleReorder(currentContent.id, nextContent.order_index);
    handleReorder(nextContent.id, currentContent.order_index);
  };

  const duplicateContent = async (content) => {
    try {
      const duplicatedContent = {
        course_id: parseInt(courseId),
        title: content.title + ' (Copy)',
        type: content.type,
        content: content.content,
        duration: content.duration,
        order_index: contents.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('course_content')
        .insert([duplicatedContent]);

      if (error) {
        showMessage('Error duplicating content: ' + error.message, 'error');
        return;
      }

      showMessage('Content duplicated successfully!', 'success');
      fetchCourseContent();
    } catch (err) {
      showMessage('Error: ' + err.message, 'error');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lesson': return <HiDocument className="text-blue-500" />;
      case 'video': return <HiPlay className="text-red-500" />;
      case 'quiz': return <HiCollection className="text-green-500" />;
      case 'assignment': return <HiPencil className="text-orange-500" />;
      default: return <HiDocument className="text-gray-500" />;
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesType = selectedType === 'all' || content.type === selectedType;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error}</p>
          <Link href="/dashboard/admin" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <HiArrowLeft className="text-xl" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <HiAcademicCap className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Course Content</h1>
                  <p className="text-gray-600">{course?.title || 'Loading...'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/admin/courses/content/${courseId}/add`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <HiPlus className="text-lg" />
                Add Content
              </Link>
            </div>
          </div>
        </div>

        {course && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-semibold">Total Content</h3>
              <p className="text-2xl font-bold text-blue-600">{contents.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold">Lessons</h3>
              <p className="text-2xl font-bold text-green-600">
                {contents.filter(c => c.type === 'lesson').length}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold">Videos</h3>
              <p className="text-2xl font-bold text-red-600">
                {contents.filter(c => c.type === 'video').length}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-orange-800 font-semibold">Assignments</h3>
              <p className="text-2xl font-bold text-orange-600">
                {contents.filter(c => c.type === 'assignment').length}
              </p>
            </div>
          </div>
        )}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              ) : (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Types</option>
                <option value="lesson">📄 Lessons</option>
                <option value="video">🎥 Videos</option>
                <option value="quiz">📝 Quizzes</option>
                <option value="assignment">📋 Assignments</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredContents.length} of {contents.length} items
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Course Content</h2>
            <p className="text-gray-600 text-sm">Manage and organize your course materials</p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Loading content...</p>
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="text-center py-12">
                <HiDocument className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  {contents.length === 0 ? 'No content yet' : 'No content matches your filter'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {contents.length === 0 
                    ? 'Start by adding your first lesson or video'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {contents.length === 0 && (
                  <Link
                    href={`/dashboard/admin/courses/content/${courseId}/add`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <HiPlus className="text-lg" />
                    Add First Content
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContents.map((content, index) => (
                  <div key={content.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(content.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-500 font-mono">#{content.order_index}</span>
                            <h3 className="font-semibold text-gray-800 text-lg">{content.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              content.type === 'lesson' ? 'bg-blue-100 text-blue-700' :
                              content.type === 'video' ? 'bg-red-100 text-red-700' :
                              content.type === 'quiz' ? 'bg-green-100 text-green-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {content.type}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                            {content.content.length > 200 
                              ? content.content.substring(0, 200) + '...' 
                              : content.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {content.duration && (
                              <div className="flex items-center gap-1">
                                <HiClock className="text-xs" />
                                <span>{content.duration}</span>
                              </div>
                            )}
                            <span>Created: {new Date(content.created_at).toLocaleDateString()}</span>
                            {content.updated_at !== content.created_at && (
                              <span>Updated: {new Date(content.updated_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Move Up"
                          >
                            <HiArrowUp className="text-sm" />
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === filteredContents.length - 1}
                            className={`p-1 rounded ${
                              index === filteredContents.length - 1
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Move Down"
                          >
                            <HiArrowDown className="text-sm" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => duplicateContent(content)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <HiDuplicate className="text-sm" />
                          </button>
                          <Link
                            href={`/dashboard/admin/courses/content/${courseId}/edit/${content.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <HiPencil className="text-sm" />
                          </Link>
                          <button
                            onClick={() => handleDelete(content.id, content.title)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <HiTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Course Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/admin/courses/content/${courseId}/add`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <HiPlus className="text-sm" />
              Add New Content
            </Link>
            <Link
              href="/dashboard/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <HiArrowLeft className="text-sm" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}