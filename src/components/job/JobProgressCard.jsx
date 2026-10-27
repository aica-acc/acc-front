import React from "react";
import { summarizeBuild, formatDuration } from "../../utils/api/JobAPI";

const STATUS_VIEW = {
  done: { icon: "bi-check-circle-fill", color: "text-emerald-400", text: "완료" },
  reused: { icon: "bi-arrow-repeat", color: "text-sky-400", text: "기존 결과 사용" },
  running: { icon: "bi-arrow-clockwise animate-spin", color: "text-yellow-400", text: "생성 중" },
  pending: { icon: "bi-circle", color: "text-gray-500", text: "대기" },
  failed: { icon: "bi-x-circle-fill", color: "text-red-400", text: "실패" },
};

/**
 * 백그라운드 작업 진행 화면 (파생물 생성, 포스터·마스코트 생성이 같이 쓴다).
 * 진행률 막대 + 남은 시간 + 단계(항목)별 상태. 버튼은 actions 로 받는다.
 */
export default function JobProgressCard({ job, error, titles, note, actions }) {
  const { percent, remaining } = summarizeBuild(job);
  const p = job?.progress;
  const failed = job?.status === "FAILED" || !!error;

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-gray-700 bg-gray-800/70 p-8 shadow-xl">
        <h1 className="text-xl font-bold">
          {failed ? titles.failed : job?.status === "SUCCEEDED" ? titles.succeeded : titles.running}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {failed
            ? error || job?.error
            : "서버에서 만들고 있어 다른 화면으로 가도 계속 진행됩니다. 끝나면 오른쪽 아래에 알려 드립니다."}
        </p>

        {!failed && (
          <>
            <div className="mt-6 flex items-end justify-between text-sm">
              <span className="text-gray-300">{p ? `${p.phase} · ${p.done}/${p.total}` : "준비 중"}</span>
              <span className="text-gray-400">
                {job?.status === "SUCCEEDED" ? "" : `남은 시간 약 ${formatDuration(remaining)}`}
              </span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-1 text-right text-xs text-gray-400">{percent}%</div>
          </>
        )}

        {p?.items?.length > 0 && (
          <ul className="mt-5 space-y-1.5">
            {p.items.map((it) => {
              const view = STATUS_VIEW[it.reused ? "reused" : it.status] || STATUS_VIEW.pending;
              const secs =
                it.status === "running" && it.startedAt ? Math.round(p.now - it.startedAt)
                  : it.finishedAt && it.startedAt && !it.reused ? Math.round(it.finishedAt - it.startedAt)
                  : null;
              return (
                <li key={it.type} className="flex items-center gap-3 rounded-lg bg-gray-900/40 px-3 py-2 text-sm">
                  <i className={`bi ${view.icon} ${view.color}`} />
                  <span className="flex-1 text-gray-200">{it.label}</span>
                  <span className={`text-xs ${view.color}`}>
                    {view.text}
                    {secs != null && ` · ${secs}초`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex gap-2">{actions}</div>
        {!failed && note && <p className="mt-3 text-center text-xs text-gray-500">{note}</p>}
      </div>
    </div>
  );
}
