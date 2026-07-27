export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="mb-4 text-base-content/30">
          <Icon size={56} strokeWidth={1.5} />
        </div>
      )}
      {title && <h3 className="text-lg font-semibold text-base-content/70 mb-1">{title}</h3>}
      {description && (
        <p className="text-sm text-base-content/50 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <button
          className={`btn ${action.variant || 'btn-primary'} btn-sm`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
