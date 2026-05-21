// src/components/Services.jsx
const Services = () => {
  const services = [
    {
      icon: "fas fa-ship",
      title: "Optimized Shipping",
      description: "Intelligent routing and predictive analytics enable greener global shipments."
    },
    {
      icon: "fas fa-warehouse",
      title: "Smart Warehousing",
      description: "IoT-enabled facilities with real-time inventory management ensure efficient operations."
    },
    {
      icon: "fas fa-boxes",
      title: "Blockchain Inventory",
      description: "Secure, transparent management with immutable records and smart contracts."
    },
    {
      icon: "fas fa-file-contract",
      title: "Automated Customs",
      description: "AI-driven compliance and documentation for frictionless border crossings."
    }
  ];

  return (
    <section id="services" className="pt-2 pb-8 md:pt-4 md:pb-12 bg-dark">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Heading & Description - all centered */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-secondary mb-2 sm:mb-3 font-normal">
            Our Advanced Services
          </h2>
          <p className="text-gray text-sm sm:text-base max-w-2xl mx-auto leading-relaxed px-2">
            We leverage state-of-the-art technology to seamlessly logistics solutions tailored to your needs.
          </p>
        </div>

        {/* Services Grid - centered on mobile (single column) */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-6xl">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-gray-800/80 hover:shadow-xl border border-white/5"
              >
                {/* Icon - centered */}
                <div className="flex justify-center mb-4 sm:mb-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-secondary/10 rounded-full flex items-center justify-center text-2xl sm:text-3xl text-secondary">
                    <i className={service.icon}></i>
                  </div>
                </div>
                {/* Title - centered */}
                <h3 className="text-base sm:text-lg text-secondary mb-2 font-bold">
                  {service.title}
                </h3>
                {/* Description - centered */}
                <p className="text-light text-xs sm:text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;