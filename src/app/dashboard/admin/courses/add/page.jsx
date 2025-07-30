"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HiArrowLeft, 
  HiPlus, 
  HiAcademicCap, 
  HiClock, 
  HiCurrencyDollar, 
  HiPhotograph,
  HiDocument,
  HiPlay,
  HiCollection,
  HiPencil,
  HiTrash,
  HiSave,
  HiEye,
  HiUpload,
  HiVideoCamera,
  HiDocumentText,
  HiLink,
  HiX
} from 'react-icons/hi';

const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ComprehensiveAddCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    instructor_name: '',
    level: 'beginner',
    duration: '',
    price: 0,
    thumbnail: '',
    status: 'draft',
    students_count: 0,
    rating: 0
  });

  const [contentList, setContentList] = useState([]);
  const [showContentForm, setShowContentForm] = useState(false);
  const [editingContentIndex, setEditingContentIndex] = useState(null);
  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'lesson',
    content: '',
    duration: '',
    order_index: 1,
    youtube_url: '',
    pdf_file: null,
    pdf_url: ''
  });

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isValidYouTubeUrl = (url) => {
    return extractYouTubeId(url) !== null;
  };

  const uploadPdfFile = async (file) => {
    try {
      setUploadingPdf(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `course_materials/${fileName}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      setUploadingPdf(false);
      return publicUrl;
    } catch (error) {
      setUploadingPdf(false);
      throw error;
    }
  };

  const handlePdfFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showMessage('Please select a PDF file only', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showMessage('PDF file size should be less than 10MB', 'error');
      return;
    }

    try {
      const pdfUrl = await uploadPdfFile(file);
      setContentForm({
        ...contentForm,
        pdf_file: file,
        pdf_url: pdfUrl
      });
      setPdfPreview({
        name: file.name,
        size: file.size,
        url: pdfUrl
      });
      showMessage('PDF uploaded successfully!', 'success');
    } catch (error) {
      showMessage('Failed to upload PDF: ' + error.message, 'error');
    }
  };

  const handleCourseChange = (e) => {
    const { name, value, type } = e.target;
    setCourseData({
      ...courseData,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    });
  };

  const handleContentChange = (e) => {
    const { name, value, type } = e.target;
    setContentForm({
      ...contentForm,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    });
  };

  const validateContentForm = () => {
    if (!contentForm.title.trim()) {
      showMessage('Content title is required', 'error');
      return false;
    }

    switch (contentForm.type) {
      case 'video':
        if (!contentForm.youtube_url.trim()) {
          showMessage('YouTube URL is required for video content', 'error');
          return false;
        }
        if (!isValidYouTubeUrl(contentForm.youtube_url)) {
          showMessage('Please enter a valid YouTube URL', 'error');
          return false;
        }
        break;
      case 'pdf':
        if (!contentForm.pdf_url && !contentForm.content.trim()) {
          showMessage('PDF file or content description is required', 'error');
          return false;
        }
        break;
      case 'lesson':
      case 'quiz':
      case 'assignment':
        if (!contentForm.content.trim()) {
          showMessage('Content description is required', 'error');
          return false;
        }
        break;
    }

    return true;
  };

  const addContent = () => {
    if (!validateContentForm()) return;

    let finalContent = contentForm.content;
    
    switch (contentForm.type) {
      case 'video':
        const videoId = extractYouTubeId(contentForm.youtube_url);
        finalContent = JSON.stringify({
          description: contentForm.content,
          youtube_id: videoId,
          youtube_url: contentForm.youtube_url,
          embed_url: `https://www.youtube.com/embed/${videoId}`
        });
        break;
      case 'pdf':
        finalContent = JSON.stringify({
          description: contentForm.content,
          pdf_url: contentForm.pdf_url,
          pdf_filename: contentForm.pdf_file?.name || 'document.pdf'
        });
        break;
    }

    const newContent = {
      ...contentForm,
      content: finalContent,
      id: Date.now(),
      order_index: contentList.length + 1
    };

    if (editingContentIndex !== null) {
      const updatedList = [...contentList];
      updatedList[editingContentIndex] = newContent;
      setContentList(updatedList);
      setEditingContentIndex(null);
    } else {
      setContentList([...contentList, newContent]);
    }

    resetContentForm();
  };

  const resetContentForm = () => {
    setContentForm({
      title: '',
      type: 'lesson',
      content: '',
      duration: '',
      order_index: contentList.length + 2,
      youtube_url: '',
      pdf_file: null,
      pdf_url: ''
    });
    setPdfPreview(null);
    setShowContentForm(false);
  };

  const editContent = (index) => {
    const content = contentList[index];
    let formData = { ...content };
    try {
      if (content.type === 'video' || content.type === 'pdf') {
        const parsedContent = JSON.parse(content.content);
        formData.content = parsedContent.description || '';
        
        if (content.type === 'video') {
          formData.youtube_url = parsedContent.youtube_url || '';
        }
        
        if (content.type === 'pdf') {
          formData.pdf_url = parsedContent.pdf_url || '';
          if (parsedContent.pdf_url) {
            setPdfPreview({
              name: parsedContent.pdf_filename || 'document.pdf',
              url: parsedContent.pdf_url
            });
          }
        }
      }
    } catch (e) {
    }

    setContentForm(formData);
    setEditingContentIndex(index);
    setShowContentForm(true);
  };

  const deleteContent = (index) => {
    if (confirm('Delete this content?')) {
      const updatedList = contentList.filter((_, i) => i !== index);
      setContentList(updatedList);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lesson': return <HiDocument className="text-blue-500" />;
      case 'video': return <HiVideoCamera className="text-red-500" />;
      case 'pdf': return <HiDocumentText className="text-orange-500" />;
      case 'quiz': return <HiCollection className="text-green-500" />;
      case 'assignment': return <HiPencil className="text-purple-500" />;
      default: return <HiDocument className="text-gray-500" />;
    }
  };

  const renderContentPreview = (content) => {
    try {
      if (content.type === 'video') {
        const parsedContent = JSON.parse(content.content);
        return (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <HiVideoCamera className="text-red-500" />
              <span>YouTube Video</span>
            </div>
            <div className="bg-gray-100 rounded p-2">
              <a 
                href={parsedContent.youtube_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {parsedContent.youtube_url}
              </a>
            </div>
          </div>
        );
      }
      
      if (content.type === 'pdf') {
        const parsedContent = JSON.parse(content.content);
        return (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <HiDocumentText className="text-orange-500" />
              <span>PDF Document</span>
            </div>
            <div className="bg-gray-100 rounded p-2 flex items-center justify-between">
              <span className="text-sm">{parsedContent.pdf_filename}</span>
              <a 
                href={parsedContent.pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                <HiEye className="inline" /> View
              </a>
            </div>
          </div>
        );
      }
    } catch (e) {
    }
    
    return null;
  };

  const validateCourse = () => {
    const { title, description, instructor_name, duration } = courseData;

    if (!title.trim()) {
      showMessage('Course title is required', 'error');
      return false;
    }

    if (!description.trim()) {
      showMessage('Course description is required', 'error');
      return false;
    }

    if (!instructor_name.trim()) {
      showMessage('Instructor name is required', 'error');
      return false;
    }

    if (!duration.trim()) {
      showMessage('Course duration is required', 'error');
      return false;
    }

    if (courseData.price < 0) {
      showMessage('Price cannot be negative', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateCourse()) return;
    setIsLoading(true);
    try {
      const coursePayload = {
        ...courseData,
        created_by: currentUser?.id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: courseResult, error: courseError } = await supabase
        .from('courses')
        .insert([coursePayload])
        .select();

      if (courseError) {
        showMessage('Failed to create course: ' + courseError.message, 'error');
        setIsLoading(false);
        return;
      }

      const courseId = courseResult[0].id;
      if (contentList.length > 0) {
        const contentPayload = contentList.map((content, index) => ({
          course_id: courseId,
          title: content.title,
          type: content.type,
          content: content.content,
          duration: content.duration || null,
          order_index: index + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: contentError } = await supabase
          .from('course_content')
          .insert(contentPayload);

        if (contentError) {
          showMessage('Course created but failed to add content: ' + contentError.message, 'error');
          setIsLoading(false);
          return;
        }
      }

      showMessage(`Course "${courseData.title}" created successfully with ${contentList.length} content items!`, 'success');

      setCourseData({
        title: '',
        description: '',
        instructor_name: '',
        level: 'beginner',
        duration: '',
        price: 0,
        thumbnail: '',
        status: 'draft',
        students_count: 0,
        rating: 0
      });
      setContentList([]);
      setActiveStep(1);

      setTimeout(() => {
        router.push('/dashboard/admin');
      }, 2000);

    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
                  <HiPlus className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Create New Course</h1>
                  <p className="text-gray-600">Build a complete course with multimedia content</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Content Items:</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                  {contentList.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center">
            <div className={`flex items-center ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Course Information</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Course Content</span>
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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Course Information</h2>
                    <p className="text-gray-600 text-sm">Basic details about your course</p>
                  </div>
                  <button
                    onClick={() => setActiveStep(activeStep === 1 ? 2 : 1)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {activeStep === 1 ? 'Next: Add Content →' : '← Back to Course Info'}
                  </button>
                </div>
              </div>

              {activeStep === 1 && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiAcademicCap className="inline mr-2" />
                        Course Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={courseData.title}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter course title"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Description *
                      </label>
                      <textarea
                        name="description"
                        value={courseData.description}
                        onChange={handleCourseChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Detailed description of your course..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructor Name *
                      </label>
                      <input
                        type="text"
                        name="instructor_name"
                        value={courseData.instructor_name}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Instructor name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Level *
                      </label>
                      <select
                        name="level"
                        value={courseData.level}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="beginner">🟢 Beginner</option>
                        <option value="intermediate">🟡 Intermediate</option>
                        <option value="advanced">🔴 Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiClock className="inline mr-2" />
                        Duration *
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={courseData.duration}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., 8 weeks, 40 hours"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiCurrencyDollar className="inline mr-2" />
                        Price (IDR)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={courseData.price}
                        onChange={handleCourseChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0 for free course"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiPhotograph className="inline mr-2" />
                        Thumbnail URL
                      </label>
                      <input
                        type="url"
                        name="thumbnail"
                        value={courseData.thumbnail}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://example.com/image.jpg"
                      />
                      {courseData.thumbnail && (
                        <div className="mt-2">
                          <img 
                            src={courseData.thumbnail} 
                            alt="Thumbnail preview" 
                            className="w-32 h-20 object-cover rounded-lg border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={courseData.status}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="draft">📝 Draft</option>
                        <option value="published">✅ Published</option>
                        <option value="archived">📦 Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Rating (0-5)
                      </label>
                      <input
                        type="number"
                        name="rating"
                        value={courseData.rating}
                        onChange={handleCourseChange}
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      Next: Add Content
                      <HiArrowLeft className="rotate-180" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            {activeStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Course Content</h2>
                      <p className="text-gray-600 text-sm">Add lessons, videos, PDFs, quizzes, and assignments</p>
                    </div>
                    <button
                      onClick={() => setShowContentForm(!showContentForm)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <HiPlus className="text-sm" />
                      Add Content
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {showContentForm && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                          {editingContentIndex !== null ? 'Edit Content' : 'Add New Content'}
                        </h3>
                        <button
                          onClick={resetContentForm}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <HiX className="text-xl" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={contentForm.title}
                            onChange={handleContentChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter content title"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content Type *
                          </label>
                          <select
                            name="type"
                            value={contentForm.type}
                            onChange={handleContentChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="lesson">📄 Text Lesson</option>
                            <option value="video">🎥 YouTube Video</option>
                            <option value="pdf">📄 PDF Document</option>
                            <option value="quiz">📝 Quiz</option>
                            <option value="assignment">📋 Assignment</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration
                          </label>
                          <input
                            type="text"
                            name="duration"
                            value={contentForm.duration}
                            onChange={handleContentChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 15 minutes"
                          />
                        </div>
                        {contentForm.type === 'video' && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <HiVideoCamera className="inline mr-2 text-red-500" />
                              YouTube URL *
                            </label>
                            <input
                              type="url"
                              name="youtube_url"
                              value={contentForm.youtube_url}
                              onChange={handleContentChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="https://www.youtube.com/watch?v=..."
                              required
                            />
                            {contentForm.youtube_url && isValidYouTubeUrl(contentForm.youtube_url) && (
                              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700">
                                  <span className="text-sm">✓ Valid YouTube URL detected</span>
                                </div>
                                <div className="mt-2">
                                  <iframe
                                    width="300"
                                    height="169"
                                    src={`https://www.youtube.com/embed/${extractYouTubeId(contentForm.youtube_url)}`}
                                    frameBorder="0"
                                    allowFullScreen
                                    className="rounded"
                                  ></iframe>
                                </div>
                              </div>
                            )}
                            {contentForm.youtube_url && !isValidYouTubeUrl(contentForm.youtube_url) && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                ⚠ Please enter a valid YouTube URL
                              </div>
                            )}
                          </div>
                        )}

                        {contentForm.type === 'pdf' && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <HiDocumentText className="inline mr-2 text-orange-500" />
                              PDF Document *
                            </label>
                            
                            {!pdfPreview ? (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handlePdfFileChange}
                                  className="hidden"
                                  id="pdf-upload"
                                  disabled={uploadingPdf}
                                />
                                <label
                                  htmlFor="pdf-upload"
                                  className="cursor-pointer flex flex-col items-center"
                                >
                                  {uploadingPdf ? (
                                    <>
                                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                      <span className="text-sm text-gray-600">Uploading PDF...</span>
                                    </>
                                  ) : (
                                    <>
                                      <HiUpload className="text-3xl text-gray-400 mb-2" />
                                      <span className="text-sm text-gray-600">
                                        Click to upload PDF file (Max 10MB)
                                      </span>
                                    </>
                                  )}
                                </label>
                              </div>
                            ) : (
                              <div className="border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <HiDocumentText className="text-2xl text-orange-500" />
                                    <div>
                                      <div className="font-medium text-gray-800">{pdfPreview.name}</div>
                                      {pdfPreview.size && (
                                        <div className="text-sm text-gray-600">
                                          {(pdfPreview.size / (1024 * 1024)).toFixed(2)} MB
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={pdfPreview.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                    >
                                      <HiEye /> Preview
                                    </a>
                                    <button
                                      onClick={() => {
                                        setPdfPreview(null);
                                        setContentForm({ ...contentForm, pdf_file: null, pdf_url: '' });
                                      }}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      <HiTrash />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {contentForm.type === 'video' ? 'Video Description' : 
                             contentForm.type === 'pdf' ? 'PDF Description' : 'Content'} 
                            {contentForm.type !== 'pdf' && ' *'}
                          </label>
                          <textarea
                            name="content"
                            value={contentForm.content}
                            onChange={handleContentChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={
                              contentForm.type === 'video' ? 'Describe what this video covers...' :
                              contentForm.type === 'pdf' ? 'Describe the PDF content (optional)...' :
                              'Enter content description...'
                            }
                            required={contentForm.type !== 'pdf'}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={addContent}
                          disabled={uploadingPdf}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                          {editingContentIndex !== null ? 'Update Content' : 'Add Content'}
                        </button>
                        <button
                          onClick={resetContentForm}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {contentList.length === 0 ? (
                      <div className="text-center py-12">
                        <HiDocument className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-600 mb-2">No content added yet</h3>
                        <p className="text-gray-500 mb-4">Start by adding your first lesson, video, or PDF</p>
                        <button
                          onClick={() => setShowContentForm(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add First Content
                        </button>
                      </div>
                    ) : (
                      contentList.map((content, index) => (
                        <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex-shrink-0 mt-1">
                                {getTypeIcon(content.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm text-gray-500">#{index + 1}</span>
                                  <h3 className="font-medium text-gray-800">{content.title}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    content.type === 'lesson' ? 'bg-blue-100 text-blue-700' :
                                    content.type === 'video' ? 'bg-red-100 text-red-700' :
                                    content.type === 'pdf' ? 'bg-orange-100 text-orange-700' :
                                    content.type === 'quiz' ? 'bg-green-100 text-green-700' :
                                    'bg-purple-100 text-purple-700'
                                  }`}>
                                    {content.type}
                                  </span>
                                </div>
                                
                                {renderContentPreview(content)}
                                
                                {content.type === 'lesson' || content.type === 'quiz' || content.type === 'assignment' ? (
                                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                    {content.content.length > 100 
                                      ? content.content.substring(0, 100) + '...' 
                                      : content.content}
                                  </p>
                                ) : (
                                  (() => {
                                    try {
                                      const parsedContent = JSON.parse(content.content);
                                      return parsedContent.description && (
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                          {parsedContent.description.length > 100 
                                            ? parsedContent.description.substring(0, 100) + '...' 
                                            : parsedContent.description}
                                        </p>
                                      );
                                    } catch (e) {
                                      return null;
                                    }
                                  })()
                                )}
                                
                                {content.duration && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <HiClock className="text-xs" />
                                    <span>{content.duration}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => editContent(index)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <HiPencil className="text-sm" />
                              </button>
                              <button
                                onClick={() => deleteContent(index)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <HiTrash className="text-sm" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  {courseData.thumbnail ? (
                    <img 
                      src={courseData.thumbnail} 
                      alt="Course thumbnail" 
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <HiAcademicCap className="text-gray-400 text-2xl" />
                    </div>
                  )}
                  <h4 className="font-bold text-lg line-clamp-2 mb-1">
                    {courseData.title || 'Course Title'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    by {courseData.instructor_name || 'Instructor Name'}
                  </p>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      courseData.level === 'beginner' ? 'bg-green-100 text-green-700' :
                      courseData.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {courseData.level}
                    </span>
                    <span className="text-gray-600">{courseData.duration || 'Duration'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600">
                      {courseData.price === 0 ? 'Free' : `IDR ${courseData.price.toLocaleString()}`}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      courseData.status === 'published' ? 'bg-green-100 text-green-700' :
                      courseData.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {courseData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Content Summary</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{contentList.length}</div>
                    <div className="text-sm text-gray-600">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {contentList.filter(c => c.type === 'lesson').length}
                    </div>
                    <div className="text-sm text-gray-600">Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {contentList.filter(c => c.type === 'video').length}
                    </div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {contentList.filter(c => c.type === 'pdf').length}
                    </div>
                    <div className="text-sm text-gray-600">PDFs</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">Course Data</h3>
              <div className="text-blue-700 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Title:</span>
                  <span className="font-medium">{courseData.title || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Instructor:</span>
                  <span className="font-medium">{courseData.instructor_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <span className="font-medium capitalize">{courseData.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{courseData.duration || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">
                    {courseData.price === 0 ? 'Free' : `IDR ${courseData.price.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium capitalize">{courseData.status}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !courseData.title || !courseData.description}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isLoading || !courseData.title || !courseData.description
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  } text-white`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Course...</span>
                    </>
                  ) : (
                    <>
                      <HiSave className="text-lg" />
                      <span>Create Course</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const draft = { ...courseData, status: 'draft' };
                    setCourseData(draft);
                  }}
                  className="w-full py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Save as Draft
                </button>

                <button
                  onClick={() => {
                    if (confirm('Reset all data? This cannot be undone.')) {
                      setCourseData({
                        title: '',
                        description: '',
                        instructor_name: '',
                        level: 'beginner',
                        duration: '',
                        price: 0,
                        thumbnail: '',
                        status: 'draft',
                        students_count: 0,
                        rating: 0
                      });
                      setContentList([]);
                      setActiveStep(1);
                      setPdfPreview(null);
                    }
                  }}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}