const sizes = {
  sm: 'loading-sm',
  md: '',
  lg: 'loading-lg',
};

export default function LoadingSpinner({ size = 'md', text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4">
      <span className={`loading loading-spinner text-primary ${sizes[size] || ''}`} />
      {text && <p className="text-sm text-base-content/60">{text}</p>}
    </div>
  );
}
