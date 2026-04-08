import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, ThumbsUp, MessageSquare, Share2, Globe } from 'lucide-react';
import { getDefaultAvatarUrl, toAbsoluteMediaUrl } from '../../services/media';

const PostCard = ({
  postId,
  user,
  time,
  content,
  images = [],
  likesCount = 0,
  commentsCount = 0,
  comments = [],
  isLiked = false,
  canInteract = false,
  onLike,
  onComment,
  onRequireAuth,
}) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const shareTimeoutRef = useRef(null);
  
  const getValidImageUrl = (imageObj) => {
    if (!imageObj) return null;
    
    // FIX: Use 'image' field instead of 'file'
    const imagePath = imageObj.image;
    if (!imagePath) return null;
    return toAbsoluteMediaUrl(imagePath);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const value = commentText.trim();
    if (!value) return;

    if (!canInteract) {
      onRequireAuth?.();
      return;
    }

    await onComment?.(value);
    setShowComments(true);
    setCommentText("");
  };

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const buildShareUrl = () => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}${window.location.pathname}`;
    if (!postId) return base;
    return `${base}#post-${postId}`;
  };

  const handleShare = async () => {
    const url = buildShareUrl();
    const shareText = String(content || "").trim();

    try {
      if (navigator?.share) {
        await navigator.share({
          title: user?.name ? `${user.name} on Phibook` : "Phibook post",
          text: shareText ? shareText.slice(0, 180) : undefined,
          url,
        });
        setShareFeedback("Shared.");
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareFeedback("Link copied.");
      } else {
        // Old browsers fallback
        window.prompt("Copy this link:", url);
        setShareFeedback("Link ready.");
      }
    } catch {
      // user canceled share or browser blocked it
      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          setShareFeedback("Link copied.");
        } catch {
          setShareFeedback("Could not share.");
        }
      } else {
        setShareFeedback("Could not share.");
      }
    } finally {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setShareFeedback(""), 2000);
    }
  };

  return (
    <div
      id={postId ? `post-${postId}` : undefined}
      className="bg-white/95 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-200 mb-4 overflow-hidden w-full max-w-[680px] mx-auto"
    >
      
      {/* HEADER SECTION */}
      <div className="p-3 sm:p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <img 
            src={user?.avatar || getDefaultAvatarUrl()} 
            className="w-10 h-10 rounded-full object-cover border border-slate-200" 
            alt="user" 
            onError={(e) => {
              e.currentTarget.src = getDefaultAvatarUrl();
            }}
          />
          <div className="min-w-0">
            <p className="font-semibold text-[15px] hover:underline cursor-pointer truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 font-normal mt-0.5 flex items-center gap-1">
              {time} · <Globe size={12} />
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      {/* CAPTION SECTION */}
      <div className="px-3 sm:px-4 pb-3">
        <p className="text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">
          {content}
        </p>
      </div>
      
      {/* IMAGE RENDERING SECTION */}
      {images && images.length > 0 && (
        <div className={`grid gap-1 border-y border-slate-200 bg-slate-100 ${
          images.length === 1 ? 'grid-cols-1' : 
          images.length === 2 ? 'grid-cols-2' :
          images.length === 3 ? 'grid-cols-2' : 
          'grid-cols-2'
        }`}>
          {images.map((imgObj, index) => {
            const finalUrl = getValidImageUrl(imgObj);
            return (
              <div 
                key={imgObj.id || index} 
                className={`relative bg-white ${
                  images.length === 3 && index === 0 ? 'col-span-2' : 
                  images.length === 3 && index > 0 ? 'col-span-1' : ''
                }`}
              >
                <img 
                  src={finalUrl} 
                  className="w-full h-full object-cover max-h-[500px] min-h-[200px] block" 
                  alt="Post content"
                  onError={(e) => {
                    console.error("Failed to load image at:", finalUrl);
                    e.target.src = "https://via.placeholder.com/600x400?text=Image+Not+Found";
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* STATS & ACTIONS */}
      <div className="px-3 sm:px-4 py-2 flex justify-between text-slate-500 text-[13px] sm:text-[14px] border-b border-slate-200 mx-1 mt-1">
        <div className="flex items-center">
          <div className="bg-sky-500 text-white rounded-full p-1 mr-2">
            <ThumbsUp size={10} fill="white" />
          </div>
          <span>{likesCount}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowComments((prev) => !prev)}
          className="hover:underline"
        >
          {commentsCount} Comments
        </button>
      </div>

      <div className="flex px-1 sm:px-2 py-1">
        <button
          onClick={() => (canInteract ? onLike?.() : onRequireAuth?.())}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 font-semibold hover:bg-slate-100 rounded-xl transition text-sm ${
            isLiked ? "text-[#1877f2]" : "text-gray-600"
          }`}
        >
          <ThumbsUp size={18} /> <span className="hidden sm:inline">Like</span>
        </button>
        <button
          onClick={() => {
            if (!canInteract) {
              onRequireAuth?.();
              return;
            }
            setShowComments(true);
          }}
          className="flex-1 flex items-center justify-center space-x-2 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition text-sm"
        >
          <MessageSquare size={18} /> <span className="hidden sm:inline">Comment</span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 flex items-center justify-center space-x-2 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition text-sm"
        >
          <Share2 size={18} /> <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {shareFeedback ? (
        <div className="px-3 sm:px-4 pb-3 -mt-1">
          <p className="text-xs text-slate-500">{shareFeedback}</p>
        </div>
      ) : null}

      {showComments ? (
        <div className="px-3 sm:px-4 pb-4 pt-2 border-t border-slate-200 bg-slate-50/60">
          {comments.length > 0 ? (
            <div className="space-y-2 mb-3 max-h-60 overflow-y-auto pr-1">
              {comments.map((comment, idx) => (
                <div key={comment?.id || idx} className="bg-white rounded-xl px-3 py-2 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">
                    {comment?.user?.name || comment?.author?.name || "User"}
                  </p>
                  <p className="text-sm text-slate-700">{comment?.content || comment?.text || ""}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 mb-3">No comments yet.</p>
          )}

          <form onSubmit={submitComment} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={canInteract ? "Write a comment..." : "Login to comment..."}
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400 bg-white"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-sky-500 to-blue-700 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:opacity-95 sm:w-auto w-full"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}
    </div>
    
  );
};

export default PostCard;
