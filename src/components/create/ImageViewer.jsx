const convertToPublicUrl = (path) => {
  if (!path) return "";
  let normalized = path.replace(/\\/g, "/"); // \ → /
  const idx = normalized.indexOf("/data/");
  if (idx !== -1) return normalized.substring(idx);
  return normalized;
};

export default function ImageViewer({ url, onClick }) {
  const publicUrl = convertToPublicUrl(url);

  return (
    <div
      className="
        w-[60vw] md:w-[38vw]
        aspect-[3/4]
        rounded-xl shadow-lg overflow-hidden cursor-pointer
      "
      onClick={onClick}
    >
      <img src={publicUrl} className="w-full h-full object-cover" alt="poster" />
    </div>
  );
}