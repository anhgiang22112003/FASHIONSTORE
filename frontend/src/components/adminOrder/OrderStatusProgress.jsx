import React from 'react'
import {
    CheckIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'

const OrderStatusProgress = ({ currentStatus }) => {
    const statusSteps = [
        { value: "PENDING", label: "Chờ xử lý", Icon: ClipboardDocumentListIcon },
        { value: "PROCESSING", label: "Đang xử lý", Icon: Cog6ToothIcon },
        { value: "SHIPPED", label: "Đang giao", Icon: TruckIcon },
        { value: "COMPLETED", label: "Hoàn thành", Icon: CheckCircleIcon },
        { value: "CANCELLED", label: "Đã hủy", Icon: XCircleIcon }
    ]

    // Tìm index của trạng thái hiện tại
    const currentIndex = statusSteps.findIndex(step => step.value === currentStatus)
    const isCancelled = currentStatus === "CANCELLED"

    // Tính toán divisor dựa trên trạng thái
    const getDivisor = () => {
        switch (currentStatus) {
            case "PENDING":
                return 2
            case "PROCESSING":
                return 1.5
            case "SHIPPED":
                return 1
            case "COMPLETED":
                return 0.7
            case "CANCELLED":
                return 1
            default:
                return 1.5
        }
    }

    return (
        <div className=" rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Tiến trình đơn hàng</h3>

            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 h-1 bg-gray-200" style={{ left: '20px', right: '20px', zIndex: 0 }}>
                    {!isCancelled && currentIndex >= 0 && (
                        <div
                            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-500 ease-in-out rounded-full"
                            style={{
                                width: `${(currentIndex / (statusSteps.length - getDivisor())) * 100}%`
                            }}
                        />
                    )}
                    {isCancelled && (
                        <div
                            className="h-full bg-red-500 transition-all duration-500 ease-in-out rounded-full"
                            style={{ width: '100%' }}
                        />
                    )}
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between" style={{ zIndex: 1 }}>
                    {statusSteps.map((step, index) => {
                        const isActive = index <= currentIndex
                        const isCurrentStep = step.value === currentStatus
                        const stepIsCancelled = step.value === "CANCELLED"
                        const StepIcon = step.Icon

                        // Nếu đơn hàng bị hủy, chỉ highlight bước "Đã hủy"
                        const shouldHighlight = isCancelled
                            ? stepIsCancelled
                            : (isActive && !stepIsCancelled)

                        return (
                            <div key={step.value} className="flex flex-col items-center" style={{ flex: 1 }}>
                                {/* Circle */}
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 relative
                    ${shouldHighlight
                                            ? (stepIsCancelled && isCancelled)
                                                ? 'bg-red-500 text-white shadow-lg scale-110'
                                                : 'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-lg scale-110'
                                            : 'bg-gray-200 text-gray-400'
                                        }
                    ${isCurrentStep ? 'ring-4 ring-pink-200' : ''}
                  `}
                                >
                                    {shouldHighlight && !stepIsCancelled ? (
                                        <CheckIcon className="w-5 h-5 stroke-2" />
                                    ) : (
                                        <StepIcon className="w-6 h-6" />
                                    )}

                                    {/* Pulse animation for current step */}
                                    {isCurrentStep && (
                                        <span className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-75"></span>
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`
                    mt-3 text-xs font-medium text-center transition-all duration-300
                    ${shouldHighlight
                                            ? (stepIsCancelled && isCancelled)
                                                ? 'text-red-600 font-bold'
                                                : 'text-pink-600 font-bold'
                                            : 'text-gray-400'
                                        }
                    ${isCurrentStep ? 'scale-105' : ''}
                  `}
                                >
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Status Message */}
            <div className="mt-6 p-4  rounded-xl">
                <p className="text-sm ">
                    {isCancelled ? (
                        <span className="text-red-600 font-semibold">⚠️ Đơn hàng đã bị hủy</span>
                    ) : currentIndex === 3 ? (
                        <span className="text-green-600 font-semibold">🎉 Đơn hàng đã hoàn thành!</span>
                    ) : (
                        <>
                            Trạng thái hiện tại: <span className="font-semibold text-pink-600">
                                {statusSteps[currentIndex]?.label}
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    )
}

export default OrderStatusProgress