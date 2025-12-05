import React, { useState, useEffect, useRef } from "react";
import { RotateCw, TrendingUp, BarChart3, ExternalLink } from "lucide-react";

const BasmatiRSSFeed = () => {
  const [feeds, setFeeds] = useState([
    { id: 1, title: "Loading live rice market updates...", link: "#", source: "Market Watch", type: "info" }
  ]);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("🌾 Live Rice Market Updates");
  const [marketTrend, setMarketTrend] = useState("loading");
  const [activeFeed, setActiveFeed] = useState(null);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);
  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    fetchFeeds();
    const interval = setInterval(fetchFeeds, 1 * 60 * 1000);
    const titleInterval = setInterval(rotateTitle, 15000);
    
    return () => {
      clearInterval(interval);
      clearInterval(titleInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!paused) {
      startScrolling();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [paused, feeds]);

  const startScrolling = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let startTime = null;
    const duration = 160000;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;
      
      const contentWidth = container.scrollWidth / 2;
      const translateX = -progress * contentWidth;
      
      container.style.transform = `translateX(${translateX}px)`;
      
      if (!paused) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const rssResponse = await fetch(`${API_BASE_URL}/rss`);
      const rssData = await rssResponse.json();

      if (rssData.current_title) setCurrentTitle(rssData.current_title);
      setMarketTrend(rssData.market_trend || "stable");

      if (rssData?.articles?.length > 0) {
        const enhancedFeeds = rssData.articles.map((article, i) => ({
          id: i,
          title: article.title,
          link: article.link || "#",
          source: article.source,
          type: getArticleType(article.title)
        }));
        setFeeds(enhancedFeeds);
      }
    } catch (err) {
      console.error("Error fetching feeds:", err);
      const fallbackFeeds = [
        { id: 1, title: `Banned rice prices rising amid strong export demand`, link: "https://example.com/price", source: "Market Intelligence", type: "price" },
        { id: 2, title: `Rice export demand wealth in international markets`, link: "https://example.com/export", source: "Trade Watch", type: "export" },
        { id: 3, title: `New rice varieties show stable yield potential`, link: "https://example.com/innovation", source: "AgriTech", type: "innovation" }
      ];
      setFeeds(fallbackFeeds);
      setCurrentTitle(getRandomTitle());
    } finally {
      setLoading(false);
    }
  };

  const rotateTitle = () => {
    const titles = [
      "🌾 Live Rice Market Updates: Prices, Exports & Trends",
      "📈 Real-time Basmati Prices & Market Intelligence",
      "💹 Live Agri-Commodity Updates: Rice & Grains",
      "🌱 Rice Export News & Price Fluctuations"
    ];
    setCurrentTitle(titles[Math.floor(Math.random() * titles.length)]);
  };

  const handleFeedClick = (feed) => {
    console.log("Clicked feed link:", feed.link);
    if (feed.link && feed.link !== "#") {
      window.open(feed.link, "_blank", "noopener,noreferrer");
    }
    setActiveFeed(feed.id);
    setTimeout(() => setActiveFeed(null), 1000);
  };

  const getArticleType = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('price') || lowerTitle.includes('cost') || lowerTitle.includes('msp')) return 'price';
    if (lowerTitle.includes('export') || lowerTitle.includes('import') || lowerTitle.includes('trade')) return 'trade';
    if (lowerTitle.includes('new') || lowerTitle.includes('technology') || lowerTitle.includes('innovation')) return 'innovation';
    if (lowerTitle.includes('weather') || lowerTitle.includes('monsoon') || lowerTitle.includes('crop')) return 'weather';
    if (lowerTitle.includes('policy') || lowerTitle.includes('government') || lowerTitle.includes('subsidy')) return 'policy';
    return 'info';
  };

  const getRandomTitle = () => {
    const titles = [
      "🌾 Live Rice Market Intelligence",
      "📈 Real-time Commodity Updates",
      "💹 Basmati Price Watch Live"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'price': return '💰';
      case 'trade': return '🚢';
      case 'innovation': return '🔬';
      case 'weather': return '🌤️';
      case 'policy': return '📜';
      default: return '📰';
    }
  };

  return (
    <div className="w-full h-16 bg-gradient-to-r from-gray-900/95 to-dark/95 border-b-2 border-emerald-500 shadow-lg z-30 overflow-hidden fixed top-20 backdrop-blur-md">
      {/* Scrolling News Ticker */}
      <div className="w-full h-full flex items-center relative bg-dark/80">
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="flex gap-8 text-white text-sm font-medium py-2 scrolling-container"
            style={{
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              willChange: 'transform'
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {[...feeds, ...feeds].map((feed, i) => (
              <div
                key={`${feed.id}-${i}`}
                className={`flex items-center gap-3 cursor-pointer transition-all duration-300 px-4 py-2 rounded-lg ${
                  activeFeed === feed.id 
                    ? 'bg-emerald-500/20 border border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20' 
                    : 'hover:bg-emerald-500/10 border border-emerald-500/30'
                } ${
                  feed.link && feed.link !== "#" 
                    ? 'hover:text-white' 
                    : 'cursor-not-allowed opacity-70'
                } backdrop-blur-sm`}
                onClick={() => handleFeedClick(feed)}
              >
                <span className="text-lg text-emerald-400">
                  {getTypeIcon(feed.type)}
                </span>
                <strong className={`font-semibold ${
                  feed.link && feed.link !== "#" 
                    ? 'text-white group-hover:text-emerald-200' 
                    : 'text-gray-300'
                }`}>
                  {feed.title}
                </strong>
                <span className="text-emerald-300 text-xs font-medium bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                  {feed.source}
                </span>
                {feed.link && feed.link !== "#" && (
                  <ExternalLink size={12} className="text-emerald-400 opacity-80" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Refresh Button - Optional */}
        {/* <button
          onClick={fetchFeeds}
          disabled={loading}
          title="Refresh live updates"
          className="absolute right-4 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 p-2 rounded-lg border border-emerald-400/50"
        >
          <RotateCw
            size={14}
            className={loading ? "animate-spin text-emerald-300" : ""}
          />
          <span className="hidden sm:inline text-xs">Refresh</span>
        </button> */}
      </div>
    </div>
  );
};

export default BasmatiRSSFeed;