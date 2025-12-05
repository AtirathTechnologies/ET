const AllProductsPage = ({ showIndustryProducts, currentUser, onBackToIndustries }) => {
  const allIndustries = [
    { id: 'Chocolate', name: 'Chocolate', image: 'https://shreejifoods.in/cdn/shop/products/IMG_19032021_095047__500_x_500_pixel.jpg?v=1616404272' },
    { id: 'Rice', name: 'Rice', image: 'https://articles-1mg.gumlet.io/articles/wp-content/uploads/2017/02/rsz_shutterstock_291146909.jpg?compress=true&quality=80&w=640&dpr=2.6' },
    { id: 'Perfumes', name: 'Perfumes', image: 'https://www.shutterstock.com/image-photo/mockup-bue-fragrance-perfume-bottle-260nw-1914090385.jpg' },
    { id: 'Clothes', name: 'Clothes', image: 'https://www.rd.com/wp-content/uploads/2022/08/GettyImages-1395657872-e1660072866664.jpg' },
    { id: 'Electronics', name: 'Electronics', image: 'https://ecelectronics.com/wp-content/uploads/2020/04/Modern-Electronics-EC-.jpg' },
    { id: 'Fruits', name: 'Fruits', image: 'https://images.ctfassets.net/prxuf37q3ta2/HKBan6gdluv8p5x3izTGO/2c495a4223d82796f76aab71c1f27af7/1534x864_Small_Fruit_and_veg.jpg?w=1280&q=70&fm=webp' },
    { id: 'Vegetables', name: 'Vegetables', image: 'https://jbmsmartstart.in/wp-content/uploads/2023/09/vegetable-names.jpg' },
    { id: 'Spices', name: 'Spices', image: 'https://pureleven.com/cdn/shop/articles/spices-to-boost-immunity.webp?v=1750638090&width=1100' },
    { id: 'Pulses', name: 'Pulses', image: 'https://media.licdn.com/dms/image/v2/C4E12AQEYXX5FJg6_mg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1520104330626?e=2147483647&v=beta&t=zBw9n6cv7e4ilmRW8MlfGvZkBdjuReWAXqE77OcfeCI' },
    { id: 'Dry Fruits', name: 'Dry Fruits', image: 'https://nutribinge.in/cdn/shop/articles/image3.jpg?v=1713258139' },
    { id: 'Flowers', name: 'Rose', image: 'https://t4.ftcdn.net/jpg/01/88/05/15/360_F_188051555_5Ut1whbPuoV6ntmuifVhBCGOmyyqD3t8.jpg' },
    { id: 'Oil', name: 'Oil', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOV0h8ngl5wQ3wftaOJAzaKTAwdbrp4UM6gg&s' },
    { id: 'Beverages', name: 'Beverages', image: 'https://agronfoodprocessing.com/wp-content/uploads/2023/08/drinks.jpg' },
    { id: 'Tea', name: 'Tea', image: 'https://domf5oio6qrcr.cloudfront.net/medialibrary/8468/conversions/Tea-thumb.jpg' },
  ];

  const handleIndustryClick = (industryId) => {
    if (!currentUser) {
      alert('Please sign in to view products');
      window.location.hash = '#signin';
      return;
    }
    showIndustryProducts(industryId);
  };

  const handleBackToIndustries = () => {
    // Use the provided function to navigate back to industries section
    if (onBackToIndustries) {
      onBackToIndustries();
    } else {
      // Fallback navigation
      window.location.hash = '#home';
      // Scroll to industries section after a short delay
      setTimeout(() => {
        const industriesSection = document.getElementById('industries');
        if (industriesSection) {
          industriesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <section id="all-products" className="py-20 bg-dark min-h-screen">
      <div className="container mx-auto px-4">
        <div className="section-title text-center mb-12">
          <h2 className="text-4xl text-secondary mb-4 text-shadow-neon">All Products</h2>
          <p className="text-gray max-w-2xl mx-auto">
            Explore our complete range of {allIndustries.length} products across all industries
          </p>
        </div>
       
        <div className="industries-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {allIndustries.map(industry => (
            <div
              key={industry.id}
              className="industry-item cursor-pointer transform transition-transform hover:scale-105 bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-secondary"
              onClick={() => handleIndustryClick(industry.id)}
            >
              <img 
                src={industry.image} 
                alt={industry.name} 
                className="w-full h-48 object-cover mb-4 rounded-lg" 
              />
              <h3 className="text-xl font-semibold text-center text-white">{industry.name}</h3>
            </div>
          ))}
        </div>

        {/* Back to Industries Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleBackToIndustries}
            className="bg-secondary hover:bg-accent text-dark font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Industries
          </button>
        </div>
      </div>
    </section>
  );
};

export default AllProductsPage;