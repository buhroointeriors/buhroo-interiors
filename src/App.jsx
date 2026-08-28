// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const CATEGORIES = [
  'All', 
  'Laminated Wall Panels',
  'French Moulding',
  'Kitchen boxing', 
  'Wardrobe', 
  'Pvc paneling', 
  'Wall paneling', 
  'Laminate Flooring', 
  'UV Marble Sheets', 
  'Louvers & Fluted Panels', 
  'Luxury Wallpapers'
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [catalogues, setCatalogues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  
  // Mobile Menu Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Custom Toast Notification State
  const [toast, setToast] = useState(null); 

  // Custom Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState(null); 

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    location: 'Srinagar',
    address: '',
    serviceType: 'On-Site Measurement Visit',
    notes: ''
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Security State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });

  // Form 1 State: New Showcase Product Card
  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Laminated Wall Panels', finish: '', image: '', description: ''
  });

  // Form 2 State: New Standalone PDF Catalogue
  const [newCatalogue, setNewCatalogue] = useState({
    title: '', category: 'Laminated Wall Panels'
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [uploadingCatalogue, setUploadingCatalogue] = useState(false);

  // Business Contacts
  const businessPhone = '+918491988890';
  const whatsappNumber = '918491988890';
  const businessEmail = 'buhroointeriors@gmail.com';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: prodData } = await supabase.from('products').select('*').order('id', { ascending: false });
    const { data: catData } = await supabase.from('catalogues').select('*').order('id', { ascending: false });
    const { data: bookData } = await supabase.from('bookings').select('*').order('id', { ascending: false });
    
    setProducts(prodData || []);
    setCatalogues(catData || []);
    setBookings(bookData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.username === 'basit' && loginCreds.password === 'Aqsa@123') {
      setIsAdminLoggedIn(true);
      setShowLoginModal(false);
      setLoginCreds({ username: '', password: '' });
      showToast('Welcome back, Admin!', 'success');
    } else {
      showToast('Invalid Username or Password!', 'error');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBooking(true);

    const { error } = await supabase.from('bookings').insert([
      {
        name: bookingForm.name,
        phone: bookingForm.phone,
        location: bookingForm.location,
        address: bookingForm.address,
        service_type: bookingForm.serviceType,
        notes: bookingForm.notes
      }
    ]);

    setSubmittingBooking(false);

    if (error) {
      showToast('Error saving booking: ' + error.message, 'error');
      return;
    }

    const emailSubject = encodeURIComponent(`New Booking: ${bookingForm.name} (${bookingForm.location})`);
    const emailBody = encodeURIComponent(
      `New Customer Booking Details:\n\n` +
      `Name: ${bookingForm.name}\n` +
      `Phone: ${bookingForm.phone}\n` +
      `Location: ${bookingForm.location}\n` +
      `Address: ${bookingForm.address}\n` +
      `Service Needed: ${bookingForm.serviceType}\n` +
      `Additional Notes: ${bookingForm.notes || 'None'}\n`
    );

    window.location.href = `mailto:${businessEmail}?subject=${emailSubject}&body=${emailBody}`;

    showToast('Booking submitted successfully! Saved to database.', 'success');
    setShowBookingModal(false);
    setBookingForm({ name: '', phone: '', location: 'Srinagar', address: '', serviceType: 'On-Site Measurement Visit', notes: '' });
    fetchData();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setUploadingProduct(true);

    const { error } = await supabase.from('products').insert([
      {
        name: newProduct.name,
        category: newProduct.category,
        finish: newProduct.finish,
        image: newProduct.image || 'https://via.placeholder.com/600x400?text=Buhroo+Interiors',
        description: newProduct.description
      }
    ]);

    setUploadingProduct(false);

    if (error) {
      showToast('Product Insert Error: ' + error.message, 'error');
    } else {
      showToast('Showcase Product Card published live!', 'success');
      setNewProduct({ name: '', category: 'Laminated Wall Panels', finish: '', image: '', description: '' });
      fetchData();
    }
  };

  const handleAddCatalogue = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      showToast('Please select a PDF file first!', 'error');
      return;
    }

    setUploadingCatalogue(true);

    const sanitizedName = pdfFile.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_');

    const cleanFileName = `${Date.now()}_${sanitizedName}`;
    const { error: storageError } = await supabase.storage.from('catalogues').upload(cleanFileName, pdfFile);

    if (storageError) {
      showToast('PDF Upload failed: ' + storageError.message, 'error');
      setUploadingCatalogue(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('catalogues').getPublicUrl(cleanFileName);

    const { error: dbError } = await supabase.from('catalogues').insert([
      {
        title: newCatalogue.title,
        category: newCatalogue.category,
        file_url: publicUrlData.publicUrl,
        file_name: pdfFile.name
      }
    ]);

    setUploadingCatalogue(false);

    if (dbError) {
      showToast('Database Insert Error: ' + dbError.message, 'error');
    } else {
      showToast('Standalone PDF Catalogue uploaded to Hub!', 'success');
      setNewCatalogue({ title: '', category: 'Laminated Wall Panels' });
      setPdfFile(null);
      fetchData();
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;

    if (type === 'product') {
      await supabase.from('products').delete().eq('id', id);
      showToast('Product card deleted successfully.', 'success');
    } else if (type === 'catalogue') {
      await supabase.from('catalogues').delete().eq('id', id);
      showToast('PDF Catalogue deleted from hub.', 'success');
    } else if (type === 'booking') {
      await supabase.from('bookings').delete().eq('id', id);
      showToast('Customer booking record deleted.', 'success');
    }

    setDeleteConfirm(null);
    fetchData();
  };

  const navigateTab = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0 relative">
      
      {/* CUSTOM FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-bold text-white transition-all transform animate-bounce ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-3 text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* CUSTOM CONFIRM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="text-4xl">🗑️</div>
            <h3 className="text-lg font-bold text-teal-950">Confirm Deletion</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete <strong className="text-gray-800">"{deleteConfirm.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete} 
                className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Notice Bar */}
      <div className="bg-amber-500 text-teal-950 text-xs font-bold py-1.5 px-4 text-center">
        📍 Serving Baramulla and Srinagar with Premium Materials & Professional Installation Services!
      </div>

      {/* Top Utility Contact Bar */}
      <div className="bg-teal-950 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex space-x-6">
            <a href={`tel:${businessPhone}`} className="hover:text-amber-400 font-semibold">📞 Call Us: +91 8491988890</a>
            <a href={`mailto:${businessEmail}`} className="hidden md:inline hover:text-amber-400 font-semibold">✉️ buhroointeriors@gmail.com</a>
          </div>

          {isAdminLoggedIn ? (
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 font-bold">🟢 Admin Active</span>
              <button onClick={() => { setIsAdminLoggedIn(false); showToast('Logged out of Admin Portal.', 'success'); }} className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-[11px] font-bold">Log Out</button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="text-amber-400 font-bold underline hover:text-amber-300">
              🔐 Admin Portal Login
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-20 items-center">
          
          {/* STYLISH BRAND LOGO WITH CHINAR LEAF ICON */}
          <div onClick={() => navigateTab('home')} className="cursor-pointer flex items-center space-x-3 group">
            <img 
              src="/chinar-leaf.png" 
              alt="Buhroo Interiors Chinar Leaf" 
              className="w-9 h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <span className="text-2xl font-black tracking-tight text-teal-950 block leading-none">
                BUHROO <span className="text-amber-600">INTERIORS</span>
              </span>
              <span className="block text-[9.5px] tracking-[0.2em] uppercase font-bold text-gray-400 mt-1">
                Surfaces & Architectural Materials
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 font-semibold text-sm text-gray-600">
            <button onClick={() => navigateTab('home')} className={activeTab === 'home' && !isAdminLoggedIn ? 'text-teal-950 border-b-2 border-amber-500 pb-1' : ''}>Home</button>
            <button onClick={() => navigateTab('catalog')} className={activeTab === 'catalog' && !isAdminLoggedIn ? 'text-teal-950 border-b-2 border-amber-500 pb-1' : ''}>Product Showcase ({products.length})</button>
            <button onClick={() => navigateTab('labour')} className={activeTab === 'labour' && !isAdminLoggedIn ? 'text-teal-950 border-b-2 border-amber-500 pb-1' : ''}>👷 On-Site Labour & Fitting</button>
            <button onClick={() => navigateTab('downloads')} className={activeTab === 'downloads' && !isAdminLoggedIn ? 'text-teal-950 border-b-2 border-amber-500 pb-1' : ''}>📥 PDF Catalogues ({catalogues.length})</button>
          </div>

          {/* Mobile Right Action Bar: WhatsApp + Hamburger Menu Toggle */}
          <div className="flex items-center space-x-3">
            <a 
              href={`https://wa.me/${whatsappNumber}?text=Hello%20Buhroo%20Interiors,%20I%20am%20looking%20for%20materials/labour%20in%20Baramulla/Srinagar.`} 
              target="_blank" 
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1"
            >
              <span>💬 WhatsApp</span>
            </a>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden text-teal-950 p-2 focus:outline-none text-2xl font-bold"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* MOBILE SLIDE-OUT MENU DRAWER */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 shadow-xl">
            <button 
              onClick={() => navigateTab('home')} 
              className={`block w-full text-left font-bold text-sm py-2 px-3 rounded-lg ${activeTab === 'home' ? 'bg-teal-950 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              🏠 Home
            </button>
            <button 
              onClick={() => navigateTab('catalog')} 
              className={`block w-full text-left font-bold text-sm py-2 px-3 rounded-lg ${activeTab === 'catalog' ? 'bg-teal-950 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              🛍️ Product Showcase ({products.length})
            </button>
            <button 
              onClick={() => navigateTab('labour')} 
              className={`block w-full text-left font-bold text-sm py-2 px-3 rounded-lg ${activeTab === 'labour' ? 'bg-teal-950 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              👷 On-Site Labour & Fitting
            </button>
            <button 
              onClick={() => navigateTab('downloads')} 
              className={`block w-full text-left font-bold text-sm py-2 px-3 rounded-lg ${activeTab === 'downloads' ? 'bg-teal-950 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              📥 PDF Catalogues ({catalogues.length})
            </button>
          </div>
        )}
      </nav>

      {/* CUSTOMER PROMPT MODAL FOR BOOKING TECHNICIAN VISIT */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black text-lg">✕</button>
            
            <div className="flex items-center space-x-2 text-amber-600 font-extrabold text-xs uppercase">
              <span>📐 Booking Form</span>
              <span>•</span>
              <span>Baramulla and Srinagar</span>
            </div>
            <h3 className="text-2xl font-bold text-teal-950 mt-1">Book On-Site Measurement & Fitting</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">Enter your details and location. We will confirm your visit!</p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name</label>
                  <input required type="text" placeholder="e.g. Tariq Ahmad" value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone / WhatsApp Number</label>
                  <input required type="tel" placeholder="+91 8491988890" value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Select City / Region</label>
                  <select value={bookingForm.location} onChange={e => setBookingForm({...bookingForm, location: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white font-semibold text-teal-950">
                    <option value="Srinagar">Srinagar</option>
                    <option value="Baramulla">Baramulla</option>
                    <option value="Sopore / Nearby">Sopore / Nearby</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Service Requested</label>
                  <select value={bookingForm.serviceType} onChange={e => setBookingForm({...bookingForm, serviceType: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white">
                    <option value="On-Site Measurement Visit">On-Site Measurement Visit</option>
                    <option value="Panelling Fitting Team">Panelling Fitting Team</option>
                    <option value="Modular Kitchen Boxing">Modular Kitchen Boxing</option>
                    <option value="Full Interior Work Quote">Full Interior Work Quote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Specific Area / Street Address</label>
                <input required type="text" placeholder="e.g. Rajbagh Srinagar / Main Market Baramulla" value={bookingForm.address} onChange={e => setBookingForm({...bookingForm, address: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Additional Project Details / Room Dimensions (Optional)</label>
                <textarea rows="2" placeholder="e.g. 2 bedrooms wall paneling + 1 kitchen boxing..." value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm"></textarea>
              </div>

              <button type="submit" disabled={submittingBooking} className="w-full bg-teal-950 hover:bg-teal-900 text-white font-bold py-3.5 rounded-xl transition shadow-md flex justify-center items-center space-x-2">
                <span>{submittingBooking ? 'Submitting...' : '✉️ Confirm Booking & Send Notification'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
            <h3 className="text-2xl font-bold text-teal-950">Admin Access</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">Enter credentials to manage products, catalogues, and customer bookings.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
                <input required type="text" placeholder="Enter username" value={loginCreds.username} onChange={e => setLoginCreds({...loginCreds, username: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input required type="password" placeholder="Enter password" value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <button type="submit" className="w-full bg-teal-950 text-white font-bold py-3 rounded-lg hover:bg-teal-900 transition">Log In</button>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN PORTAL VIEW */}
      {isAdminLoggedIn ? (
        <section className="max-w-5xl mx-auto px-4 py-12 space-y-12">
          
          {/* CUSTOMER BOOKINGS LIST FOR ADMIN */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-teal-950">Received Customer Bookings ({bookings.length})</h2>
                <p className="text-xs text-gray-500">Real-time measurement and fitting requests submitted by customers.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Live Cloud Feed</span>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No bookings received yet.</div>
            ) : (
              <div className="space-y-4">
                {bookings.map(book => (
                  <div key={book.id} className="p-4 border rounded-xl bg-gray-50 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-teal-950 text-base">{book.name}</span>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">{book.location}</span>
                        <span className="bg-teal-100 text-teal-900 text-[10px] font-bold px-2 py-0.5 rounded-full">{book.service_type}</span>
                      </div>
                      <p className="text-xs text-gray-600">📞 Phone: <strong>{book.phone}</strong></p>
                      <p className="text-xs text-gray-600">🏠 Address: {book.address}</p>
                      {book.notes && <p className="text-xs text-gray-500 italic">📝 Notes: {book.notes}</p>}
                    </div>

                    <div className="flex space-x-2">
                      <a href={`https://wa.me/${book.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(book.name)},%20this%20is%20Buhroo%20Interiors%20regarding%20your%20measurement%20request.`} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">
                        💬 Contact
                      </a>
                      <button onClick={() => setDeleteConfirm({ type: 'booking', id: book.id, title: book.name })} className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORM 1: ADD PRODUCT SHOWCASE CARD */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-teal-950 mb-2">1. Add New Showcase Product Card</h2>
            <p className="text-xs text-gray-500 mb-6">Create cards displayed on the main Product Showcase page.</p>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Title</label>
                  <input required type="text" placeholder="e.g. Premium Wardrobe Panel" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category Section</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white">
                    <option value="Laminated Wall Panels">Laminated Wall Panels</option>
                    <option value="French Moulding">French Moulding</option>
                    <option value="Kitchen boxing">Kitchen boxing</option>
                    <option value="Wardrobe">Wardrobe</option>
                    <option value="Pvc paneling">Pvc paneling</option>
                    <option value="Wall paneling">Wall paneling</option>
                    <option value="Laminate Flooring">Laminate Flooring</option>
                    <option value="UV Marble Sheets">UV Marble Sheets</option>
                    <option value="Louvers & Fluted Panels">Louvers & Fluted Panels</option>
                    <option value="Luxury Wallpapers">Luxury Wallpapers</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Finish Type (Optional)</label>
                  <input type="text" placeholder="e.g. High Glossy / Matte" value={newProduct.finish} onChange={e => setNewProduct({...newProduct, finish: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                  <input type="text" placeholder="https://..." value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
              </div>

              <textarea rows="2" placeholder="Description..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm"></textarea>

              <button type="submit" disabled={uploadingProduct} className="w-full bg-teal-950 text-white font-bold py-3 rounded-lg hover:bg-teal-900 transition">
                {uploadingProduct ? 'Saving Product...' : 'Save & Publish Product Card'}
              </button>
            </form>
          </div>

          {/* FORM 2: UPLOAD STANDALONE PDF CATALOGUE TO HUB */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-teal-950 mb-2">2. Upload Standalone PDF Catalogue to Download Hub</h2>
            <p className="text-xs text-gray-500 mb-6">Upload complete PDF catalogue documents directly into the "PDF Catalogues" page.</p>

            <form onSubmit={handleAddCatalogue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Catalogue Title</label>
                  <input required type="text" placeholder="e.g. Full Kitchen & Wardrobe Guide 2026" value={newCatalogue.title} onChange={e => setNewCatalogue({...newCatalogue, title: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select value={newCatalogue.category} onChange={e => setNewCatalogue({...newCatalogue, category: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white">
                    <option value="Laminated Wall Panels">Laminated Wall Panels</option>
                    <option value="French Moulding">French Moulding</option>
                    <option value="Kitchen boxing">Kitchen boxing</option>
                    <option value="Wardrobe">Wardrobe</option>
                    <option value="Pvc paneling">Pvc paneling</option>
                    <option value="Wall paneling">Wall paneling</option>
                    <option value="Laminate Flooring">Laminate Flooring</option>
                    <option value="UV Marble Sheets">UV Marble Sheets</option>
                    <option value="Louvers & Fluted Panels">Louvers & Fluted Panels</option>
                    <option value="Luxury Wallpapers">Luxury Wallpapers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select PDF File from Mac</label>
                <input required type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} className="w-full border rounded-lg p-2 text-xs bg-gray-50 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700" />
              </div>

              <button type="submit" disabled={uploadingCatalogue} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition">
                {uploadingCatalogue ? 'Uploading PDF to Cloud Storage...' : 'Upload Catalogue to PDF Hub'}
              </button>
            </form>
          </div>

          {/* MANAGE ITEMS LISTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-teal-950 mb-4">Manage Showcase Products ({products.length})</h3>
              <div className="space-y-3">
                {products.map(prod => (
                  <div key={prod.id} className="flex justify-between items-center p-3 border rounded-xl bg-gray-50">
                    <div>
                      <span className="font-bold text-gray-900 text-xs block">{prod.name}</span>
                      <span className="text-[10px] text-amber-600 font-bold">{prod.category}</span>
                    </div>
                    <button onClick={() => setDeleteConfirm({ type: 'product', id: prod.id, title: prod.name })} className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">🗑️ Delete</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-teal-950 mb-4">Manage PDF Hub Catalogues ({catalogues.length})</h3>
              <div className="space-y-3">
                {catalogues.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-3 border rounded-xl bg-gray-50">
                    <div>
                      <span className="font-bold text-gray-900 text-xs block">{cat.title}</span>
                      <span className="text-[10px] text-gray-500 font-bold">{cat.category}</span>
                    </div>
                    <button onClick={() => setDeleteConfirm({ type: 'catalogue', id: cat.id, title: cat.title })} className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">🗑️ Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      ) : (
        /* PUBLIC SITE VIEW */
        <main>
          {/* HERO BANNER - ORIGINAL EXACT WORDING */}
          {activeTab === 'home' && (
            <>
              <section 
                className="relative bg-teal-950 text-white py-36 px-4 bg-cover bg-center" 
                style={{ backgroundImage: "url('/wgbh1.jpg')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-950/95 via-teal-950/80 to-teal-950/40"></div>
                <div className="max-w-7xl mx-auto relative z-10 md:w-2/3">
                  <span className="bg-amber-500 text-teal-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Available in Baramulla and Srinagar
                  </span>
                  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-4 leading-tight">
                    Premium Surfaces & Skilled Installation.
                  </h1>
                  <p className="mt-4 text-lg text-gray-200 font-light">
                    Transform your home or commercial space. We supply top-quality materials and offer professional fitting teams across Srinagar and Baramulla.
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-4">
                    <button onClick={() => navigateTab('catalog')} className="bg-amber-500 hover:bg-amber-400 text-teal-950 font-bold py-3.5 px-8 rounded-xl shadow-lg transition">
                      Explore Products
                    </button>
                    <button 
                      onClick={() => setShowBookingModal(true)} 
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition flex items-center space-x-2"
                    >
                      <span>📐 Book Technician Visit</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* INTERACTIVE CARDS */}
              <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* CARD 1: LOCATION */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="text-3xl mb-3">📍</div>
                      <h3 className="font-bold text-teal-950 text-lg">Active Location Coverage</h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Prompt material delivery and site visits across all areas of Baramulla and Srinagar.
                      </p>
                    </div>
                  </div>

                  {/* CARD 2: EXPERT LABOUR */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="text-3xl mb-3">👷</div>
                      <h3 className="font-bold text-teal-950 text-lg">Expert Labour & Fitting</h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Experienced carpenters & wall panel installers for clean, precise, and fast execution.
                      </p>
                    </div>
                    <button onClick={() => navigateTab('labour')} className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700 text-left">
                      View fitting team details →
                    </button>
                  </div>

                  {/* CARD 3: MEASUREMENT */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between border-l-4 border-l-amber-500">
                    <div>
                      <div className="text-3xl mb-3">📐</div>
                      <h3 className="font-bold text-teal-950 text-lg">On-Site Measurement</h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Book a technician to take exact measurements for Kitchen Boxing, Wardrobes, and Panelling.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowBookingModal(true)} 
                      className="mt-4 bg-teal-950 text-white font-bold text-xs py-2.5 px-4 rounded-lg hover:bg-teal-900 transition text-center block shadow-sm"
                    >
                      Book Technician Visit
                    </button>
                  </div>

                </div>
              </section>
            </>
          )}

          {/* DEDICATED LABOUR & FITTING SECTION */}
          {activeTab === 'labour' && (
            <section className="max-w-5xl mx-auto px-4 py-16">
              <div className="text-center mb-12">
                <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase">On-Site Expertise</span>
                <h2 className="text-3xl font-extrabold text-teal-950 mt-3">Professional Labour & Installation Services</h2>
                <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
                  We don't just sell surface materials—we provide trained local teams in Baramulla and Srinagar to complete your project flawlessly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-teal-950 mb-3">🛠️ Available Fitting Services</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>PVC & WPC Fluted Wall Paneling Installation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Modular Kitchen Boxing & Shutter Fitting</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Wardrobe Framing & Laminated Surface Application</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>French Moulding Wainscoting & Border Framing</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Swiss Oak Laminate Flooring Laying</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-teal-950 text-white p-8 rounded-2xl shadow-md flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Book Fitting Team</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Need skilled workers at your site in Srinagar or Baramulla? Fill in our measurement form to schedule a site visit.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="mt-6 w-full bg-amber-500 hover:bg-amber-400 text-teal-950 font-bold py-3 text-center rounded-xl text-sm transition block"
                  >
                    📐 Book Technician Visit
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* DEDICATED PDF DOWNLOAD HUB - MINIMAL & CLEAN */}
          {activeTab === 'downloads' && (
            <section className="max-w-5xl mx-auto px-4 py-12">
              <div className="text-center mb-8">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Downloads
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-teal-950 mt-2">
                  Product Catalogues
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Download PDF guides and specifications.
                </p>
              </div>

              {catalogues.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm max-w-sm mx-auto">
                  <div className="text-3xl mb-2">📄</div>
                  <h3 className="font-bold text-gray-800 text-sm">No Catalogues Available</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Check back later or contact us on WhatsApp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalogues.map((cat) => (
                    <div 
                      key={cat.id} 
                      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                          {cat.category}
                        </span>
                        <h3 className="text-sm font-bold text-teal-950">
                          {cat.title}
                        </h3>
                      </div>

                      <a 
                        href={cat.file_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        download={cat.file_name || `${cat.title}.pdf`}
                        className="bg-teal-950 hover:bg-amber-500 hover:text-teal-950 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shrink-0 ml-4"
                      >
                        <span>Download</span>
                        <span>📥</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* PRODUCT SHOWCASE SECTION - MINIMAL & CLEAN FILTER BAR */}
          {activeTab !== 'downloads' && activeTab !== 'labour' && (
            <section className="max-w-7xl mx-auto px-4 py-12">
              {/* Section Header - Minimal */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200/80 mb-6 gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-teal-950">
                    Material Collections
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Filter by category to view products.
                  </p>
                </div>

                <div className="text-xs font-semibold text-gray-500">
                  Total <span className="text-teal-950 font-bold">{filteredProducts.length}</span> items
                </div>
              </div>

              {/* Modern Horizontal Scrolling Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center space-x-2 shrink-0 border ${
                        isSelected
                          ? 'bg-teal-950 text-white border-teal-950 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-teal-950'
                      }`}
                    >
                      <span>{cat}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                          isSelected
                            ? 'bg-amber-500 text-teal-950'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Product Cards Grid */}
              {loading ? (
                <div className="text-center py-16 text-gray-400 font-semibold text-sm">
                  Loading collections...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                    >
                      <div>
                        <div className="relative h-60 bg-gray-100 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-teal-950/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider shadow-sm">
                            {product.category}
                          </span>
                        </div>

                        <div className="p-5">
                          <h3 className="text-base font-extrabold text-teal-950 group-hover:text-amber-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>

                          {product.finish && (
                            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-gray-600 font-medium">
                              <span className="bg-amber-50 border border-amber-200/60 text-amber-900 px-2.5 py-1 rounded-md font-bold">
                                ✨ {product.finish}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-5 pt-0 space-y-2">
                        <button
                          onClick={() => setActiveModalProduct(product)}
                          className="block w-full bg-teal-950 hover:bg-teal-900 text-white font-bold text-xs py-2.5 rounded-xl text-center shadow-sm transition"
                        >
                          🔍 View Specifications
                        </button>
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                            `Hello Buhroo Interiors, I am interested in ${product.name}. Please send pricing.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl text-center shadow-sm transition"
                        >
                          Request Price on WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      )}

      {/* POPUP MODAL FOR PRODUCT DETAILS */}
      {activeModalProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setActiveModalProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
            <h3 className="text-2xl font-bold text-teal-950 mt-1">{activeModalProduct.name}</h3>
            <img src={activeModalProduct.image} alt={activeModalProduct.name} className="w-full h-52 object-cover rounded-xl mt-4" />
            <p className="text-xs text-gray-600 mt-4 leading-relaxed">{activeModalProduct.description}</p>
            <div className="mt-6">
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Buhroo Interiors, I am interested in ${activeModalProduct.name}. Please share pricing.`)}`} target="_blank" rel="noreferrer" className="block w-full bg-emerald-600 text-white font-bold text-xs py-3 rounded-lg text-center">
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around p-3 shadow-lg">
        <button onClick={() => setShowBookingModal(true)} className="flex flex-col items-center text-xs font-bold text-teal-950">
          <span className="text-base">📐</span> Measure
        </button>
        <button onClick={() => navigateTab('labour')} className="flex flex-col items-center text-xs font-bold text-amber-600">
          <span className="text-base">👷</span> Fitting
        </button>
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="flex flex-col items-center text-xs font-bold text-emerald-600">
          <span className="text-base">💬</span> WhatsApp
        </a>
      </div>

    </div>
  );
}

export default App;