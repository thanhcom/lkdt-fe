"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiCpu, FiSmartphone, FiSettings } from "react-icons/fi";
import { FaFacebookF, FaPhoneAlt } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const slides: string[] = [
    "/images/slide1.jpg",
    "/images/slide2.jpeg",
    "/images/slide3.jpg",
  ];

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-grow p-8">
        {/* Header */}
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x neon-glow">
            Thành Trang Electronic
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Chúng tôi chuyên sửa chữa điện tử, cung cấp các thiết bị IoT và
            thiết kế các giải pháp tự động hóa.
          </p>
        </section>

        {/* Slider */}
        <section className="max-w-4xl mx-auto mb-16">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
            spaceBetween={20}
          >
            {slides.map((src, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-64 md:h-96 relative">
                  <Image
                    src={src}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover rounded-lg shadow-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    priority={index === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Services */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition">
            <FiCpu className="text-5xl text-blue-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Sửa chữa điện tử</h2>
            <p className="text-gray-600">
              Chúng tôi cung cấp dịch vụ sửa chữa điện tử chất lượng, nhanh
              chóng và uy tín.
            </p>
          </Card>

          <Card className="p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition">
            <FiSmartphone className="text-5xl text-green-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Thiết bị IoT</h2>
            <p className="text-gray-600">
              Cung cấp các thiết bị IoT hiện đại, từ cảm biến đến module ESP32,
              Raspberry Pi, phù hợp cho nhà thông minh.
            </p>
          </Card>

          <Card className="p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition">
            <FiSettings className="text-5xl text-purple-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Tự động hóa</h2>
            <p className="text-gray-600">
              Thiết kế giải pháp tự động hóa cho doanh nghiệp và nhà ở, giúp
              tiết kiệm thời gian và tối ưu vận hành.
            </p>
          </Card>
        </section>

        {/* About */}
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Về chúng tôi</h2>
          <p className="text-gray-700 mb-4">
            Thành Trang Electronic là cửa hàng chuyên sửa chữa điện tử và cung
            cấp các thiết bị IoT. Chúng tôi thiết kế các giải pháp tự động hóa,
            giúp doanh nghiệp và gia đình tối ưu vận hành và tiết kiệm thời
            gian.
          </p>
          <p className="text-gray-700">
            Với đội ngũ kỹ thuật giàu kinh nghiệm, chúng tôi cam kết đem đến
            dịch vụ chất lượng, tin cậy và luôn đồng hành cùng khách hàng.
          </p>
        </section>

        {/* Contact Info */}
        {/* Contact Info */}
        <section className="max-w-3xl mx-auto text-center mb-16 p-6 bg-white rounded-xl transition shadow hover:shadow-xl hover:-translate-y-1">
          <h2 className="text-3xl font-bold mb-6">Thông tin liên hệ</h2>

          <div className="space-y-3 text-lg text-gray-700">
            <p>
              <strong>Địa chỉ:</strong> Cổ Dũng - Kim Thành - Hải Dương
            </p>
            <p className="flex justify-center items-center gap-2">
              <FaPhoneAlt /> <strong>Số điện thoại:</strong> 096.210.0123
            </p>
            <p>
              <strong>Email:</strong> danhthanh89@gmail.com
            </p>

            <div className="flex justify-center gap-6 mt-4 text-3xl">
              <a
                href="https://www.facebook.com/mit.to.tho.2025"
                className="hover:text-blue-600 transition transform hover:scale-110"
              >
                <FaFacebookF />
              </a>
              <a
                href="#https://zalo.me/0962100123"
                className="hover:text-blue-500 transition transform hover:scale-110"
              >
                <SiZalo />
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Hãy liên hệ với chúng tôi</h2>
          <p className="text-gray-700 mb-6">
            Chúng tôi luôn sẵn sàng tư vấn và triển khai các giải pháp điện tử
            và IoT tốt nhất cho bạn.
          </p>
          <Link href="/component">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Vào trang quản trị   
            </Button>
          </Link>
        </section>
      </div>
    </main>
  );
}
