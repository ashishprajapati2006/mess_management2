import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { API } from '../App';
import { toast } from 'sonner';
import { UtensilsCrossed, Plus, Star, Users, DollarSign, TrendingUp, LogOut, MessageCircle } from 'lucide-react';

function OwnerDashboard({ user }) {
  const navigate = useNavigate();
  const [messes, setMesses] = useState([]);
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [menuDialog, setMenuDialog] = useState(false);
  const [selectedMess, setSelectedMess] = useState(null);
  const [messData, setMessData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    mess_type: 'both',
    description: '',
    contact_number: '',
    pricing_monthly: '',
    pricing_weekly: ''
  });
  const [menuData, setMenuData] = useState([
    { day: 'Monday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Tuesday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Wednesday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Thursday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Friday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Saturday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Sunday', breakfast: '', lunch: '', dinner: '' }
  ]);

  useEffect(() => {
    fetchMesses();
    fetchStats();
  }, []);

  const fetchMesses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/mess/owner/my-messes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMesses(data);
    } catch (error) {
      toast.error('Failed to fetch messes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/owner/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchComplaints = async (messId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/complaint/mess/${messId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints');
    }
  };

  const handleCreateMess = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/mess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...messData,
          pricing_monthly: parseFloat(messData.pricing_monthly),
          pricing_weekly: parseFloat(messData.pricing_weekly)
        })
      });
      
      if (!response.ok) throw new Error('Failed to create mess');
      
      toast.success('Mess created successfully! Waiting for admin verification.');
      setCreateDialog(false);
      setMessData({
        name: '',
        address: '',
        city: '',
        state: '',
        mess_type: 'both',
        description: '',
        contact_number: '',
        pricing_monthly: '',
        pricing_weekly: ''
      });
      fetchMesses();
      fetchStats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateMenu = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/mess/${selectedMess.id}/menu`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ menu: menuData })
      });
      
      if (!response.ok) throw new Error('Failed to update menu');
      
      toast.success('Menu updated successfully!');
      setMenuDialog(false);
      fetchMesses();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" data-testid="owner-dashboard">
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
              <Button onClick={logout} variant="outline" data-testid="logout-btn">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Owner Dashboard</h1>
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="create-mess-btn">
                <Plus className="h-4 w-4 mr-2" />
                Register New Mess
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="create-mess-dialog">
              <DialogHeader>
                <DialogTitle>Register Your Mess</DialogTitle>
                <DialogDescription>Provide details about your mess. Admin will verify before it goes live.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMess} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Mess Name</Label>
                    <Input
                      value={messData.name}
                      onChange={(e) => setMessData({ ...messData, name: e.target.value })}
                      required
                      data-testid="mess-name-input"
                    />
                  </div>
                  <div>
                    <Label>Contact Number</Label>
                    <Input
                      value={messData.contact_number}
                      onChange={(e) => setMessData({ ...messData, contact_number: e.target.value })}
                      required
                      data-testid="contact-number-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={messData.address}
                    onChange={(e) => setMessData({ ...messData, address: e.target.value })}
                    required
                    data-testid="address-input"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={messData.city}
                      onChange={(e) => setMessData({ ...messData, city: e.target.value })}
                      required
                      data-testid="city-input"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={messData.state}
                      onChange={(e) => setMessData({ ...messData, state: e.target.value })}
                      required
                      data-testid="state-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>Mess Type</Label>
                  <Select value={messData.mess_type} onValueChange={(val) => setMessData({ ...messData, mess_type: val })}>
                    <SelectTrigger data-testid="mess-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine-in">Dine-in Only</SelectItem>
                      <SelectItem value="delivery">Delivery Only</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Monthly Price (₹)</Label>
                    <Input
                      type="number"
                      value={messData.pricing_monthly}
                      onChange={(e) => setMessData({ ...messData, pricing_monthly: e.target.value })}
                      required
                      data-testid="monthly-price-input"
                    />
                  </div>
                  <div>
                    <Label>Weekly Price (₹)</Label>
                    <Input
                      type="number"
                      value={messData.pricing_weekly}
                      onChange={(e) => setMessData({ ...messData, pricing_weekly: e.target.value })}
                      required
                      data-testid="weekly-price-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={messData.description}
                    onChange={(e) => setMessData({ ...messData, description: e.target.value })}
                    rows={3}
                    data-testid="description-textarea"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-mess-btn">
                  Register Mess
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-12" data-testid="stats-section">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Messes</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.total_messes}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.active_subscriptions}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.average_rating.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">₹{stats.total_revenue.toFixed(0)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Messes */}
        <section data-testid="messes-section">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Messes</h2>
          {messes.length === 0 ? (
            <Card className="p-8 text-center" data-testid="no-messes">
              <p className="text-gray-500 mb-4">You haven't registered any messes yet.</p>
              <Button onClick={() => setCreateDialog(true)} data-testid="register-first-mess-btn">Register Your First Mess</Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messes.map((mess) => (
                <Card key={mess.id} className="card-hover" data-testid={`mess-card-${mess.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{mess.name}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        mess.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {mess.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <CardDescription>{mess.city}, {mess.state}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{mess.rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({mess.total_ratings} reviews)</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-600">Monthly: ₹{mess.pricing_monthly}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">Weekly: ₹{mess.pricing_weekly}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedMess(mess);
                          setMenuData(mess.menu.length > 0 ? mess.menu : menuData);
                          setMenuDialog(true);
                        }}
                        data-testid={`update-menu-btn-${mess.id}`}
                      >
                        Update Menu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMess(mess);
                          fetchComplaints(mess.id);
                        }}
                        data-testid={`view-complaints-btn-${mess.id}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Complaints Section */}
        {selectedMess && complaints.length > 0 && (
          <section className="mt-12" data-testid="complaints-section">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Complaints for {selectedMess.name}</h2>
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id} data-testid={`complaint-card-${complaint.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                        <CardDescription>From: {complaint.student_name} | {new Date(complaint.created_at).toLocaleDateString()}</CardDescription>
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
          </section>
        )}
      </div>

      {/* Update Menu Dialog */}
      <Dialog open={menuDialog} onOpenChange={setMenuDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" data-testid="update-menu-dialog">
          <DialogHeader>
            <DialogTitle>Update Weekly Menu</DialogTitle>
            <DialogDescription>Set the menu for each day of the week</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {menuData.map((day, index) => (
              <div key={day.day} className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-3">{day.day}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm">Breakfast</Label>
                    <Input
                      value={day.breakfast}
                      onChange={(e) => {
                        const newMenu = [...menuData];
                        newMenu[index].breakfast = e.target.value;
                        setMenuData(newMenu);
                      }}
                      placeholder="e.g., Idli, Sambar, Chutney"
                      data-testid={`breakfast-${day.day}-input`}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Lunch</Label>
                    <Input
                      value={day.lunch}
                      onChange={(e) => {
                        const newMenu = [...menuData];
                        newMenu[index].lunch = e.target.value;
                        setMenuData(newMenu);
                      }}
                      placeholder="e.g., Rice, Dal, Sabzi"
                      data-testid={`lunch-${day.day}-input`}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Dinner</Label>
                    <Input
                      value={day.dinner}
                      onChange={(e) => {
                        const newMenu = [...menuData];
                        newMenu[index].dinner = e.target.value;
                        setMenuData(newMenu);
                      }}
                      placeholder="e.g., Roti, Paneer"
                      data-testid={`dinner-${day.day}-input`}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button onClick={handleUpdateMenu} className="w-full" data-testid="save-menu-btn">
              Save Menu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OwnerDashboard;