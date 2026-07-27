const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

const statusSizes = {
  sm: 'w-2.5 h-2.5 border',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function UserAvatar({ user, size = 'md', online = false, showStatus = true }) {
  const initials = getInitials(user?.name);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const statusClass = statusSizes[size] || statusSizes.md;

  return (
    <div className="relative inline-flex shrink-0">
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || 'User'}
          className={`${sizeClass} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center`}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-base-100 ${
            online ? 'bg-success' : 'bg-base-300'
          } ${statusClass}`}
        />
      )}
    </div>
  );
}
