// src/components/ProductReviewForm.jsx
import React, { useState } from "react"
import { toast } from "react-toastify"
import api from "@/service/api"

const ProductReviewForm = ({ item, userId, orderId }) => {
    const [rating, setRating] = useState(5)
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(false)
    console.log(item)

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
                    <svg
                        key={star}
                        onClick={() => setRating(star)}
                        xmlns="http://www.w3.org/2000/svg"
                        fill={star <= rating ? "#facc15" : "none"}
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="#facc15"
                        className="w-6 h-6 cursor-pointer transition"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.013 4.082a.563.563 0 00.424.308l4.505.654a.563.563 0 01.312.96l-3.26 3.178a.563.563 0 00-.162.498l.769 4.48a.563.563 0 01-.817.592L12 16.347l-4.03 2.12a.563.563 0 01-.817-.592l.769-4.48a.563.563 0 00-.162-.498L4.5 9.503a.563.563 0 01.312-.96l4.505-.654a.563.563 0 00.424-.308l2.013-4.082z"
                        />
                    </svg>
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
