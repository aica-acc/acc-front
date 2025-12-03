export default function NaviControls({ index, total, onPrev, onNext }) {
  return (
    <div className="flex items-center gap-4">
      <button disabled={index === 0} onClick={onPrev}
        className="p-2 bg-gray-700 rounded-full shadow disabled:opacity-30 text-gray-200 hover:bg-gray-600 transition-colors"
      >
        <i className="bi bi-chevron-left text-xl"></i>
      </button>

      <span className="text-gray-300 text-sm font-medium">
        {index + 1} / {total}
      </span>

      <button disabled={index === total - 1} onClick={onNext}
        className="p-2 bg-gray-700 rounded-full shadow disabled:opacity-30 text-gray-200 hover:bg-gray-600 transition-colors"
      >
        <i className="bi bi-chevron-right text-xl"></i>
      </button>
    </div>
  );
}
