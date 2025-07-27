"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { HiArrowLeft, HiPlus, HiDocument, HiPlay, HiCollection, HiPencil, HiSave } from 'react-icons/hi';

const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AddSingleContentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [existingContents, setExistingContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'lesson',
    content: '',
    duration: '',
    order_index: 1
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchExistingContent();
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
        showMessage('Course not found: ' + error.message, 'error');
        return;
      }

      setCourse(data);
    } catch (err) {
      showMessage('Error fetching course: ' + err.message, 'error');
    }
  };

  const fetchExistingContent = async () => {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching existing content:', error);
      } else {
        setExistingContents(data || []);
        setFormData(prev => ({
          ...prev,
          order_index: (data?.length || 0) + 1
        }));
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showMessage('Title is required', 'error');
      return false;
    }

    if (!formData.content.trim()) {
      showMessage('Content is required', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const contentData = {
        course_id: parseInt(courseId),
        title: formData.title.trim(),
        type: formData.type,
        content: formData.content.trim(),
        duration: formData.duration || null,
        order_index: formData.order_index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('course_content')
        .insert([contentData])
        .select();

      if (error) {
        showMessage('Error adding content: ' + error.message, 'error');
        setIsLoading(false);
        return;
      }

      showMessage(`Content "${formData.title}" added successfully!`, 'success');
      
      setTimeout(() => {
        router.push(`/dashboard/admin/courses/content/${courseId}`);
      }, 2000);

    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/dashboard/admin/courses/content/${courseId}`}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <HiArrowLeft className="text-xl" />
                <span>Back to Content</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <HiPlus className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Add New Content</h1>
                  <p className="text-gray-600">Course: {course.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Content Details</h2>
                <p className="text-gray-600 text-sm">Fill in the information for the new content</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter content title (e.g., Introduction to React)"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Content Type *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'lesson', label: 'Lesson', icon: '📄', desc: 'Text-based lesson', color: 'blue' },
                        { value: 'video', label: 'Video', icon: '🎥', desc: 'Video content', color: 'red' },
                        { value: 'quiz', label: 'Quiz', icon: '📝', desc: 'Interactive quiz', color: 'green' },
                        { value: 'assignment', label: 'Assignment', icon: '📋', desc: 'Homework task', color: 'orange' }
                      ].map((type) => (
                        <label key={type.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`p-4 border-2 rounded-lg text-center transition-all ${
                            formData.type === type.value 
                              ? `border-${type.color}-500 bg-${type.color}-50` 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <div className="font-medium text-sm">{type.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={
                        formData.type === 'video' 
                          ? 'Enter video URL or embed code...\n\nExample:\nhttps://www.youtube.com/watch?v=VIDEO_ID\n\nor\n\n<iframe src="..." frameborder="0"></iframe>'
                          : formData.type === 'quiz'
                          ? 'Enter quiz questions in JSON format or description...\n\nExample:\n{\n  "questions": [\n    {\n      "question": "What is React?",\n      "options": ["Library", "Framework"],\n      "correct": 0\n    }\n  ]\n}'
                          : formData.type === 'assignment'
                          ? 'Enter assignment instructions and requirements...\n\n## Assignment: Build a Component\n\n### Objective:\nCreate a functional React component...\n\n### Requirements:\n1. Use functional component\n2. Include proper styling\n\n### Submission:\n- Upload component file\n- Include documentation'
                          : 'Enter lesson content, explanations, and materials...\n\n# Lesson Title\n\n## Introduction\nThis lesson will cover...\n\n## Key Concepts\n- Concept 1\n- Concept 2\n\n## Examples\n...'
                      }
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {formData.type === 'video' && 'Supports YouTube, Vimeo URLs or HTML embed codes'}
                      {formData.type === 'quiz' && 'You can use JSON format for structured quiz data'}
                      {formData.type === 'assignment' && 'Include clear instructions and submission guidelines'}
                      {formData.type === 'lesson' && 'You can use Markdown formatting for better presentation'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (Optional)
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., 15 minutes, 1 hour, 30 mins"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Position
                      </label>
                      <input
                        type="number"
                        name="order_index"
                        value={formData.order_index}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Position in the course (current max: {existingContents.length})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    } text-white flex items-center justify-center gap-2`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding Content...</span>
                      </>
                    ) : (
                      <>
                        <HiSave className="text-lg" />
                        <span>Add Content</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/dashboard/admin/courses/content/${courseId}`}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold text-center flex items-center justify-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Preview</h3>
              </div>
              <div className="p-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(formData.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500">#{formData.order_index}</span>
                        <h4 className="font-medium text-gray-800">
                          {formData.title || 'Content Title'}
                        </h4>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        formData.type === 'lesson' ? 'bg-blue-100 text-blue-700' :
                        formData.type === 'video' ? 'bg-red-100 text-red-700' :
                        formData.type === 'quiz' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {formData.type}
                      </span>
                      {formData.duration && (
                        <p className="text-sm text-gray-500 mt-2">⏱️ {formData.duration}</p>
                      )}
                      {formData.content && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-4">
                          {formData.content.length > 150 
                            ? formData.content.substring(0, 150) + '...' 
                            : formData.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Existing Content ({existingContents.length})</h3>
              </div>
              <div className="p-4">
                {existingContents.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No content yet. This will be the first one!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {existingContents.map((content) => (
                      <div key={content.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                        <span className="text-gray-500 font-mono">#{content.order_index}</span>
                        <div className="flex-shrink-0">
                          {getTypeIcon(content.type)}
                        </div>
                        <span className="flex-1 truncate font-medium">{content.title}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          content.type === 'lesson' ? 'bg-blue-100 text-blue-600' :
                          content.type === 'video' ? 'bg-red-100 text-red-600' :
                          content.type === 'quiz' ? 'bg-green-100 text-green-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {content.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Course Info</h3>
              <div className="text-blue-700 text-sm space-y-1">
                <p><span className="font-medium">Title:</span> {course.title}</p>
                <p><span className="font-medium">Instructor:</span> {course.instructor_name}</p>
                <p><span className="font-medium">Level:</span> {course.level}</p>
                <p><span className="font-medium">Status:</span> {course.status}</p>
                <p><span className="font-medium">Students:</span> {course.students_count || 0}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/dashboard/admin/courses/content/${courseId}`}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center block"
                >
                  Manage Content
                </Link>
                <Link
                  href={`/dashboard/admin/courses/edit/${courseId}`}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-center block"
                >
                  Edit Course
                </Link>
                <Link
                  href="/dashboard/admin"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}