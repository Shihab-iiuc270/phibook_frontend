import useLocalVerificationStatus from "../../hooks/useLocalVerificationStatus";

const VerifiedBadgeIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" fill="#1877F2" />
    <path
      d="M10.1 15.3 6.9 12.1l1.4-1.4 1.8 1.8L15.7 6.9l1.4 1.4-7 7Z"
      fill="white"
    />
  </svg>
);

const formatDateTime = (date) => {
  if (!date) return "";
  try {
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
};

const VerifiedName = ({
  user = null,
  name = "",
  className = "",
  nameClassName = "",
  badgeSize = 16,
  showCountdown = false,
}) => {
  const resolvedName = name || user?.name || user?.email || "";
  const { verified, expiresAt, remainingLabelShort, remainingLabelLong } =
    useLocalVerificationStatus(user);

  const remainingTitlePart = remainingLabelLong ? ` • ${remainingLabelLong} left` : "";
  const title = verified
    ? expiresAt
      ? `Blue Badge active • Expires ${formatDateTime(expiresAt)}${remainingTitlePart}`
      : "Blue Badge active"
    : "";

  return (
    <span className={`inline-flex items-center gap-1 min-w-0 ${className}`}>
      <span className={`min-w-0 truncate ${nameClassName}`}>{resolvedName}</span>
      {verified ? (
        <span
          className="inline-flex items-center gap-1 shrink-0"
          title={title}
        >
          <VerifiedBadgeIcon size={badgeSize} />
          {showCountdown && remainingLabelShort ? (
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md">
              {remainingLabelShort}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
};

export default VerifiedName;
