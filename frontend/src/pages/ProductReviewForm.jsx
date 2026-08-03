// src/components/ProductReviewForm.jsx
import React, { useState } from "react"
import { Star } from "lucide-react"
import { toast } from "react-toastify"
import api from "@/service/api"

const ProductReviewForm = ({ item, userId, orderId }) => {
    const [rating, setRating] = useState(5)
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim()) return toast.warning("Vui lòng nhập nội dung đánh giá.")

        try {
            setLoading(true)
            await api.post("/reviews", {
                rating,
                content,
                userId,
                productId: item.product,
                orderId: orderId,
            })
            toast.success("Đã gửi đánh giá, chờ duyệt ✅")
            setContent("")
            setRating(5)
        } catch (err) {
            console.error(err)
            toast.error(err?.response?.data?.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-50 p-4 rounded-xl shadow-sm mb-4 border"
        >
            <div className="flex items-center space-x-4 mb-2">
                <p className="font-semibold text-gray-700">{item.productName}</p>
                <p className="text-sm text-gray-500">({item.color} / {item.size})</p>
            </div>

            {/* Rating stars */}
            <div className="flex space-x-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    onClick={() => setRating(star)}
                    fill={star <= rating ? "#facc15" : "none"}
                    stroke="#facc15"
                    strokeWidth={1.5}
                    className="w-6 h-6 cursor-pointer transition"
                />
            ))}
            </div>

            <textarea
                className="w-full border rounded-lg p-2 focus:ring-pink-400 focus:border-pink-400"
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <div className="text-right mt-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
                >
                    {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
            </div>
        </form>
    )
}

export default ProductReviewForm
