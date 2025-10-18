"use client";

import { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  X,
  Check,
} from "lucide-react";
import axiosInstance from "../../../utils/axiosinstance";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  title: string;
  review: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewsSectionProps {
  productId: string;
  productTitle: string;
  averageRating: number;
  totalRatings: number;
}

const ReviewsSection = ({
  productId,
  productTitle,
  averageRating,
  totalRatings,
}: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    rating: 0,
    title: "",
    review: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async (pageNum = 1) => {
    try {
      const response = await axiosInstance.get(
        `/product/api/ratings/product/${productId}?page=${pageNum}&limit=5`
      );

      if (pageNum === 1) {
        setReviews(response.data.ratings);
      } else {
        setReviews((prev) => [...prev, ...response.data.ratings]);
      }

      setHasMore(response.data.pagination.totalPages > pageNum);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const response = await axiosInstance.get(
        `/product/api/ratings/stats/${productId}`
      );
      setRatingStats(response.data);
    } catch (error) {
      console.error("Error fetching rating stats:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchRatingStats();
  }, [productId]);

  const loadMoreReviews = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id);
    setEditForm({
      rating: review.rating,
      title: review.title,
      review: review.review,
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 0, title: "", review: "" });
  };

  const handleUpdateReview = async (reviewId: string) => {
    if (editForm.rating < 1 || editForm.rating > 5) {
      toast.error("Please select a valid rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.put(`/product/api/ratings/${reviewId}`, {
        rating: editForm.rating,
        title: editForm.title,
        review: editForm.review,
      });

      toast.success("Review updated successfully!");

      // Update the review in the local state
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                rating: editForm.rating,
                title: editForm.title,
                review: editForm.review,
              }
            : review
        )
      );

      // Refresh rating stats
      await fetchRatingStats();

      setEditingReview(null);
      setEditForm({ rating: 0, title: "", review: "" });
    } catch (error: any) {
      console.error("Error updating review:", error);
      toast.error(error.response?.data?.message || "Failed to update review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/product/api/ratings/${reviewId}`);

      toast.success("Review deleted successfully!");

      // Remove the review from local state
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));

      // Refresh rating stats
      await fetchRatingStats();
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onStarClick?: (rating: number) => void
  ) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        } ${
          interactive
            ? "cursor-pointer hover:scale-110 transition-transform"
            : ""
        }`}
        onClick={
          interactive && onStarClick ? () => onStarClick(i + 1) : undefined
        }
      />
    ));
  };

  const getRatingPercentage = (rating: number) => {
    if (!ratingStats) return 0;
    const count = ratingStats.ratingDistribution[rating] || 0;
    return (count / ratingStats.totalRatings) * 100;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Customer Reviews</h3>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(averageRating))}
          </div>
          <div className="text-gray-600">
            Based on {totalRatings} review{totalRatings !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">
                {ratingStats?.ratingDistribution[rating] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {review.user.avatar?.url ? (
                    <img
                      src={review.user.avatar.url}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {review.user.name}
                      </span>
                      {review.isVerified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    {/* Edit/Delete buttons - Only show for current user's reviews */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit review"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {editingReview === review.id ? (
                    // Edit Form
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating *
                        </label>
                        <div className="flex gap-1">
                          {renderStars(editForm.rating, true, (rating) =>
                            setEditForm((prev) => ({ ...prev, rating }))
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Review Title
                        </label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Summarize your review"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={editForm.review}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              review: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tell others about your experience"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateReview(review.id)}
                          disabled={isSubmitting || editForm.rating < 1}
                          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Check size={16} />
                          {isSubmitting ? "Updating..." : "Update"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Normal Review Display
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-2">
                          {review.title}
                        </h4>
                      )}

                      {review.review && (
                        <p className="text-gray-700 mb-3">{review.review}</p>
                      )}

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-md cursor-pointer hover:opacity-80"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-blue-600">
                          <ThumbsUp size={16} />
                          Helpful
                        </button>
                        <button className="flex items-center gap-1 hover:text-red-600">
                          <ThumbsDown size={16} />
                          Not helpful
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={loadMoreReviews}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Load More Reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
