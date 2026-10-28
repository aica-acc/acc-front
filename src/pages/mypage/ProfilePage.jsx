import React, { useEffect, useState } from "react";
import api from "../../utils/api/BaseAPI";
import { useAuthStore } from "../../store/authStore";
import CreditPanel from "../../components/credit/CreditPanel";

const ROLE_LABEL = { USER: "일반 회원", TEST: "데모 계정", ADMIN: "관리자" };

const inputClass =
  "w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60";

const errorText = (e, fallback) =>
  e.response?.status === 403
    ? "변경할 수 없습니다. (현재 비밀번호 또는 계정 권한을 확인해주세요)"
    : e.response?.status === 400
    ? "입력값을 확인해주세요."
    : fallback;

/** 마이프로필: 내 정보 확인 · 이름/연락처 수정 · 비밀번호 변경 · 내 활동 요약 */
const ProfilePage = () => {
  const [me, setMe] = useState(null);
  const updateMember = useAuthStore((s) => s.updateMember);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [stats, setStats] = useState({ projects: 0, assets: 0 });
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [loadError, setLoadError] = useState("");

  const isTest = me?.role === "TEST";

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((res) => {
        setMe(res.data);
        setForm({ name: res.data.name || "", phone: res.data.phone || "" });
      })
      .catch(() => setLoadError("내 정보를 불러오지 못했습니다."));

    Promise.all([api.get("/api/mypage/projects"), api.get("/api/mypage/assets")])
      .then(([p, a]) => setStats({ projects: p.data.length, assets: a.data.length }))
      .catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    try {
      const res = await api.patch("/api/auth/me", form);
      setMe(res.data);
      updateMember(res.data);
      setProfileMsg({ type: "ok", text: "저장했습니다." });
    } catch (err) {
      setProfileMsg({ type: "err", text: errorText(err, "저장에 실패했습니다.") });
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (pw.newPassword.length < 8) {
      setPwMsg({ type: "err", text: "새 비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ type: "err", text: "새 비밀번호 확인이 일치하지 않습니다." });
      return;
    }
    try {
      await api.post("/api/auth/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setPwMsg({ type: "ok", text: "비밀번호를 변경했습니다." });
    } catch (err) {
      setPwMsg({ type: "err", text: errorText(err, "비밀번호 변경에 실패했습니다.") });
    }
  };

  if (loadError) return <p className="text-center text-red-400 py-20">{loadError}</p>;
  if (!me) return <p className="text-center text-gray-400 py-20">불러오는 중...</p>;

  const msgClass = (m) => (m.type === "ok" ? "text-green-400" : "text-red-400");

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* 상단 요약 */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold">
          {(me.name || "?").trim().charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{me.name}</h1>
          <p className="text-gray-400">{me.email}</p>
          <span className="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full bg-indigo-500">
            {ROLE_LABEL[me.role] || me.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1b1c25] rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-yellow-300">{stats.projects}</p>
          <p className="text-sm text-gray-400 mt-1">프로젝트</p>
        </div>
        <div className="bg-[#1b1c25] rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-yellow-300">{stats.assets}</p>
          <p className="text-sm text-gray-400 mt-1">생성된 홍보물</p>
        </div>
        <div className="bg-[#1b1c25] rounded-xl p-5 text-center">
          <p className="text-lg font-bold text-yellow-300 mt-2">{me.createAt || "-"}</p>
          <p className="text-sm text-gray-400 mt-1">가입일</p>
        </div>
      </div>

      <CreditPanel />

      {isTest && (
        <p className="mb-6 p-4 rounded-xl border border-indigo-500/50 bg-indigo-500/10 text-indigo-200 text-sm">
          데모 계정은 여러 사람이 함께 쓰므로 정보와 비밀번호를 변경할 수 없습니다.
        </p>
      )}

      {/* 기본 정보 */}
      <form onSubmit={saveProfile} className="bg-[#1b1c25] rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
        <label className="block text-sm text-gray-300 mb-1">이메일</label>
        <input className={inputClass + " mb-4"} value={me.email} disabled />
        <label className="block text-sm text-gray-300 mb-1">이름</label>
        <input
          className={inputClass + " mb-4"}
          value={form.name}
          disabled={isTest}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <label className="block text-sm text-gray-300 mb-1">연락처</label>
        <input
          className={inputClass + " mb-4"}
          value={form.phone}
          disabled={isTest}
          placeholder="010-0000-0000"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {profileMsg.text && <p className={`mb-3 text-sm ${msgClass(profileMsg)}`}>{profileMsg.text}</p>}
        <button
          type="submit"
          disabled={isTest}
          className="px-6 py-2.5 rounded-lg font-semibold bg-yellow-300 text-black hover:bg-yellow-400 transition disabled:opacity-40"
        >
          저장
        </button>
      </form>

      {/* 비밀번호 변경 */}
      <form onSubmit={savePassword} className="bg-[#1b1c25] rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">비밀번호 변경</h2>
        <input
          className={inputClass + " mb-3"}
          type="password"
          placeholder="현재 비밀번호"
          autoComplete="current-password"
          disabled={isTest}
          value={pw.currentPassword}
          onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
        />
        <input
          className={inputClass + " mb-3"}
          type="password"
          placeholder="새 비밀번호 (8자 이상)"
          autoComplete="new-password"
          disabled={isTest}
          value={pw.newPassword}
          onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
        />
        <input
          className={inputClass + " mb-4"}
          type="password"
          placeholder="새 비밀번호 확인"
          autoComplete="new-password"
          disabled={isTest}
          value={pw.confirm}
          onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
        />
        {pwMsg.text && <p className={`mb-3 text-sm ${msgClass(pwMsg)}`}>{pwMsg.text}</p>}
        <button
          type="submit"
          disabled={isTest}
          className="px-6 py-2.5 rounded-lg font-semibold border border-gray-500 hover:bg-gray-700 transition disabled:opacity-40"
        >
          비밀번호 변경
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
