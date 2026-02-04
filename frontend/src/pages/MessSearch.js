import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { API } from '../App';
import { toast } from 'sonner';
import { MapPin, Star, DollarSign, UtensilsCrossed } from 'lucide-react';

function MessSearch({ user }) {
  const navigate = useNavigate();
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('');

  useEffect(() => {
    fetchMesses();
  }, []);

  const fetchMesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchCity) params.append('city', searchCity);
      if (searchState) params.append('state', searchState);
      
      const response = await fetch(`${API}/mess/search?${params}`);
      const data = await response.json();
      setMesses(data);
    } catch (error) {
      toast.error('Failed to fetch messes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMesses();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" data-testid="mess-search-page">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <UtensilsCrossed className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Smart Mess</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button onClick={() => navigate(user.role === 'student' ? '/student/dashboard' : '/owner/dashboard')} data-testid="dashboard-btn">
                  Dashboard
                </Button>
              ) : (
                <Button onClick={() => navigate('/auth')} data-testid="login-btn">Login</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="search-section">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Messes</h1>
          <p className="text-lg text-gray-600 mb-6">Find the perfect mess near you</p>
          
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search by city"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="max-w-xs"
              data-testid="search-city-input"
            />
            <Input
              placeholder="Search by state"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="max-w-xs"
              data-testid="search-state-input"
            />
            <Button type="submit" data-testid="search-submit-btn">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchCity('');
                setSearchState('');
                fetchMesses();
              }}
              data-testid="search-clear-btn"
            >
              Clear
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : messes.length === 0 ? (
          <Card className="p-12 text-center" data-testid="no-messes-found">
            <p className="text-gray-500 text-lg">No messes found. Try adjusting your search.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="mess-list">
            {messes.map((mess) => (
              <Card
                key={mess.id}
                className="card-hover cursor-pointer"
                onClick={() => navigate(`/mess/${mess.id}`)}
                data-testid={`mess-card-${mess.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{mess.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {mess.city}, {mess.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{mess.rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({mess.total_ratings} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign className="h-4 w-4" />
                      <span>₹{mess.pricing_monthly}/month</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {mess.mess_type}
                      </span>
                    </div>
                    {mess.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{mess.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessSearch;