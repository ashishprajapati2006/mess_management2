import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { API } from '../App';
import { toast } from 'sonner';
import { MapPin, Star, DollarSign, UtensilsCrossed, Phone, MessageCircle } from 'lucide-react';

function MessDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mess, setMess] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribeDialog, setSubscribeDialog] = useState(false);
  const [ratingDialog, setRatingDialog] = useState(false);
  const [complaintDialog, setComplaintDialog] = useState(false);
  const [planType, setPlanType] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [complaint, setComplaint] = useState({ subject: '', description: '' });

  useEffect(() => {
    fetchMessDetails();
    fetchRatings();
  }, [id]);

  const fetchMessDetails = async () => {
    try {
      const response = await fetch(`${API}/mess/${id}`);
      const data = await response.json();
      setMess(data);
    } catch (error) {
      toast.error('Failed to fetch mess details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await fetch(`${API}/rating/mess/${id}`);
      const data = await response.json();
      setRatings(data);
    } catch (error) {
      console.error('Failed to fetch ratings');
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please login to subscribe');
      navigate('/auth');
      return;
    }

    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const amount = planType === 'monthly' ? mess.pricing_monthly : mess.pricing_weekly;
      
      // Create Razorpay order
      const orderResponse = await fetch(`${API}/subscription/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          subscription_data: {
            mess_id: id,
            plan_type: planType,
            start_date: new Date(startDate).toISOString()
          }
        })
      });
      
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.detail);

      // For demo purposes, simulate successful payment
      toast.success('Payment processing... (Demo mode)');
      setTimeout(() => {
        toast.success('Subscription created successfully!');
        setSubscribeDialog(false);
        navigate('/student/dashboard');
      }, 1500);
      
    } catch (error) {
      toast.error(error.message || 'Failed to create subscription');
    }
  };

  const handleRating = async () => {
    if (!user) {
      toast.error('Please login to rate');
      navigate('/auth');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mess_id: id,
          rating: parseFloat(rating),
          review: review
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit rating');
      
      toast.success('Rating submitted successfully!');
      setRatingDialog(false);
      setRating(5);
      setReview('');
      fetchMessDetails();
      fetchRatings();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleComplaint = async () => {
    if (!user) {
      toast.error('Please login to file a complaint');
      navigate('/auth');
      return;
    }

    if (!complaint.subject || !complaint.description) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/complaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mess_id: id,
          subject: complaint.subject,
          description: complaint.description
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit complaint');
      
      toast.success('Complaint submitted successfully!');
      setComplaintDialog(false);
      setComplaint({ subject: '', description: '' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!mess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Mess not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" data-testid="mess-details-page">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <UtensilsCrossed className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Smart Mess</span>
            </div>
            <Button onClick={() => navigate('/search')} variant="outline" data-testid="back-to-search-btn">
              Back to Search
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="mess-info-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl mb-2">{mess.name}</CardTitle>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{mess.address}, {mess.city}, {mess.state}</span>
                    </div>
                  </div>
                  {!mess.is_verified && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                      Pending Verification
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-lg">{mess.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({mess.total_ratings} reviews)</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {mess.mess_type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-5 w-5" />
                  <span>{mess.contact_number}</span>
                </div>

                {mess.description && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">About</h3>
                    <p className="text-gray-700">{mess.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-2">Pricing</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">₹{mess.pricing_monthly}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">₹{mess.pricing_weekly}</span>
                      <span className="text-gray-500">/week</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu */}
            {mess.menu && mess.menu.length > 0 && (
              <Card data-testid="menu-card">
                <CardHeader>
                  <CardTitle>Weekly Menu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mess.menu.map((item, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h4 className="font-semibold text-lg mb-2">{item.day}</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          {item.breakfast && (
                            <div>
                              <p className="text-gray-500 font-medium">Breakfast</p>
                              <p className="text-gray-700">{item.breakfast}</p>
                            </div>
                          )}
                          {item.lunch && (
                            <div>
                              <p className="text-gray-500 font-medium">Lunch</p>
                              <p className="text-gray-700">{item.lunch}</p>
                            </div>
                          )}
                          {item.dinner && (
                            <div>
                              <p className="text-gray-500 font-medium">Dinner</p>
                              <p className="text-gray-700">{item.dinner}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ratings */}
            <Card data-testid="ratings-card">
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {ratings.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first to rate!</p>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((r) => (
                      <div key={r.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{r.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-700 font-medium">{r.student_name}</span>
                        </div>
                        {r.review && <p className="text-gray-600">{r.review}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {user && user.role === 'student' && (
              <>
                <Dialog open={subscribeDialog} onOpenChange={setSubscribeDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg" data-testid="subscribe-btn">Subscribe Now</Button>
                  </DialogTrigger>
                  <DialogContent data-testid="subscribe-dialog">
                    <DialogHeader>
                      <DialogTitle>Subscribe to {mess.name}</DialogTitle>
                      <DialogDescription>Choose your plan and start date</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Plan Type</Label>
                        <Select value={planType} onValueChange={setPlanType}>
                          <SelectTrigger data-testid="plan-type-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly - ₹{mess.pricing_monthly}</SelectItem>
                            <SelectItem value="weekly">Weekly - ₹{mess.pricing_weekly}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          data-testid="start-date-input"
                        />
                      </div>
                      <Button onClick={handleSubscribe} className="w-full" data-testid="confirm-subscribe-btn">
                        Proceed to Payment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={ratingDialog} onOpenChange={setRatingDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" data-testid="rate-mess-btn">
                      <Star className="h-4 w-4 mr-2" />
                      Rate this Mess
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="rating-dialog">
                    <DialogHeader>
                      <DialogTitle>Rate {mess.name}</DialogTitle>
                      <DialogDescription>Share your experience</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <Select value={rating.toString()} onValueChange={(val) => setRating(parseFloat(val))}>
                          <SelectTrigger data-testid="rating-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 - Excellent</SelectItem>
                            <SelectItem value="4">4 - Good</SelectItem>
                            <SelectItem value="3">3 - Average</SelectItem>
                            <SelectItem value="2">2 - Below Average</SelectItem>
                            <SelectItem value="1">1 - Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Review (optional)</Label>
                        <Textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share your experience..."
                          rows={4}
                          data-testid="review-textarea"
                        />
                      </div>
                      <Button onClick={handleRating} className="w-full" data-testid="submit-rating-btn">
                        Submit Rating
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={complaintDialog} onOpenChange={setComplaintDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" data-testid="file-complaint-btn">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      File Complaint
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="complaint-dialog">
                    <DialogHeader>
                      <DialogTitle>File a Complaint</DialogTitle>
                      <DialogDescription>We'll review your complaint and take action</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={complaint.subject}
                          onChange={(e) => setComplaint({ ...complaint, subject: e.target.value })}
                          placeholder="Brief description"
                          data-testid="complaint-subject-input"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={complaint.description}
                          onChange={(e) => setComplaint({ ...complaint, description: e.target.value })}
                          placeholder="Detailed complaint..."
                          rows={4}
                          data-testid="complaint-description-textarea"
                        />
                      </div>
                      <Button onClick={handleComplaint} className="w-full" data-testid="submit-complaint-btn">
                        Submit Complaint
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {!user && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4 text-center">Login to subscribe, rate, or file complaints</p>
                  <Button onClick={() => navigate('/auth')} className="w-full" data-testid="login-to-continue-btn">
                    Login to Continue
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessDetails;