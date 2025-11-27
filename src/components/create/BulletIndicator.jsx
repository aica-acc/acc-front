export default function BulletIndicator({ index, total, onSelect }) {
  return (
    <div className="flex gap-2 mt-3">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`
            w-3 h-3 rounded-full 
            ${i === index ? "bg-gray-900" : "bg-gray-300"}
          `}
        />
      ))}
    </div>
  );
}