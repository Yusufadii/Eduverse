"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiArrowLeft, HiPlus, HiUser, HiMail, HiLockClosed, HiUserGroup } from 'react-icons/hi';

// Konfigurasi Supabase
const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AddUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    status: 'active'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    // Auto hide message after 5 seconds
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  const validateForm = () => {
    const { nama, email, password, confirmPassword } = formData;

    if (!nama.trim()) {
      showMessage('Nama tidak boleh kosong', 'error');
      return false;
    }

    if (!email.trim()) {
      showMessage('Email tidak boleh kosong', 'error');
      return false;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Format email tidak valid', 'error');
      return false;
    }

    if (!password) {
      showMessage('Password tidak boleh kosong', 'error');
      return false;
    }

    if (password.length < 6) {
      showMessage('Password minimal 6 karakter', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      showMessage('Konfirmasi password tidak sama', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Cek apakah email sudah terdaftar
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email.trim())
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        showMessage('Gagal mengecek email: ' + checkError.message, 'error');
        setIsLoading(false);
        return;
      }

      if (existingUser) {
        showMessage('Email sudah terdaftar', 'error');
        setIsLoading(false);
        return;
      }

      // Insert user baru
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            nama: formData.nama.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            role: formData.role,
            status: formData.status
          }
        ])
        .select();

      if (error) {
        showMessage('Gagal menambah user: ' + error.message, 'error');
        setIsLoading(false);
        return;
      }

      showMessage(`User ${formData.nama} berhasil ditambahkan!`, 'success');
      
      // Reset form
      setFormData({
        nama: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        status: 'active'
      });

      // Redirect ke halaman users setelah 2 detik
      setTimeout(() => {
        router.push('/dashboard/admin/');
      }, 2000);

    } catch (error) {
      showMessage('Terjadi kesalahan: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nama: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      status: 'active'
    });
    setMessage({ text: '', type: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/admin/users"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <HiArrowLeft className="text-xl" />
                <span>Kembali</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <HiPlus className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Tambah User Baru</h1>
                  <p className="text-gray-600">Tambahkan user atau admin baru ke sistem</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
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

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Informasi User</h2>
            <p className="text-gray-600 text-sm">Isi data lengkap untuk user baru</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiUser className="inline mr-2" />
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiMail className="inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="contoh@email.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiLockClosed className="inline mr-2" />
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiLockClosed className="inline mr-2" />
                  Konfirmasi Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ulangi password"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiUserGroup className="inline mr-2" />
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="active">🟢 Active</option>
                  <option value="inactive">🔴 Inactive</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
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
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <HiPlus className="text-lg" />
                    <span>Tambah User</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Informasi:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Password minimal 6 karakter</li>
            <li>• Email harus unique (tidak boleh duplikat)</li>
            <li>• User dengan role Admin dapat mengakses dashboard admin</li>
            <li>• Status inactive akan menonaktifkan akses login</li>
          </ul>
        </div>
      </div>
    </div>
  );
}