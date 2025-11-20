// src/components/editor/sidebar/EditorSidebar.jsx
import React from "react";
import LeftTabBar from "./LeftTabBar";
import SidePanelContainer from "./SidePanelContainer";

import MyDesignsPanel from "../panels/MyDesignsPanel";
import TextPanel from "../panels/TextPanel";
import IconsPanel from "../panels/IconsPanel";
import ShapesPanel from "../panels/ShapesPanel";
import UploadPanel from "../panels/UploadPanel";
import SizePanel from "../panels/SizePanel";
import LayersPanel from "../panels/LayersPanel";

const PANEL_COMPONENTS = {
  "my-designs": MyDesignsPanel,
  text: TextPanel,
  icons: IconsPanel,
  shapes: ShapesPanel,
  upload: UploadPanel,
  size: SizePanel,
  layers: LayersPanel,
};

const EditorSidebar = ({ activeTab, onChangeTab, designList, onSelectDesign }) => {
  const renderPanel = () => {
    if (activeTab === "my-designs") {
      return (
        <MyDesignsPanel designs={designList} onSelectDesign={onSelectDesign} />
      );
    }
    // 다른 탭들은 2단계에서 채움
    return (
      <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400">
        아직 준비되지 않은 패널입니다.
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* 왼쪽 아이콘 바 */}
      <LeftTabBar activeTab={activeTab} onTabClick={onChangeTab} />

      {/* 오른쪽 패널 (선택된 탭이 있을 때만) */}
      {activeTab && (
        <SidePanelContainer activeTab={activeTab} onClose={() => onChangeTab(null)}>
          {renderPanel()}
        </SidePanelContainer>
      )}
    </div>
  );
};

export default EditorSidebar;
