import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AdminGuard from './AdminGuard';
import type { MemberRole, NotificationPreferences } from '../lib/supabase-types';

interface Member {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
  role: MemberRole;
  member_since: string;
  notification_preferences: NotificationPreferences;
}

export default function AdminMembers() {
  return (
    <AdminGuard>
      <AdminMembersContent />
    </AdminGuard>
  );
}

function AdminMembersContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    const { data } = await supabase
      .from('member_profiles')
      .select('*')
      .order('member_since', { ascending: false });
    setMembers((data as Member[]) || []);
    setLoading(false);
  }

  async function toggleRole(member: Member) {
    const newRole: MemberRole = member.role === 'admin' ? 'member' : 'admin';
    await supabase
      .from('member_profiles')
      .update({ role: newRole })
      .eq('id', member.id);
    await loadMembers();
  }

  const filtered = members.filter(m =>
    m.display_name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-text-muted text-center py-8">載入中...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">會員列表 ({members.length})</h2>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜尋名稱或 email..."
          className="px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary text-sm focus:border-brand focus:outline-none w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted border-b border-surface-lighter">
              <th className="pb-3 font-medium">會員</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">角色</th>
              <th className="pb-3 font-medium">加入日期</th>
              <th className="pb-3 font-medium">通知設定</th>
              <th className="pb-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(member => (
              <tr key={member.id} className="border-b border-surface-lighter/50 hover:bg-surface-light/50">
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-xs font-bold text-brand-light">
                        {member.display_name[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{member.display_name}</span>
                  </div>
                </td>
                <td className="py-3 text-text-muted">{member.email}</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    member.role === 'admin' ? 'bg-brand/20 text-brand-light' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {member.role === 'admin' ? '管理員' : '會員'}
                  </span>
                </td>
                <td className="py-3 text-text-muted text-xs">
                  {new Date(member.member_since).toLocaleDateString('zh-TW')}
                </td>
                <td className="py-3">
                  <div className="flex gap-1">
                    {member.notification_preferences.event_confirmation && <span title="報名確認">📩</span>}
                    {member.notification_preferences.event_reminder && <span title="活動提醒">⏰</span>}
                    {member.notification_preferences.event_update && <span title="活動異動">📢</span>}
                    {member.notification_preferences.new_article && <span title="新文章">📘</span>}
                  </div>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => toggleRole(member)}
                    className="text-xs px-3 py-1 border border-surface-lighter hover:border-brand/40 rounded-lg text-text-secondary hover:text-text-primary transition-all"
                  >
                    {member.role === 'admin' ? '降為會員' : '升為管理員'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
