import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { Sparkles, ShoppingBag, Plus, X, ExternalLink, Heart, Image as ImageIcon, Upload, Edit3, Share2 } from 'lucide-react';
import { Theme, VisionBoardItem, WishlistItem, LanguageOption } from '../types';
import { auth, storage as firebaseStorage, uploadImageToStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { handleShare } from '../utils/share';

interface VisionViewProps {
  visionItems: VisionBoardItem[];
  wishlistItems: WishlistItem[];
  onAddVisionItem: (item: Omit<VisionBoardItem, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteVisionItem: (id: string, imageUrl?: string) => Promise<void>;
  onAddWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'isPurchased'>) => Promise<void>;
  onUpdateWishlistItem: (id: string, updates: Partial<WishlistItem>) => Promise<void>;
  onDeleteWishlistItem: (id: string, imageUrl?: string) => Promise<void>;
  theme: Theme;
  accentColor: string;
  lang: LanguageOption;
}

export const VisionView: React.FC<VisionViewProps> = ({
  visionItems,
  wishlistItems,
  onAddVisionItem,
  onDeleteVisionItem,
  onAddWishlistItem,
  onUpdateWishlistItem,
  onDeleteWishlistItem,
  theme,
  accentColor,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'vision' | 'wishlist'>('vision');
  
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [newVisionFile, setNewVisionFile] = useState<File | null>(null);
  const [newVisionImageUrl, setNewVisionImageUrl] = useState('');
  const [newVisionQuote, setNewVisionQuote] = useState('');
  const [isUploadingVision, setIsUploadingVision] = useState(false);
  
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [editingWishlistId, setEditingWishlistId] = useState<string | null>(null);
  const [newWishlistTitle, setNewWishlistTitle] = useState('');
  const [newWishlistPrice, setNewWishlistPrice] = useState('');
  const [newWishlistLink, setNewWishlistLink] = useState('');
  const [isUploadingWishlist, setIsUploadingWishlist] = useState(false);
  const [isSharingCollage, setIsSharingCollage] = useState(false);

  const handleShareCollage = async () => {
    const element = document.getElementById('vision-board-collage');
    if (!element) return;
    setIsSharingCollage(true);
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: theme === 'neon' ? '#020617' : theme === 'soft' ? '#fff5f7' : '#fafafa',
        scale: 2
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert(lang === 'ro' ? 'Eroare la generarea imaginii colajului.' : 'Error generating collage image.');
          setIsSharingCollage(false);
          return;
        }

        const file = new File([blob], 'vision_board_collage.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: lang === 'ro' ? 'Vision Board-ul Meu' : 'My Vision Board',
              text: lang === 'ro' ? 'Iată vision board-ul meu de astăzi! 🌟' : 'Here is my vision board for today! 🌟',
            });
            setIsSharingCollage(false);
            return;
          } catch (e: any) {
            if (e.name === 'AbortError') {
              console.log("Share cancelled by user");
              setIsSharingCollage(false);
              return;
            }
            console.error("Web Share API error, falling back to download:", e);
          }
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vision_board_collage.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsSharingCollage(false);
        alert(
          lang === 'ro' 
            ? 'Imaginea colajului a fost descărcată în mod automat! 🖼️' 
            : 'Collage image downloaded successfully! 🖼️'
        );
      }, 'image/png');
    } catch (e) {
      console.error("Collage generation error:", e);
      setIsSharingCollage(false);
      alert(lang === 'ro' ? 'Eroare la generarea colajului.' : 'Error generating collage.');
    }
  };

  const isNeon = theme === 'neon';
  const isSoft = theme === 'soft';
  const textPrimary = isNeon ? 'text-white' : 'text-slate-800';
  const textSecondary = isNeon ? 'text-slate-400' : 'text-slate-500';

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error(lang === 'ro' ? "Formatul citit nu este valid." : "Invalid format read."));
        }
      };
      reader.onerror = (error) => {
        reject(error || new Error(lang === 'ro' ? "Eroare la citirea fișierului." : "Error reading file."));
      };
      reader.readAsDataURL(file);
    });
  };

  const compressAndResizeImage = (file: File, maxDimension: number = 600): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Could not get 2D canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Could not compress file"));
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }, "image/jpeg", 0.65);
        };
        img.onerror = () => {
          reject(new Error(lang === 'ro' ? "Eroare la încărcarea imaginii pentru procesare." : "Failed to load image for processing."));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => {
        reject(err || new Error(lang === 'ro' ? "Eroare la citirea fișierului." : "Failed to read file."));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveVision = async () => {
    if (!newVisionFile && !newVisionImageUrl.trim()) return;
    setIsUploadingVision(true);
    try {
        let imageUrl = '';
        if (newVisionFile) {
            try {
                // Compress and scale down to ensure tiny payload size (under 1MB limit for firestore & superfast upload)
                const processedFile = await compressAndResizeImage(newVisionFile);
                try {
                    imageUrl = await uploadImageToStorage(processedFile, 'visionBoard');
                } catch (storageError: any) {
                    console.warn("Firebase Storage upload timed out or failed, falling back to compressed local Base64...", storageError);
                    imageUrl = await convertFileToBase64(processedFile);
                }
            } catch (compressError: any) {
                console.error("Image compression failed, trying direct upload as fallback:", compressError);
                try {
                    imageUrl = await uploadImageToStorage(newVisionFile, 'visionBoard');
                } catch (storageError: any) {
                    console.warn("Storage upload failed for original file, using original base64:", storageError);
                    imageUrl = await convertFileToBase64(newVisionFile);
                }
            }
        } else {
            imageUrl = newVisionImageUrl.trim();
        }

        if (!imageUrl) {
            throw new Error(lang === 'ro' ? "Eroare: Nu s-a putut obține adresa URL a imaginii." : "Error: Could not get the image URL.");
        }

        await onAddVisionItem({
            imageUrl,
            quote: newVisionQuote.trim() || undefined
        });
        setNewVisionFile(null);
        setNewVisionImageUrl('');
        setNewVisionQuote('');
        setIsVisionModalOpen(false);
    } catch (error: any) {
        console.error("Failed to upload image:", error);
        alert(lang === 'ro' 
          ? `Eroare la încărcarea imaginii: ${error?.message || error || "Problemă de conexiune sau lipsă permisiuni"}`
          : `Failed to upload image: ${error?.message || error || "Connection error or missing permissions"}`
        );
    } finally {
        setIsUploadingVision(false);
    }
  };

  const handleEditWishlistItem = (item: WishlistItem) => {
      try {
          setEditingWishlistId(item.id);
          setNewWishlistTitle(item.title);
          setNewWishlistPrice(item.price || '');
          setNewWishlistLink(item.storeLink || '');
          setIsWishlistModalOpen(true);
      } catch (error) {
          console.error("Error setting edit wishlist item state:", error);
      }
  };

  const handleOpenWishlistModal = () => {
      setEditingWishlistId(null);
      setNewWishlistTitle('');
      setNewWishlistPrice('');
      setNewWishlistLink('');
      setIsWishlistModalOpen(true);
  };
  
  const handleDeleteWishlistItem = async (id: string, imageUrl?: string) => {
      try {
          if (confirm("Ștergi acest obiect?")) {
              await onDeleteWishlistItem(id, imageUrl);
          }
      } catch (error) {
          console.error("Failed to delete wishlist item:", error);
          alert("Eroare la ștergerea elementului din catalog.");
      }
  };

  const handleSaveWishlist = async () => {
    if (!newWishlistTitle.trim()) return;
    setIsUploadingWishlist(true);
    try {
        let imageUrl = undefined;
        
        if (newWishlistLink.trim()) {
            try {
                const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(newWishlistLink.trim())}`);
                const data = await res.json();
                imageUrl = data.data?.image?.url || data.data?.screenshot?.url || data.data?.logo?.url;
            } catch (e) {
                console.error("Microlink fetch error:", e);
            }
        }
        
        if (!imageUrl && !editingWishlistId) {
            // Default elegant fallback pastel gradient image
            imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80";
        }
        
        if (editingWishlistId) {
             const updates: Partial<WishlistItem> = {
                 title: newWishlistTitle.trim(),
                 price: newWishlistPrice.trim() || undefined,
                 storeLink: newWishlistLink.trim() || undefined
             };
             if (imageUrl) updates.imageUrl = imageUrl;
             await onUpdateWishlistItem(editingWishlistId, updates);
        } else {
             await onAddWishlistItem({
                 title: newWishlistTitle.trim(),
                 price: newWishlistPrice.trim() || undefined,
                 storeLink: newWishlistLink.trim() || undefined,
                 imageUrl: imageUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80"
             });
        }
        
        setNewWishlistTitle('');
        setNewWishlistPrice('');
        setNewWishlistLink('');
        setEditingWishlistId(null);
        setIsWishlistModalOpen(false);
    } catch (error: any) {
        console.error("Failed to save wishlist item:", error);
        alert(`Eroare la salvare: ${error?.message || error || "Verifică conexiunea sau link-ul."}`);
    } finally {
        setIsUploadingWishlist(false);
    }
  };

  return (
    <div className={`flex flex-col w-full px-4 pb-32 lg:pb-8 animate-in slide-in-from-bottom-2 ${isNeon ? 'bg-slate-950 text-slate-200' : 'bg-[#fafafa]'}`}>
      <div className="max-w-5xl w-full mx-auto mt-6">
        
        {/* Header & Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-2 ${textPrimary}`}>
            <Sparkles className="text-pink-400 fill-pink-400" size={28} />
            Inspirație
          </h1>

          <div className={`flex p-1 rounded-full shadow-sm border ${isNeon ? 'bg-slate-900 border-slate-800' : isSoft ? 'bg-white border-pink-100' : 'bg-white border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('vision')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'vision' ? 'shadow-md text-white' : `hover:bg-slate-100 ${textSecondary}`}`}
              style={activeTab === 'vision' ? { backgroundColor: accentColor } : {}}
            >
              <ImageIcon size={16} /> Vision Board
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'wishlist' ? 'shadow-md text-white' : `hover:bg-slate-100 ${textSecondary}`}`}
              style={activeTab === 'wishlist' ? { backgroundColor: accentColor } : {}}
            >
              <ShoppingBag size={16} /> Wishlist
            </button>
          </div>
        </div>

        {/* Vision Board View */}
        {activeTab === 'vision' && (
          <div className="animate-in fade-in duration-300">
             <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {visionItems.length > 0 && (
                   <button
                      onClick={handleShareCollage}
                      disabled={isSharingCollage}
                      className={`px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95 border cursor-pointer ${isNeon ? 'bg-slate-900 border-slate-800 text-pink-400 hover:bg-slate-800' : isSoft ? 'bg-pink-50 border-pink-100 text-pink-600 hover:bg-pink-100' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                   >
                      <Share2 size={18} /> {isSharingCollage ? (lang === 'ro' ? 'Se generează...' : 'Generating...') : (lang === 'ro' ? '📤 Distribuie Vision Board' : '📤 Share Vision Board')}
                   </button>
                )}
                <button
                   onClick={() => setIsVisionModalOpen(true)}
                   className="px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95 text-white sm:ml-auto cursor-pointer"
                   style={{ backgroundColor: accentColor }}
                >
                   <Plus size={18} className="stroke-[3]" /> Adaugă Inspirație
                </button>
             </div>
             
             {visionItems.length === 0 ? (
                 <div className={`flex flex-col items-center justify-center p-12 rounded-[2rem] border-dashed border-2 ${isNeon ? 'border-slate-800 bg-slate-900/50' : isSoft ? 'border-pink-200 bg-pink-50/50' : 'border-slate-200 bg-slate-50'}`}>
                     <ImageIcon size={48} className={`mb-4 ${isNeon ? 'text-slate-600' : 'text-slate-300'}`} />
                     <p className={`text-lg font-medium ${textSecondary}`}>Vision board-ul tău este gol.</p>
                     <p className={`text-sm mt-1 ${isNeon ? 'text-slate-500' : 'text-slate-400'}`}>Adaugă imagini care te inspiră!</p>
                 </div>
             ) : (
                 <div id="vision-board-collage" className="columns-2 md:columns-3 gap-6 space-y-8 pb-12 px-2 bg-inherit rounded-2xl p-4">
                     {visionItems.map((item, index) => {
                         const rotationClass = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-3'][index % 6];
                         const marginClass = ['mt-2', '-mt-4', 'mt-4', '-mt-2', 'mt-1', '-mt-3'][index % 6];
                         return (
                             <div key={item.id} className={`break-inside-avoid relative group animate-in zoom-in-95 duration-300 ${rotationClass} ${marginClass} transition-transform hover:z-10 hover:rotate-0 hover:scale-105 z-0`}>
                                 <div className={`p-2 md:p-3 pb-8 md:pb-12 rounded-sm shadow-md transition-shadow hover:shadow-xl ${isNeon ? 'bg-slate-800' : 'bg-white'}`}>
                                     <img 
                                        src={item.imageUrl} 
                                        alt="Vision board item" 
                                        className="w-full h-auto object-cover rounded-sm shadow-sm"
                                     />
                                     {item.quote && (
                                        <div className={`mt-4 px-2 text-center text-sm md:text-base font-medium italic ${isNeon ? 'text-slate-300' : 'text-slate-700'}`}>
                                           "{item.quote}"
                                        </div>
                                     )}
                                 </div>
                                 <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                     <button 
                                        onClick={async (e) => { 
                                            e.stopPropagation(); 
                                            e.preventDefault();
                                            const quoteStr = item.quote ? `"${item.quote}"` : '';
                                            const text = quoteStr 
                                                ? `✨ Inspirație zilnică:\n${quoteStr}\n\nImagine: ${item.imageUrl}\n\nTrimis din SmartPlanner 🌸`
                                                : `✨ Inspirație zilnică:\nImagine: ${item.imageUrl}\n\nTrimis din SmartPlanner 🌸`;
                                            await handleShare({ 
                                                title: 'Inspirație', 
                                                text,
                                                url: item.imageUrl 
                                            }); 
                                        }}
                                        className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors cursor-pointer hidden"
                                        title={lang === 'ro' ? 'Distribuie' : 'Share'}
                                     >
                                        <Share2 size={16} />
                                     </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); if(confirm(lang === 'ro' ? "Ștergi această imagine?" : "Delete this image?")) onDeleteVisionItem(item.id, item.imageUrl); }}
                                        className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                                        title={lang === 'ro' ? 'Șterge' : 'Delete'}
                                     >
                                        <X size={16} />
                                     </button>
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             )}
          </div>
        )}

        {/* Wishlist View */}
        {activeTab === 'wishlist' && (
          <div className="animate-in fade-in duration-300">
             <div className="mb-6 flex justify-end">
                <button
                   onClick={() => handleOpenWishlistModal()}
                   className="px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95 text-white"
                   style={{ backgroundColor: accentColor }}
                >
                   <ShoppingBag size={18} className="stroke-[2.5]" /> Adaugă Dorință
                </button>
             </div>

             {wishlistItems.length === 0 ? (
                 <div className={`flex flex-col items-center justify-center p-12 rounded-[2rem] border-dashed border-2 ${isNeon ? 'border-slate-800 bg-slate-900/50' : isSoft ? 'border-pink-200 bg-pink-50/50' : 'border-slate-200 bg-slate-50'}`}>
                     <ShoppingBag size={48} className={`mb-4 ${isNeon ? 'text-slate-600' : 'text-slate-300'}`} />
                     <p className={`text-lg font-medium ${textSecondary}`}>Wishlist-ul tău este gol.</p>
                     <p className={`text-sm mt-1 ${isNeon ? 'text-slate-500' : 'text-slate-400'}`}>Adaugă lucruri pe care ți le dorești!</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {wishlistItems.map(item => (
                         <div key={item.id} className={`flex flex-col rounded-[2rem] overflow-hidden shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md ${isNeon ? 'bg-slate-900' : isSoft ? 'bg-white border border-pink-50' : 'bg-white'} ${item.isPurchased ? 'opacity-70' : ''}`}>
                             {item.imageUrl ? (
                                <div className="aspect-square w-full relative">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                    {item.isPurchased && (
                                        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-pink-600 text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                                            <Heart size={12} className="fill-pink-600" /> Bifat!
                                        </div>
                                    )}
                                </div>
                             ) : (
                                <div className={`h-24 w-full flex items-center justify-center relative ${isNeon ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-800' : isSoft ? 'bg-gradient-to-br from-pink-100 to-pink-50' : 'bg-gradient-to-br from-slate-100 to-slate-50'}`}>
                                    <ShoppingBag size={28} className={`opacity-50 ${isNeon ? 'text-slate-500' : 'text-slate-400'}`} />
                                    {item.isPurchased && (
                                        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-pink-600 text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                                            <Heart size={12} className="fill-pink-600" /> Bifat!
                                        </div>
                                    )}
                                </div>
                             )}
                             <div className="p-5 flex flex-col flex-1">
                                 <h3 className={`font-bold text-lg mb-1 leading-tight line-clamp-2 ${item.isPurchased ? 'line-through opacity-70' : ''} ${textPrimary}`}>{item.title}</h3>
                                 {item.price && <p className={`font-medium mb-4 ${isNeon ? 'text-indigo-400' : 'text-indigo-600'}`}>{item.price}</p>}
                                 
                                 <div className="mt-auto flex items-center justify-between gap-2">
                                     <button 
                                        onClick={() => {
                                             const nextPurchased = !item.isPurchased;
                                             if (nextPurchased) {
                                                 confetti({ 
                                                     particleCount: 150, 
                                                     spread: 80, 
                                                     origin: { y: 0.6 }, 
                                                     colors: ['#fbcfe8', '#fce7f3', '#fef4f8', '#fde047'] 
                                                 });
                                             }
                                             onUpdateWishlistItem(item.id, { isPurchased: nextPurchased });
                                         }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-sm border ${item.isPurchased ? (isNeon ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500') : (isNeon ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50')}`}
                                     >
                                         <Heart size={16} className={item.isPurchased ? "fill-current text-pink-500" : ""} />
                                         {item.isPurchased ? 'Obținut' : 'Bifează'}
                                     </button>

                                     <div className="flex items-center gap-1">
                                         {item.storeLink && (
                                             <button 
                                                 onClick={(e) => { 
                                                     e.stopPropagation(); 
                                                     e.preventDefault(); 
                                                     try {
                                                         window.open(item.storeLink, '_blank'); 
                                                     } catch (err) {
                                                         console.error("Failed to open link:", err);
                                                     }
                                                 }}
                                                 className={`p-2 rounded-xl transition-all ${isNeon ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                                                 title="Vizitează Magazinul"
                                             >
                                                 <ExternalLink size={18} />
                                             </button>
                                         )}
                                         <button 
                                             onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleEditWishlistItem(item); }}
                                             className={`p-2 rounded-xl transition-all ${isNeon ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                                         >
                                             <Edit3 size={18} />
                                         </button>
                                         <button 
                                             onClick={async (e) => { 
                                                 e.stopPropagation(); 
                                                 e.preventDefault();
                                                 const priceStr = item.price ? item.price : (lang === 'ro' ? 'Nespecificat' : 'Unspecified');
                                                 const linkStr = item.storeLink ? item.storeLink : (lang === 'ro' ? 'Fără link' : 'No link');
                                                 const text = lang === 'ro'
                                                     ? `🛍️ Mic indiciu pentru cadoul meu ideal:\n• Produs: ${item.title}\n• Preț: ${priceStr}\n• Link magazin: ${linkStr}\n\nSper să îți placă! 🌸✨`
                                                     : `🛍️ Small hint for my ideal gift:\n• Product: ${item.title}\n• Price: ${priceStr}\n• Shop link: ${linkStr}\n\nHope you like it! 🌸✨`;
                                                 await handleShare({ 
                                                     title: lang === 'ro' ? 'Sugestie Cadou' : 'Gift Hint', 
                                                     text,
                                                     ...(item.storeLink ? { url: item.storeLink } : {})
                                                 });
                                             }}
                                             className={`p-2 rounded-xl transition-all ${isNeon ? 'bg-slate-800 text-pink-400 hover:text-pink-300 hover:bg-slate-700' : 'bg-pink-50 text-pink-600 hover:text-pink-700 hover:bg-pink-100'}`}
                                             title={lang === 'ro' ? 'Trimite un indiciu 🎁' : 'Send a hint 🎁'}
                                         >
                                             🎁
                                         </button>
                                         <button 
                                             onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteWishlistItem(item.id, item.imageUrl); }}
                                             className="p-2 rounded-xl transition-all text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                         >
                                             <X size={18} />
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
          </div>
        )}

      </div>

      {/* Add Vision Item Modal */}
      {isVisionModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsVisionModalOpen(false)}></div>
              <div className={`relative w-full max-w-sm rounded-[2rem] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 border ${isNeon ? 'bg-slate-900 border-slate-800' : isSoft ? 'bg-[#fffbf0] border-pink-100' : 'bg-white border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className={`text-2xl font-bold ${textPrimary}`}>Inspirație Nouă</h2>
                      <button onClick={() => setIsVisionModalOpen(false)} className={`p-2 rounded-full transition-colors ${isNeon ? 'hover:bg-slate-800 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                      <div>
                          <label className={`block text-sm font-bold mb-2 ml-1 ${textSecondary}`}>Opțiune 1: Alege din Galerie</label>
                          <label className={`w-full flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-all border-2 border-dashed ${newVisionImageUrl.trim() ? (isNeon ? 'opacity-50 border-slate-700 bg-slate-800 pointer-events-none' : 'opacity-50 border-slate-200 bg-slate-50 pointer-events-none') : (isNeon ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : isSoft ? 'bg-pink-50/50 border-pink-200 hover:border-pink-400' : 'bg-slate-50 border-slate-200 hover:border-slate-400')}`}>
                             {newVisionFile ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden object-cover border">
                                    <img src={URL.createObjectURL(newVisionFile)} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <span className="text-white font-medium text-sm">Schimbă imaginea</span>
                                    </div>
                                </div>
                             ) : (
                                <div className={`flex flex-col items-center text-center ${textSecondary}`}>
                                    <Upload size={24} className="mb-2" />
                                    <span className="font-bold">🖼️ Alege din Galerie</span>
                                </div>
                             )}
                             <input 
                                 type="file"
                                 accept="image/*"
                                 disabled={!!newVisionImageUrl.trim()}
                                 onChange={(e) => {
                                     if (e.target.files && e.target.files[0]) {
                                         setNewVisionFile(e.target.files[0]);
                                         setNewVisionImageUrl('');
                                     }
                                 }}
                                 className="hidden"
                             />
                          </label>
                      </div>

                      <div className="relative flex items-center py-1">
                          <div className={`flex-grow border-t ${isNeon ? 'border-slate-700' : 'border-slate-200'}`}></div>
                          <span className={`flex-shrink-0 mx-4 font-bold text-xs ${textSecondary}`}>SAU</span>
                          <div className={`flex-grow border-t ${isNeon ? 'border-slate-700' : 'border-slate-200'}`}></div>
                      </div>

                      <div>
                          <label className={`block text-sm font-bold mb-2 ml-1 ${textSecondary}`}>Opțiune 2: Link Imagine (URL)</label>
                          <input 
                              type="url"
                              value={newVisionImageUrl}
                              disabled={!!newVisionFile}
                              onChange={(e) => {
                                  setNewVisionImageUrl(e.target.value);
                                  if (e.target.value.trim()) {
                                      setNewVisionFile(null);
                                  }
                              }}
                              placeholder="https://..."
                              className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all border ${!!newVisionFile ? 'opacity-50 pointer-events-none ' : ''}${isNeon ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : isSoft ? 'bg-white border-pink-100 placeholder-slate-300' : 'bg-slate-50 border-slate-200 placeholder-slate-400'}`}
                          />
                      </div>
                      <div>
                          <label className={`block text-sm font-bold mb-2 ml-1 ${textSecondary}`}>Citat / Descriere (opțional)</label>
                          <textarea 
                              value={newVisionQuote}
                              onChange={(e) => setNewVisionQuote(e.target.value)}
                              placeholder="Un gând frumos..."
                              className={`w-full p-4 rounded-2xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all border ${isNeon ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : isSoft ? 'bg-white border-pink-100 placeholder-slate-300' : 'bg-slate-50 border-slate-200 placeholder-slate-400'}`}
                          />
                      </div>
                      <button 
                          onClick={handleSaveVision}
                          disabled={(!newVisionFile && !newVisionImageUrl.trim()) || isUploadingVision}
                          className={`w-full py-4 mt-2 rounded-2xl font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 hover:-translate-y-0.5 flex items-center justify-center gap-2`}
                          style={{ backgroundColor: accentColor }}
                      >
                          {isUploadingVision ? (
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                          ) : 'Adaugă Imagine'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Add Wishlist Item Modal */}
      {isWishlistModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsWishlistModalOpen(false)}></div>
              <div className={`relative w-full max-w-sm rounded-[2rem] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 border ${isNeon ? 'bg-slate-900 border-slate-800' : isSoft ? 'bg-[#fffbf0] border-pink-100' : 'bg-white border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className={`text-2xl font-bold ${textPrimary}`}>Dorință Nouă</h2>
                      <button onClick={() => setIsWishlistModalOpen(false)} className={`p-2 rounded-full transition-colors ${isNeon ? 'hover:bg-slate-800 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                      <div>
                          <label className={`block text-sm font-bold mb-2 ml-1 ${textSecondary}`}>Nume Produs</label>
                          <input 
                              type="text"
                              value={newWishlistTitle}
                              onChange={(e) => setNewWishlistTitle(e.target.value)}
                              placeholder="ex: Geantă pastel..."
                              className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all border ${isNeon ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : isSoft ? 'bg-white border-pink-100 placeholder-slate-300' : 'bg-slate-50 border-slate-200 placeholder-slate-400'}`}
                          />
                      </div>
                      <div className="flex gap-4">
                          <div className="flex-1">
                              <label className={`block text-sm font-bold mb-2 ml-1 ${textSecondary}`}>Preț (opțional)</label>
                              <input 
                                  type="text"
                                  value={newWishlistPrice}
                                  onChange={(e) => setNewWishlistPrice(e.target.value)}
                                  placeholder="ex: 150 RON"
                                  className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all border ${isNeon ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : isSoft ? 'bg-white border-pink-100 placeholder-slate-300' : 'bg-slate-50 border-slate-200 placeholder-slate-400'}`}
                              />
                          </div>
                      </div>
                      <div>
                          <label className={`block text-sm font-bold mb-2 ml-1 ${textSecondary}`}>Link Magazin</label>
                          <input 
                              type="url"
                              value={newWishlistLink}
                              onChange={(e) => setNewWishlistLink(e.target.value)}
                              placeholder="https://..."
                              className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all border ${isNeon ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : isSoft ? 'bg-white border-pink-100 placeholder-slate-300' : 'bg-slate-50 border-slate-200 placeholder-slate-400'}`}
                          />
                      </div>
                      <button 
                          onClick={handleSaveWishlist}
                          disabled={!newWishlistTitle.trim() || isUploadingWishlist}
                          className={`w-full py-4 mt-2 rounded-2xl font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 hover:-translate-y-0.5 flex items-center justify-center gap-2`}
                          style={{ backgroundColor: accentColor }}
                      >
                          {isUploadingWishlist ? (
                              <div className="flex items-center gap-2">
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Se caută imaginea... ✨
                              </div>
                          ) : (editingWishlistId ? 'Actualizează' : 'Adaugă Dorință')}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
