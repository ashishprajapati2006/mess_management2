import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { API } from '../App';
import { toast } from 'sonner';
import { UtensilsCrossed, Users, Building2, MessageCircle, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [messes, setMesses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warningDialog, setWarningDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchMesses();
    fetchComplaints();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchMesses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/admin/messes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMesses(data);
    } catch (error) {
      toast.error('Failed to fetch messes');
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/admin/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      toast.error('Failed to fetch complaints');
    }
  };

  const handleVerifyMess = async (messId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/admin/verify-mess/${messId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to verify mess');
      
      toast.success('Mess verified successfully!');
      fetchMesses();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleResolveComplaint = async (complaintId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/admin/complaint/${complaintId}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to resolve complaint');
      
      toast.success('Complaint resolved');
      fetchComplaints();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSendWarning = async () => {
    if (!warningMessage) {
      toast.error('Please enter a warning message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/admin/send-warning/${selectedOwner.id}?message=${encodeURIComponent(warningMessage)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to send warning');
      
      toast.success('Warning sent successfully!');
      setWarningDialog(false);
      setWarningMessage('');
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

  const students = users.filter(u => u.role === 'student');
  const owners = users.filter(u => u.role === 'owner');
  const pendingMesses = messes.filter(m => !m.is_verified);
  const pendingComplaints = complaints.filter(c => c.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" data-testid="admin-dashboard">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Smart Mess Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Admin Panel</span>
              <Button onClick={logout} variant="outline" data-testid="logout-btn">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12" data-testid="stats-section">
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{students.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Owners</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{owners.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Verifications</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{pendingMesses.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Complaints</CardTitle>
              <MessageCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{pendingComplaints.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="messes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messes" data-testid="messes-tab">Messes</TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">Users</TabsTrigger>
            <TabsTrigger value="complaints" data-testid="complaints-tab">Complaints</TabsTrigger>
          </TabsList>

          {/* Messes Tab */}
          <TabsContent value="messes" className="mt-6" data-testid="messes-content">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Messes</h2>
            <div className="space-y-4">
              {messes.map((mess) => (
                <Card key={mess.id} data-testid={`mess-card-${mess.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{mess.name}</CardTitle>
                        <CardDescription>{mess.city}, {mess.state} | {mess.contact_number}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          mess.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {mess.is_verified ? 'Verified' : 'Pending'}
                        </span>
                        {!mess.is_verified && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyMess(mess.id)}
                            data-testid={`verify-mess-btn-${mess.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 font-medium">{mess.mess_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Monthly:</span>
                        <span className="ml-2 font-medium">₹{mess.pricing_monthly}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Rating:</span>
                        <span className="ml-2 font-medium">{mess.rating.toFixed(1)} ({mess.total_ratings})</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6" data-testid="users-content">
            <div className="space-y-8">
              {/* Students */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Students ({students.length})</h2>
                <div className="space-y-4">
                  {students.map((student) => (
                    <Card key={student.id} data-testid={`student-card-${student.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            <p className="text-gray-600">{student.email}</p>
                            {student.phone && <p className="text-gray-500 text-sm">{student.phone}</p>}
                          </div>
                          <span className="text-sm text-gray-500">
                            Joined {new Date(student.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Owners */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mess Owners ({owners.length})</h2>
                <div className="space-y-4">
                  {owners.map((owner) => {
                    const ownerMesses = messes.filter(m => m.owner_id === owner.id);
                    const ownerComplaints = complaints.filter(c => 
                      ownerMesses.some(m => m.id === c.mess_id)
                    );
                    
                    return (
                      <Card key={owner.id} data-testid={`owner-card-${owner.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{owner.name}</h3>
                              <p className="text-gray-600">{owner.email}</p>
                              {owner.phone && <p className="text-gray-500 text-sm">{owner.phone}</p>}
                              <div className="mt-2 flex gap-4 text-sm text-gray-600">
                                <span>Messes: {ownerMesses.length}</span>
                                <span>Complaints: {ownerComplaints.length}</span>
                              </div>
                            </div>
                            <Dialog open={warningDialog && selectedOwner?.id === owner.id} onOpenChange={(open) => {
                              setWarningDialog(open);
                              if (!open) setSelectedOwner(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedOwner(owner)}
                                  data-testid={`send-warning-btn-${owner.id}`}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Send Warning
                                </Button>
                              </DialogTrigger>
                              <DialogContent data-testid="warning-dialog">
                                <DialogHeader>
                                  <DialogTitle>Send Warning to {owner.name}</DialogTitle>
                                  <DialogDescription>The owner will receive this warning via email</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Warning Message</Label>
                                    <Textarea
                                      value={warningMessage}
                                      onChange={(e) => setWarningMessage(e.target.value)}
                                      placeholder="Enter warning message..."
                                      rows={4}
                                      data-testid="warning-message-textarea"
                                    />
                                  </div>
                                  <Button onClick={handleSendWarning} className="w-full" data-testid="confirm-warning-btn">
                                    Send Warning
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="mt-6" data-testid="complaints-content">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Complaints</h2>
            <div className="space-y-4">
              {complaints.map((complaint) => {
                const mess = messes.find(m => m.id === complaint.mess_id);
                return (
                  <Card key={complaint.id} data-testid={`complaint-card-${complaint.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                          <CardDescription>
                            From: {complaint.student_name} | Mess: {mess?.name || 'Unknown'} | 
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            complaint.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            complaint.status === 'dismissed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {complaint.status.toUpperCase()}
                          </span>
                          {complaint.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleResolveComplaint(complaint.id)}
                              data-testid={`resolve-complaint-btn-${complaint.id}`}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{complaint.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;