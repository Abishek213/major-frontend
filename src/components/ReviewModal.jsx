import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Star,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { submitReview } from "@/services/reviewService";

const STAR_CONFIG = [
  { emoji: "😞", label: "Terrible", color: "text-red-500", fill: "#ef4444" },
  { emoji: "😕", label: "Poor", color: "text-orange-500", fill: "#f97316" },
  { emoji: "😐", label: "Okay", color: "text-yellow-500", fill: "#eab308" },
  { emoji: "😊", label: "Good", color: "text-lime-500", fill: "#84cc16" },
  {
    emoji: "🤩",
    label: "Amazing!",
    color: "text-emerald-500",
    fill: "#10b981",
  },
];

const PLACEHOLDERS = [
  "",
  "What went wrong? Help the organiser improve…",
  "What could have been better?",
  "Anything you'd like to share with the organiser?",
  "Tell others what made it good!",
  "Wow! What made this event unforgettable?",
];

const ReviewModal = ({ event, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [errorMsg, setErrorMsg] = useState("");
  const [animateIn, setAnimateIn] = useState(false);
  const overlayRef = useRef(null);
  const textareaRef = useRef(null);

  const active = hovered || rating;
  const mood = active ? STAR_CONFIG[active - 1] : null;

  useEffect(() => {
    requestAnimationFrame(() => setAnimateIn(true));
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(onClose, 280);
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      await submitReview({
        eventId: event._id,
        rating,
        comment: comment.trim(),
      });
      setStatus("success");
      setTimeout(() => {
        onSuccess?.(event._id, rating);
        handleClose();
      }, 1800);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to submit review.";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const eventImage = event.image
    ? `/uploads/events/${event.image.split("/").pop()}`
    : null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(10,10,30,0.65)",
        backdropFilter: "blur(6px)",
        transition: "opacity 0.28s ease",
        opacity: animateIn ? 1 : 0,
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          transform: animateIn
            ? "translateY(0) scale(1)"
            : "translateY(40px) scale(0.96)",
          opacity: animateIn ? 1 : 0,
          transition:
            "transform 0.32s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease",
        }}
      >
        <div className="relative h-36 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
          {eventImage && (
            <img
              src={eventImage}
              alt={event.event_name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.35 }}
            />
          )}

          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
              opacity: 0.4,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-5 right-12">
            <p className="text-xs text-white/70 uppercase tracking-widest font-medium mb-1">
              How was your experience?
            </p>
            <h2 className="text-white font-bold text-lg leading-tight line-clamp-2">
              {event.event_name}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {status === "success" ? (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#10b981,#34d399)",
                  boxShadow: "0 0 0 12px rgba(16,185,129,0.12)",
                }}
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mt-2">
                Thanks for your review!
              </h3>
              <p className="text-sm text-gray-500">
                Your feedback helps the community and the organiser.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-3">
                <div
                  className="h-14 flex flex-col items-center justify-center transition-all duration-200"
                  style={{ opacity: mood ? 1 : 0.35 }}
                >
                  <span
                    className="text-4xl leading-none"
                    style={{
                      transform: mood ? "scale(1)" : "scale(0.7)",
                      transition:
                        "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  >
                    {mood?.emoji || "⭐"}
                  </span>
                  <span
                    className={`text-sm font-semibold mt-1 ${
                      mood?.color || "text-gray-400"
                    }`}
                  >
                    {mood?.label || "Tap a star to rate"}
                  </span>
                </div>

                <div
                  className="flex items-center justify-center gap-3"
                  onMouseLeave={() => setHovered(0)}
                >
                  {[1, 2, 3, 4, 5].map((n) => {
                    const lit = n <= (hovered || rating);
                    const fill = lit
                      ? STAR_CONFIG[Math.max(hovered, rating) - 1]?.fill
                      : "#e5e7eb";

                    return (
                      <button
                        key={n}
                        onMouseEnter={() => setHovered(n)}
                        onClick={() => {
                          setRating(n);
                          setTimeout(() => textareaRef.current?.focus(), 100);
                        }}
                        style={{ transform: lit ? "scale(1.15)" : "scale(1)" }}
                        className="transition-transform duration-150 focus:outline-none"
                        aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                      >
                        <Star
                          className="w-10 h-10"
                          style={{
                            fill,
                            color: fill,
                            filter: lit
                              ? `drop-shadow(0 2px 6px ${fill}88)`
                              : "none",
                            transition: "fill 0.15s, color 0.15s, filter 0.15s",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  Leave a comment
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      PLACEHOLDERS[rating] || "Share your experience…"
                    }
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                  />
                  <span className="absolute bottom-2.5 right-3 text-xs text-gray-400 select-none">
                    {comment.length}/500
                  </span>
                </div>
              </div>

              {status === "error" && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!rating || status === "submitting"}
                className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                  rating
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Reviews are public and visible to all attendees
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
