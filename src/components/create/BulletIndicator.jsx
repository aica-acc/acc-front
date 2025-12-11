export default function BulletIndicator({ index, total, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap justify-center max-w-full">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`
            w-3 h-3 rounded-full transition-all
            ${i === index ? "bg-yellow-500" : "bg-gray-600 hover:bg-gray-500"}
          `}
        />
      ))}
    </div>
  );
}