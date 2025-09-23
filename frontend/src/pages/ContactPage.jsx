import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Địa chỉ cửa hàng",
      details: [
        "123 Nguyễn Huệ, Quận 1, TP.HCM",
        "456 Trần Hưng Đạo, Quận 5, TP.HCM",
        "789 Lê Văn Sỹ, Quận 3, TP.HCM"
      ]
    },
    {
      icon: Phone,
      title: "Số điện thoại",
      details: [
        "Hotline: 1900 1234",
        "Tư vấn: 028 3456 7890",
        "Khiếu nại: 028 3456 7891"
      ]
    },
    {
      icon: Mail,
      title: "Email",
      details: [
        "contact@fashionstore.vn",
        "support@fashionstore.vn",
        "info@fashionstore.vn"
      ]
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      details: [
        "Thứ 2 - Thứ 6: 8:00 - 22:00",
        "Thứ 7 - Chủ nhật: 9:00 - 21:00",
        "Lễ Tết: 10:00 - 18:00"
      ]
    }
  ];

  const stores = [
    {
      name: "FashionStore Nguyễn Huệ",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "028 3456 7890",
      hours: "8:00 - 22:00 (T2-T6), 9:00 - 21:00 (T7-CN)"
    },
    {
      name: "FashionStore Trần Hưng Đạo", 
      address: "456 Trần Hưng Đạo, Quận 5, TP.HCM",
      phone: "028 3456 7891",
      hours: "8:00 - 22:00 (T2-T6), 9:00 - 21:00 (T7-CN)"
    },
    {
      name: "FashionStore Lê Văn Sỹ",
      address: "789 Lê Văn Sỹ, Quận 3, TP.HCM", 
      phone: "028 3456 7892",
      hours: "8:00 - 22:00 (T2-T6), 9:00 - 21:00 (T7-CN)"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
            Hãy liên hệ để được tư vấn tốt nhất!
          </p>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tin nhắn *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Nhập nội dung tin nhắn..."
                  />
                </div>

                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600" size="lg">
                  <Send className="w-5 h-5 mr-2" />
                  Gửi tin nhắn
                </Button>
              </form>
            </div>

            {/* Map Placeholder & Store Info */}
            <div className="space-y-8">
              {/* Map */}
              <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Bản đồ cửa hàng</p>
                  <p className="text-sm">123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                </div>
              </div>

              {/* Store Locations */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hệ thống cửa hàng</h3>
                <div className="space-y-4">
                  {stores.map((store, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <h4 className="font-semibold text-gray-900 mb-2">{store.name}</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-pink-500" />
                          <span>{store.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-pink-500" />
                          <span>{store.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-pink-500" />
                          <span>{store.hours}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Câu hỏi thường gặp</h2>
            <p className="text-gray-600">Những thắc mắc phổ biến từ khách hàng</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Làm thế nào để đổi trả sản phẩm?",
                answer: "Bạn có thể đổi trả sản phẩm trong vòng 30 ngày kể từ ngày mua với điều kiện sản phẩm còn nguyên tem, nhãn và chưa qua sử dụng."
              },
              {
                question: "Thời gian giao hàng là bao lâu?",
                answer: "Thời gian giao hàng tiêu chuẩn là 2-3 ngày làm việc trong nội thành TP.HCM và 3-5 ngày cho các tỉnh thành khác."
              },
              {
                question: "Có miễn phí vận chuyển không?",
                answer: "Chúng tôi miễn phí vận chuyển cho tất cả đơn hàng từ 500,000đ trở lên trên toàn quốc."
              },
              {
                question: "Làm sao để kiểm tra size phù hợp?",
                answer: "Bạn có thể tham khảo bảng size chi tiết trên từng sản phẩm hoặc liên hệ tư vấn viên để được hỗ trợ chọn size."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;