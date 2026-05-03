import { useState, useRef } from 'react';
import { X, Loader2, Camera, ImagePlus } from 'lucide-react';
import { supabase, MENS_CATEGORIES, WOMENS_CATEGORIES } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['Black', 'White', 'Grey', 'Navy', 'Blue', 'Red', 'Green', 'Yellow', 'Orange', 'Pink', 'Brown', 'Beige', 'Multi'];

export default function UploadModal({ onClose, onSuccess, defaultGender = 'mens' }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [gender, setGender] = useState(defaultGender);
  const [category, setCategory] = useState(defaultGender === 'mens' ? 't-shirts' : 'tops');
  const [color, setColor] = useState('Black');
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const categories = gender === 'mens' ? MENS_CATEGORIES : WOMENS_CATEGORIES;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageToSupabase = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('clothing-images')
      .upload(fileName, file);
    if (error) throw error;

    const { data } = supabase.storage
      .from('clothing-images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);

    try {
      let image_url = 'https://via.placeholder.com/150';
      if (imageFile) {
        image_url = await uploadImageToSupabase(imageFile);
      }

      const { error } = await supabase.from('clothing_items').insert({
        user_id: user.id,
        name: name || `${color} ${category}`,
        category,
        subcategory: category,
        gender,
        color,
        image_url,
      });

      if (!error) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }

    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold">Add Item</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Image Upload Area */}
          <div className="w-full border-2 border-dashed border-stone-300 rounded-xl overflow-hidden">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <p className="text-sm text-stone-400">Add a photo of your clothing</p>
                <div className="flex gap-3">

                  {/* Camera Button */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm hover:bg-stone-700 transition"
                  >
                    <Camera size={16} /> Take Photo
                  </button>

                  {/* Gallery Button */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-800 rounded-xl text-sm hover:bg-stone-200 transition"
                  >
                    <ImagePlus size={16} /> Gallery
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* Hidden Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          <input
            type="text"
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-xl"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-xl"
          >
            {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>

          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`px-3 py-1 rounded-lg text-xs ${color === c ? 'bg-stone-900 text-white' : 'bg-stone-100'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-stone-900 text-white py-3 rounded-xl flex justify-center"
          >
            {uploading ? <Loader2 className="animate-spin" /> : 'Add to Wardrobe'}
          </button>

        </form>
      </div>
    </div>
  );
}