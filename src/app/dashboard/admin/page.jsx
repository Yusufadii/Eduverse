'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Konfigurasi Supabase - pastikan sama dengan AuthForms
const SUPABASE_URL = 'https://pdwoywubzmbhtjistdql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd295d3Viem1iaHRqaXN0ZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTY4MTgsImV4cCI6MjA2ODk5MjgxOH0.txxqW32gKoNYTCkJLZ1wpWekyf2ATrVqIQRjVMCBWhg';

export default function Dashadmin() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, nama, role, status');
        
      if (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="w-screen max-w-screen-xl mx-auto px-4 gap-10 bg-white mt-10 text-[#131313]">
        <div className="flex justify-center items-center py-20">
          <div className="text-xl">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen max-w-screen-xl mx-auto px-4 gap-10 bg-white mt-10 text-[#131313]">
        <div className="flex justify-center items-center py-20">
          <div className="text-xl text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="w-screen max-w-screen-xl mx-auto px-4 gap-10 bg-white mt-10 text-[#131313]">
      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-semibold">Active Users</h3>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(user => user.status === 'active').length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-purple-800 font-semibold">Admin Users</h3>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(user => user.role === 'admin').length}
          </p>
        </div>
      </div>
      <h1 className="text-[40px] font-bold mb-4">All Users</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-[#ccc] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label htmlFor="role" className="text-[16px]">Role:</label>
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
          
          <label htmlFor="status" className="text-[16px]">Status:</label>
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
          <button className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white px-4 py-2 rounded-md font-semibold gap-2 hover:from-[#0052CC] hover:to-[#003D99] transition-all duration-300">
            + Add Users
          </button>
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-md border border-[#dadada] p-4">
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
                        onClick={() => handleDelete(user.id)}
                        className="bg-[#AA0000] px-5 py-1 rounded-md text-white font-semibold hover:bg-[#CC0000] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && !loading && (
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
    </div>
  );
}