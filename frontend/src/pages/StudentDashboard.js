import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { API } from '../App';
import { toast } from 'sonner';
import { UtensilsCrossed, Star, DollarSign, Calendar, MessageCircle, LogOut, Search } from 'lucide-react';

function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skipDialog, setSkipDialog] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [skipData, setSkipData] = useState({ date: '', mealType: 'breakfast' });

  useEffect(() => {
    fetchSubscriptions();
    fetchComplaints();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/subscription/my-subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/complaint/my-complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints');
    }
  };

  const handlePause = async (subId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/subscription/${subId}/pause`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to pause subscription');
      toast.success('Subscription paused');
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancel = async (subId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/subscription/${subId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to cancel subscription');
      toast.success('Subscription cancelled');
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSkipMeal = async () => {
    if (!skipData.date) {
      toast.error('Please select a date');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const skipDateTime = new Date(skipData.date).toISOString();
      
      const response = await fetch(`${API}/subscription/skip-meal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription_id: selectedSub.id,
          skip_date: skipDateTime,
          meal_type: skipData.mealType
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to skip meal');
      }
      
      toast.success('Meal skipped successfully');
      setSkipDialog(false);
      setSkipData({ date: '', mealType: 'breakfast' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" data-testid="student-dashboard">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Smart Mess</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hello, {user.name}!</span>
              <Button onClick={() => navigate('/search')} variant="outline" data-testid="search-messes-nav-btn">
                <Search className="h-4 w-4 mr-2" />
                Search Messes
              </Button>
              <Button onClick={logout} variant="outline" data-testid="logout-btn">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Dashboard</h1>

        {/* My Subscriptions */}
        <section className="mb-12" data-testid="subscriptions-section">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Subscriptions</h2>
          {subscriptions.length === 0 ? (
            <Card className="p-8 text-center" data-testid="no-subscriptions">
              <p className="text-gray-500 mb-4">You don't have any active subscriptions.</p>
              <Button onClick={() => navigate('/search')} data-testid="browse-messes-btn">Browse Messes</Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className="card-hover" data-testid={`subscription-card-${sub.id}`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{sub.mess_details?.name || 'Mess'}</CardTitle>
                    <CardDescription>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(sub.status)}`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{sub.plan_type === 'monthly' ? 'Monthly' : 'Weekly'} Plan</span>
                    </div>
                    {sub.status === 'active' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedSub(sub);
                            setSkipDialog(true);
                          }}
                          data-testid={`skip-meal-btn-${sub.id}`}
                        >
                          Skip Meal
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePause(sub.id)}
                          data-testid={`pause-btn-${sub.id}`}
                        >
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancel(sub.id)}
                          data-testid={`cancel-btn-${sub.id}`}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="link"
                      className="w-full mt-2"
                      onClick={() => navigate(`/mess/${sub.mess_id}`)}
                      data-testid={`view-mess-btn-${sub.id}`}
                    >
                      View Mess Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* My Complaints */}
        <section data-testid="complaints-section">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Complaints</h2>
          {complaints.length === 0 ? (
            <Card className="p-8 text-center" data-testid="no-complaints">
              <p className="text-gray-500">No complaints filed yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id} data-testid={`complaint-card-${complaint.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                        <CardDescription>{new Date(complaint.created_at).toLocaleDateString()}</CardDescription>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        complaint.status === 'dismissed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {complaint.status.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{complaint.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Skip Meal Dialog */}
      <Dialog open={skipDialog} onOpenChange={setSkipDialog}>
        <DialogContent data-testid="skip-meal-dialog">
          <DialogHeader>
            <DialogTitle>Skip Meal</DialogTitle>
            <DialogDescription>Select the date and meal type you want to skip (minimum 2 hours notice required)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={skipData.date}
                onChange={(e) => setSkipData({ ...skipData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                data-testid="skip-date-input"
              />
            </div>
            <div>
              <Label>Meal Type</Label>
              <Select value={skipData.mealType} onValueChange={(val) => setSkipData({ ...skipData, mealType: val })}>
                <SelectTrigger data-testid="skip-meal-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSkipMeal} className="w-full" data-testid="confirm-skip-meal-btn">
              Confirm Skip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentDashboard;