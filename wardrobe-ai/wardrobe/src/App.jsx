import React, { useState, useRef } from 'react';

const IngestApparel = ({ onAddItem }) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Top');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Optional: Automatically set item name from file name if empty
      if (!itemName) {
        const fileNameWithoutExt = e.target.files[0].name.split('.').slice(0, -1).join('.');
        setItemName(fileNameWithoutExt);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct the new item object (minus color profile)
    const newItem = {
      name: itemName || 'Untitled Apparel',
      category,
      file: selectedFile,
    };

    onAddItem(newItem);

    // Reset Form
    setItemName('');
    setCategory('Top');
    setSelectedFile(null);
  };

  return (
    <div className="bg-[#121212] border border-[#232323] rounded-xl p-6 text-white max-w-5xl mx-auto my-6">
      {/* Header & Upload Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide">Ingest Apparel Modality</h2>
          <p className="text-gray-400 text-sm mt-1">
            Upload an image from your device gallery or capture a photo instantly.
          </p>
        </div>
        
        {/* Merged Upload/Camera Button */}
        <div>
          <input
            type="file"
            accept="image/*"
            capture="environment" // Merges functionality: Mobile devices will prompt camera or gallery
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={triggerFileInput}
            className="flex items-center gap-2 bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#3a3a3a] px-5 py-2.5 rounded-lg transition font-medium text-sm"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {selectedFile ? 'Change Device File' : 'Upload from Device'}
          </button>
          {selectedFile && (
            <p className="text-xs text-yellow-500 mt-1 max-w-[200px] truncate">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </div>

      {/* Form Fields Matrix */}
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
        {/* Item Name Input */}
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Item Name (Optional if uploading image)
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. Silk Formal Dress"
            className="w-full bg-[#181818] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition text-sm"
          />
        </div>

        {/* Category Target Selector */}
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Category Target
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#181818] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition appearance-none text-sm"
            >
              <option value="Top">Top</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Bottom">Bottom</option>
              <option value="Shoes">Shoes</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Form Submission Action Button */}
        <div className="w-full md:w-auto">
          <button
            type="submit"
            className="w-full bg-[#f5c518] hover:bg-[#dfb212] text-black font-bold px-6 py-2.5 rounded-lg transition text-sm"
          >
            Add Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default IngestApparel;