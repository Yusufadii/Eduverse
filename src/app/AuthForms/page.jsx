// app/AuthForms/page.jsx
"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Konfigurasi Supabase
const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

// Inisialisasi Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AuthFormsPage() {
  const router = useRouter();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
    registerName: '',
    registerEmail: '',
    registerPassword: '',
    registerRole: 'user'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setMessage({ text: '', type: '' });
    setFormData({
      loginEmail: '',
      loginPassword: '',
      registerName: '',
      registerEmail: '',
      registerPassword: '',
      registerRole: 'user'
    });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
  };

  const loginUser = async () => {
    const { loginEmail, loginPassword } = formData;

    if (!loginEmail || !loginPassword) {
      showMessage('Silakan isi email dan password', 'error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginEmail)
        .eq('password', loginPassword)
        .single();

      if (error || !data) {
        showMessage('Email atau password salah', 'error');
        console.log('Login error:', error);
        return;
      }

      showMessage(`Selamat datang, ${data.nama || data.email}!`, 'success');
      
      // Simpan data user ke localStorage
      localStorage.setItem('currentUser', JSON.stringify(data));
      
      // Redirect berdasarkan role setelah 1.5 detik
      setTimeout(() => {
        if (data.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/user');
        }
      }, 1500);

    } catch (err) {
      showMessage('Terjadi kesalahan saat login', 'error');
      console.error('Login error:', err);
    }
  };

  const registerUser = async () => {
    const { registerName, registerEmail, registerPassword, registerRole } = formData;

    if (!registerName || !registerEmail || !registerPassword) {
      showMessage('Silakan isi semua field', 'error');
      return;
    }

    if (registerPassword.length < 6) {
      showMessage('Password minimal 6 karakter', 'error');
      return;
    }

    try {
      // Cek apakah email sudah terdaftar
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', registerEmail)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.log('Check error:', checkError);
        showMessage('Gagal mengecek email: ' + checkError.message, 'error');
        return;
      }

      if (existingUser) {
        showMessage('Email sudah terdaftar', 'error');
        return;
      }

      // Insert user baru ke table users
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            nama: registerName,
            email: registerEmail,
            password: registerPassword,
            role: registerRole,
            status: 'active'
          }
        ])
        .select();

      if (error) {
        console.log('Insert error:', error);
        showMessage('Gagal mendaftar: ' + error.message, 'error');
        return;
      }

      console.log('User berhasil didaftarkan:', data);
      showMessage(`Pendaftaran berhasil sebagai ${registerRole}! Silakan login.`, 'success');
      
      setTimeout(() => {
        toggleForm();
      }, 1500);

    } catch (err) {
      showMessage('Terjadi kesalahan saat mendaftar', 'error');
      console.error('Register error:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isLoginForm) {
        loginUser();
      } else {
        registerUser();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {isLoginForm ? 'Login - Eduverse' : 'Daftar - Eduverse'}
        </h2>
        
        {message.text && (
          <div className={`p-3 rounded-lg mb-6 text-center ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}
        
        {isLoginForm ? (
          // Login Form
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email:
              </label>
              <input
                type="email"
                name="loginEmail"
                value={formData.loginEmail}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password:
              </label>
              <input
                type="password"
                name="loginPassword"
                value={formData.loginPassword}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>
            <button
              onClick={loginUser}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:-translate-y-1 shadow-lg"
            >
              Login
            </button>
            <p 
              onClick={toggleForm}
              className="text-center text-indigo-600 cursor-pointer hover:text-purple-600 font-medium underline"
            >
              Belum punya akun? Daftar di sini
            </p>
          </div>
        ) : (
          // Register Form
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama:
              </label>
              <input
                type="text"
                name="registerName"
                value={formData.registerName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email:
              </label>
              <input
                type="email"
                name="registerEmail"
                value={formData.registerEmail}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password:
              </label>
              <input
                type="password"
                name="registerPassword"
                value={formData.registerPassword}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>
            <button
              onClick={registerUser}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:-translate-y-1 shadow-lg mt-6"
            >
              Daftar
            </button>
            <p 
              onClick={toggleForm}
              className="text-center text-indigo-600 cursor-pointer hover:text-purple-600 font-medium underline"
            >
              Sudah punya akun? Login di sini
            </p>
          </div>
        )}
      </div>
    </div>
  );
}