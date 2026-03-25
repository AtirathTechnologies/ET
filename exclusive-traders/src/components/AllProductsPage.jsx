import React, { useState, useEffect } from 'react';
import { db as database, ref, get } from '../firebase';
import { useNavigate } from 'react-router-dom';

const AllProductsPage = ({ onBackToIndustries }) => {
    const [categoriesData, setCategoriesData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const categoriesRef = ref(database, 'categories');
            const snapshot = await get(categoriesRef);

            if (snapshot.exists()) {
                const categories = snapshot.val();
                setCategoriesData(categories);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (categoryId) => {
        const slug = categoryId.toLowerCase().replace(/\s+/g, '-');
        navigate(`/products/category/${slug}`);
    };

    const getCategoryImage = (category, categoryData) => {
        if (categoryData && categoryData.image) {
            let imagePath = categoryData.image;
            // Handle various path formats
            if (imagePath.startsWith('http')) return imagePath;
            if (imagePath.startsWith('/img/') || imagePath.startsWith('img/')) {
                return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
            }
            return `/img/All_Products/${imagePath}`;
        }

        // Fallback images
        const fallbackImages = {
            rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
            chocolate: "/img/All_Products/Chocolate.webp",
            beverages: "/img/All_Products/Beverages.jpg",
            dry_fruits: "/img/All_Products/Dryfruits.jpg",
            default: "/img/All_Products/default-category.jpg"
        };
        return fallbackImages[category.toLowerCase()] || fallbackImages.default;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4096e2] mb-4 mx-auto"></div>
                    <p className="text-[#f1f5f9]">Loading categories...</p>
                </div>
            </div>
        );
    }

    const allCategories = Object.entries(categoriesData).map(([key, value]) => ({
        id: key,
        name: value.name || key,
        description: value.description || '',
        image: getCategoryImage(key, value)
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#4096e2] drop-shadow-lg">All Categories</h1>
                    <p className="text-[#94a3b8] max-w-2xl mx-auto">
                        Browse our extensive collection of products across various industries.
                    </p>
                </div>

                {allCategories.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-[#94a3b8]">No categories found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {allCategories.map((category, index) => (
                            <div
                                key={category.id}
                                className="group cursor-pointer bg-[#1e293b]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:border-[#4096e2]/40 hover:shadow-[0_0_30px_rgba(64,150,226,0.15)]"
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                <div className="relative overflow-hidden rounded-xl mb-4 h-48 flex items-center justify-center bg-white/5">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.src = "/img/All_Products/default-category.jpg";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60"></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#4096e2] transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-[#94a3b8] text-sm line-clamp-2">
                                    {category.description}
                                </p>
                                <div className="mt-4 flex items-center text-[#4096e2] font-semibold text-sm">
                                    View Products
                                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllProductsPage;
