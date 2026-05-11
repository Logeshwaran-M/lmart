// src/helpers/categoryService.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

// 🔥 Load all categories + subcategories from Firestore
export const fetchCategoryTree = async () => {
  try {
    const snap = await getDocs(collection(db, "categories"));
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Category load error:", err);
    return [];
  }
};

// 🔥 Get unique main categories
export const getMainCategories = (list) => {
  const set = new Set();
  list.forEach((c) => {
    if (c.category) set.add(c.category);
  });
  return ["All Products", ...Array.from(set)];
};

// 🔥 Get unique subcategories from selected main category
export const getSubcategories = (list, mainCategory) => {
  const set = new Set();
  list.forEach((c) => {
    if (mainCategory === "All Products" || c.category === mainCategory) {
      if (c.subcategory) set.add(c.subcategory);
    }
  });
  return ["All", ...Array.from(set)];
};
