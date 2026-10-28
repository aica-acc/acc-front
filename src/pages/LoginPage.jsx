import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api/BaseAPI";
import Header from "../layout/Header";
import { useAuthStore } from "../store/authStore";

const inputClass =
  "w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500";

/** 실제 이용하기: 이메일 + 비밀번호 로그인 / 회원가입 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const loggedIn = useAuthStore((s) => !!s.token);
  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [testEnabled, setTestEnabled] = useState(false);

  const afterLogin = location.state?.from || "/select";

  // 이미 로그인한 사용자가 /login 에 들어오면 바로 다음 화면으로 (로그인 직후 이동도 이 효과가 처리한다)
  useEffect(() => {
    if (loggedIn) navigate(afterLogin, { replace: true });
  }, [loggedIn, afterLogin, navigate]);

  useEffect(() => {
    api
      .get("/api/auth/config")
      .then((res) => setTestEnabled(!!res.data?.testLoginEnabled))
      .catch(() => setTestEnabled(false));
  }, []);

  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;
      const res = await api.post(path, body);
      // 이동은 위의 효과가 처리한다 (스토어의 로그인 상태가 바뀌면 자동으로 다음 화면으로)
      setSession(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.status === 401
            ? "이메일 또는 비밀번호가 올바르지 않습니다."
            : err.response?.status === 409
            ? "이미 가입된 이메일입니다."
            : err.response?.status === 400
            ? "입력값을 확인해주세요. (이메일 형식, 비밀번호 8자 이상, 이름 필수)"
            : "요청에 실패했습니다. 잠시 후 다시 시도해주세요.")
      );
    } finally {
      setBusy(false);
    }
  };

  const testLogin = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/api/auth/test-login");
      setSession(res.data);
    } catch {
      setError("테스트 로그인에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Header />
      <div
        className="max-w-md mx-auto bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-lg"
        style={{ marginTop: "140px" }}
      >
        <h2 className="text-3xl font-semibold mb-2 text-center text-white">
          {mode === "login" ? "로그인" : "회원가입"}
        </h2>
        <p className="text-gray-400 text-center mb-6">
          {mode === "login" ? "ACC AI 를 실제로 이용하려면 로그인하세요" : "이메일로 간단히 가입할 수 있어요"}
        </p>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <>
              <input className={inputClass} placeholder="이름 *" value={form.name} onChange={change("name")} />
              <input className={inputClass} placeholder="연락처 (선택)" value={form.phone} onChange={change("phone")} />
            </>
          )}
          <input
            className={inputClass}
            type="email"
            placeholder="이메일 *"
            autoComplete="email"
            value={form.email}
            onChange={change("email")}
          />
          <input
            className={inputClass}
            type="password"
            placeholder={mode === "signup" ? "비밀번호 * (8자 이상)" : "비밀번호 *"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={form.password}
            onChange={change("password")}
          />

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-lg font-semibold text-lg bg-yellow-300 hover:bg-yellow-400 text-black transition disabled:opacity-60"
          >
            {mode === "login" ? "로그인" : "가입하고 시작하기"}
          </button>
        </form>

        <div className="text-center mt-4 text-gray-400 text-sm">
          {mode === "login" ? (
            <>
              계정이 없으신가요?{" "}
              <button className="text-indigo-400 hover:underline" onClick={() => { setMode("signup"); setError(""); }}>
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <button className="text-indigo-400 hover:underline" onClick={() => { setMode("login"); setError(""); }}>
                로그인
              </button>
            </>
          )}
        </div>

        {testEnabled && (
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm mb-3">가입 없이 먼저 둘러보고 싶다면</p>
            <button
              onClick={testLogin}
              disabled={busy}
              className="px-6 py-2.5 rounded-full border border-indigo-400 text-indigo-300 hover:bg-indigo-500/20 transition"
            >
              데모 둘러보기 (미리 만든 결과)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
