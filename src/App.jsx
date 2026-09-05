// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

import chinarLeaf from '/chinar-leaf.png';

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

const ITEMS_PER_PAGE = 8;
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80';
// Premium Static Architectural Interior Background
const HERO_BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&auto=format&fit=crop&q=80';

const formatImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  return url.trim();
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [catCurrentPage, setCatCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [catalogues, setCatalogues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  
  // Custom Toast Notification State
  const [toast, setToast] = useState(null); 

  // Booking Modal & Success States
  const [bookingSuccessModal, setBookingSuccessModal] = useState(null);
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

  // Admin & Delete States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Admin Search Filters
  const [adminProdSearch, setAdminProdSearch] = useState('');
  const [adminCatSearch, setAdminCatSearch] = useState('');

  // Admin Forms State
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Laminated Wall Panels', finish: '', image: '', description: '' });
  const [newCatalogue, setNewCatalogue] = useState({ title: '', category: 'Laminated Wall Panels' });
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

    setBookingSuccessModal({ name: bookingForm.name, location: bookingForm.location });
    setShowBookingModal(false);
    setBookingForm({ name: '', phone: '', location: 'Srinagar', address: '', serviceType: 'On-Site Measurement Visit', notes: '' });
    fetchData();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setUploadingProduct(true);
    const cleanImgUrl = formatImageUrl(newProduct.image);

    const { error } = await supabase.from('products').insert([
      {
        name: newProduct.name,
        category: newProduct.category,
        finish: newProduct.finish,
        image: cleanImgUrl,
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
    const sanitizedName = pdfFile.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.-]/g, '_');
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

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const catTotalPages = Math.ceil(catalogues.length / ITEMS_PER_PAGE);
  const catStartIndex = (catCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCatalogues = catalogues.slice(catStartIndex, catStartIndex + ITEMS_PER_PAGE);

  const filteredAdminProducts = products.filter(p => p.name.toLowerCase().includes(adminProdSearch.toLowerCase()) || p.category.toLowerCase().includes(adminProdSearch.toLowerCase()));
  const filteredAdminCatalogues = catalogues.filter(c => c.title.toLowerCase().includes(adminCatSearch.toLowerCase()) || c.category.toLowerCase().includes(adminCatSearch.toLowerCase()));

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const scrollToTopGrid = () => {
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#23261f] font-['Lexend',sans-serif] text-white selection:bg-[#eef1e7] selection:text-[#23261f] overflow-x-hidden flex flex-col justify-between relative">
      
      {/* CUSTOM STYLES */}
      <style>{`
        .sylva-dock {
          background: rgba(34, 40, 31, 0.92);
          box-shadow: 0 10px 30px rgba(10, 14, 8, 0.50), inset 0 1px rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
        
        .sylva-card {
          background: #f2f3ef; color: #23261f;
          box-shadow: 0 20px 50px rgba(16, 21, 13, 0.35);
          border-radius: 28px;
        }

        .sylva-dark-card {
          background: rgba(43, 46, 39, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 8px; }
      `}</style>

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center space-x-2 text-xs font-medium transition-all ${toast.type === 'error' ? 'bg-red-900/90 text-white' : 'bg-[#eef1e7] text-[#23261f]'}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="bg-[#2b2e27] border-b border-white/5 h-8 px-3 md:px-8 text-[10px] sm:text-xs text-white/70 flex justify-between items-center z-50">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
          <span className="truncate">Srinagar & Baramulla</span>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <a href={`tel:${businessPhone}`} className="hover:text-amber-400 transition font-medium">📞 <span className="hidden sm:inline">{businessPhone}</span></a>
          {isAdminLoggedIn ? (
            <button onClick={() => setIsAdminLoggedIn(false)} className="bg-rose-600 text-white px-2 py-0.5 rounded text-[9px] font-bold">Log Out</button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="text-amber-400 font-bold hover:underline">🔐 Admin</button>
          )}
        </div>
      </div>

      {/* PUBLIC FLOATING DOCK */}
      {!isAdminLoggedIn && (
        <div className="fixed top-10 sm:top-12 left-0 right-0 z-50 flex justify-center pointer-events-none px-2">
          <nav className="sylva-dock pointer-events-auto flex items-center justify-between w-full max-w-md md:max-w-max p-1.5 rounded-2xl backdrop-blur-xl">
            <button onClick={() => setActiveTab('home')} className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-[#eef1e7] text-[#23261f] rounded-xl sm:rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-md shrink-0 overflow-hidden">
              <img src={chinarLeaf} alt="Urban Vibes Interior" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline'; }} />
              <span className="hidden text-base sm:text-xl">🍁</span>
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => setActiveTab('catalog')} className={`px-2.5 sm:px-5 h-8 sm:h-10 md:h-12 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase transition-all duration-300 shrink-0 ${activeTab === 'catalog' ? 'bg-[#f2f3ef] text-[#23261f] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>Products</button>
              <button onClick={() => setActiveTab('labour')} className={`px-2.5 sm:px-5 h-8 sm:h-10 md:h-12 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase transition-all duration-300 shrink-0 ${activeTab === 'labour' ? 'bg-[#f2f3ef] text-[#23261f] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>Fitting</button>
              <button onClick={() => setActiveTab('downloads')} className={`px-2.5 sm:px-5 h-8 sm:h-10 md:h-12 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase transition-all duration-300 shrink-0 ${activeTab === 'downloads' ? 'bg-[#f2f3ef] text-[#23261f] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>Catalogues</button>
            </div>
          </nav>
        </div>
      )}

      {/* HOME TAB HERO (STATIC LUXURY BACKGROUND IMAGE - ZERO LAG / ZERO CRASHES) */}
      {activeTab === 'home' && !isAdminLoggedIn && (
        <main className="relative w-full min-h-[90vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BACKGROUND_IMAGE})` }}>
          
          {/* Dark Overlay Vignette for Crisp Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181c14] via-[#181c14]/75 to-[#181c14]/60 backdrop-blur-[2px]"></div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 sm:pt-36 pb-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
                <div>
                  <span className="bg-[#eef1e7]/20 border border-[#a1b08b]/50 text-[#a1b08b] text-xs sm:text-xl lg:text-2xl font-black tracking-[0.25em] uppercase px-6 py-3 rounded-full backdrop-blur-md inline-block shadow-lg">
                    URBAN VIBES INTERIOR
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.15]">
                  Crafting Luxury <br />
                  <i className="not-italic text-[#a1b08b] font-normal">Living Spaces.</i>
                </h1>

                <div className="block lg:hidden pt-1">
                  <div className="sylva-dark-card p-4 sm:p-6 backdrop-blur-md space-y-1.5">
                    <span className="text-xs sm:text-sm text-[#a1b08b] font-extrabold uppercase tracking-wider block">
                      URBAN VIBES INTERIOR DESIGN & DECOR
                    </span>
                    <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                      Bespoke surface finishes, architectural panelling, and master craftsmanship — tailored and fitted across Srinagar and Baramulla.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <button onClick={() => setActiveTab('catalog')} className="sylva-card px-8 py-3.5 text-xs sm:text-sm font-bold tracking-widest uppercase hover:scale-105 transition-transform text-center shadow-lg">
                    Explore Products
                  </button>
                  <button onClick={() => setShowBookingModal(true)} className="bg-white/10 backdrop-blur-md border border-white/20 text-[#eef1e7] px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-white/20 transition-colors text-center">
                    📐 Book Technician Visit
                  </button>
                </div>
              </div>

              <div className="hidden lg:block lg:col-span-5">
                <div className="sylva-dark-card p-6 sm:p-8 md:p-10 backdrop-blur-md space-y-3">
                  <span className="text-base sm:text-lg lg:text-xl text-[#a1b08b] font-extrabold uppercase tracking-wider block">
                    URBAN VIBES INTERIOR DESIGN & DECOR
                  </span>
                  <p className="text-sm sm:text-base lg:text-lg text-white/95 font-light leading-relaxed">
                    Bespoke surface finishes, architectural panelling, and master craftsmanship — tailored and fitted across Srinagar and Baramulla.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>
      )}

      {/* ADMIN PORTAL VIEW */}
      {isAdminLoggedIn ? (
        <section className="max-w-6xl mx-auto px-4 lg:px-8 pt-10 pb-20 space-y-8 z-10 relative">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#2b2e27] border border-white/10 p-5 rounded-3xl shadow-xl">
            <div>
              <span className="text-[10px] text-[#a1b08b] font-black uppercase tracking-widest">Admin Control Panel</span>
              <h1 className="text-xl sm:text-2xl font-light text-white">Urban Vibes Interior Management</h1>
            </div>
            <button onClick={() => setIsAdminLoggedIn(false)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-md transition">
              Exit Admin Mode ✕
            </button>
          </div>

          <div className="sylva-dark-card p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-light text-[#eef1e7] mb-1">Customer Bookings ({bookings.length})</h2>
            <p className="text-xs text-white/50 mb-6">Real-time measurement and fitting requests submitted by customers.</p>

            {bookings.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">No bookings received yet.</div>
            ) : (
              <div className="space-y-4">
                {bookings.map(book => (
                  <div key={book.id} className="p-4 rounded-2xl bg-[#181c14] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{book.name}</span>
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full">{book.location}</span>
                        <span className="bg-[#a1b08b]/20 text-[#a1b08b] text-[10px] px-2 py-0.5 rounded-full">{book.service_type}</span>
                      </div>
                      <p className="text-xs text-white/60">📞 Phone: <strong>{book.phone}</strong> | 🏠 Address: {book.address}</p>
                      {book.notes && <p className="text-xs text-white/40 italic">Notes: {book.notes}</p>}
                    </div>

                    <div className="flex space-x-2 shrink-0">
                      <a href={`https://wa.me/${book.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(book.name)},%20this%20is%20Urban%20Vibes%20Interior%20regarding%20your%20measurement%20request.`} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">
                        💬 WhatsApp
                      </a>
                      <button onClick={() => setDeleteConfirm({ type: 'booking', id: book.id, title: book.name })} className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            <div className="sylva-dark-card p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-medium text-[#eef1e7] mb-1">1. Add Showcase Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-3.5 mt-4">
                <input required type="text" placeholder="Product Title" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#a1b08b]" />
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#a1b08b]">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Finish Type (Optional)" value={newProduct.finish} onChange={e => setNewProduct({...newProduct, finish: e.target.value})} className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#a1b08b]" />
                <input type="text" placeholder="Image URL (https://...)" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#a1b08b]" />
                <textarea rows="2" placeholder="Description..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#a1b08b]"></textarea>
                <button type="submit" disabled={uploadingProduct} className="sylva-card w-full text-[#23261f] font-bold text-xs py-3.5 rounded-xl tracking-widest uppercase hover:scale-[1.02] transition-transform">
                  {uploadingProduct ? 'Saving...' : 'Save & Publish Product Card'}
                </button>
              </form>
            </div>

            <div className="sylva-dark-card p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-medium text-[#eef1e7] mb-1">2. Upload PDF Catalogue</h2>
              <form onSubmit={handleAddCatalogue} className="space-y-3.5 mt-4">
                <input required type="text" placeholder="Catalogue Title" value={newCatalogue.title} onChange={e => setNewCatalogue({...newCatalogue, title: e.target.value})} className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#a1b08b]" />
                <select value={newCatalogue.category} onChange={e => setNewCatalogue({...newCatalogue, category: e.target.value})} className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#a1b08b]">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 block">Select PDF Document</label>
                  <input required type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} className="w-full border border-white/10 rounded-xl p-2.5 text-xs text-white/70 bg-[#181c14]" />
                </div>
                <button type="submit" disabled={uploadingCatalogue} className="bg-amber-500 text-teal-950 w-full font-bold text-xs py-3.5 rounded-xl tracking-widest uppercase hover:scale-[1.02] transition-transform">
                  {uploadingCatalogue ? 'Uploading PDF...' : 'Upload Catalogue to PDF Hub'}
                </button>
              </form>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            <div className="sylva-dark-card p-5 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg sm:text-xl font-medium text-[#eef1e7]">Manage Products ({products.length})</h3>
                </div>
                <p className="text-xs text-white/50 mb-4">Search and delete active showcase items</p>
                
                <input
                  type="text"
                  placeholder="🔍 Search product by title..."
                  value={adminProdSearch}
                  onChange={(e) => setAdminProdSearch(e.target.value)}
                  className="w-full bg-[#181c14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mb-4 focus:outline-none focus:border-[#a1b08b] placeholder:text-white/30"
                />

                <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                  {filteredAdminProducts.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-xs">No products match your search.</div>
                  ) : (
                    filteredAdminProducts.map(prod => (
                      <div key={prod.id} className="flex justify-between items-center p-2.5 rounded-2xl bg-[#181c14] border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3 truncate pr-2">
                          <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-xl bg-black/40 shrink-0" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                          <div className="truncate">
                            <span className="font-medium text-white text-xs block truncate">{prod.name}</span>
                            <span className="text-[9px] text-[#a1b08b] font-bold uppercase tracking-wider">{prod.category}</span>
                          </div>
                        </div>
                        <button onClick={() => setDeleteConfirm({ type: 'product', id: prod.id, title: prod.name })} className="bg-rose-600/80 hover:bg-rose-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shrink-0 transition">
                          🗑️ Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="sylva-dark-card p-5 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg sm:text-xl font-medium text-[#eef1e7]">Manage Catalogues ({catalogues.length})</h3>
                </div>
                <p className="text-xs text-white/50 mb-4">Search and delete PDF catalogues from the hub</p>
                
                <input
                  type="text"
                  placeholder="🔍 Search catalogue by title..."
                  value={adminCatSearch}
                  onChange={(e) => setAdminCatSearch(e.target.value)}
                  className="w-full bg-[#181c14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mb-4 focus:outline-none focus:border-[#a1b08b] placeholder:text-white/30"
                />

                <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                  {filteredAdminCatalogues.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-xs">No catalogues match your search.</div>
                  ) : (
                    filteredAdminCatalogues.map(cat => (
                      <div key={cat.id} className="flex justify-between items-center p-3 rounded-2xl bg-[#181c14] border border-white/5 hover:border-white/20 transition-all">
                        <div className="truncate pr-2">
                          <span className="font-medium text-white text-xs block truncate">{cat.title}</span>
                          <span className="text-[9px] text-[#a1b08b] font-bold uppercase tracking-wider">{cat.category}</span>
                        </div>
                        <button onClick={() => setDeleteConfirm({ type: 'catalogue', id: cat.id, title: cat.title })} className="bg-rose-600/80 hover:bg-rose-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shrink-0 transition">
                          🗑️ Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

        </section>
      ) : (
        /* PUBLIC SITE CONTENT */
        <div className={`flex-grow pt-24 sm:pt-28 pb-20 z-10 relative ${activeTab === 'home' ? 'hidden' : ''}`}>
          
          {/* GROVE (PRODUCT SHOWCASE) */}
          {activeTab === 'catalog' && (
            <section className="max-w-7xl mx-auto px-4 lg:px-8 animate-in fade-in duration-500">
              <div className="mb-6 border-b border-white/10 pb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-light text-[#eef1e7] tracking-tight">Material Collections</h2>
                  <p className="text-xs sm:text-sm text-[#eef1e7]/50 mt-1 font-light">Explore PVC paneling, wall panels, laminate flooring, and wallpapers.</p>
                </div>
                <div className="text-[10px] sm:text-xs text-white/40 shrink-0">
                  Total {filteredProducts.length} items (Page {currentPage} of {totalPages || 1})
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => handleCategoryChange(cat)}
                    className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-medium tracking-wide transition-all ${
                      selectedCategory === cat ? 'bg-[#eef1e7] text-[#23261f] shadow-lg' : 'bg-[#2b2e27] text-white/60 hover:bg-[#3f453a] hover:text-white'
                    }`}
                  >{cat}</button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-16 text-white/40 text-sm font-light">Loading materials...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {paginatedProducts.map(product => (
                      <div key={product.id} className="sylva-dark-card overflow-hidden group hover:-translate-y-1 transition-transform duration-500 flex flex-col justify-between">
                        <div>
                          <div className="relative aspect-[4/3] overflow-hidden bg-[#181c14]">
                            <img src={product.image} alt={product.name} onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2b2e27] via-transparent to-transparent"></div>
                            <span className="absolute top-2.5 left-2.5 bg-[#23261f]/90 backdrop-blur-md text-[#eef1e7] text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-white/10">{product.category}</span>
                          </div>
                          <div className="p-4 sm:p-5">
                            <h3 className="text-sm sm:text-base font-light text-[#eef1e7] tracking-tight mb-1 group-hover:text-[#a1b08b] transition-colors line-clamp-1">{product.name}</h3>
                            <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{product.description}</p>
                            {product.finish && (
                              <span className="inline-block mt-2 bg-[#eef1e7]/10 text-[#eef1e7] px-2 py-0.5 rounded text-[9px] tracking-widest uppercase border border-white/5">✨ {product.finish}</span>
                            )}
                          </div>
                        </div>
                        <div className="p-4 sm:p-5 pt-0 mt-auto">
                          <button onClick={() => setActiveModalProduct(product)} className="w-full bg-[#383b34] border border-white/10 hover:border-[#a1b08b] hover:text-[#a1b08b] text-white/80 text-[11px] font-medium tracking-widest uppercase py-2.5 sm:py-3 rounded-xl transition-all">
                            🔍 View Specifications
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8 pt-6 border-t border-white/10">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage(prev => Math.max(prev - 1, 1));
                          scrollToTopGrid();
                        }}
                        className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#2b2e27] text-white/70 hover:bg-[#3f453a] hover:text-white disabled:opacity-30 border border-white/5 transition-all"
                      >
                        Prev
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            scrollToTopGrid();
                          }}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition-all ${
                            currentPage === page
                              ? 'bg-[#eef1e7] text-[#23261f] shadow-lg scale-105'
                              : 'bg-[#2b2e27] text-white/60 hover:bg-[#3f453a] hover:text-white border border-white/5'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => {
                          setCurrentPage(prev => Math.min(prev + 1, totalPages));
                          scrollToTopGrid();
                        }}
                        className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#2b2e27] text-white/70 hover:bg-[#3f453a] hover:text-white disabled:opacity-30 border border-white/5 transition-all"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* HABITATS (LABOUR & FITTING) */}
          {activeTab === 'labour' && (
            <section className="max-w-5xl mx-auto px-4 lg:px-8 animate-in fade-in duration-500">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-5xl font-light text-[#eef1e7] tracking-tight mb-2">Fitting & On-Site Expertise</h2>
                <p className="text-xs sm:text-base text-white/50 font-light max-w-2xl mx-auto">We provide trained local fitting teams across Baramulla and Srinagar to execute your project flawlessly.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="sylva-dark-card p-5 sm:p-10">
                  <h3 className="text-lg sm:text-2xl font-light text-[#a1b08b] mb-4 sm:mb-6">🛠️ Available Fitting Services</h3>
                  <ul className="space-y-3 text-white/70 font-light text-xs sm:text-sm">
                    <li className="flex items-start space-x-2.5"><span className="text-[#a1b08b]">✓</span> <span>PVC & WPC Fluted Wall Paneling Installation</span></li>
                    <li className="flex items-start space-x-2.5"><span className="text-[#a1b08b]">✓</span> <span>Modular Kitchen Boxing & Shutter Fitting</span></li>
                    <li className="flex items-start space-x-2.5"><span className="text-[#a1b08b]">✓</span> <span>Wardrobe Framing & Laminated Surface Application</span></li>
                    <li className="flex items-start space-x-2.5"><span className="text-[#a1b08b]">✓</span> <span>French Moulding Wainscoting & Border Framing</span></li>
                    <li className="flex items-start space-x-2.5"><span className="text-[#a1b08b]">✓</span> <span>Swiss Oak Laminate Flooring Laying</span></li>
                  </ul>
                </div>
                <div className="sylva-card p-5 sm:p-10 flex flex-col justify-center text-center">
                  <h3 className="text-lg sm:text-2xl font-light text-[#23261f] mb-2">Book Fitting Team</h3>
                  <p className="text-[#7c8177] text-xs sm:text-sm leading-relaxed mb-5">Need skilled workers at your site in Srinagar or Baramulla? Schedule a technician site visit now.</p>
                  <button onClick={() => setShowBookingModal(true)} className="bg-[#23261f] text-[#eef1e7] py-3.5 px-8 rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-xl mx-auto">
                    📐 Book Technician Visit
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* JOURNAL (PDF CATALOGUES) */}
          {activeTab === 'downloads' && (
            <section className="max-w-5xl mx-auto px-4 lg:px-8 animate-in fade-in duration-500">
              <div className="mb-6 border-b border-white/10 pb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-light text-[#eef1e7] tracking-tight">PDF Catalogues</h2>
                  <p className="text-xs sm:text-sm text-[#eef1e7]/50 mt-1 font-light">Download architectural guides, PDF catalogues, and material specifications.</p>
                </div>
                <div className="text-[10px] sm:text-xs text-white/40 shrink-0">
                  Total {catalogues.length} items (Page {catCurrentPage} of {catTotalPages || 1})
                </div>
              </div>

              {catalogues.length === 0 ? (
                <div className="sylva-dark-card p-12 text-center text-white/40 text-sm">No catalogues available right now.</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {paginatedCatalogues.map(cat => (
                      <div key={cat.id} className="sylva-dark-card p-4 sm:p-6 flex justify-between items-center hover:border-[#a1b08b] transition-colors gap-3">
                        <div className="space-y-1 truncate">
                          <span className="text-[#a1b08b] text-[9px] sm:text-[10px] uppercase tracking-widest block">{cat.category}</span>
                          <h3 className="text-white text-xs sm:text-sm font-medium truncate">{cat.title}</h3>
                        </div>
                        <a href={cat.file_url} target="_blank" rel="noreferrer" download={cat.file_name || `${cat.title}.pdf`} className="bg-[#eef1e7] text-[#23261f] px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center space-x-1 shrink-0">
                          <span>Get</span>
                          <span>📥</span>
                        </a>
                      </div>
                    ))}
                  </div>

                  {catTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8 pt-6 border-t border-white/10">
                      <button
                        disabled={catCurrentPage === 1}
                        onClick={() => {
                          setCatCurrentPage(prev => Math.max(prev - 1, 1));
                          scrollToTopGrid();
                        }}
                        className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#2b2e27] text-white/70 hover:bg-[#3f453a] hover:text-white disabled:opacity-30 border border-white/5 transition-all"
                      >
                        Prev
                      </button>

                      {Array.from({ length: catTotalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => {
                            setCatCurrentPage(page);
                            scrollToTopGrid();
                          }}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition-all ${
                            catCurrentPage === page
                              ? 'bg-[#eef1e7] text-[#23261f] shadow-lg scale-105'
                              : 'bg-[#2b2e27] text-white/60 hover:bg-[#3f453a] hover:text-white border border-white/5'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        disabled={catCurrentPage === catTotalPages}
                        onClick={() => {
                          setCatCurrentPage(prev => Math.min(prev + 1, catTotalPages));
                          scrollToTopGrid();
                        }}
                        className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#2b2e27] text-white/70 hover:bg-[#3f453a] hover:text-white disabled:opacity-30 border border-white/5 transition-all"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-[#181c14]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="sylva-dark-card max-w-md w-full p-6 sm:p-8 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-5 text-white/40 hover:text-white text-xl">✕</button>
            <h3 className="text-xl sm:text-2xl font-light text-[#eef1e7] mb-6">Admin Access</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input required type="text" placeholder="Username" value={loginCreds.username} onChange={e => setLoginCreds({...loginCreds, username: e.target.value})} className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#a1b08b]" />
              <input required type="password" placeholder="Password" value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#a1b08b]" />
              <button type="submit" className="w-full sylva-card text-[#23261f] font-bold text-xs py-3.5 sm:py-4 rounded-full uppercase tracking-widest mt-2">Log In</button>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT SPECIFICATIONS MODAL */}
      {activeModalProduct && (
        <div className="fixed inset-0 bg-[#181c14]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="sylva-dark-card max-w-lg w-full p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setActiveModalProduct(null)} className="absolute top-4 right-5 text-white/40 hover:text-white text-xl">✕</button>
            <h3 className="text-xl sm:text-2xl font-light text-[#eef1e7] mb-3 pr-6 tracking-tight">{activeModalProduct.name}</h3>
            <img src={activeModalProduct.image} alt={activeModalProduct.name} onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} className="w-full h-48 sm:h-56 object-cover rounded-2xl shadow-inner opacity-90" />
            <p className="text-xs sm:text-sm text-white/60 mt-4 sm:mt-6 leading-relaxed font-light">{activeModalProduct.description}</p>
            <div className="mt-6 sm:mt-8">
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Urban Vibes Interior, I am interested in ${activeModalProduct.name}. Please share pricing.`)}`} target="_blank" rel="noreferrer" 
                 className="block w-full sylva-card text-center text-[#23261f] font-medium tracking-widest uppercase text-xs py-3.5 sm:py-4 rounded-full transition-transform hover:scale-105 shadow-xl">
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* BOOK TECHNICIAN VISIT MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-[#181c14]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="sylva-dark-card max-w-lg w-full p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-5 text-white/40 hover:text-white text-xl">✕</button>
            <h3 className="text-xl sm:text-2xl font-light text-[#eef1e7] mb-1">Book Technician Visit</h3>
            <p className="text-xs text-white/50 mb-5">Enter your details for on-site measurement & fitting in Srinagar or Baramulla.</p>
            
            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              <input required type="text" placeholder="Your Full Name" value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})} 
                className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#a1b08b] placeholder:text-white/30" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input required type="tel" placeholder="Phone Number" value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})} 
                  className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#a1b08b] placeholder:text-white/30" />
                <select value={bookingForm.location} onChange={e => setBookingForm({...bookingForm, location: e.target.value})} 
                  className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#a1b08b]">
                  <option value="Srinagar">Srinagar</option>
                  <option value="Baramulla">Baramulla</option>
                  <option value="Sopore / Nearby">Sopore / Nearby</option>
                </select>
              </div>

              <div>
                <select value={bookingForm.serviceType} onChange={e => setBookingForm({...bookingForm, serviceType: e.target.value})} 
                  className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#a1b08b]">
                  <option value="On-Site Measurement Visit">On-Site Measurement Visit</option>
                  <option value="Panelling Fitting Team">Panelling Fitting Team</option>
                  <option value="Modular Kitchen Boxing">Modular Kitchen Boxing</option>
                  <option value="Full Interior Work Quote">Full Interior Work Quote</option>
                </select>
              </div>

              <input required type="text" placeholder="Specific Area / Street Address" value={bookingForm.address} onChange={e => setBookingForm({...bookingForm, address: e.target.value})} 
                className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#a1b08b] placeholder:text-white/30" />

              <textarea rows="2" placeholder="Project details or dimensions (Optional)..." value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} 
                className="w-full bg-[#181c14] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#a1b08b] placeholder:text-white/30"></textarea>
              
              <button type="submit" disabled={submittingBooking} className="w-full sylva-card text-[#23261f] font-bold tracking-widest uppercase text-xs py-3.5 rounded-full hover:scale-105 transition-transform mt-2">
                {submittingBooking ? 'Submitting...' : '✉️ Confirm Booking & Send Notice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING SUCCESS MODAL */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 bg-[#181c14]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="sylva-dark-card max-w-sm w-full p-6 sm:p-8 text-center">
            <div className="w-14 h-16 sm:w-16 sm:h-16 bg-[#eef1e7] text-[#4a4d44] text-2xl sm:text-3xl rounded-2xl flex items-center justify-center mx-auto mb-5">✓</div>
            <h3 className="text-xl sm:text-2xl font-light text-[#eef1e7] mb-2">Thank You, {bookingSuccessModal.name}!</h3>
            <p className="text-white/50 text-xs sm:text-sm font-light mb-6">Your request for {bookingSuccessModal.location} is logged. Our team will reach out to you shortly.</p>
            <button onClick={() => setBookingSuccessModal(null)} className="w-full bg-[#383b34] border border-white/10 text-white/80 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10">Done</button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-[#181c14]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="sylva-dark-card max-w-sm w-full p-6 text-center space-y-4">
            <div className="text-3xl">🗑️</div>
            <h3 className="text-lg font-light text-white">Confirm Deletion</h3>
            <p className="text-xs text-white/50">Are you sure you want to delete "{deleteConfirm.title}"?</p>
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setDeleteConfirm(null)} className="w-1/2 bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs">Cancel</button>
              <button onClick={executeDelete} className="w-1/2 bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* INLINE FOOTER WITH KASHMIRI PROVERB */}
      <footer className="bg-[#2b2e27] border-t border-white/5 py-10 sm:py-12 px-6 mt-12 sm:mt-16 text-center text-white/50 text-xs z-50">
        <div className="max-w-3xl mx-auto space-y-2.5">
          <p className="text-lg sm:text-2xl font-serif text-[#a1b08b] font-light" dir="rtl">
            مِحنَت چُھ بَرَكَتُك مُول، تہِ رِزِق چُھ خُداے دِوان
          </p>
          <p className="italic text-white/70 font-light text-xs sm:text-sm">
            "Mehnat chuh barkatuk mool, te riziq chuh Khuday diwan."
          </p>
          <p className="text-[9px] sm:text-[10px] tracking-widest uppercase text-white/40 pt-1">
            Hard work is the root of blessing, and Allah is the Provider of sustenance.
          </p>
        </div>
        <div className="mt-6 sm:mt-8 pt-5 border-t border-white/5 text-[10px] sm:text-[11px] text-white/30">
          © {new Date().getFullYear()} Urban Vibes Interior Design & Decor. All rights reserved. Crafted with passion in Kashmir 🏔️
        </div>
      </footer>

    </div>
  );
}
