const testimonials = [
  {
    id: 1,
    quote: "Finally found my tribe. Built my MVP in 3 days and met my co-founder around a campfire.",
    author: "Alex Chen",
    role: "Founder @ NightOwl",
    experience: "Desert Code Camp"
  },
  {
    id: 2,
    quote: "This isn't networking. It's magic. Pure creative chaos that somehow makes perfect sense.",
    author: "Maya Rodriguez",
    role: "Creative Director",
    experience: "Tokyo Street Tech"
  },
  {
    id: 3,
    quote: "Traded my corner office for a beach office. Best decision ever. The ideas just flow here.",
    author: "Sam Kim",
    role: "Solo Builder",
    experience: "Bali Builder Retreat"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-dark">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-neon-yellow">Founders Go</span>
            <br />
            <span className="text-neon-cyan">Farther</span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join a community of rebels, misfits, and builders who believe the best 
            ideas happen when you step away from the screen and into the real world.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="relative p-8 bg-card border border-gray-800 rounded-2xl hover:border-gray-700 transition-all duration-300"
            >
              {/* Quote */}
              <blockquote className="text-lg text-foreground mb-6 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="space-y-2">
                <div className="font-bold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-gray-400">{testimonial.role}</div>
                
                {/* Experience badge */}
                <div className="inline-block">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                    {testimonial.experience}
                  </span>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                index === 0 ? 'bg-neon-pink' : 
                index === 1 ? 'bg-neon-cyan' : 'bg-neon-yellow'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;