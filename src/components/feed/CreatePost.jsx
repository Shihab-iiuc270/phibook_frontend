import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const CreatePost = ({ onSubmit, loading = false }) => {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = caption.trim();

    if (!value) {
      setError("Post caption is required");
      return;
    }

    setError("");

    try {
      await onSubmit({ caption: value, images });
      setCaption("");
      setImages([]);
    } catch {
      // parent handles post errors
    }
  };

  const busy = loading;

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-200 mb-4 p-4 sm:p-5">
      <h3 className="text-base font-semibold mb-3 text-slate-800">Create Post</h3>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {error ? (
          <div className="bg-red-50 text-red-600 p-2 rounded-xl border border-red-200 text-sm">
            {error}
          </div>
        ) : null}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border border-slate-300 rounded-xl p-3 min-h-[100px] resize-y focus:outline-none focus:border-sky-400 bg-slate-50/40"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 block">Add Images</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-sky-300 bg-sky-50 hover:bg-sky-100 rounded-xl p-4 text-sky-700 flex items-center justify-center gap-2 transition-colors"
          >
            <ImagePlus size={18} />
            <span className="font-medium">{images.length > 0 ? "Change images" : "Choose images"}</span>
          </button>

          {images.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {images.map((file, idx) => (
                <span
                  key={`${file.name}-${idx}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200 max-w-full"
                >
                  <span className="truncate max-w-[170px] sm:max-w-[260px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-red-500 shrink-0"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No images selected.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-95 transition disabled:opacity-60"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
