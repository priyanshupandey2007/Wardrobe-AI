import React, { useState, useRef, useEffect } from 'react';

// Pre-defined color palette tokens for multi-select chips
const COLOR_PALETTE = [
  { name: 'Navy', hex: '#000080' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Khaki', hex: '#F0E68C' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' }
];

// Pre-defined multi-select occasion tokens
const OCCASION_OPTIONS = ['Work', 'Casual', 'Evening', 'Athletic', 'Date Night', 'Weekend', 'Formal', 'Vacation'];

export default function App() {
  // --- 🔐 AUTHENTICATION STATE GATEWAY ---
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [authMode, setAuthMode] = useState('login'); 
  const [currentTab, setCurrentTab] = useState('wardrobe'); 
  const [activeFilter, setActiveFilter] = useState('All');
  const [authError, setAuthError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true); 

  // --- 🛰️ APPLICATION UTILITIES STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // --- 📸 HARDWARE CAPTURE LINKS ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- 🗃️ PRIMARY WARDROBE STORAGE POOL ---
  const [items, setItems] = useState([]);

  // --- ✏️ INLINE EDIT TRACKING MANAGEMENT ---
  const [editingId, setEditingId] = useState(null); 
  const [tempEditName, setTempEditName] = useState(''); 

  // --- 📋 FORM STATES METADATA CAPTURE ---
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Top');
  const [selectedColors, setSelectedColors] = useState([]); // Array of strings (hex or names)
  const [size, setSize] = useState('M');
  const [fit, setFit] = useState('Regular');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [selectedOccasions, setSelectedOccasions] = useState([]); // Array of strings
  const [condition, setCondition] = useState('Good');
  const [careInstructions, setCareInstructions] = useState('Machine Wash');

  // --- 🤖 AI SYNTHESIS LOOKBOOK ENGINE CACHE ---
  const [generatedOutfit, setGeneratedOutfit] = useState(null);

  // --- 👤 SYSTEM PROFILE SIMULATION MOCKS ---
  const [fullName, setFullName] = useState('Priyanshu Pandey');
  const [email, setEmail] = useState('priyanshandey2864@gmail.com');
  const [password, setPassword] = useState('');

  // --- 🔔 TOAST DISPATCHER HELPER SYSTEM ---
  const showToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // --- 🚪 USER LOGOUT CLEANER ACTUATOR ---
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthMode('login');
    setPassword('');
    setEmail('');
    setAuthError('');
    setGeneratedOutfit(null);
    setEditingId(null);
    showToast('✓ Successfully logged out from profile secure hub');
  };

  // --- 🔑 SYSTEM REGISTRATION CONTROL SUBMISSION ---
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!email.trim() || !password.trim()) {
      setAuthError('Please fill out all required fields.');
      return;
    }
    if (authMode === 'signup' && !fullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    
    setIsAuthenticated(true);
    showToast(`✓ Welcome to Wardrobe AI workspace, ${fullName || 'User'}`);
  };

  // --- 🏷️ MULTI-SELECT HANDLERS ---
  const toggleColorSelection = (hex) => {
    if (selectedColors.includes(hex)) {
      setSelectedColors(selectedColors.filter(c => c !== hex));
    } else {
      setSelectedColors([...selectedColors, hex]);
    }
  };

  const toggleOccasionSelection = (occ) => {
    if (selectedOccasions.includes(occ)) {
      setSelectedOccasions(selectedOccasions.filter(o => o !== occ));
    } else {
      setSelectedOccasions([...selectedOccasions, occ]);
    }
  };

  // --- 🛡️ DUPLICATE ITEM DETECTION SYSTEM ---
  const checkDuplicateAndProceed = (newItemCandidate) => {
    const isDuplicate = items.some(item => 
      item.category === newItemCandidate.category && 
      item.name.toLowerCase().trim() === newItemCandidate.name.toLowerCase().trim()
    );

    if (isDuplicate) {
      setDuplicateWarning(newItemCandidate);
    } else {
      commitItemToStorage(newItemCandidate);
    }
  };

  const commitItemToStorage = (itemToSave) => {
    setItems([itemToSave, ...items]);
    showToast(`✓ Item added! You now have ${items.length + 1} pieces`);
    
    // Clear Ingestion Form Controls completely
    setItemName('');
    setSelectedColors([]);
    setSize('M');
    setFit('Regular');
    setBrand('');
    setPrice('');
    setSelectedOccasions([]);
    setCondition('Good');
    setCareInstructions('Machine Wash');
    setUploadPreview(null);
    setDuplicateWarning(null);
  };

  // --- 📂 MANUAL FILE SYSTEM INGESTION MATRIX ---
  const handleFileUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDeviceFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (.jpg, .png, .webp).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPreview(event.target.result);
      showToast('✓ Image attached securely. Review parameters below.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // --- 📸 DEVICE LENS INTERACTION CONTROL MODULE ---
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera channel block:", err);
      alert("Could not access device camera frames. Please authorize hardware runtime hooks.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg');

    setUploadPreview(imageDataUrl);
    stopCamera();
    showToast('✓ Camera scan slice mapped into image validation portal.');
  };

  // --- 📥 PRIMARY EXECUTOR OPERATION HANDLER FORM SUBMIT ---
  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    
    // Fallback automated namings
    let verifiedName = itemName.trim();
    if (!verifiedName) {
      const defaultNames = { Top: 'Navy Blue Button-Up Shirt', Outerwear: 'Classic Structured Jacket', Bottom: 'Tailored Trousers', Shoes: 'All-Weather Footwear' };
      verifiedName = `${defaultNames[category]} #${Math.floor(Math.random() * 900 + 100)}`;
    }

    const builtItem = {
      id: Date.now(),
      name: verifiedName,
      category,
      image: uploadPreview,
      colors: selectedColors.length > 0 ? selectedColors : ['#808080'], // Gray default if omitted
      size,
      fit,
      brand: brand.trim() ? brand.trim() : 'Unlisted Brand',
      price: price ? parseFloat(price) : 0,
      occasions: selectedOccasions.length > 0 ? selectedOccasions : ['Casual'],
      condition,
      careInstructions,
      wearCount: 0 
    };

    checkDuplicateAndProceed(builtItem);
  };

  // --- 🧮 ITEM ACTIONS OPERATIONS AND METRICS LOGGING ---
  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setGeneratedOutfit(null);
    if (editingId === id) setEditingId(null);
    showToast('✓ Item deleted');
  };

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setTempEditName(currentName);
  };

  const saveEdit = (id) => {
    if (!tempEditName.trim()) {
      alert("Item name cannot be configuration strings containing whitespace blanks.");
      return;
    }
    setItems(items.map(item => 
      item.id === id ? { ...item, name: tempEditName.trim() } : item
    ));
    setEditingId(null);
    setTempEditName('');
    showToast('✓ Changes saved');
  };

  const incrementWearCount = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, wearCount: item.wearCount + 1 } : item
    ));
    showToast('✓ Marked as Worn Today! Tracking index incremented.');
  };

  // --- 🤖 INTUITIVE LOOKBOOK AI RECONCILIATION ---
  const handleGenerateOutfit = () => {
    const tops = items.filter(i => i.category === 'Top');
    const bottoms = items.filter(i => i.category === 'Bottom');
    const outer = items.filter(i => i.category === 'Outerwear');
    const shoes = items.filter(i => i.category === 'Shoes');

    if (tops.length === 0 || bottoms.length === 0) {
      alert("AI Lookbook requires at least 1 'Top' and 1 'Bottom' uploaded into your wardrobe to compile layouts.");
      return;
    }

    const selectedTop = tops[Math.floor(Math.random() * tops.length)];
    const selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    const selectedOuter = outer.length > 0 ? outer[Math.floor(Math.random() * outer.length)] : null;
    const selectedShoes = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : null;

    // Auto-increment track targets matching context
    setItems(prevItems => prevItems.map(item => {
      if ([selectedTop.id, selectedBottom.id, selectedOuter?.id, selectedShoes?.id].includes(item.id)) {
        return { ...item, wearCount: item.wearCount + 1 };
      }
      return item;
    }));

    setGeneratedOutfit({
      top: selectedTop,
      bottom: selectedBottom,
      outerwear: selectedOuter,
      shoes: selectedShoes,
      score: Math.floor(Math.random() * (100 - 92 + 1)) + 92
    });
    showToast('✨ AI Match successfully processed. Wardrobe frequencies synced.');
  };

  // --- 🔍 ADVANCED SEARCH FILTER MATCHING ENGINE ---
  const filteredItems = items.filter(item => {
    const matchesCategory = activeFilter === 'All' || item.category === activeFilter;
    
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return matchesCategory;

    const matchesName = item.name.toLowerCase().includes(cleanQuery);
    const matchesBrand = item.brand.toLowerCase().includes(cleanQuery);
    const matchesOccasion = item.occasions.some(occ => occ.toLowerCase().includes(cleanQuery));
    const matchesColorToken = COLOR_PALETTE.some(cp => 
      item.colors.includes(cp.hex) && cp.name.toLowerCase().includes(cleanQuery)
    );

    return matchesCategory && (matchesName || matchesBrand || matchesOccasion || matchesColorToken);
  });

  // Dynamic Theme Interface Map Lookups
  const theme = {
    bgMain: isDarkMode ? 'bg-[#0C0C0E]' : 'bg-[#F4F4F6]',
    bgPanel: isDarkMode ? 'bg-[#141311]' : 'bg-[#FFFFFF]',
    bgCard: isDarkMode ? 'bg-[#1C1C1E]' : 'bg-[#EBEBEF]',
    textPrimary: isDarkMode ? 'text-white' : 'text-neutral-900',
    textSecondary: isDarkMode ? 'text-neutral-400' : 'text-neutral-600',
    border: isDarkMode ? 'border-neutral-800/70' : 'border-neutral-200/90',
    inputBg: isDarkMode ? 'bg-[#0C0C0E]' : 'bg-[#F4F4F6]',
    toggleInactive: isDarkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600',
  };

  return (
    <div className={`min-h-screen w-full ${theme.bgMain} ${theme.textPrimary} font-sans antialiased transition-colors duration-300 selection:bg-[#F5C518] selection:text-black`}>
      
      {/* ── 🔔 TOAST NOTIFICATIONS DRAWER PORTAL ── */}
      <div className="fixed top-5 right-5 z-[200] space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div key={toast.id} className="bg-neutral-900/95 text-white text-xs font-semibold px-4 py-3 rounded-xl border border-neutral-800 shadow-2xl flex items-center gap-2 animate-slide-in backdrop-blur-md">
            <span className="text-[#F5C518]">✦</span>
            <p className="flex-1">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* ── 🛑 DUPLICATE INTERACTION SHEET WINDOW MODAL ── */}
      {duplicateWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className={`${theme.bgPanel} border border-amber-500/40 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl shadow-amber-950/20`}>
            <div className="flex items-center gap-3 text-amber-500">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-base font-bold">Duplicate Item Detected</h3>
            </div>
            <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
              An item categorized as <span className="font-bold text-white">"{duplicateWarning.category}"</span> with the name <span className="font-bold text-white">"{duplicateWarning.name}"</span> is already tracked inside your database.
            </p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDuplicateWarning(null)} className="flex-1 py-2 text-xs font-semibold bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors">Skip</button>
              <button onClick={() => commitItemToStorage(duplicateWarning)} className="flex-1 py-2 text-xs font-bold bg-[#F5C518] text-black rounded-xl hover:bg-[#e0b415] transition-colors">Add Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════
           VIEW 1: AUTHENTICATION LANDING WALL
         ═════════════════════════════════════════════ */}
      {!isAuthenticated ? (
        <div className="min-h-screen w-full flex flex-col md:flex-row">
          {/* Left Side Branding Split */}
          <div className={`w-full md:w-1/2 ${theme.bgPanel} p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r ${theme.border} relative overflow-hidden transition-colors duration-300`}>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5C518] flex items-center justify-center font-mono text-xl font-black text-black shadow-md">W</div>
                <span className="text-xl font-bold tracking-tight">Wardrobe AI</span>
              </div>
              <div className="text-xs tracking-widest text-neutral-500 font-mono uppercase">Est. 2024</div>
            </div>

            <div className="my-auto py-12 md:py-0 max-w-md z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F5C518] block mb-3">Modular Styling</span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">Track architecture.<br />Optimize apparel.</h2>
              <p className={`text-sm ${theme.textSecondary} leading-relaxed`}>
                Enterprise grade layout schema tools designed to map out styles, trace investment indexes, and track cost efficiency cycles dynamically.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/40 z-10">
              <div>
                <div className="text-2xl font-bold tracking-tight">Phase 4</div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">Runtime Version</div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">Multi</div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">Color Arrays</div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">Synced</div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">Analytics Hub</div>
              </div>
            </div>
          </div>

          {/* Right Side Control Interface Form */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center items-center relative">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`absolute top-6 right-6 p-2 rounded-xl border ${theme.border} text-[#F5C518] hover:bg-neutral-800/40 transition-colors`}>
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            <div className="w-full max-w-sm flex flex-col">
              <div className="mb-6">
                <span className="text-xs text-neutral-500 font-medium block mb-1">{authMode === 'login' ? 'Secure Node Verification' : 'Cloud Onboarding Access'}</span>
                <h1 className="text-2xl font-bold tracking-tight">{authMode === 'login' ? 'Sign in' : 'Create account'}</h1>
              </div>

              <div className={`grid grid-cols-2 ${isDarkMode ? 'bg-neutral-900/60' : 'bg-neutral-200/50'} p-1 rounded-xl mb-6 border ${theme.border}`}>
                <button onClick={() => setAuthMode('login')} className={`py-2 text-xs font-semibold rounded-lg transition-all ${authMode === 'login' ? 'bg-[#222226] text-white shadow-sm' : theme.toggleInactive}`}>Sign in</button>
                <button onClick={() => setAuthMode('signup')} className={`py-2 text-xs font-semibold rounded-lg transition-all ${authMode === 'signup' ? 'bg-[#222226] text-white shadow-sm' : theme.toggleInactive}`}>Sign up</button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Identity Tag</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className={`w-full bg-transparent border-b ${theme.border} focus:border-[#F5C518] py-2 text-sm outline-none transition-colors placeholder-neutral-600`} />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Electronic Mail Target</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`w-full bg-transparent border-b ${theme.border} focus:border-[#F5C518] py-2 text-sm outline-none transition-colors placeholder-neutral-600`} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Access Pass Keyphrase</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`w-full bg-transparent border-b ${theme.border} focus:border-[#F5C518] py-2 text-sm outline-none transition-colors placeholder-neutral-600`} />
                </div>
                {authError && <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400">{authError}</div>}
                <button type="submit" className="w-full mt-2 py-3.5 bg-[#F5C518] text-black hover:bg-[#e0b415] rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md">Continue</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ═════════════════════════════════════════════
             VIEW 2: ENTERPRISE MANAGEMENT DASHBOARD
           ═════════════════════════════════════════════ */
        <div className="min-h-screen flex flex-col">
          <input type="file" ref={fileInputRef} onChange={handleDeviceFileChange} accept="image/*" className="hidden" />

          {/* Core Header Navigation Bar */}
          <header className={`${theme.bgPanel} px-6 py-4 flex justify-between items-center border-b ${theme.border} sticky top-0 z-50 shadow-sm transition-colors duration-300`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5C518] flex items-center justify-center font-mono font-black text-black">W</div>
              <span className="text-base font-bold tracking-tight">Wardrobe AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{fullName}</p>
                <p className="text-[10px] text-neutral-500 font-mono">{email}</p>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl border ${theme.border} hover:bg-neutral-800/40 transition-colors`}>{isDarkMode ? '☀️' : '🌙'}</button>
              <button onClick={handleLogout} className="px-4 py-1.5 border border-red-900/30 text-red-400 hover:bg-red-950/30 rounded-full text-xs font-medium transition-colors">Log out</button>
            </div>
          </header>

          {/* Sub Navigation Submenu Rails */}
          <nav className={`${theme.bgPanel} flex px-6 border-b ${theme.border} sticky top-[65px] z-40`}>
            {['wardrobe', 'outfits', 'weekly'].map((tab) => (
              <button key={tab} onClick={() => setCurrentTab(tab)} className={`px-5 py-3.5 border-b-2 font-bold text-xs tracking-wider uppercase transition-all ${currentTab === tab ? 'border-[#F5C518] text-[#F5C518]' : `border-transparent ${theme.textSecondary}`}`}>
                {tab === 'wardrobe' ? 'Closet Inventory' : tab === 'outfits' ? 'AI Compiler' : 'Weekly Scheduler'}
              </button>
            ))}
          </nav>

          {/* Primary Viewport Area Container */}
          <main className="p-4 md:p-8 max-w-6xl w-full mx-auto flex-1">
            
            {/* TAB 1: CLOSET MATRIX CONSOLE */}
            {currentTab === 'wardrobe' && (
              <div className="space-y-6">
                
                {/* Asymmetric Split Form Layout Grid */}
                <div className={`${theme.bgPanel} rounded-2xl p-6 border ${theme.border} shadow-xl transition-all duration-300`}>
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Left Stream: Metadata Parameter Pickers */}
                    <form onSubmit={handleAddItemSubmit} className="flex-1 space-y-4">
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                          <h2 className="text-sm font-bold tracking-tight">Ingest Apparel Modality</h2>
                          
                          {/* Hardware triggers buttons mapping */}
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button type="button" onClick={handleFileUploadClick} className="flex-1 sm:flex-none px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                              📁 Upload File
                            </button>
                            <button type="button" onClick={startCamera} className="flex-1 sm:flex-none px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-[#F5C518] rounded-lg text-xs font-bold relative overflow-hidden group flex items-center justify-center gap-1">
                              <span className="absolute inset-0 bg-[#F5C518]/10 animate-pulse pointer-events-none rounded-lg" />
                              📸 Live Lens Scan
                            </button>
                          </div>
                        </div>

                        <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Item Name Identifier</label>
                        <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Navy blue button-up shirt" className={`w-full ${theme.inputBg} px-4 py-2 border ${theme.border} rounded-xl text-xs outline-none focus:border-[#F5C518] transition-colors`} />
                      </div>

                      {/* Size & Fit Dropdown Rows Split */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Size Specification</label>
                          <select value={size} onChange={(e) => setSize(e.target.value)} className={`w-full ${theme.inputBg} px-3 py-2 border ${theme.border} rounded-xl text-xs outline-none focus:border-[#F5C518]`}>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Fit Architecture</label>
                          <select value={fit} onChange={(e) => setFit(e.target.value)} className={`w-full ${theme.inputBg} px-3 py-2 border ${theme.border} rounded-xl text-xs outline-none focus:border-[#F5C518]`}>
                            {['Slim', 'Regular', 'Oversized', 'Petite', 'Tall'].map(f => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Brand & Investment Tracking Fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Brand/Label Affiliation</label>
                          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Zara, Uniqlo" className={`w-full ${theme.inputBg} px-3 py-2 border ${theme.border} rounded-xl text-xs outline-none focus:border-[#F5C518]`} />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Purchase Price Target</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-xs text-neutral-500">$</span>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className={`w-full ${theme.inputBg} pl-6 pr-3 py-2 border ${theme.border} rounded-xl text-xs outline-none focus:border-[#F5C518]`} />
                          </div>
                        </div>
                      </div>

                      {/* Core Category Target Rail */}
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">System Allocation Target</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full ${theme.inputBg} px-3 py-2 border ${theme.border} rounded-xl text-xs outline-none focus:border-[#F5C518]`}>
                          {['Top', 'Outerwear', 'Bottom', 'Shoes'].map(cat => <option key={cat}>{cat}</option>)}
                        </select>
                      </div>

                      {/* Multi-Select Color Arrays Chips Row */}
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Color Palette Profiles Matrix (Select Multiples)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {COLOR_PALETTE.map((cp) => {
                            const isSelected = selectedColors.includes(cp.hex);
                            return (
                              <button type="button" key={cp.name} onClick={() => toggleColorSelection(cp.hex)} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 transition-all ${isSelected ? 'border-[#F5C518] bg-[#F5C518]/10 text-[#F5C518]' : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white'}`}>
                                <span className="w-2 h-2 rounded-full border border-neutral-700 block" style={{ backgroundColor: cp.hex }} />
                                {cp.name} {isSelected && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Multi-Select Occasions Tags Box */}
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Occasion Framework Modality</label>
                        <div className="flex flex-wrap gap-1">
                          {OCCASION_OPTIONS.map((occ) => {
                            const isSelected = selectedOccasions.includes(occ);
                            return (
                              <button type="button" key={occ} onClick={() => toggleOccasionSelection(occ)} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${isSelected ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800/60 hover:border-neutral-700'}`}>
                                {occ} {isSelected && '•'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Care Instructions and Conditions Controls Row Split */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Structural Condition State</label>
                          <select value={condition} onChange={(e) => setCondition(e.target.value)} className={`w-full ${theme.inputBg} px-3 py-2 border ${theme.border} rounded-xl text-xs outline-none`}>
                            {['New', 'Good', 'Fair', 'Needs Repair'].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Care/Maintenance Blueprint</label>
                          <select value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} className={`w-full ${theme.inputBg} px-3 py-2 border ${theme.border} rounded-xl text-xs outline-none`}>
                            {['Machine Wash', 'Hand Wash', 'Dry Clean Only', 'Air Dry Only'].map(ci => <option key={ci}>{ci}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Final Adding Trigger Button */}
                      <button type="submit" className="w-full py-2.5 bg-[#F5C518] hover:bg-[#e0b415] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md">
                        Commit Asset to Closet Inventory
                      </button>
                    </form>

                    {/* Right Stream: Interactive Upload Preview Verification Block */}
                    <div className="w-full lg:w-64 flex flex-col shrink-0">
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Visual Content Verification Portal</label>
                      <div className={`flex-1 min-h-[180px] rounded-2xl border-2 border-dashed ${theme.border} flex flex-col items-center justify-center p-4 text-center relative overflow-hidden bg-neutral-950/20`}>
                        {uploadPreview ? (
                          <div className="absolute inset-0 w-full h-full group">
                            <img src={uploadPreview} alt="Target file validation snapshot" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <button type="button" onClick={() => setUploadPreview(null)} className="px-3 py-1 bg-red-600 rounded-lg text-white text-[10px] font-bold uppercase">Purge Frame</button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-2xl opacity-40">🖼️</div>
                            <p className="text-[10px] text-neutral-500 font-medium">No active file preview matrix mounted yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 🔍 SEARCH AND FILTERS CONTROLS COMPLEX */}
                <div className="space-y-3">
                  {/* Dedicated Search Input Bar Component */}
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-neutral-500 text-sm">🔍</span>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by item name, color tag, or brand context..." className={`w-full ${theme.bgPanel} pl-10 pr-10 py-3 rounded-xl border ${theme.border} text-xs outline-none focus:border-[#F5C518] shadow-sm transition-all`} />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-4 top-2.5 text-neutral-500 text-base hover:text-white">×</button>
                    )}
                  </div>

                  {/* Neutralized Category Filters Matrix Rails (Yellow only on active) */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {['All', 'Top', 'Outerwear', 'Bottom', 'Shoes'].map((filter) => {
                      const isSelected = activeFilter === filter;
                      return (
                        <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${isSelected ? 'bg-[#F5C518] text-black border-[#F5C518] shadow-sm font-bold' : `bg-neutral-900/60 text-neutral-400 hover:text-white ${theme.border}`}`}>
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inventory Results Layout Grid Area */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                      Closet Inventory Matrix ({filteredItems.length})
                    </h3>
                  </div>

                  {filteredItems.length === 0 ? (
                    /* PROGRESSIVE ONBOARDING EMPTY STATE MATRIX */
                    <div className={`${theme.bgPanel} text-center py-16 px-6 border-2 border-dashed ${theme.border} rounded-3xl space-y-3`}>
                      <div className="w-10 h-10 bg-neutral-900 text-neutral-400 rounded-xl flex items-center justify-center mx-auto text-sm border border-neutral-800">🎨</div>
                      <h4 className="text-sm font-bold">Your wardrobe is empty!</h4>
                      <p className={`text-xs ${theme.textSecondary} max-w-sm mx-auto leading-relaxed`}>
                        Start by adding <span className="text-[#F5C518] font-bold">3-5 pieces</span> to generate your first outfit. Upload item capture templates from your device storage or activate Live Lens Scan to stream frames.
                      </p>
                    </div>
                  ) : (
                    /* Displaying cards layout elements matrix */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {filteredItems.map((item) => (
                        <div key={item.id} className={`${theme.bgPanel} border ${theme.border} rounded-2xl overflow-hidden shadow-lg flex flex-col group relative transition-all`}>
                          
                          {/* Wear Tracker Frequency Counter Floating Badge */}
                          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-neutral-900/90 backdrop-blur-md text-[9px] font-mono font-bold border border-neutral-800/80 rounded text-neutral-300">
                            Worn: {item.wearCount === 0 ? 'Never' : `${item.wearCount} times`}
                          </div>

                          {/* Top Card Image Shell */}
                          <div className="h-40 w-full bg-neutral-950 flex items-center justify-center relative border-b border-neutral-900 overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-3xl opacity-30">
                                {item.category === 'Top' && '👕'}
                                {item.category === 'Outerwear' && '🧥'}
                                {item.category === 'Bottom' && '👖'}
                                {item.category === 'Shoes' && '👟'}
                              </div>
                            )}

                            {/* Color Tags Floating Stack Frame Area */}
                            <div className="absolute top-3 right-3 flex flex-col gap-1">
                              {item.colors.map((hex, idx) => (
                                <div key={idx} className="w-3 h-3 rounded-full border border-neutral-800 shadow" style={{ backgroundColor: hex }} />
                              ))}
                            </div>
                          </div>

                          {/* Data Body Section Details Panel */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-extrabold tracking-widest uppercase px-1.5 py-0.5 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-neutral-500 font-medium font-mono">{item.brand}</span>
                              </div>

                              {editingId === item.id ? (
                                <input type="text" value={tempEditName} onChange={(e) => setTempEditName(e.target.value)} className="w-full bg-neutral-900 text-xs px-2 py-1 rounded border border-[#F5C518] outline-none text-white" autoFocus />
                              ) : (
                                <p className="text-xs font-bold truncate text-neutral-200">{item.name}</p>
                              )}

                              {/* Size, Fit and Pricing Secondary Specs Text */}
                              <div className="flex flex-wrap gap-2 text-[9px] text-neutral-500 font-medium">
                                <span>Size: <strong className="text-neutral-400">{item.size} ({item.fit})</strong></span>
                                {item.price > 0 && <span>• Value: <strong className="text-emerald-500">${item.price}</strong></span>}
                              </div>
                            </div>

                            {/* Operational Utilities Action Triggers Footer */}
                            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px]">
                              {editingId === item.id ? (
                                <div className="flex gap-2">
                                  <button onClick={() => saveEdit(item.id)} className="text-[#F5C518] font-bold">Save</button>
                                  <button onClick={() => setEditingId(null)} className="text-neutral-500">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button onClick={() => startEditing(item.id, item.name)} className="text-neutral-400 hover:text-white transition-colors">Rename</button>
                                  <button onClick={() => incrementWearCount(item.id)} className="text-amber-500 hover:underline transition-all">Log Wear +</button>
                                </div>
                              )}
                              <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-400">Delete</button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: AI OUTFIT GENERATOR ENGINE */}
            {currentTab === 'outfits' && (
              <div className="space-y-6 max-w-xl mx-auto">
                <div className={`${theme.bgPanel} rounded-3xl p-6 border ${theme.border} text-center space-y-4 shadow-xl`}>
                  <div className="w-12 h-12 rounded-2xl bg-[#F5C518]/10 text-[#F5C518] flex items-center justify-center mx-auto text-xl font-bold">✨</div>
                  <h3 className="text-lg font-bold tracking-tight">AI Lookbook Compiler</h3>
                  <p className={`text-xs ${theme.textSecondary} max-w-sm mx-auto leading-relaxed`}>
                    Synthesize layouts matching colors, dimensions, occasion context guidelines, and tracks runtime indices automatically.
                  </p>
                  <button onClick={handleGenerateOutfit} className="px-6 py-2.5 bg-[#F5C518] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:bg-[#e0b415]">
                    Synthesize Outfit Look
                  </button>
                </div>

                {generatedOutfit && (
                  <div className={`${theme.bgPanel} rounded-2xl border ${theme.border} p-6 shadow-2xl space-y-4`}>
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                      <div>
                        <h4 className="text-sm font-bold">Suggested Fit Strategy</h4>
                        <p className="text-[10px] text-neutral-500">Frequencies and values synced</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-900">
                        {generatedOutfit.score}% Match Score
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { label: 'Top Layer', item: generatedOutfit.top },
                        { label: 'Bottom Layer', item: generatedOutfit.bottom },
                        { label: 'Outer Structure', item: generatedOutfit.outerwear },
                        { label: 'Footwear Matrix', item: generatedOutfit.shoes }
                      ].map((slot, index) => {
                        if (!slot.item) return null;
                        return (
                          <div key={index} className="bg-neutral-950 p-2.5 border border-neutral-900 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-900 overflow-hidden shrink-0 flex items-center justify-center border border-neutral-800 text-lg">
                              {slot.item.image ? <img src={slot.item.image} alt="" className="w-full h-full object-cover" /> : '👕'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold">{slot.label}</p>
                              <p className="text-xs font-bold text-neutral-200 truncate">{slot.item.name}</p>
                              <p className="text-[9px] text-neutral-400 font-mono">{slot.item.brand} • Size {slot.item.size}</p>
                            </div>
                            <div className="flex shrink-0 gap-0.5">
                              {slot.item.colors.map((hex, i) => <div key={i} className="w-2 h-2 rounded-full border border-neutral-800" style={{ backgroundColor: hex }} />)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WEEKLY FIT MATRIX */}
            {currentTab === 'weekly' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Chrono Fit Weekly Lookbook</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className={`${theme.bgPanel} border ${theme.border} rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[140px] group hover:border-neutral-700 transition-all`}>
                      <div className="bg-neutral-950/80 py-1.5 text-center text-[10px] font-bold tracking-wider border-b border-neutral-900 text-neutral-400">{day}</div>
                      <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
                        <p className="text-[10px] text-neutral-600 font-mono">No Fit Assigned</p>
                        <button className="text-[9px] text-[#F5C518] font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Assign Look +</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>

          {/* ── LIVE HARDWARE HARDWARE INTERACTIVE LENS CANVASES MODAL ── */}
          {isCameraOpen && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[220] flex items-center justify-center p-4">
              <div className="bg-[#141311] border border-neutral-800 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl flex flex-col">
                <div className="p-4 border-b border-neutral-900 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Capture Modality Terminal</h4>
                    <p className="text-[9px] text-neutral-500 mt-0.5">Target Classification Slot: <span className="text-[#F5C518] font-bold">{category}</span></p>
                  </div>
                  <button onClick={stopCamera} className="text-xs text-neutral-400 hover:text-white">✕</button>
                </div>

                <div className="bg-black aspect-video w-full relative flex items-center justify-center overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-4 border border-dashed border-[#F5C518]/20 rounded-xl pointer-events-none" />
                </div>

                <div className="p-3 bg-neutral-950 flex justify-between gap-2">
                  <button onClick={stopCamera} className="flex-1 py-2 text-xs font-semibold bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400">Cancel</button>
                  <button onClick={capturePhoto} className="flex-1 py-2 text-xs font-bold bg-[#F5C518] text-black rounded-xl">Snap & Ingest Fit</button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}