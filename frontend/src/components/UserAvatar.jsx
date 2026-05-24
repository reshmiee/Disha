const SIZES = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-10 h-10 text-sm',
}

export default function UserAvatar({ username, size = 'md', className = '' }) {
  const initial = (username || '?').charAt(0).toUpperCase()

  return (
    <div
      className={[
        'rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-primary font-bold uppercase flex-shrink-0',
        SIZES[size] || SIZES.md,
        className,
      ].join(' ')}
      title={username || 'Profile'}
    >
      {initial}
    </div>
  )
}
