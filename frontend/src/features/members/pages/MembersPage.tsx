import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, ShieldCheck } from 'lucide-react';
import { Member } from '@/types/memberTypes';
import { mockMembersList } from '@/services/memberService';
import { MemberTable } from '../components/MemberTable';
import { MemberForm } from '../components/MemberForm';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();

  useEffect(() => {
    // In real app: fetch from API
    setMembers(mockMembersList);
  }, []);

  const handleSave = (data: Partial<Member>) => {
    if (editingMember) {
      // Update
      setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...data } as Member : m));
    } else {
      // Create
      const newMember: Member = {
        ...(data as Member),
        id: `mem-new-${Date.now()}`,
        member_code: `TV0${members.length + 1}`,
        status: 'PENDING',
        join_date: new Date().toISOString().split('T')[0],
      };
      setMembers([newMember, ...members]);
    }
    setShowForm(false);
    setEditingMember(undefined);
  };

  const handleApprove = (m: Member) => {
    if (confirm(`Bạn có chắc chắn muốn duyệt kết nạp xã viên ${m.full_name}?`)) {
      setMembers(members.map(item => item.id === m.id ? { ...item, status: 'ACTIVE' } : item));
    }
  };

  const handleSuspend = (m: Member) => {
    if (confirm(`Bạn có chắc chắn muốn đình chỉ xã viên ${m.full_name}?`)) {
      setMembers(members.map(item => item.id === m.id ? { ...item, status: 'INACTIVE' } : item));
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.member_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-600/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Xã viên</h1>
          </div>
          <p className="text-emerald-50 text-lg max-w-2xl leading-relaxed">
            Danh sách thành viên Hợp tác xã Tân Tiến. Quản lý hồ sơ, theo dõi trạng thái và kết nạp thành viên mới.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => {
              setEditingMember(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl font-bold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" />
            <span>Thêm xã viên mới</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold mb-1">Tổng số xã viên</div>
          <div className="text-3xl font-bold text-slate-800">{members.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="text-green-600 text-sm font-semibold mb-1">Thành viên Chính thức</div>
          <div className="text-3xl font-bold text-slate-800">
            {members.filter(m => m.member_type === 'CHINH_THUC').length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="text-blue-600 text-sm font-semibold mb-1">Hộ liên kết</div>
          <div className="text-3xl font-bold text-slate-800">
            {members.filter(m => m.member_type !== 'CHINH_THUC').length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="text-orange-600 text-sm font-semibold mb-1">Chờ duyệt kết nạp</div>
          <div className="text-3xl font-bold text-slate-800">
            {members.filter(m => m.status === 'PENDING').length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, mã xã viên..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <MemberTable 
          members={filteredMembers} 
          onView={(m) => {
            setEditingMember(m);
            setShowForm(true); // Temporarily use form as view
          }}
          onEdit={(m) => {
            setEditingMember(m);
            setShowForm(true);
          }}
          onApprove={handleApprove}
          onSuspend={handleSuspend}
        />
      </div>

      {showForm && (
        <MemberForm 
          initialData={editingMember}
          onSave={handleSave} 
          onCancel={() => {
            setShowForm(false);
            setEditingMember(undefined);
          }} 
        />
      )}
    </div>
  );
};
