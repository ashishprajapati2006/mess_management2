import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { UtensilsCrossed, Target, Users, Award } from 'lucide-react';

function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" data-testid="about-page">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <UtensilsCrossed className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Smart Mess</span>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" data-testid="back-home-btn">Back to Home</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-6">About Smart Mess System</h1>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Revolutionizing the way students connect with quality mess services
        </p>

        {/* Mission Section */}
        <section className="mb-16" data-testid="mission-section">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <Target className="h-10 w-10 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              At Smart Mess System, we believe every student deserves access to nutritious, affordable, and reliable meal services. 
              Our mission is to bridge the gap between students and mess owners by providing a transparent, easy-to-use platform 
              that ensures quality food and excellent service for everyone.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16" data-testid="values-section">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Student-Centric</h3>
              <p className="text-gray-700">
                We prioritize student needs by providing flexible meal plans, transparent pricing, and the freedom to choose.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100">
              <Award className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Quality Assurance</h3>
              <p className="text-gray-700">
                Every mess on our platform undergoes verification to ensure they meet our quality and hygiene standards.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100">
              <UtensilsCrossed className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Transparency</h3>
              <p className="text-gray-700">
                Real reviews, genuine ratings, and clear pricing help students make informed decisions about their meals.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16" data-testid="story-section">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                Smart Mess System was born from a simple observation: students struggle to find reliable, affordable meal options, 
                while mess owners struggle to reach their target audience.
              </p>
              <p>
                Founded in 2025, we set out to solve this problem by creating a platform that benefits both students and mess owners. 
                Today, we're proud to serve thousands of students across the country and support hundreds of local mess businesses.
              </p>
              <p>
                Our platform not only simplifies the subscription process but also ensures accountability through our rating and 
                complaint system, creating a better experience for everyone involved.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section data-testid="team-section">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">For Students</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Easy search and comparison</li>
                <li>• Flexible meal plans</li>
                <li>• Transparent reviews and ratings</li>
                <li>• Secure payment options</li>
                <li>• 24/7 complaint resolution</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">For Mess Owners</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Reach thousands of students</li>
                <li>• Manage subscriptions easily</li>
                <li>• Real-time analytics dashboard</li>
                <li>• Direct customer feedback</li>
                <li>• Verified platform credibility</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Growing Community</h2>
          <p className="text-gray-600 mb-6">Whether you're a student or mess owner, we're here to help.</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} data-testid="get-started-cta-btn">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')} data-testid="contact-us-cta-btn">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;