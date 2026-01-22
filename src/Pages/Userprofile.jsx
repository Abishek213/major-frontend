import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Camera, Calendar, MapPin, Clock, Edit2, X, User, Save, Loader2 } from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    fullname: '',
    email: '',
    contactNo: '',
    role: '',
    profileImage: null,
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [bookedEvents, setBookedEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [wishlistEvents, setWishlistEvents] = useState([]);
  const [organizedEvents, setOrganizedEvents] = useState([]);
  
  // Store original data to reset if user cancels edit
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchUserData();
    fetchUserEvents();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4001/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = response.data.user;
      setUserData(user);
      // Store original data for cancel functionality
      setOriginalData(user);
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to fetch user data' });
    }
  };

  const fetchUserEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4001/api/v1/users/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookedEvents(response.data.booked || []);
      setPastEvents(response.data.past || []);
      setWishlistEvents(response.data.wishlist || []);
      setOrganizedEvents(response.data.organized || []);
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to fetch events' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', content: 'Image size should be less than 5MB' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', content: 'Please select an image file' });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4001/api/v1/users/upload-profile-image',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUserData(prev => ({ ...prev, profileImage: response.data.imageUrl }));
      setOriginalData(prev => ({ ...prev, profileImage: response.data.imageUrl }));
      setMessage({ type: 'success', content: 'Profile image updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    // Store current data as original when starting edit
    setOriginalData({ ...userData });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    // Reset to original data
    setUserData({ ...originalData });
    setIsEditing(false);
    setMessage({ type: '', content: '' });
  };

  const handleProfileUpdate = async () => {
    // Validation
    if (!userData.fullname.trim()) {
      setMessage({ type: 'error', content: 'Full name is required' });
      return;
    }

    if (userData.contactNo && !/^\d{10}$/.test(userData.contactNo)) {
      setMessage({ type: 'error', content: 'Please enter a valid 10-digit contact number' });
      return;
    }

    // Check if there are actual changes
    const hasChanges = 
      userData.fullname !== originalData.fullname ||
      userData.contactNo !== originalData.contactNo ||
      userData.bio !== originalData.bio;

    if (!hasChanges) {
      setMessage({ type: 'info', content: 'No changes to save' });
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:4001/api/v1/users/update',
        {
          fullname: userData.fullname,
          contactNo: userData.contactNo,
          bio: userData.bio
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ type: 'success', content: 'Profile updated successfully!' });
      
      // Update original data with new changes
      setOriginalData({
        ...originalData,
        fullname: userData.fullname,
        contactNo: userData.contactNo,
        bio: userData.bio
      });
      
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleEventAction = async (eventId, action) => {
    try {
      const token = localStorage.getItem('token');
      switch (action) {
        case 'cancel':
          await axios.delete(`http://localhost:4001/api/v1/bookings/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBookedEvents(prev => prev.filter(event => event._id !== eventId));
          break;
        case 'removeWishlist':
          await axios.delete(`http://localhost:4001/api/v1/wishlist/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWishlistEvents(prev => prev.filter(event => event._id !== eventId));
          break;
        case 'edit':
          navigate(`/events/edit/${eventId}`);
          break;
        case 'manage':
          navigate(`/events/manage/${eventId}`);
          break;
      }
      setMessage({ type: 'success', content: `Event ${action} successful` });
    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || `Failed to ${action} event` });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-16">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header Card */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                  <AvatarImage 
                    src={userData.profileImage || "/default-avatar.png"} 
                    className="object-cover" 
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {userData.fullname?.charAt(0) || <User className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="profile-image" 
                  className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg cursor-pointer transition-all
                    ${loading ? 'bg-gray-100' : 'bg-white hover:bg-gray-50 hover:scale-110'}`}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-gray-600" />
                  )}
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </label>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent 
                                 bg-gradient-to-r from-blue-600 to-purple-600">
                      {userData.fullname || 'User Profile'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-block px-3 py-1 text-sm font-semibold 
                                     rounded-full bg-gradient-to-r from-blue-100 to-purple-100 
                                     text-blue-700">
                        {userData.role || 'User'}
                      </span>
                      {userData.role === 'Organizer' && (
                        <span className="text-sm text-gray-500">Verified Organizer</span>
                      )}
                    </div>
                    {userData.bio && (
                      <p className="mt-2 text-gray-600 max-w-2xl">{userData.bio}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={isEditing ? cancelEditing : startEditing}
                    disabled={loading}
                    className={`transition-all duration-200 ${isEditing ? 
                      'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' : 
                      'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}
                  >
                    {loading && isEditing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel Edit
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Details
                {isEditing && (
                  <span className="text-sm font-normal text-blue-600 animate-pulse">
                    (Editing...)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Full Name *</label>
                  <Input
                    name="fullname"
                    value={userData.fullname}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className={`transition-all ${isEditing ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <Input
                    name="email"
                    value={userData.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Contact Number</label>
                  <Input
                    name="contactNo"
                    value={userData.contactNo}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className={`transition-all ${isEditing ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}
                    placeholder="10-digit number (optional)"
                  />
                  {isEditing && (
                    <p className="text-xs text-gray-500">Optional - 10 digits only</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Bio</label>
                  <textarea
                    name="bio"
                    value={userData.bio || ''}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                      ${isEditing ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}
                    placeholder="Tell us about yourself... (optional)"
                    rows="3"
                  />
                  {isEditing && (
                    <p className="text-xs text-gray-500">Optional - Brief description about yourself</p>
                  )}
                </div>
                {isEditing && (
                  <div className="pt-4 border-t">
                    <Button 
                      type="button"
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 
                               hover:from-green-600 hover:to-emerald-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Events Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="booked" className="space-y-4">
              <TabsList className="w-full justify-start bg-white p-1 rounded-lg shadow">
                <TabsTrigger value="booked" className="flex-1">Upcoming</TabsTrigger>
                <TabsTrigger value="wishlist" className="flex-1">Wishlist</TabsTrigger>
                <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
                {userData.role === 'Organizer' && (
                  <TabsTrigger value="organized" className="flex-1">Organized</TabsTrigger>
                )}
              </TabsList>

              {['booked', 'wishlist', 'past', 'organized'].map(tabValue => (
                <TabsContent key={tabValue} value={tabValue}>
                  <div className="grid gap-4">
                    {(tabValue === 'booked' ? bookedEvents :
                      tabValue === 'wishlist' ? wishlistEvents :
                      tabValue === 'past' ? pastEvents :
                      organizedEvents).length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <p className="text-gray-500">
                            {tabValue === 'booked' && 'No upcoming events booked'}
                            {tabValue === 'wishlist' && 'No events in wishlist'}
                            {tabValue === 'past' && 'No past events'}
                            {tabValue === 'organized' && 'No organized events yet'}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      (tabValue === 'booked' ? bookedEvents :
                        tabValue === 'wishlist' ? wishlistEvents :
                        tabValue === 'past' ? pastEvents :
                        organizedEvents).map(event => (
                        <EventCard
                          key={event._id}
                          event={event}
                          onAction={(id, action) => handleEventAction(id, 
                            tabValue === 'booked' ? 'cancel' :
                            tabValue === 'wishlist' ? 'removeWishlist' :
                            tabValue === 'organized' ? 'manage' : null
                          )}
                          actionLabel={
                            tabValue === 'booked' ? 'Cancel Booking' :
                            tabValue === 'wishlist' ? 'Remove from Wishlist' :
                            tabValue === 'organized' ? 'Manage Event' : null
                          }
                          showAction={tabValue !== 'past'}
                        />
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* Notification Alert */}
        {message.content && (
          <Alert className={`fixed bottom-4 right-4 max-w-md animate-in slide-in-from-bottom-5
                            ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
                             message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                             'bg-blue-50 border-blue-200 text-blue-800'}`}>
            <AlertDescription className="flex items-center justify-between">
              <span>{message.content}</span>
              <button onClick={() => setMessage({ type: '', content: '' })}
                      className="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, onAction, actionLabel, showAction = true }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <CardContent className="p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
          <div className="flex flex-col gap-2 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
            {event.price > 0 && (
              <div className="text-green-600 font-semibold">
                ${parseFloat(event.price).toFixed(2)}
              </div>
            )}
          </div>
        </div>
        {showAction && (
          <div className="flex items-center">
            <Button
              onClick={() => onAction(event._id, 
                actionLabel === 'Cancel Booking' ? 'cancel' :
                actionLabel === 'Remove from Wishlist' ? 'removeWishlist' :
                'manage'
              )}
              variant={
                actionLabel === 'Cancel Booking' ? 'destructive' :
                actionLabel === 'Manage Event' ? 'default' :
                'secondary'
              }
              className={`w-full md:w-auto transition-all ${
                actionLabel === 'Manage Event' ? 
                'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' :
                ''
              }`}
            >
              {actionLabel === 'Manage Event' && <Edit2 className="h-4 w-4 mr-2" />}
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default UserProfile;