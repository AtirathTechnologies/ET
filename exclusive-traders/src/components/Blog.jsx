// src/components/Blog.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Global Rice Trade 2024: Navigating New Market Dynamics",
      excerpt: "Explore the evolving landscape of international rice trade with insights on emerging markets, pricing trends, and supply chain innovations.",
      image: "https://etimg.etb2bimg.com/photo/107855000.cms",
    },
    {
      id: 2,
      title: "Wheat Import Strategies for European Markets",
      excerpt: "Master the complexities of wheat import regulations, quality standards, and logistics for successful European market entry.",
      image: "https://www.desmud.org/uploads/9d8e3b3a7c9447ff686bc1e0e9058f87.jpg",
    },
    {
      id: 3,
      title: "Sustainable Coffee Sourcing: From Farm to Global Markets",
      excerpt: "Discover how ethical sourcing and sustainable practices are reshaping the global coffee trade landscape.",
      image: "https://www.iisd.org/ssi/wp-content/uploads/2019/07/coffee-header-1024x683-1.jpg",
    },
    {
      id: 4,
      title: "Spice Export Opportunities in Middle Eastern Markets",
      excerpt: "Learn how to capitalize on the growing demand for premium spices in GCC countries and beyond.",
      image: "https://media.istockphoto.com/id/532239993/photo/spices-in-the-spice-souk-in-dubai.jpg?s=612x612&w=0&k=20&c=TaEW_D8YyNI7XLlYCETeXD5yWP2slyUT4cofMn8mmSw=",
    },
    {
      id: 5,
      title: "Nut Export Regulations and Market Access Strategies",
      excerpt: "Navigate the complex world of nut exports with our comprehensive guide to regulations, certifications, and market entry.",
      image: "https://cdn.momex.ae/momex-storage/static/blog_images/Nuts_and_Food_Export_A_Comprehensive_Guide_for_the_International_Market_momex_74ff6.webp",
    },
    {
      id: 6,
      title: "Pulse Trading: Opportunities in Emerging Markets",
      excerpt: "Discover the growing demand for pulses in developing economies and how to build sustainable export relationships.",
      image: "https://media.istockphoto.com/id/1143901429/photo/finance-investment-stock-market-chart-graph-currency-exchange-global-business-fintech.jpg?s=612x612&w=0&k=20&c=Gxi0YYjQiE2kCZL5y9hU2LCQshUl5mVsJsYWjj5ckFQ=",
    },
    {
      id: 7,
      title: "Tea Export Dynamics: Traditional Markets vs Emerging Opportunities",
      excerpt: "Analyze the shifting patterns in global tea trade and identify new growth markets for premium tea exports.",
      image: "https://i0.wp.com/elmarspices.com/wp-content/uploads/2023/03/tea2.jpg?resize=640%2C397&ssl=1",
    },
    {
      id: 8,
      title: "Sugar Trading in Volatile Markets: Risk Management Strategies",
      excerpt: "Learn how to navigate price volatility and supply chain challenges in the global sugar trade.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFvgaCxLt6d1jCubTN6okL3pFMscFUcCKUKjFnEpnchQJABF4bBtlH-Ayu1xUaEfOoSKw&usqp=CAU",
    }
  ];

  return (
    <div className="min-h-screen bg-dark text-light py-8 px-4 professional-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="professional-heading text-secondary text-shadow-neon">
            Global Trade Insights: Import & Export Expertise
          </h1>
          <p className="professional-body max-w-3xl mx-auto mt-4">
            Stay informed with the latest trends, market analysis, and strategic insights 
            from the forefront of global agricultural trade and commodity markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 innovation-grid">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="innovation-feature-card animate-fade-in-up flex flex-col h-full"
              style={{ animationDelay: `${post.id * 0.1}s` }}
            >
              {/* Image Section - Fixed Height */}
              <div className="relative overflow-hidden rounded-lg mb-4 flex-shrink-0">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              
              {/* Content Section - Flexible */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Title - Fixed */}
                <h3 className="text-xl font-bold mb-3 text-light leading-tight line-clamp-2 min-h-[3.5rem]">
                  {post.title}
                </h3>
                
                {/* Excerpt - Flexible */}
                <p className="text-gray-300 mb-4 professional-body flex-grow line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Read More Button - Fixed at Bottom */}
                <div className="mt-auto pt-4 border-t border-gray-600/50">
                  <Link
                    to={`/blog/${post.id}`}
                    className="w-full text-secondary hover:text-accent font-medium transition-colors py-2 px-4 rounded-lg text-center hover:bg-secondary/10 block"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;