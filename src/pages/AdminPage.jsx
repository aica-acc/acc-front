import React, { useCallback, useEffect, useState } from "react";
import api from "../utils/api/BaseAPI";
import Header from "../layout/Header";
import { useAuthStore } from "../store/authStore";

const ROLES = ["USER", "TEST", "ADMIN"];
const ROLE_LABEL = { USER: "일반", TEST: "테스트", ADMIN: "관리자" };

/** 관리자 화면: 회원 목록, 권한 변경, 계정 정지/해제, 회원 데이터 초기화(test 계정 되돌리기) */
const AdminPage = () => {
  const me = useAuthStore((s) => s.member);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.get("/api/admin/members");
      setMembers(res.data);
      setError("");
    } catch {
      setError("회원 목록을 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn, okMessage) => {
    setMessage("");
    setError("");
    try {
      await fn();
      setMessage(okMessage);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "처리에 실패했습니다.");
    }
  };

  const changeRole = (m, role) =>
    run(() => api.patch(`/api/admin/members/${m.mNo}/role`, { role }), `${m.email} 권한을 ${ROLE_LABEL[role]}(으)로 변경했습니다.`);

  const toggleState = (m) => {
    const next = m.state === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    return run(
      () => api.patch(`/api/admin/members/${m.mNo}/state`, { state: next }),
      next === "SUSPENDED" ? `${m.email} 계정을 정지했습니다.` : `${m.email} 계정을 다시 활성화했습니다.`
    );
  };

  const resetData = (m) => {
    if (!window.confirm(`${m.email} 의 프로젝트와 생성 기록을 모두 삭제할까요? (되돌릴 수 없음)`)) return;
    return run(
      async () => {
        const res = await api.post(`/api/admin/members/${m.mNo}/reset-data`);
        setMessage(`${m.email} 프로젝트 ${res.data.deletedProjects}개를 삭제했습니다.`);
      },
      ""
    );
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Header />
      <div className="max-w-6xl mx-auto px-6 pb-16" style={{ paddingTop: "120px" }}>
        <h2 className="text-3xl font-semibold text-white mb-2">관리자</h2>
        <p className="text-gray-400 mb-6">회원 권한을 바꾸거나 테스트 데이터를 초기화할 수 있습니다. 변경은 즉시 적용됩니다.</p>

        {message && <p className="text-green-400 mb-3">{message}</p>}
        {error && <p className="text-red-400 mb-3">{error}</p>}

        <div className="overflow-x-auto bg-gray-800 border border-gray-700 rounded-xl">
          <table className="w-full text-left text-gray-200">
            <thead className="bg-gray-700/60 text-gray-300 text-sm">
              <tr>
                <th className="px-4 py-3">회원번호</th>
                <th className="px-4 py-3">이메일</th>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">권한</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">가입일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const self = m.email === me?.email;
                return (
                  <tr key={m.mNo} className="border-t border-gray-700">
                    <td className="px-4 py-3 font-mono text-sm">{m.mNo}</td>
                    <td className="px-4 py-3">{m.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.name}</td>
                    <td className="px-4 py-3">
                      <select
                        value={m.role}
                        disabled={self}
                        onChange={(e) => changeRole(m, e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.state === "SUSPENDED" ? "정지" : "정상"}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{m.createAt}</td>
                    <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                      <button
                        disabled={self}
                        onClick={() => toggleState(m)}
                        className="px-3 py-1 text-sm rounded border border-gray-500 hover:bg-gray-700 disabled:opacity-40"
                      >
                        {m.state === "SUSPENDED" ? "정지 해제" : "정지"}
                      </button>
                      <button
                        onClick={() => resetData(m)}
                        className="px-3 py-1 text-sm rounded border border-red-400 text-red-300 hover:bg-red-500/20"
                      >
                        데이터 초기화
                      </button>
                    </td>
                  </tr>
                );
              })}
              {members.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
