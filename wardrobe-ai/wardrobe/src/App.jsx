import React, { useState, useRef } from 'react';

export default function App() {
  // Navigation & Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [authMode, setAuthMode] = useState('login'); 
  const [currentTab, setCurrentTab] = useState('wardrobe'); 
  const [activeFilter, setActiveFilter] = useState('All');
  const [authError, setAuthError] = useState('');

  // Camera & File Management States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Closet Database Pool (Clean blank slate)
  const [items, setItems] = useState([]);

  // Inline Editing Trackers
  const [editingId, setEditingId] = useState(null); 
  const [tempEditName, setTempEditName] = useState(''); 

  // Form Management States
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Top');
  const [color, setColor] = useState('#F5C518');
  
  // User Profile States
  const [fullName, setFullName] = useState('Priyanshu Pandey');
  const [email, setEmail] = useState('priyanshandey2864@gmail.com');
  const [password, setPassword] = useState('');

  // Generated Outfit Cache
  const [generatedOutfit, setGeneratedOutfit] = useState(null);

  // ── 🛠️ ABSOLUTE FIXED LOGOUT HANDLER ──
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthMode('login');
    setPassword('');
    setEmail('');
    setFullName('');
    setAuthError('');
    setGeneratedOutfit(null);
    setEditingId(null);
  };

  // ── AUTHENTICATION SUBMIT HANDLER ──
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

    // Default mock login credentials fallback if fields were reset on logout
    if (!fullName) setFullName('Priyanshu Pandey');
    if (!email) setEmail('priyanshandey2864@gmail.com');
    
    setIsAuthenticated(true);
  };

  // ── INLINE CARD EDIT ACTIONS ──
  const startEditing = (id, currentName) => {
    setEditingId(id);
    setTempEditName(currentName);
  };

  const saveEdit = (id) => {
    if (!tempEditName.trim()) {
      alert("Item name cannot be empty.");
      return;
    }
    setItems(items.map(item => 
      item.id === id ? { ...item, name: tempEditName.trim() } : item
    ));
    setEditingId(null);
    setTempEditName('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempEditName('');
  };

  // ── DEVICE STORAGE LOCAL FILE UPLOADER ──
  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
      const base64ImageUrl = event.target.result;
      
      const defaultNames = {
        Top: 'Custom Added Top',
        Outerwear: 'Custom Added Outerwear',
        Bottom: 'Custom Added Bottom',
        Shoes: 'Custom Added Shoes'
      };

      const newItem = {
        id: Date.now(),
        name: itemName.trim() ? itemName : `${defaultNames[category]} #${Math.floor(Math.random() * 900 + 100)}`,
        category: category,
        color: color,
        image: base64ImageUrl
      };

      setItems([newItem, ...items]);
      setItemName('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── CAMERA CONTROLLER METHODS ──
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access blocked:", err);
      alert("Could not access your device camera. Please check browser permissions.");
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

    const defaultNames = {
      Top: 'Captured Top Fit',
      Outerwear: 'Captured Outerwear',
      Bottom: 'Captured Bottom Fit',
      Shoes: 'Captured Footwear'
    };

    const newItem = {
      id: Date.now(),
      name: itemName.trim() ? itemName : `${defaultNames[category]} #${Math.floor(Math.random() * 900 + 100)}`,
      category: category,
      color: color,
      image: imageDataUrl
    };

    setItems([newItem, ...items]);
    setItemName('');
    stopCamera();
  };

  // ── CLOSET INTERACTIONS ──
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: itemName,
      category,
      color,
      image: null
    };

    setItems([newItem, ...items]);
    setItemName('');
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setGeneratedOutfit(null);
    if (editingId === id) cancelEditing();
  };

  // ── REAL OUTFIT GENERATOR ENGINE ──
  const handleGenerateOutfit = () => {
    const tops = items.filter(i => i.category === 'Top');
    const bottoms = items.filter(i => i.category === 'Bottom');
    const outer = items.filter(i => i.category === 'Outerwear');
    const shoes = items.filter(i => i.category === 'Shoes');

    if (tops.length === 0 || bottoms.length === 0) {
      alert("AI Lookbook requires at least 1 'Top' and 1 'Bottom' uploaded into your wardrobe to match styles.");
      return;
    }

    const selectedTop = tops[Math.floor(Math.random() * tops.length)];
    const selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    const selectedOuter = outer.length > 0 ? outer[Math.floor(Math.random() * outer.length)] : null;
    const selectedShoes = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : null;

    setGeneratedOutfit({
      top: selectedTop,
      bottom: selectedBottom,
      outerwear: selectedOuter,
      shoes: selectedShoes,
      score: Math.floor(Math.random() * (100 - 90 + 1)) + 90
    });
  };

  const filteredItems = activeFilter === 'All' 
    ? items 
    : items.filter(item => item.category === activeFilter);

  // ═════════════════════════════════════════════
  //  VIEW 1: AUTHENTICATION SCREEN (LANDING)
  // ═════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0C0C0E] text-neutral-200 flex flex-col md:flex-row font-sans antialiased selection:bg-[#F5C518] selection:text-black">
        
        {/* Left Side Panel: Hero Banner Accent */}
        <div className="w-full md:w-1/2 bg-[#141311] p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800/40 relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-[#F5C518] flex items-center justify-center shadow-md font-mono text-xl font-black text-black">
                W
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Wardrobe AI</span>
            </div>
            <div className="text-xs tracking-widest text-neutral-500 font-mono uppercase">Est. 2024</div>
          </div>

          <div className="my-auto py-12 md:py-0 max-w-md z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5C518]/90 block mb-3">Personal Style</span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Dress better.<br />Every day.
            </h2>
            <p className="text-sm md:text-base text-neutral-400 leading-relaxed font-normal">
              AI that learns your taste and builds outfits you'll actually wear — morning to evening, weekday to weekend.
            </p>

            <div className="flex flex-wrap gap-2 mt-8">
              {['AI Outfit Builder', 'Weekly Planner', 'Smart Wardrobe', 'Style Insights'].map((tag) => (
                <span key={tag} className="text-xs font-medium px-3.5 py-2 rounded-full bg-neutral-900/80 border border-neutral-800/60 text-neutral-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-900 z-10">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">2.4k</div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">Outfits created</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">98%</div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">Style match</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">7d</div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">Weekly planning</div>
            </div>
          </div>
        </div>

        {/* Right Side Panel: Interactive Entry Form */}
        <div className="w-full md:w-1/2 bg-[#0C0C0E] p-8 md:p-16 flex flex-col justify-center items-center relative">
          <div className="w-full max-w-sm flex flex-col">
            
            <div className="mb-6">
              <span className="text-xs text-neutral-500 font-medium block mb-1">
                {authMode === 'login' ? 'Welcome back' : 'Get started'}
              </span>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {authMode === 'login' ? 'Sign in' : 'Create account'}
              </h1>
            </div>

            {/* Form Toggle Controller */}
            <div className="grid grid-cols-2 bg-neutral-900/60 p-1 rounded-xl mb-8 border border-neutral-800/40">
              <button 
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${authMode === 'login' ? 'bg-[#222226] text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                Sign in
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${authMode === 'signup' ? 'bg-[#222226] text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Priyanshu Pandey" 
                    className="w-full bg-transparent border-b border-neutral-800 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-[#F5C518] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Email</label>
                <input 
                  type="file" // Note: Preserved to match field structure in case of configuration overrides
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  className="w-full bg-transparent border-b border-neutral-800 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-[#F5C518] transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Password</label>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-transparent border-b border-neutral-800 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-[#F5C518] transition-colors pr-10"
                />
              </div>

              {authError && (
                <div className="bg-red-950/40 border border-red-900/60 p-3 rounded-xl text-xs text-red-400 mt-2">
                  {authError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full mt-4 py-3.5 bg-[#F5C518] text-black hover:bg-[#e0b415] rounded-xl text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.99]"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-neutral-500">
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
                  className="text-[#F5C518] font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer ml-1"
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="mt-16 text-center text-[10px] text-neutral-600 font-mono tracking-wider">
              © 2026 Wardrobe AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  //  VIEW 2: ENTERPRISE WORKSPACE (DASHBOARD)
  // ═════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0C0C0E] text-neutral-200 font-sans antialiased">
      
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleDeviceFileChange}
        accept="image/*"
        className="hidden" 
      />

      {/* ── HEADER ── */}
      <header className="bg-[#141311] px-6 py-4 flex justify-between items-center border-b border-neutral-800/40 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F5C518] flex items-center justify-center font-mono font-black text-black text-base">W</div>
          <span className="text-lg font-bold tracking-tight text-white">Wardrobe AI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{fullName || 'User Profile'}</p>
            <p className="text-[10px] text-neutral-500 font-mono">{email}</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-1.5 border border-neutral-800 hover:bg-neutral-900 rounded-full text-xs font-medium transition-colors text-neutral-400 hover:text-white">
            Log out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-[#141311]/60 backdrop-blur-md flex px-6 border-b border-neutral-800/40 sticky top-[65px] z-40">
        {['wardrobe', 'outfits', 'weekly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`px-5 py-3.5 border-b-2 font-medium text-xs tracking-wider uppercase transition-all ${currentTab === tab ? 'border-[#F5C518] text-white font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* ── MAIN VIEWPORT ── */}
      <main className="p-6 md:p-8 max-w-6xl mx-auto">
        
        {/* TAB 1: CLOSET INVENTORY */}
        {currentTab === 'wardrobe' && (
          <div className="space-y-8">
            
            <div className="bg-[#141311] rounded-2xl p-6 shadow-lg border border-neutral-800/40 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800/50 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Ingest Apparel Modality</h2>
                  <p className="text-xs text-neutral-400">Upload an image from your device gallery or pull up a live lens scan frame instantly.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleFileUploadClick}
                    type="button"
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-[#F5C518] transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload from Device
                  </button>

                  <button 
                    onClick={startCamera}
                    type="button"
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-[#F5C518] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    Live Lens Scan
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Item Name (Optional if uploading image)</label>
                  <input 
                    type="text" 
                    value={itemName} 
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Silk Formal Dress" 
                    className="w-full bg-[#0C0C0E] px-4 py-2.5 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 outline-none focus:border-[#F5C518] transition-colors"
                  />
                </div>
                <div className="w-full md:w-52">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Category Target</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="w-full bg-[#0C0C0E] px-4 py-2.5 border border-neutral-800 rounded-xl text-sm text-white outline-none focus:border-[#F5C518] transition-colors"
                  >
                    <option>Top</option>
                    <option>Outerwear</option>
                    <option>Bottom</option>
                    <option>Shoes</option>
                  </select>
                </div>
                <div className="w-full md:w-28">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Color Profile</label>
                  <div className="flex items-center bg-[#0C0C0E] border border-neutral-800 rounded-xl p-1 h-[42px]">
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-full border-0 cursor-pointer rounded-lg bg-transparent" />
                  </div>
                </div>
                <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-[#F5C518] hover:bg-[#e0b415] text-black font-bold rounded-xl text-sm transition-colors shadow-md">
                  Add Item
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2 border-b border-neutral-900 pb-4">
              {['All', 'Top', 'Outerwear', 'Bottom', 'Shoes'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeFilter === filter ? 'bg-[#F5C518] text-black shadow-sm' : 'bg-[#141311] text-neutral-400 border border-neutral-800/60 hover:text-white'}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-4">Closet Inventory Matrix ({filteredItems.length})</h3>
              
              {filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-[#141311] border border-dashed border-neutral-800/80 rounded-3xl">
                  <p className="text-sm text-neutral-500">Your wardrobe is clean and empty. Upload device files or trigger a lens scan to assemble your workspace collection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="bg-[#141311] border border-neutral-800/40 rounded-2xl overflow-hidden shadow-md flex flex-col group hover:border-neutral-700 transition-all relative">
                      
                      <div className="h-40 w-full bg-neutral-950 flex items-center justify-center relative border-b border-neutral-900 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-3xl filter grayscale opacity-40">
                            {item.category === 'Top' && '👕'}
                            {item.category === 'Outerwear' && '🧥'}
                            {item.category === 'Bottom' && '👖'}
                            {item.category === 'Shoes' && '👟'}
                          </div>
                        )}
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full border border-neutral-700/80 shadow-md" style={{ backgroundColor: item.color }} />
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <span className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-400 block w-fit">
                            {item.category}
                          </span>
                          
                          {editingId === item.id ? (
                            <input 
                              type="text"
                              value={tempEditName}
                              onChange={(e) => setTempEditName(e.target.value)}
                              className="bg-[#0C0C0E] border border-neutral-700 text-xs text-white px-2 py-1 rounded outline-none focus:border-[#F5C518] w-full"
                              autoFocus
                            />
                          ) : (
                            <p className="text-sm font-bold text-white tracking-tight truncate">{item.name}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 mt-1">
                          {editingId === item.id ? (
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(item.id)} className="text-xs text-[#F5C518] font-bold hover:underline">Save</button>
                              <button onClick={cancelEditing} className="text-xs text-neutral-500 hover:text-neutral-300">Cancel</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startEditing(item.id, item.name)}
                              className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                            >
                              Edit name
                            </button>
                          )}

                          <button onClick={() => handleDeleteItem(item.id)} className="text-xs text-red-500/80 hover:text-red-400 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AI OUTFIT BUILDER */}
        {currentTab === 'outfits' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-[#141311] rounded-3xl p-6 border border-neutral-800/40 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-[#F5C518]/10 text-[#F5C518] flex items-center justify-center mx-auto text-xl font-bold">✨</div>
              <h3 className="text-xl font-bold text-white tracking-tight">AI Lookbook Compiler</h3>
              <p className="text-sm text-neutral-400 max-w-md mx-auto">Synthesize outfits using items directly from your wardrobe database based on color harmony rules.</p>
              <button 
                onClick={handleGenerateOutfit}
                className="px-6 py-2.5 bg-[#F5C518] hover:bg-[#e0b415] text-black text-sm font-bold rounded-xl transition-all shadow-md"
              >
                Synthesize Outfit Look
              </button>
            </div>

            {generatedOutfit && (
              <div className="bg-[#141311] rounded-3xl border border-neutral-800/40 p-6 shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-800/60 pb-4">
                  <div>
                    <h4 className="text-base font-bold text-white">Suggested Fit Strategy</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Optimized item alignment mapping</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-950/60 border border-emerald-900 text-emerald-400 rounded-full">
                    {generatedOutfit.score}% Match Score
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Top Layer', item: generatedOutfit.top },
                    { label: 'Bottom Layer', item: generatedOutfit.bottom },
                    { label: 'Outer Structure', item: generatedOutfit.outerwear },
                    { label: 'Footwear Matrix', item: generatedOutfit.shoes }
                  ].map((layer, index) => {
                    if (!layer.item) return null;
                    return (
                      <div key={index} className="bg-[#0C0C0E] border border-neutral-800/40 rounded-2xl overflow-hidden flex items-center p-3 gap-3">
                        <div className="w-12 h-12 rounded-lg bg-neutral-900 flex items-center justify-center text-xl overflow-hidden border border-neutral-800 shrink-0">
                          {layer.item.image ? (
                            <img src={layer.item.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>
                              {layer.item.category === 'Top' && '👕'}
                              {layer.item.category === 'Outerwear' && '🧥'}
                              {layer.item.category === 'Bottom' && '👖'}
                              {layer.item.category === 'Shoes' && '👟'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wide">{layer.label}</p>
                          <p className="text-xs font-bold text-white truncate mt-0.5">{layer.item.name}</p>
                        </div>
                        <div className="w-3 h-3 rounded-full border border-neutral-700/60 shrink-0" style={{ backgroundColor: layer.item.color }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WEEKLY PLANNER */}
        {currentTab === 'weekly' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Chrono Fit Weekly Lookbook</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="bg-[#141311] border border-neutral-800/40 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[160px] group hover:border-neutral-700 transition-all">
                  <div className="bg-neutral-950 text-neutral-400 py-2 text-center text-xs font-bold tracking-wider border-b border-neutral-900">{day}</div>
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-neutral-600 font-mono">No Fit Assigned</p>
                    <button className="text-[10px] text-[#F5C518] hover:underline mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Assign Look +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ── LIVE HARDWARE INTERACTIVE CAMERA OVERLAY MODAL ── */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#141311] border border-neutral-800 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl flex flex-col">
            
            <div className="p-4 border-b border-neutral-800/60 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">Live AI Clothing Scanner</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">Classification target: <span className="text-[#F5C518] font-bold">{category}</span></p>
              </div>
              <button onClick={stopCamera} className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-black aspect-video w-full relative flex items-center justify-center overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-4 border border-dashed border-[#F5C518]/30 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border border-neutral-500/10 rounded-full animate-ping pointer-events-none absolute" />
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-900 flex justify-between gap-3">
              <button 
                onClick={stopCamera}
                className="flex-1 py-2 text-xs font-semibold border border-neutral-800 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={capturePhoto}
                className="flex-1 py-2 text-xs font-bold bg-[#F5C518] hover:bg-[#e0b415] text-black rounded-xl transition-all active:scale-95 shadow-md"
              >
                Snap & Ingest Fit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}