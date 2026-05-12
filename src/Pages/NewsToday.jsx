import React, { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import { useLocation } from 'react-router-dom'
import { 
  X, 
  Calendar, 
  User, 
  Play, 
  Image as ImageIcon,
  ArrowRight,
  Search,
  Filter,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  TrendingUp,
  Tag,
  Phone,
  Mail,
  Building2,
  Hash
} from 'lucide-react'

const NewsToday = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [newsArticles, setNewsArticles] = useState([])
  const [categories, setCategories] = useState(['all'])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const videoRef = useRef(null)
  const location = useLocation()

  /* ---------- DATE FORMAT ---------- */
  const formatDate = (date) => {
    if (!date) return ''
    if (date?.toDate) {
      const d = date.toDate()
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    return date
  }

  /* ---------- TIME AGO FORMAT ---------- */
  const formatTimeAgo = (date) => {
    if (!date) return ''
    const now = new Date()
    const articleDate = date?.toDate ? date.toDate() : new Date(date)
    const diffMs = now - articleDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(date)
  }

  /* ---------- RESET FILTER ---------- */
  useEffect(() => {
    if (location.state?.resetFilters) {
      setSelectedCategory('all')
      setSearchTerm('')
      setSelectedArticle(null)
    }
  }, [location.state])

  /* ---------- FETCH NEWS ---------- */
  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'))

    const unsub = onSnapshot(q, (snap) => {
      const articles = snap.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          title: d.title || 'Untitled',
          excerpt: d.excerpt || '',
          content: d.excerpt || '',
          category: d.category || 'General',
          author: d.author || 'Admin',
          date: formatDate(d.date || d.createdAt),
          timeAgo: formatTimeAgo(d.createdAt),
          
          // ✅ MEDIA
          mainImage: d.mainImageUrl || null,
          mainImagePath: d.mainImagePath || null,
          gallery: Array.isArray(d.gallery) ? d.gallery : [],
          galleryPaths: Array.isArray(d.galleryPaths) ? d.galleryPaths : [],
          videoUrl: d.videoUrl || null,
          videoPath: d.videoPath || null,

          // ✅ NEW FIELDS
          location: d.location || '',
          marketRates: Array.isArray(d.marketRates) ? d.marketRates : [],

          // ✅ NEW FIELDS
          location: d.location || '',
          marketRates: Array.isArray(d.marketRates) ? d.marketRates : [],

          hasVideo: !!d.videoUrl,
          hasGallery: (Array.isArray(d.gallery) && d.gallery.length > 0) || (Array.isArray(d.galleryPaths) && d.galleryPaths.length > 0),
          createdAt: d.createdAt,
        }
      })

      setNewsArticles(articles)
      setCategories(['all', ...new Set(articles.map(a => a.category))])
      setLoading(false)
    })

    return () => unsub()
  }, [])

  /* ---------- FILTER ---------- */
  const filtered = newsArticles.filter(a => {
    const cat = selectedCategory === 'all' || a.category === selectedCategory
    const txt =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return cat && txt
  })

  /* ---------- CLOSE MODAL ---------- */
  const closeModal = () => {
    setSelectedArticle(null)
    setCurrentGalleryIndex(0)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  /* ---------- GALLERY NAVIGATION ---------- */
  const nextGalleryImage = () => {
    if (selectedArticle?.gallery) {
      setCurrentGalleryIndex((prev) => 
        prev === selectedArticle.gallery.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevGalleryImage = () => {
    if (selectedArticle?.gallery) {
      setCurrentGalleryIndex((prev) => 
        prev === 0 ? selectedArticle.gallery.length - 1 : prev - 1
      )
    }
  }

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center">
        <div className="relative">
          <div className="h-24 w-24 border-4 border-purple-200 rounded-full"></div>
          <div className="absolute top-0 left-0 h-24 w-24 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading news...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      

      {/* CATEGORY BAR */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
              <Filter size={16} className="inline mr-2" />
              Categories:
            </span>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === c
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c === 'all' ? '✨ All News' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-600">
          Showing <span className="font-bold text-purple-600">{filtered.length}</span> of {newsArticles.length} articles
        </p>
      </div>

      {/* NEWS GRID */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <Search size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No articles found</h3>
            <p className="text-gray-500">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(article => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer overflow-hidden
                         transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                {/* MEDIA PREVIEW */}
                <div className="h-56 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  {article.mainImage ? (
                    <img
                      src={article.mainImage}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={article.title}
                    />
                  ) : article.hasVideo ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full 
                                      flex items-center justify-center group-hover:scale-110 transition-transform duration-300
                                      shadow-xl shadow-purple-200">
                          <Play size={32} className="text-white ml-1" fill="white" />
                        </div>
                        <div className="absolute inset-0 animate-ping bg-purple-400 rounded-full opacity-20"></div>
                      </div>
                      <span className="text-sm mt-4 font-semibold text-purple-700 bg-white/80 px-3 py-1 rounded-full">
                        Video News
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-300" />
                    </div>
                  )}
                  
                  {/* CATEGORY BADGE */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-purple-700 px-3 py-1 
                                   rounded-full text-xs font-bold shadow-sm">
                      {article.category}
                    </span>
                  </div>

                  {/* MEDIA TYPE BADGES */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {article.hasVideo && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        <Play size={10} className="inline mr-1" /> VIDEO
                      </span>
                    )}
                    {article.hasGallery && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        <ImageIcon size={10} className="inline mr-1" /> GALLERY
                      </span>
                    )}
                  </div>

                  {/* TIME AGO */}
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                      <Clock size={10} className="inline mr-1" />
                      {article.timeAgo}
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <h3 className="font-bold text-xl line-clamp-2 mb-3 group-hover:text-purple-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  
                  {/* AUTHOR & DATE */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-500">{article.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-500">{article.date}</span>
                    </div>
                  </div>

                  {/* LOCATION */}
                  {article.location && (
                    <div className="flex items-center gap-2 mt-2 text-gray-500">
                      <MapPin size={14} className="text-purple-500" />
                      <span className="text-xs font-medium uppercase tracking-wider">{article.location}</span>
                    </div>
                  )}

                  {/* READ MORE BUTTON */}
                  <button className="mt-4 w-full py-3 bg-gradient-to-r from-gray-50 to-gray-100 
                                   rounded-lg text-purple-600 font-semibold flex items-center justify-center gap-2
                                   group-hover:from-purple-50 group-hover:to-purple-100 transition-all duration-300">
                    Read Full Story
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50">
          {/* BACKDROP */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* MODAL CONTENT */}
          <div className="relative h-full overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <div 
                className="bg-white max-w-4xl w-[1200px] rounded-2xl overflow-hidden shadow-2xl
                          transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* HEADER */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10">
                  <div className="flex justify-between items-center p-6">
                    <div className="flex items-center gap-3">
                      <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                                     px-4 py-2 rounded-full font-bold shadow-lg">
                        {selectedArticle.category}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User size={14} />
                        <span>{selectedArticle.author}</span>
                        <Calendar size={14} className="ml-4" />
                        <span>{selectedArticle.date}</span>
                        {selectedArticle.location && (
                          <>
                            <MapPin size={14} className="ml-4 text-purple-600" />
                            <span className="font-semibold text-purple-700">{selectedArticle.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="max-h-[80vh] overflow-y-auto">
                  {/* MAIN IMAGE */}
                  {selectedArticle.mainImage && (
                    <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center relative">
                      <img
                        src={selectedArticle.mainImage}
                        className="max-h-full max-w-full object-contain p-4"
                        alt=""
                      />
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        Featured Image
                      </div>
                    </div>
                  )}

                  {/* VIDEO CONTENT */}
                  {selectedArticle.hasVideo && (
                    <div className="px-8 pt-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Play size={24} className="text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Video Content
                          </h3>
                          <p className="text-gray-600">Watch the full story</p>
                        </div>
                      </div>
                      <div className="relative rounded-xl overflow-hidden shadow-xl">
                        <video
                          ref={videoRef}
                          src={selectedArticle.videoUrl}
                          controls
                          controlsList="nodownload"
                          className="w-full h-auto bg-black"
                          poster={selectedArticle.mainImage}
                        />
                        <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
                          Click to play
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GALLERY */}
                  {selectedArticle.gallery.length > 0 && (
                    <div className="px-8 pt-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ImageIcon size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              Photo Gallery
                            </h3>
                            <p className="text-gray-600">
                              {selectedArticle.gallery.length} photos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={prevGalleryImage}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <span className="text-sm text-gray-600">
                            {currentGalleryIndex + 1} / {selectedArticle.gallery.length}
                          </span>
                          <button
                            onClick={nextGalleryImage}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </div>
                      </div>
                      <div className="relative h-96 rounded-xl overflow-hidden mb-4">
                        <img
                          src={selectedArticle.gallery[currentGalleryIndex]}
                          className="w-full h-full object-contain bg-gray-50"
                          alt={`Gallery image ${currentGalleryIndex + 1}`}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white text-sm">
                            Image {currentGalleryIndex + 1} of {selectedArticle.gallery.length}
                          </p>
                        </div>
                      </div>
                      {selectedArticle.gallery.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedArticle.gallery.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentGalleryIndex(i)}
                              className={`h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                i === currentGalleryIndex 
                                  ? 'border-purple-600 ring-2 ring-purple-200' 
                                  : 'border-transparent hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={img}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONTENT */}
                  <div className="p-8">
                    <h1 className="text-4xl font-bold mb-6 text-gray-900 leading-tight">
                      {selectedArticle.title}
                    </h1>
                    
                    <div className="prose prose-lg max-w-none">
                      <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        {selectedArticle.excerpt}
                      </p>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl mb-8">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {selectedArticle.content}
                        </p>
                      </div>

                      {/* MARKET RATES */}
                      {selectedArticle.marketRates && selectedArticle.marketRates.length > 0 && (
                        <div className="mt-8">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Phone size={24} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                Contact Details
                              </h3>
                              <p className="text-gray-600">Connect with the provider</p>
                            </div>
                          </div>
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
                            {/* Standard Location Field */}
                            {selectedArticle.location && (
                              <div className="flex gap-2 text-lg">
                                <span className="text-gray-900 font-bold min-w-[100px]">Location:</span>
                                <span className="text-gray-700">{selectedArticle.location}</span>
                              </div>
                            )}

                            {/* Contact Details / Market Rates */}
                            {selectedArticle.marketRates.map((rate, index) => {
                              const labels = [
                                { first: "Name", second: "Email" },
                                { first: "Phone", second: "Address" },
                                { first: "City", second: "Pincode" }
                              ];
                              const currentLabel = labels[index] || { first: "Label", second: "Value" };

                              return (
                                <React.Fragment key={`rate-group-${index}`}>
                                  {rate.itemName && (
                                    <div className="flex gap-2 text-lg">
                                      <span className="text-gray-900 font-bold min-w-[110px]">{currentLabel.first}:</span>
                                      <span className="text-gray-700">{rate.itemName}</span>
                                    </div>
                                  )}
                                  {rate.price && (
                                    <div className="flex gap-2 text-lg">
                                      <span className="text-gray-900 font-bold min-w-[110px]">{currentLabel.second}:</span>
                                      <span className="text-gray-700">{rate.price}</span>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-wrap gap-4 pt-8 border-t">
                      <button
                        onClick={closeModal}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                                 text-white rounded-xl font-semibold hover:shadow-lg 
                                 hover:shadow-purple-200 transition-all duration-300
                                 flex items-center gap-2"
                      >
                        <ChevronLeft size={20} />
                        Back to News
                      </button>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsToday