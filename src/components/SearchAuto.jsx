import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function SearchAuto() {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();

  // Fetch products once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = collection(db, "products");
        const snap = await getDocs(ref);

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllProducts(list);
      } catch (err) {
        console.log("Error fetching:", err);
      }
    };

    fetchData();
  }, []);

  // Live suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase();

    const filtered = allProducts.filter((p) =>
      p.searchKeywords?.some((k) => k.toLowerCase().includes(q))
    );

    setSuggestions(filtered.slice(0, 6)); // show max 6
  }, [query, allProducts]);

  // Submit Search
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    navigate(`/search?q=${query.trim()}`);
    setSuggestions([]);
    setQuery("");
  };

  const handleSelectSuggestion = (value) => {
    navigate(`/search?q=${value}`);
    setSuggestions([]);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Box */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white shadow-lg rounded-full px-4 py-2 gap-3"
      >
        <input
          type="text"
          value={query}
          placeholder="Search products..."
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {/* Suggestions Box */}
      {suggestions.length > 0 && (
        <div className="absolute top-14 left-0 w-full bg-white shadow-lg rounded-lg border z-50 overflow-hidden">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
              onClick={() => handleSelectSuggestion(item.name)}
            >
              <img
                src={item.mainImageUrl}
                alt={item.name}
                className="w-10 h-10 rounded object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-gray-500">{item.productTag}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchAuto;
