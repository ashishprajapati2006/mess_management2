import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { UtensilsCrossed, Users, Star, Shield, TrendingUp, MapPin } from 'lucide-react';

function Landing({ user }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const getDashboardLink = () => {
    if (!user) return '/auth';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'owner') return '/owner/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 glass border-b border-gray-200" data-testid="main-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Smart Mess</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
              <Link to="/faq" className="text-gray-700 hover:text-blue-600 transition-colors">FAQ</Link>
              {user ? (
                <>
                  <Link to={getDashboardLink()}>
                    <Button data-testid="dashboard-btn">Dashboard</Button>
                  </Link>
                  <Button variant="outline" onClick={logout} data-testid="logout-btn">Logout</Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button data-testid="get-started-btn">Get Started</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4" data-testid="hero-section">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 fade-in">
            Connect with the Best <span className="text-blue-600">Mess Services</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Smart Mess System bridges students and mess owners, making meal subscriptions easy, transparent, and reliable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-6" data-testid="hero-get-started-btn">
                  Get Started Free
                </Button>
              </Link>
            )}
            <Link to="/search">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" data-testid="search-messes-btn">
                Search Messes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">Why Choose Smart Mess?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 card-hover" data-testid="feature-easy-search">
              <MapPin className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Easy Search</h3>
              <p className="text-gray-600">Find nearby messes based on your location with detailed menus and pricing.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 card-hover" data-testid="feature-ratings">
              <Star className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Transparent Ratings</h3>
              <p className="text-gray-600">Read genuine reviews and ratings from fellow students before subscribing.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 card-hover" data-testid="feature-flexibility">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Flexible Plans</h3>
              <p className="text-gray-600">Choose monthly or weekly plans with options to pause, cancel, or skip meals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-12 mt-12">
            {/* For Students */}
            <div className="space-y-6" data-testid="student-flow">
              <h3 className="text-2xl font-semibold text-blue-600 flex items-center gap-2">
                <Users className="h-6 w-6" />
                For Students
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sign Up & Search</h4>
                    <p className="text-gray-600">Create an account and search for messes in your area</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Choose & Subscribe</h4>
                    <p className="text-gray-600">Select a mess, choose your plan, and make secure payment</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Manage & Rate</h4>
                    <p className="text-gray-600">Manage your subscription, skip meals, and rate your experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Mess Owners */}
            <div className="space-y-6" data-testid="owner-flow">
              <h3 className="text-2xl font-semibold text-blue-600 flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6" />
                For Mess Owners
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Register Your Mess</h4>
                    <p className="text-gray-600">Provide mess details and wait for admin verification</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Upload Menu</h4>
                    <p className="text-gray-600">Keep your daily/weekly menu updated for students</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Manage Orders</h4>
                    <p className="text-gray-600">View subscriptions, handle complaints, and track analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-blue-600 text-white" data-testid="stats-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Registered Messes</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Happy Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8/5</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of students and mess owners using Smart Mess System today.</p>
          {!user && (
            <Link to="/auth">
              <Button size="lg" className="text-lg px-10 py-6" data-testid="cta-signup-btn">
                Sign Up Now
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <UtensilsCrossed className="h-6 w-6" />
                <span className="text-xl font-bold">Smart Mess</span>
              </div>
              <p className="text-gray-400">Connecting students with quality mess services.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About Us</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
                <Link to="/faq" className="block text-gray-400 hover:text-white transition-colors">FAQ</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Users</h4>
              <div className="space-y-2">
                <Link to="/search" className="block text-gray-400 hover:text-white transition-colors">Search Messes</Link>
                <Link to="/feedback" className="block text-gray-400 hover:text-white transition-colors">Feedback</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Smart Mess System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;