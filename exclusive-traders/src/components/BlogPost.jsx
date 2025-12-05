// src/components/BlogPost.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const BlogPost = () => {
  const { id } = useParams();

  const blogPosts = [
    {
      id: 1,
      title: "Global Rice Trade 2024: Navigating New Market Dynamics",
      excerpt: "Explore the evolving landscape of international rice trade with insights on emerging markets, pricing trends, and supply chain innovations.",
      category: "Grains & Cereals",
      image: "https://etimg.etb2bimg.com/photo/107855000.cms",
      // readTime: "5 min read",
      // publishDate: "March 15, 2024",
      fullContent: `
        <h2 class="text-2xl font-bold text-secondary mb-4">The Changing Face of Global Rice Markets</h2>
        <p class="mb-4 text-light">The global rice trade is undergoing significant transformation in 2024, driven by changing consumption patterns, climate impacts, and geopolitical shifts. As one of the world's leading rice exporters, we're at the forefront of these developments.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Key Market Trends</h3>
        <p class="mb-3"><strong class="text-accent">Asian Dominance Continues:</strong> India, Thailand, and Vietnam remain the top exporters, accounting for over 60% of global rice trade. However, new players like Myanmar and Cambodia are gaining market share with competitive pricing and improved quality standards.</p>
        
        <p class="mb-4"><strong class="text-accent">African Demand Surge:</strong> Sub-Saharan Africa has emerged as the fastest-growing rice import market, with Nigeria, Ivory Coast, and Senegal leading demand. This presents excellent opportunities for exporters who can navigate the complex logistics of African trade.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Quality Standards Evolution</h3>
        <p class="mb-3">International buyers are increasingly demanding:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light">Certified organic and sustainable farming practices</li>
          <li class="text-light">Blockchain-enabled traceability from farm to port</li>
          <li class="text-light">Strict adherence to maximum residue levels (MRLs)</li>
          <li class="text-light">Non-GMO verification and certification</li>
        </ul>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Logistics Innovation</h3>
        <p class="mb-3">Modern rice trading requires sophisticated supply chain management:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light">Temperature-controlled container technology</li>
          <li class="text-light">Real-time shipment tracking systems</li>
          <li class="text-light">Automated customs clearance processes</li>
          <li class="text-light">Integrated quality control at multiple checkpoints</li>
        </ul>
        
        <p class="text-light">As we move through 2024, successful rice traders will be those who combine traditional market knowledge with digital innovation and sustainable practices.</p>
      `
    },
    {
      id: 2,
      title: "Wheat Import Strategies for European Markets",
      excerpt: "Master the complexities of wheat import regulations, quality standards, and logistics for successful European market entry.",
      category: "Grains & Cereals",
      image: "https://www.desmud.org/uploads/9d8e3b3a7c9447ff686bc1e0e9058f87.jpg",
      // readTime: "4 min read",
      // publishDate: "March 12, 2024",
      fullContent: `
        <h2 class="text-2xl font-bold text-secondary mb-4">Navigating European Wheat Import Regulations</h2>
        <p class="mb-4 text-light">Importing wheat into European markets requires careful planning and strict adherence to complex regulatory frameworks. Here's what you need to know for successful market entry in 2024.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Key Import Requirements</h3>
        <p class="mb-3"><strong class="text-accent">Quality Specifications:</strong> European buyers demand specific protein content, moisture levels, and falling numbers. Understanding these technical requirements is crucial for successful transactions.</p>
        
        <p class="mb-4"><strong class="text-accent">Phytosanitary Standards:</strong> All wheat imports must comply with EU plant health regulations, including certification of freedom from specified pests and diseases.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Strategic Sourcing</h3>
        <p class="mb-3">Successful wheat import strategies include:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">Diversified Sourcing:</strong> Balance supplies from Black Sea regions, North America, and Australia</li>
          <li class="text-light"><strong class="text-accent">Quality Assurance:</strong> Implement rigorous testing protocols at origin</li>
          <li class="text-light"><strong class="text-accent">Logistics Planning:</strong> Coordinate shipping schedules with harvest timelines</li>
          <li class="text-light"><strong class="text-accent">Risk Management:</strong> Use futures and options to hedge price volatility</li>
        </ul>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Market Opportunities</h3>
        <p class="mb-3">Several European markets show particular promise:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">Italy:</strong> Growing demand for high-protein durum wheat for pasta production</li>
          <li class="text-light"><strong class="text-accent">Spain:</strong> Increasing imports for flour milling and bakery industries</li>
          <li class="text-light"><strong class="text-accent">Netherlands:</strong> Strategic re-export hub with excellent infrastructure</li>
        </ul>
        
        <p class="text-light">By understanding these dynamics and building strong relationships with European partners, wheat importers can capitalize on the growing demand for quality grains.</p>
      `
    },
    {
      id: 3,
      title: "Sustainable Coffee Sourcing: From Farm to Global Markets",
      excerpt: "Discover how ethical sourcing and sustainable practices are reshaping the global coffee trade landscape.",
      category: "Beverages",
      image: "https://www.iisd.org/ssi/wp-content/uploads/2019/07/coffee-header-1024x683-1.jpg",
      // readTime: "6 min read",
      // publishDate: "March 10, 2024",
      fullContent: `
        <h2 class="text-2xl font-bold text-secondary mb-4">The New Era of Coffee Trading</h2>
        <p class="mb-4 text-light">Coffee trading is evolving beyond simple commodity transactions to embrace sustainability, traceability, and quality differentiation. Here's how the industry is transforming.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Sustainable Sourcing Models</h3>
        <p class="mb-3"><strong class="text-accent">Direct Trade Relationships:</strong> Building long-term partnerships with coffee growers ensures consistent quality and fair compensation. This approach bypasses traditional commodity markets and creates value for both producers and importers.</p>
        
        <p class="mb-4"><strong class="text-accent">Certification Programs:</strong> Fair Trade, Rainforest Alliance, and Organic certifications are no longer niche requirements but mainstream expectations in many markets.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Quality Innovation</h3>
        <p class="mb-3">The specialty coffee segment continues to grow, driven by:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">Single-Origin Focus:</strong> Consumers want to know exactly where their coffee comes from</li>
          <li class="text-light"><strong class="text-accent">Processing Methods:</strong> Natural, honey, and washed processes create distinct flavor profiles</li>
          <li class="text-light"><strong class="text-accent">Roast Profiling:</strong> Custom roasting for specific market preferences</li>
        </ul>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Supply Chain Transparency</h3>
        <p class="mb-3">Modern coffee traders are implementing:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light">Blockchain tracking from farm to cup</li>
          <li class="text-light">Digital quality assessment platforms</li>
          <li class="text-light">Real-time shipment monitoring</li>
          <li class="text-light">Sustainability impact reporting</li>
        </ul>
        
        <p class="text-light">The future of coffee trading lies in creating transparent, sustainable supply chains that deliver exceptional quality while supporting coffee-growing communities.</p>
      `
    },
    {
      id: 4,
      title: "Spice Export Opportunities in Middle Eastern Markets",
      excerpt: "Learn how to capitalize on the growing demand for premium spices in GCC countries and beyond.",
      category: "Spices",
      image: "https://media.istockphoto.com/id/532239993/photo/spices-in-the-spice-souk-in-dubai.jpg?s=612x612&w=0&k=20&c=TaEW_D8YyNI7XLlYCETeXD5yWP2slyUT4cofMn8mmSw=",
      // readTime: "5 min read",
      // publishDate: "March 8, 2024",
      fullContent: `
        <h2 class="text-2xl font-bold text-secondary mb-4">Expanding Spice Exports to the Middle East</h2>
        <p class="mb-4 text-light">The Middle Eastern spice market offers significant opportunities for exporters who understand regional preferences, quality standards, and business practices.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Market Dynamics</h3>
        <p class="mb-3"><strong class="text-accent">Growing Demand:</strong> The GCC spice market is projected to grow at 6.8% annually, driven by population growth, tourism, and evolving culinary trends.</p>
        
        <p class="mb-4"><strong class="text-accent">Premiumization Trend:</strong> Consumers are increasingly seeking high-quality, authentic spices with clear origin stories and quality certifications.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Key Product Categories</h3>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">Saffron:</strong> High demand for premium Iranian and Kashmiri saffron</li>
          <li class="text-light"><strong class="text-accent">Cardamom:</strong> Essential for Arabic coffee and traditional dishes</li>
          <li class="text-light"><strong class="text-accent">Black Pepper:</strong> Consistent demand with preference for specific origins</li>
          <li class="text-light"><strong class="text-accent">Mixed Spices:</strong> Custom blends for regional cuisines</li>
        </ul>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Export Strategy</h3>
        <p class="mb-3">Successful spice exporters to the Middle East focus on:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">Quality Certification:</strong> Halal certification, ISO standards, and food safety compliance</li>
          <li class="text-light"><strong class="text-accent">Packaging:</strong> Attractive, culturally appropriate packaging that maintains product freshness</li>
          <li class="text-light"><strong class="text-accent">Distribution:</strong> Partnering with established distributors who understand local markets</li>
          <li class="text-light"><strong class="text-accent">Pricing:</strong> Competitive positioning while maintaining quality margins</li>
        </ul>
        
        <p class="text-light">With the right approach, spice exporters can build sustainable businesses in this dynamic and growing market.</p>
      `
    },
    {
      id: 5,
      title: "Nut Export Regulations and Market Access Strategies",
      excerpt: "Navigate the complex world of nut exports with our comprehensive guide to regulations, certifications, and market entry.",
      category: "Nuts & Dry Fruits",
      image: "https://cdn.momex.ae/momex-storage/static/blog_images/Nuts_and_Food_Export_A_Comprehensive_Guide_for_the_International_Market_momex_74ff6.webp",
      // readTime: "7 min read",
      // publishDate: "March 5, 2024",
      fullContent: `
        <h2 class="text-2xl font-bold text-secondary mb-4">Mastering Nut Export Compliance</h2>
        <p class="mb-4 text-light">Exporting nuts requires careful attention to international regulations, food safety standards, and market-specific requirements. Here's your roadmap to successful nut exports.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Key Regulatory Considerations</h3>
        <p class="mb-3"><strong class="text-accent">Food Safety Standards:</strong> Compliance with HACCP, ISO 22000, and other international food safety management systems is essential for market access.</p>
        
        <p class="mb-4"><strong class="text-accent">Maximum Residue Levels (MRLs):</strong> Different markets have varying tolerance levels for pesticides and contaminants. Regular testing and documentation are mandatory.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Major Export Markets</h3>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">European Union:</strong> Strict regulations on aflatoxin levels and pesticide residues</li>
          <li class="text-light"><strong class="text-accent">United States:</strong> FDA requirements and state-specific regulations</li>
          <li class="text-light"><strong class="text-accent">Middle East:</strong> Halal certification and GCC standard compliance</li>
          <li class="text-light"><strong class="text-accent">East Asia:</strong> Country-specific import permits and quarantine requirements</li>
        </ul>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Quality Assurance</h3>
        <p class="mb-3">Implement comprehensive quality control measures:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light">Regular laboratory testing for aflatoxins and contaminants</li>
          <li class="text-light">Moisture content monitoring and control</li>
          <li class="text-light">Size grading and color sorting</li>
          <li class="text-light">Vacuum packaging and modified atmosphere packaging</li>
        </ul>
        
        <p class="text-light">By building robust quality systems and staying informed about regulatory changes, nut exporters can access premium international markets.</p>
      `
    },
    {
      id: 6,
      title: "Pulse Trading: Opportunities in Emerging Markets",
      excerpt: "Discover the growing demand for pulses in developing economies and how to build sustainable export relationships.",
      category: "Pulses",
      image: "https://media.istockphoto.com/id/1143901429/photo/finance-investment-stock-market-chart-graph-currency-exchange-global-business-fintech.jpg?s=612x612&w=0&k=20&c=Gxi0YYjQiE2kCZL5y9hU2LCQshUl5mVsJsYWjj5ckFQ=",
      // readTime: "4 min read",
      // publishDate: "March 3, 2024",
      fullContent: `
        <h2 class="text-2xl font-bold text-secondary mb-4">The Pulse Revolution in Global Trade</h2>
        <p class="mb-4 text-light">Pulses are gaining prominence in international trade as nutritional awareness grows and developing economies seek affordable protein sources.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Market Growth Drivers</h3>
        <p class="mb-3"><strong class="text-accent">Nutritional Awareness:</strong> Increasing recognition of pulses as healthy, sustainable protein sources is driving global demand.</p>
        
        <p class="mb-3"><strong class="text-accent">Population Growth:</strong> Rising populations in Africa and Asia are creating new markets for pulse consumption.</p>
        
        <p class="mb-4"><strong class="text-accent">Price Stability:</strong> Compared to animal proteins, pulses offer more stable pricing and longer shelf life.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Key Product Categories</h3>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">Chickpeas:</strong> Strong demand in Middle Eastern and Mediterranean markets</li>
          <li class="text-light"><strong class="text-accent">Lentils:</strong> Growing popularity in South Asian and North American cuisines</li>
          <li class="text-light"><strong class="text-accent">Dry Beans:</strong> Stable demand across multiple global markets</li>
          <li class="text-light"><strong class="text-accent">Peas:</strong> Increasing use in plant-based protein products</li>
        </ul>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Export Strategy</h3>
        <p class="mb-3">Successful pulse exporters focus on:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">Quality Consistency:</strong> Maintaining uniform quality across shipments</li>
          <li class="text-light"><strong class="text-accent">Supply Reliability:</strong> Building relationships with multiple producers</li>
          <li class="text-light"><strong class="text-accent">Market Intelligence:</strong> Understanding seasonal patterns and price trends</li>
          <li class="text-light"><strong class="text-accent">Logistics Efficiency:</strong> Optimizing shipping and storage costs</li>
        </ul>
        
        <p class="text-light">The pulse trade offers excellent opportunities for traders who can navigate the unique challenges of these commodity markets.</p>
      `
    },
    {
      id: 7,
      title: "Tea Export Dynamics: Traditional Markets vs Emerging Opportunities",
      excerpt: "Analyze the shifting patterns in global tea trade and identify new growth markets for premium tea exports.",
      category: "Beverages",
      image: "https://i0.wp.com/elmarspices.com/wp-content/uploads/2023/03/tea2.jpg?resize=640%2C397&ssl=1",
      // readTime: "5 min read",
      // publishDate: "March 1, 2024",
      fullContent: `
        <h2 class="text-2xl font-bold text-secondary mb-4">Transforming Tea Trade for Modern Markets</h2>
        <p class="mb-4 text-light">The global tea industry is experiencing significant transformation as traditional markets evolve and new opportunities emerge in unexpected regions.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Traditional Market Evolution</h3>
        <p class="mb-3"><strong class="text-accent">United Kingdom:</strong> While still a major tea market, consumer preferences are shifting toward specialty and single-origin teas.</p>
        
        <p class="mb-3"><strong class="text-accent">Russia & CIS:</strong> Stable demand for traditional black teas with growing interest in premium varieties.</p>
        
        <p class="mb-4"><strong class="text-accent">Middle East:</strong> Strong cultural tea consumption with increasing demand for quality differentiation.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Emerging Opportunities</h3>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">North America:</strong> Growing specialty tea market with focus on health benefits</li>
          <li class="text-light"><strong class="text-accent">East Asia:</strong> Rising interest in non-traditional tea varieties and blends</li>
          <li class="text-light"><strong class="text-accent">Eastern Europe:</strong> Increasing disposable income driving premium tea consumption</li>
          <li class="text-light"><strong class="text-accent">Latin America:</strong> Emerging tea culture in traditionally coffee-dominated markets</li>
        </ul>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Quality and Certification</h3>
        <p class="mb-3">Modern tea exporters must focus on:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">Origin Story:</strong> Clear provenance and production methods</li>
          <li class="text-light"><strong class="text-accent">Sustainability:</strong> Rainforest Alliance and organic certifications</li>
          <li class="text-light"><strong class="text-accent">Quality Grading:</strong> Consistent quality parameters and tasting profiles</li>
          <li class="text-light"><strong class="text-accent">Traceability:</strong> Supply chain transparency from garden to cup</li>
        </ul>
        
        <p class="text-light">By understanding these market dynamics and investing in quality differentiation, tea exporters can build sustainable businesses in the evolving global tea trade.</p>
      `
    },
    {
      id: 8,
      title: "Sugar Trading in Volatile Markets: Risk Management Strategies",
      excerpt: "Learn how to navigate price volatility and supply chain challenges in the global sugar trade.",
      category: "Sweeteners",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFvgaCxLt6d1jCubTN6okL3pFMscFUcCKUKjFnEpnchQJABF4bBtlH-Ayu1xUaEfOoSKw&usqp=CAU",
      // readTime: "6 min read",
      // publishDate: "February 28, 2024",
      fullContent: `
        <h2 class="text-2xl font-bold text-secondary mb-4">Mastering Sugar Market Volatility</h2>
        <p class="mb-4 text-light">Sugar trading requires sophisticated risk management strategies to navigate the commodity's inherent price volatility and supply chain complexities.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Market Dynamics</h3>
        <p class="mb-3"><strong class="text-accent">Price Drivers:</strong> Sugar prices are influenced by multiple factors including weather patterns, government policies, energy prices, and currency fluctuations.</p>
        
        <p class="mb-4"><strong class="text-accent">Supply Chain Complexity:</strong> From cane fields to refineries and international shipping, sugar trading involves multiple stakeholders and potential disruption points.</p>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Risk Management Strategies</h3>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">Hedging:</strong> Using futures and options to manage price risk</li>
          <li class="text-light"><strong class="text-accent">Diversification:</strong> Trading multiple sugar grades and origins</li>
          <li class="text-light"><strong class="text-accent">Contract Structuring:</strong> Flexible terms to accommodate market changes</li>
          <li class="text-light"><strong class="text-accent">Supply Chain Redundancy:</strong> Multiple sourcing and shipping options</li>
        </ul>
        
        <h3 class="text-xl font-bold text-secondary mb-3">Quality Considerations</h3>
        <p class="mb-3">Different markets demand specific sugar characteristics:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li class="text-light"><strong class="text-accent">ICUMSA Ratings:</strong> Color measurement standards for white sugar</li>
          <li class="text-light"><strong class="text-accent">Polarization:</strong> Sucrose content measurement</li>
          <li class="text-light"><strong class="text-accent">Moisture Content:</strong> Critical for storage and transportation</li>
          <li class="text-light"><strong class="text-accent">Granulation:</strong> Crystal size for different applications</li>
        </ul>
        
        <p class="text-light">Successful sugar traders combine market intelligence, risk management expertise, and quality assurance to profit in this challenging but rewarding market.</p>
      `
    }
  ];

  const post = blogPosts.find(p => p.id === parseInt(id));

  if (!post) {
    return (
      <div className="min-h-screen bg-dark text-light py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl text-secondary mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-secondary hover:text-accent">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-light py-8 px-4 professional-section">
      <div className="max-w-4xl mx-auto">
        <Link to="/blog" className="inline-block mb-8 text-secondary hover:text-accent flex items-center gap-2">
          ← Back to Blog
        </Link>
        <article className="innovation-feature-card animate-fade-in-up p-8">
          <div className="relative overflow-hidden rounded-lg mb-6">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-secondary text-dark px-3 py-1 rounded-full text-sm font-semibold">
                {post.category}
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
              <span className="text-accent">{post.publishDate}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            
            {/* Main Title - Now properly part of the scrollable content */}
            <div className="sticky top-0 bg-dark bg-opacity-90 backdrop-blur-sm py-4 z-10 -mx-8 px-8 border-b border-gray-700 mb-6">
              <h1 className="text-4xl font-bold text-light leading-tight">{post.title}</h1>
              <p className="text-gray-300 text-lg italic border-l-4 border-secondary pl-4 py-2 mt-3">
                {post.excerpt}
              </p>
            </div>
          </div>
          
          <div 
            className="prose prose-invert max-w-none blog-content mt-6"
            dangerouslySetInnerHTML={{ __html: post.fullContent }}
          />
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <Link to="/blog" className="text-secondary hover:text-accent font-medium flex items-center gap-2">
              ← Back to Blog
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;