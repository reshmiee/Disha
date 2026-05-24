export default function TokenBadge({ user, className = '' }) {
  if (!user) return null

  const display   = user.tokens_remaining == null ? '∞' : user.tokens_remaining
  const isPremium = user.is_premium
  const title     = isPremium
    ? 'Unlimited AI queries (Premium)'
    : `${display} AI queries remaining this month`

  return (
    <div
      className={[
        'hidden sm:flex items-center gap-2 bg-primary-container/20 px-4 py-2 rounded-full border border-primary/20',
        className,
      ].join(' ')}
      title={title}
    >
      <span className="text-secondary">✨</span>
      <span className="font-label-md text-label-md text-secondary">{display}</span>
      {!isPremium && user.monthly_limit != null && (
        <span className="text-on-surface-variant text-xs">/ {user.monthly_limit}</span>
      )}
      {isPremium && (
        <span className="text-on-surface-variant text-xs hidden md:inline">Premium</span>
      )}
    </div>
  )
}
