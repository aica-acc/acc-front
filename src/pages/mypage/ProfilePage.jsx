import React, { useState } from "react";

const ProfilePage = () => {
  // 더미 프로필 데이터
  const [form, setForm] = useState({
    username: "acc_user",
    name: "김민수",
    email: "kim_minsu@example.com",
    phone: "010-1234-5678",
    nickname: "민수",
    password: "",
    credit: 15,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제 저장 로직 대신 콘솔만
    console.log("프로필 더미 저장:", form);
    alert("더미 데이터라 실제로 저장되진 않아요 🙂");
  };

  return (
    <div className="w-full h-full flex justify-center items-start px-6 py-10">
      <div className="w-full max-w-3xl space-y-6">
        {/* 제목 */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">프로필 정보</h1>
          <p className="mt-2 text-sm text-slate-400">
            계정 정보를 확인하고 수정할 수 있어요.
          </p>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
          {/* 상단 프로필 영역 */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl text-white">
              {/* 간단한 사람 아이콘 느낌 */}
              <span className="select-none">👤</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{form.nickname}</p>
              <p className="mt-1 text-xs text-indigo-100">{form.email}</p>
            </div>
          </div>

          {/* 크레딧 영역 */}
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-300 text-sm font-semibold">
                C
              </div>
              <div>
                <p className="text-xs text-slate-400">보유 크레딧</p>
                <p className="text-sm font-semibold text-pink-300">
                  {form.credit} 크레딧
                </p>
              </div>
            </div>
            {/* <span className="text-[11px] text-slate-500">
              * 크레딧은 화면에서만 표시되는 더미 값입니다
            </span> */}
          </div>

          {/* 폼 영역 */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {/* 아이디 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                아이디
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 비밀번호 변경 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                비밀번호 변경
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="새 비밀번호를 입력하세요"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 이름 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">이름</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 이메일 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 휴대폰 번호 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                휴대폰 번호
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 닉네임 */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                닉네임
              </label>
              <input
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 버튼 */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 transition-colors"
              >
                프로필 저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
