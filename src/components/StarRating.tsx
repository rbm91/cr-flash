interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  readOnly?: boolean;
}

export default function StarRating({ value, onChange, label, readOnly = false }: StarRatingProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            &#9733;
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500 self-center">{value}/5</span>
      </div>
    </div>
  );
}
