const Services = () => {
  const services = [
    {
      icon: "fas fa-ship",
      title: "Optimized Shipping",
      description: "Intelligent routing and predictive analytics for faster, greener global shipments."
    },
    {
      icon: "fas fa-warehouse",
      title: "Smart Warehousing",
      description: "IoT-enabled facilities with real-time inventory tracking and automation."
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
    <section id="services" className="py-20 bg-dark">
      <div className="container mx-auto px-4">
        <div className="section-title text-center mb-12">
          <h2 className="text-4xl text-secondary mb-4 text-shadow-neon">Our Advanced Services</h2>
          <p className="text-gray max-w-2xl mx-auto">
            We leverage state-of-the-art technology to provide seamless logistics solutions tailored to your needs.
          </p>
        </div>
        
        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon text-4xl text-secondary mb-6 text-shadow-neon">
                <i className={service.icon}></i>
              </div>
              <h3 className="text-xl text-secondary font-semibold mb-4">{service.title}</h3>
              <p className="text-light">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;