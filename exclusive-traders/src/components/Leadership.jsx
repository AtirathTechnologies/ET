// src/components/Leadership.jsx
import React from 'react';
import himayatImg from '../assets/Hymat.png';
import chandarImg from '../assets/Chander.png';
import jahnaviImg from '../assets/Jahnavi.png';

const Leadership = () => {
  const leaders = [
    {
      name: "Mr. Himayat Ali",
      position: "Director",
      image: himayatImg,
      bio: "Himayat Ali brings extensive expertise in supply chain management and international business development with key strengths in strategic planning, market expansion, logistics optimization, partnership development, financial management, and team leadership."
    },
    {
      name: "Mr. G. Chandar",
      position: "Director",
      image: chandarImg,
      bio: "He brings expertise in real estate, agriculture, IT, and supply chain management. Having worked with international partners across MENA and USA markets, he plays a key role in driving operational excellence, building partnerships, and expanding Exclusive Trader's global presence."
    },
    {
      name: "Ms. P. Jahnavi",
      position: "IT Head",
      image: jahnaviImg,
      bio: "Jahnavi leads our technology initiatives with expertise in system architecture, cybersecurity, digital transformation, data analytics, cloud infrastructure, and IT project management. She ensures our technological infrastructure supports global trade operations efficiently and securely."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-[#0a1a2f] to-[#0f2b4a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 lg:mb-20">
          <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
            Our Leadership
          </span>
        </h2>

        {/* Leaders Grid */}
        <div className="space-y-20 lg:space-y-24">
          {leaders.map((leader, index) => {
            const isEven = index % 2 === 1;

            return (
              <div
                key={index}
                className={`flex flex-col ${
                  isEven ? "lg:flex-row-reverse" : "lg:flex-row"
                } gap-10 lg:gap-16 items-center`}
              >
                {/* Image - Reduced height, full face visible */}
                <div className="w-full lg:w-5/12 flex justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="relative w-72 h-96 lg:w-80 lg:h-96 object-contain rounded-3xl shadow-2xl border-4 border-cyan-500/30"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-7/12 text-center lg:text-left">
                  <span className="inline-block px-5 py-2 bg-cyan-500/20 rounded-full text-cyan-300 text-sm font-semibold mb-5">
                    {leader.position}
                  </span>

                  <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                    {leader.name}
                  </h3>

                  <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    {leader.bio}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Leadership;