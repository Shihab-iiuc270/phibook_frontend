import { BadgeCheck } from "lucide-react";
import useLocalVerificationStatus from "../../hooks/useLocalVerificationStatus";

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
  showCountdown = true,
}) => {
  const resolvedName = name || user?.name || user?.email || "";
  const { verified, expiresAt, remainingLabelShort, remainingLabelLong } =
    useLocalVerificationStatus(user);

  const title = verified
    ? expiresAt
      ? `Blue Badge active • Expires ${formatDateTime(expiresAt)} • ${remainingLabelLong || ""} left`
      : "Blue Badge active"
    : "";

  return (
    <span className={`inline-flex items-center gap-1 min-w-0 ${className}`}>
      <span className={`min-w-0 truncate ${nameClassName}`}>{resolvedName}</span>
      {verified ? (
        <span
          className="inline-flex items-center gap-1 shrink-0 text-sky-600"
          title={title}
        >
          <BadgeCheck size={badgeSize} className="text-sky-600" />
          {showCountdown && remainingLabelShort ? (
            <span className="text-[11px] font-semibold text-sky-700">
              {remainingLabelShort}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
};

export default VerifiedName;

