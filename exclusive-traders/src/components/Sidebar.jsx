import React, { useState } from 'react';

const Sidebar = ({
  goBackToProducts,
  industryData,
  selectedBrand,
  handleBrandClick,
  clearBrandFilter,
  filteredProducts,
  isSidebarOpen,
  toggleSidebar
}) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const toggleCategories = () => setIsCategoriesOpen(!isCategoriesOpen);

  // Check if current industry is rice
  const isRiceIndustry = industryData.name && (
    industryData.name.toLowerCase().includes('rice') || 
    industryData.brands?.includes('Basmati')
  );

  // For rice industry, use brands array; for others, extract from products
  const displayItems = isRiceIndustry 
    ? industryData.brands 
    : [...new Set(industryData.products.map(product => product.name))];

  // Get product counts for rice categories
  const getRiceCategoryCounts = () => {
    if (!isRiceIndustry) return {};
    
    const counts = {};
    industryData.brands.forEach(brand => {
      counts[brand] = industryData.products.filter(product => product.brand === brand).length;
    });
    return counts;
  };

  const riceCategoryCounts = getRiceCategoryCounts();

  // Handle exit/back button click
  const handleExitButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Exit button clicked - going back to products');
    goBackToProducts();
  };

  // Handle category item click
  const handleCategoryClick = (item) => {
    console.log('Selected item:', item);
    handleBrandClick(item);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) { // lg breakpoint
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Sidebar container */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-56 lg:w-72 bg-dark transition-transform duration-300 ease-in-out z-40 shadow-xl border-r border-white/10 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-none pt-4 px-4 pb-4 h-full overflow-y-auto">
          
          {/* Simple Back Button for Mobile */}
          <div className="lg:hidden mb-4">
            <button
              onClick={handleExitButtonClick}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 border border-white/30"
              aria-label="Go back to products"
            >
              <i className="fas fa-arrow-left text-sm"></i>
            </button>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-secondary flex items-center">
                <i className="fas fa-tags mr-2"></i> Categories / Products
              </h3>
              <button
                onClick={toggleCategories}
                className="text-secondary hover:text-accent transition-colors text-lg p-3 rounded-full bg-white/20 hover:bg-white/40 border border-secondary"
              >
                {isCategoriesOpen ? (
                  <i className="fas fa-chevron-up"></i>
                ) : (
                  <i className="fas fa-chevron-down"></i>
                )}
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isCategoriesOpen ? 'max-h-full' : 'max-h-0'
              }`}
            >
              <div className="space-y-2">
                {displayItems.length > 0 ? displayItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleCategoryClick(item)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-300 transform ${
                      selectedBrand === item
                        ? 'bg-secondary/30 border-secondary text-secondary scale-105'
                        : 'bg-white/10 border-white/5 text-light'
                    } hover:bg-white/20 hover:scale-105 active:scale-95`}
                    style={{ transitionDelay: `${index * 40}ms` }}
                  >
                    <span className="font-medium text-sm">{item}</span>
                    {isRiceIndustry && riceCategoryCounts[item] && (
                      <span className="text-xs text-light/70 ml-2">
                        ({riceCategoryCounts[item]} products)
                      </span>
                    )}
                  </div>
                )) : (
                  // Fallback for industries with no brands or products
                  <div className="p-3 rounded-lg bg-white/10 border border-white/5 text-light text-sm">
                    <span className="font-medium">No categories available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected brand filter */}
          {selectedBrand && (
            <div className="p-2 bg-secondary/20 rounded-lg border border-secondary/30 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-light text-xs">Active filter:</span>
                <div className="flex items-center">
                  <span className="text-secondary font-medium mr-1 text-sm">
                    {selectedBrand}
                  </span>
                  <button
                    onClick={clearBrandFilter}
                    className="text-accent hover:text-secondary text-xs"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <button
                onClick={clearBrandFilter}
                className="text-xs text-gray hover:text-light mt-1"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Product count */}
          <div className="mt-3 p-2 bg-white/10 rounded-lg">
            <p className="text-light text-xs text-center">
              Showing <span className="text-secondary font-bold">{filteredProducts.length}</span> of{' '}
              <span className="text-accent font-bold">{industryData.products.length}</span> products
            </p>
            {isRiceIndustry && (
              <p className="text-light text-xs text-center mt-1">
                Total: <span className="text-accent font-bold">18</span> rice products
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Black overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Mobile menu toggle button */}
      <button
        onClick={toggleSidebar}
        className={`fixed bottom-4 left-4 z-50 lg:hidden p-3 rounded-full bg-gradient-to-r from-secondary to-accent text-white shadow-lg transition-all duration-300 transform ${
          isSidebarOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
        }`}
      >
        <i className="fas fa-bars text-lg"></i>
      </button>

      {/* Custom CSS for better mobile experience */}
      <style jsx>{`
        @media (max-width: 1024px) {
          /* Ensure sidebar is above all other content on mobile */
          .fixed.top-16 {
            z-index: 10000 !important;
          }
          
          /* Make sure buttons are clickable */
          button {
            cursor: pointer !important;
            -webkit-tap-highlight-color: transparent;
          }
          
          /* Improve touch targets */
          .p-3 {
            padding: 12px !important;
          }
          
          /* Prevent text selection on buttons */
          button {
            user-select: none;
            -webkit-user-select: none;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;