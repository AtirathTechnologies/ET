import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";

const CACHE_KEY = 'industries_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const SHOW_ALL_KEY = 'industries_showAll'; // Key for sessionStorage

const Industries = ({ showIndustryProducts }) => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  // Initialize showAll from sessionStorage (default false)
  const [showAll, setShowAll] = useState(() => {
    const stored = sessionStorage.getItem(SHOW_ALL_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setIndustries(data);
          setLoading(false);
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // Always fetch fresh data in background
    const fetchIndustries = async () => {
      try {
        const categoriesRef = ref(db, "categories");
        const snapshot = await get(categoriesRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          const industriesArray = Object.entries(data).map(
            ([id, category]) => {
              let imagePath =
                category.image || "/ProductsImg/All_Products/default-category.jpg";
              imagePath = imagePath.replace("/img/", "/ProductsImg/");

              return {
                id,
                name: category.name || id,
                image: imagePath,
              };
            }
          );

          setIndustries(industriesArray);
          setLoading(false);

          // Save to cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: industriesArray,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  const handleIndustryClick = (industryId) => {
    if (showIndustryProducts) {
      showIndustryProducts(industryId);
    }
  };

  const handleToggleView = () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);
    // Store the preference in sessionStorage
    sessionStorage.setItem(SHOW_ALL_KEY, newShowAll.toString());
  };

  // Determine which industries to display – show first 8 initially
  const displayedIndustries = showAll ? industries : industries.slice(0, 8);
  const hasMore = industries.length > 8;

  // Skeleton loader – show 8 skeleton items
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="w-full h-48 bg-gray-700 rounded-lg"></div>
          <div className="h-6 bg-gray-700 rounded mt-3 mx-auto w-3/4"></div>
        </div>
      ))}
    </div>
  );

  return (
    <section id="industries" className="pt-8 pb-20 bg-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl text-secondary mb-4">
            Industries We Transform
          </h2>
          <p className="text-gray">
            Specialized solutions for food, beverage, and nutrition industries.
          </p>
        </div>

        {loading ? renderSkeleton() : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {displayedIndustries.map((industry) => (
                <div
                  key={industry.id}
                  className="industry-item cursor-pointer hover:scale-105 transition"
                  onClick={() => handleIndustryClick(industry.id)}
                >
                  <img
                    src={industry.image}
                    alt={industry.name}
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.src = "/ProductsImg/All_Products/default-category.jpg";
                    }}
                  />
                  <h3 className="text-xl text-center text-white mt-3">
                    {industry.name}
                  </h3>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={handleToggleView}
                  className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition"
                >
                  {showAll ? "Show Less" : "View All Products"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Industries;