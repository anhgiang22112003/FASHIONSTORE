import api from '@/service/api'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

const ProductCategories = () => {
  const [category, setCategory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      const activeCategories = response?.data?.data.filter(item => item.isActive)
      setCategory(activeCategories || [])
    } catch (error) {
      console.error('Error fetching product categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <>
      <style>{`
        .pc-section {
          padding: 5rem 0;
          background: linear-gradient(180deg, #fff1f2 0%, #ffffff 100%);
          color: #111827;
          position: relative;
          overflow: hidden;
        }

        .pc-glow-bg {
          position: absolute;
          width: 35%;
          height: 35%;
          background: radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, transparent 70%);
          top: 10%;
          left: 5%;
          pointer-events: none;
          z-index: 1;
        }

        .pc-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 3rem;
          gap: 1.5rem;
          flex-wrap: wrap;
          position: relative;
          z-index: 2;
        }

        .pc-eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ec4899;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pc-title {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          font-weight: 900;
          line-height: 1.15;
          color: #111827;
          margin: 0;
        }

        .pc-title em {
          font-style: normal;
          color: #db2777;
        }

        .pc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          position: relative;
          z-index: 2;
        }

        @media (min-width: 640px) {
          .pc-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .pc-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.75rem;
          }
        }

        .pc-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #fce7f3;
          box-shadow: 0 8px 25px rgba(236, 72, 153, 0.06);
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s, border-color 0.4s;
          aspect-ratio: 4 / 5;
          display: flex;
          flex-direction: column;
        }

        .pc-card:hover {
          transform: translateY(-8px);
          border-color: #f472b6;
          box-shadow: 0 20px 40px rgba(236, 72, 153, 0.18);
        }

        .pc-card-img-wrap {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .pc-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pc-card:hover .pc-card-img {
          transform: scale(1.08);
        }

        .pc-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.25) 50%, transparent 100%);
          transition: background 0.3s;
        }

        .pc-card:hover .pc-card-overlay {
          background: linear-gradient(to top, rgba(190, 24, 93, 0.9) 0%, rgba(17, 24, 39, 0.3) 60%, transparent 100%);
        }

        .pc-card-body {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .pc-card-count {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fbcfe8;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          padding: 0.25rem 0.65rem;
          border-radius: 99px;
          margin-bottom: 0.5rem;
        }

        .pc-card-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.5rem;
          line-height: 1.3;
        }

        .pc-card-action {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
          opacity: 0.9;
          transition: transform 0.3s, color 0.3s;
        }

        .pc-card:hover .pc-card-action {
          transform: translateX(4px);
          color: #fbcfe8;
        }
      `}</style>

      <section className="pc-section">
        <div className="pc-glow-bg" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pc-header">
            <div>
              <p className="pc-eyebrow">
                <Sparkles size={14} /> Danh Mục Nổi Bật
              </p>
              <h2 className="pc-title">Tìm Kiếm Theo <em>Phong Cách</em></h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-pink-100/50 rounded-2xl aspect-[4/5]" />
              ))}
            </div>
          ) : (
            <div className="pc-grid">
              {category.map((cat, index) => (
                <div
                  key={cat._id || index}
                  className="pc-card"
                  onClick={() => navigate(
                    `/category/${cat.slug || cat.name.replace(/\s+/g, '-').toLowerCase()}`,
                    { state: { id: cat._id } }
                  )}
                  id={`cat-card-${index}`}
                >
                  <div className="pc-card-img-wrap">
                    <img
                      src={cat?.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80'}
                      alt={cat?.name}
                      className="pc-card-img"
                      loading="lazy"
                    />
                    <div className="pc-card-overlay" />
                  </div>

                  <div className="pc-card-body">
                    <span className="pc-card-count">
                      {cat?.productCount || 0} sản phẩm
                    </span>
                    <h3 className="pc-card-name">{cat?.name}</h3>
                    <div className="pc-card-action">
                      Khám phá ngay <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default ProductCategories
