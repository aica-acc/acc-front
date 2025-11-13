import React from "react";

const PromptCard = ({ item, onEdit }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition"
      onClick={() => onEdit(item)}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
          <i className="bi bi-file-text text-lg"></i>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{item.title}</h3>
          <p className="text-sm text-gray-500">클릭하여 편집</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
    </div>
  );
};

export default PromptCard;
