const About = () => {
  return (
    <section id="about" className="py-20 bg-light text-dark">
      <div className="container mx-auto px-4">
        <div className="about-content flex flex-col md:flex-row items-center gap-12">
          <div className="about-text flex-1">
            <h2 className="text-3xl text-primary font-bold mb-6">About Exclusive Traders</h2>
            <div className="space-y-4">
              <p className="mb-4">
                Founded in 2017 as Exclusive Travel, we mastered London's luxury sector through a decade of premium hospitality operations. This experience revealed critical supply chain gaps for high-quality essentials and unnecessary intermediary costs.
              </p>
              <p className="mb-4">
                Our transformation into Exclusive Traders (ET) established us as a specialized B2B sourcing partner delivering Supply Chain Certainty. We leverage our global network for direct-to-manufacturer access, ensuring superior quality control and competitive pricing.
              </p>
              <p className="mb-4">
                Our curated portfolio spans premium guest amenities, operational essentials, and strategic raw materials tailored for luxury hospitality. Committed to UK/EU regulatory compliance, we practice transparent, ethical sourcing across all partnerships.
              </p>
              <p className="mb-4">
                We function as a reliable extension of your procurement team, providing consistent quality and operational efficiency. Guided by our principle, "Where there is need is the answer one can get from us," we transform challenges into sustainable solutions.
              </p>
            </div>
          </div>
          <div className="about-image flex-1 rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Futuristic Warehouse" 
              className="w-full h-auto block transition-transform duration-500 hover:scale-110"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;