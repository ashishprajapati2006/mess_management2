import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { UtensilsCrossed, MessageSquare } from 'lucide-react';

function Feedback() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    rating: '5',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Thank you for your feedback! We appreciate your input.');
      setFormData({
        name: '',
        email: '',
        category: 'general',
        rating: '5',
        message: ''
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" data-testid="feedback-page">
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <MessageSquare className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">We Value Your Feedback</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your feedback helps us improve Smart Mess System. Tell us about your experience or suggest new features.
          </p>
        </div>

        <Card data-testid="feedback-form-card">
          <CardHeader>
            <CardTitle>Share Your Thoughts</CardTitle>
            <CardDescription>All feedback is anonymous and helps us serve you better</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="feedback-form">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="email-input"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Feedback Category</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger id="category" data-testid="category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="ui">User Interface</SelectItem>
                      <SelectItem value="service">Service Quality</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rating">Overall Experience</Label>
                  <Select value={formData.rating} onValueChange={(val) => setFormData({ ...formData, rating: val })}>
                    <SelectTrigger id="rating" data-testid="rating-select">
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
              </div>

              <div>
                <Label htmlFor="message">Your Feedback</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  placeholder="Tell us what you think..."
                  required
                  data-testid="message-textarea"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading} data-testid="submit-feedback-btn">
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Feature Requests</h3>
              <p className="text-sm text-gray-700">
                Have an idea for a new feature? We're always looking to improve. Your suggestions help shape our roadmap.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Report Issues</h3>
              <p className="text-sm text-gray-700">
                Found a bug or technical issue? Let us know so we can fix it quickly and improve your experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Feedback;