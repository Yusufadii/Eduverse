'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function Dashadmin() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Initialize Supabase client
  const supabase = createClient();

  // ✅ Fetch Data
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

  // ✅ Delete Handler
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
        fetchUsers(); // Refresh data
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Terjadi kesalahan yang tidak terduga');
    }
  };

  // ✅ Filter Users (Fixed status filter logic)
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    // ✅ Fixed: status filter was using user.role instead of user.status
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ✅ Loading state
  if (loading) {
    return (
      <div className="w-screen max-w-screen-xl mx-auto px-4 gap-10 bg-white mt-10 text-[#131313]">
        <div className="flex justify-center items-center py-20">
          <div className="text-xl">Loading users...</div>
        </div>
      </div>
    );
  }

  // ✅ Error state
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
      <h1 className="text-[40px] font-bold mb-4">All Users</h1>

      {/* ✅ Added search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 border border-[#ccc] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
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
        
        <Link href="/admin/adduser">
          <button className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white px-4 py-2 rounded-md font-semibold gap-2">
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
                      <Link href={`/admin/edituser/${user.id}`}>
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