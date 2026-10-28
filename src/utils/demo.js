import { useEffect, useRef, useState } from "react";
import { getRole, clearSession } from "./auth";
import { useProjectStore } from "../store/projectStore";
import projectSession from "./projectSession";

/**
 * 데모(test 계정) 흐름 도우미.
 * 데모는 실제 서비스와 같은 화면을 지나가되, 생성 단계는 미리 만들어 둔 결과를 쓴다.
 * 그래서 서버 작업은 금방 끝나는데, 화면에는 "이 정도 걸리는 작업"이라는 걸 보여 주도록 짧게 진행을 연출한다.
 */

export const isDemoUser = () => getRole() === "TEST";

/** 체험 세션을 깨끗하게 끝낸다 (첫 화면 진입, 실제 사용으로 전환) */
export const endDemoSession = () => {
  clearSession();
  useProjectStore.getState().reset();
  try {
    ["types", "acc_project"].forEach((k) => sessionStorage.removeItem(k));
    localStorage.removeItem("festivalForm");
  } catch {
    /* ignore */
  }
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 데모 프로젝트의 고정 베이스와 만들어 둔 파생물 종류 ({poster, mascot, types}). ProposalLoadingPage 가 저장한다 */
export const getDemoBase = () => {
  try {
    return JSON.parse(projectSession.getItem("demoBase") || "null");
  } catch {
    return null;
  }
};

/**
 * 데모일 때 작업 진행을 단계별로 연출한다.
 *  - steps: [{ type, label, seconds }] 화면에 보여 줄 단계 (실제 작업에 항목이 있으면 그 상태를 이어받는다)
 *  - 모든 단계 연출이 끝나고 실제 작업도 끝났을 때 실제 작업(SUCCEEDED/FAILED)을 돌려준다
 * 데모가 아니면 job 을 그대로 돌려준다.
 */
export function usePacedJob(job, enabled, steps) {
  const [now, setNow] = useState(() => Date.now());
  const startedAt = useRef(null);
  const running = enabled && !!job;

  useEffect(() => {
    if (!running) return undefined;
    if (!startedAt.current) startedAt.current = Date.now();
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [running]);

  if (!running || !steps?.length) return job;

  const start = (startedAt.current || now) / 1000;
  const nowSec = now / 1000;
  const realItems = job.progress?.items || [];
  let cursor = start;
  const items = steps.map((s) => {
    const begin = cursor;
    const end = begin + s.seconds;
    cursor = end;
    const real = realItems.find((it) => it.type === s.type);
    let status = "pending";
    if (nowSec >= end) status = real?.status === "failed" ? "failed" : "done";
    else if (nowSec >= begin) status = "running";
    return {
      type: s.type,
      label: s.label,
      status,
      expectSeconds: s.seconds,
      startedAt: status === "pending" ? null : begin,
      finishedAt: status === "done" || status === "failed" ? end : null,
    };
  });

  const paced = nowSec >= cursor;
  const finished = job.status === "SUCCEEDED" || job.status === "FAILED";
  if (paced && finished) return job;

  const done = items.filter((it) => it.status === "done" || it.status === "failed").length;
  return {
    ...job,
    status: "RUNNING",
    progress: {
      ...(job.progress || {}),
      phase: job.progress?.phase || "생성",
      total: items.length,
      done,
      items,
      now: nowSec,
      status: "running",
    },
  };
}

