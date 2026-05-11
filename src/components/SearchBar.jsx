import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import SearchBar from "./SearchBar";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(list);
        setFiltered(list);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // Handle Search
  const handleSearch = (query) => {
    if (!query) {
      setFiltered(products); // show all again
      return;
    }

    const q = query.toLowerCase();

    const results = products.filter((item) =>
      item.searchKeywords &&
      item.searchKeywords.some((keyword) =>
        keyword.toLowerCase().includes(q)
      )
    );

    setFiltered(results);
  };

  return (
    <div className="w-full p-4">
      <SearchBar onSearch={handleSearch} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {filtered.length === 0 ? (
          <p className="text-center w-full col-span-full">No products found</p>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className="border shadow-sm rounded-lg p-2 bg-white"
            >
              <img
                src={product.mainImageUrl}
                alt={product.name}
                className="w-full h-32 object-cover rounded-md"
              />

              <h3 className="mt-2 text-sm font-semibold">{product.name}</h3>
              <p className="text-xs text-gray-500">{product.productTag}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
