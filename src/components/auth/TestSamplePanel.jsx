import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "../../utils/api/BaseAPI";

/**
 * test 계정 / 관리자 전용: 샘플 기획서(파일)와 입력값을 자동으로 채워서
 * 사용자가 "분석 시작하기"만 눌러 다음 단계로 넘어갈 수 있게 한다.
 *  - 폼이 비어 있으면 첫 번째 샘플을 자동 적용한다.
 *  - 드롭다운으로 다른 샘플을 고르면 다시 채운다.
 */
const TestSamplePanel = ({ formIsEmpty, onApply, demo = false }) => {
  const [samples, setSamples] = useState([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("");
  const autoApplied = useRef(false);

  const apply = useCallback(
    async (sample) => {
      const values = {
        festivalName: sample.title,
        keywords: sample.keywords || [],
        theme: sample.theme || "",
      };
      // 축제명·키워드·테마는 먼저 채운다 (기획서 파일을 못 받아도 입력값은 남도록)
      onApply({ ...values, file: null });
      setSelected(sample.id);
      setStatus("샘플 기획서를 불러오는 중...");
      try {
        const res = await api.get(`/api/test/samples/${sample.id}/file`, { responseType: "blob" });
        // 디스크 파일명(file)은 영문 id, 사용자에게 보이는 이름은 fileName(원래 한글 파일명)
        const name = sample.fileName || String(sample.file).split("/").pop();
        const file = new File([res.data], name, { type: res.data.type || "application/pdf" });
        onApply({ ...values, file });
        setStatus(`샘플 "${sample.title}" 이(가) 자동 입력되었습니다.`);
      } catch {
        setStatus("기획서 파일을 불러오지 못했습니다. 축제 정보만 입력되었으니 기획서는 직접 첨부해 주세요.");
      }
    },
    [onApply]
  );

  useEffect(() => {
    const load = demo
      ? // 데모: 같은 축제로 미리 만들어 둔 프로젝트가 있는 샘플만 (그 결과를 보여 준다)
        Promise.all([api.get("/api/test/samples"), api.get("/api/mypage/projects")]).then(([s, p]) => {
          const titles = new Set((p.data || []).map((x) => x.festivalName));
          return (s.data || []).filter((x) => titles.has(x.title));
        })
      : api.get("/api/test/samples").then((res) => res.data || []);
    load.then(setSamples).catch(() => setStatus("샘플 목록을 불러오지 못했습니다."));
  }, [demo]);

  useEffect(() => {
    if (samples.length > 0 && formIsEmpty && !autoApplied.current) {
      autoApplied.current = true;
      apply(samples[0]);
    }
  }, [samples, formIsEmpty, apply]);

  if (samples.length === 0 && !status) return null;

  return (
    <div className="mb-8 p-4 rounded-xl border border-indigo-500/50 bg-indigo-500/10">
      <div className="flex items-center gap-3 mb-2">
        {!demo && <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-500 text-white">TEST</span>}
        <span className="text-indigo-200 font-medium">
          {demo ? "예시 축제 기획서" : "테스트 계정 – 샘플 기획서 자동 입력"}
        </span>
      </div>
      {samples.length > 0 && (
        <select
          value={selected}
          onChange={(e) => {
            const s = samples.find((x) => x.id === e.target.value);
            if (s) apply(s);
          }}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 mb-2"
        >
          <option value="" disabled>
            다른 샘플 선택...
          </option>
          {samples.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      )}
      {status && <p className="text-sm text-indigo-200">{status}</p>}
      <p className="text-xs text-gray-400 mt-1">
        {demo
          ? '다른 축제를 고를 수 있습니다. 아래 "분석 시작하기"를 눌러 진행하세요.'
          : '값은 자유롭게 수정할 수 있습니다. 아래 "분석 시작하기"를 눌러 다음 단계로 진행하세요.'}
      </p>
    </div>
  );
};

export default TestSamplePanel;
