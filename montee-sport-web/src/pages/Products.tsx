import { fetchProducts } from "../data/products";
import type { Product } from "../data/products";
import { Link, useLocation, useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";

const Products = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const series = query.get("series");
  const category = query.get("category");
  const colorway = query.get("colorway");
  const gender = query.get("gender");

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load products");
        setLoading(false);
      });
  }, []);

  const filtered = products.filter(
    (p) =>
      (!gender || p.gender === gender) &&
      (!category || p.category === category)
  );

  // Get unique products by filtering duplicates across genders
  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return products.filter((product) => {
      const key = `${product.series}-${product.category}-${product.colorway}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return uniqueProducts;
    return uniqueProducts.filter(product => product.category.toLowerCase() === selectedCategory);
  }, [uniqueProducts, selectedCategory]);

  // Debug output for troubleshooting
  if (loading) return <div className="p-10">Loading products...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;
  // Debug: show product count and sample data
  if (!loading && !error) {
    console.info('Products loaded:', products.length, products);
  }

  // If series, category, and colorway are specified, show gender variants
  if (series && category && colorway) {
    const variantProducts = products.filter(
      (p) => 
        p.series === series && 
        p.category === category && 
        p.colorway === colorway
    );

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 p-10">
        {variantProducts.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group transition-transform duration-200"
          >
            <div className="flex justify-center aspect-[3/4]">
              <img
                src={
                  hoveredId === p.id
                    ? (p.images && p.images[2] ? p.images[2].replace(/^\.\.\/\.\.\/images\//, '/images/') : p.images[0]?.replace(/^\.\.\/\.\.\/images\//, '/images/') || "")
                    : (p.images && p.images[1] ? p.images[1].replace(/^\.\.\/\.\.\/images\//, '/images/') : p.images[0]?.replace(/^\.\.\/\.\.\/images\//, '/images/') || "")
                }
                alt={p.name}
                className="w-full h-full object-cover rounded-xl transition-opacity duration-300"
              />
            </div>
            <div className="mt-4">
              <h2 className="font-medium text-base text-gray-800">{p.name}</h2>
              <p className="text-gray-500 text-sm capitalize mt-1">
                {p.gender} · {p.category}
              </p>
              {p.discount ? (
                <div className="mt-2 flex items-center justify-start gap-2">
                  <div className="flex items-center space-x-2">
                    <p className="text-black font-bold text-base">
                      Rp {(p.price - (p.price * p.discount) / 100).toLocaleString("id-ID")}
                    </p>
                    <p className="text-gray-400 line-through text-sm">
                      Rp{p.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="text-red-600 border border-red-600 text-xs font-medium px-2 py-0.5 rounded">
                    -{p.discount}%
                  </span>
                </div>
              ) : (
                <p className="text-black font-bold text-base mt-2">
                  Rp{p.price.toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (gender || (gender && category)) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 p-10">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group transition-transform duration-200"
          >
            {/* Product Image */}
            <div className="flex justify-center aspect-[3/4]">
              <img
                src={
                  hoveredId === p.id
                    ? (p.images && p.images[2] ? p.images[2].replace(/^\.\.\/\.\.\/images\//, '/images/') : p.images[0]?.replace(/^\.\.\/\.\.\/images\//, '/images/') || "")
                    : (p.images && p.images[1] ? p.images[1].replace(/^\.\.\/\.\.\/images\//, '/images/') : p.images[0]?.replace(/^\.\.\/\.\.\/images\//, '/images/') || "")
                }
                alt={p.name}
                className="w-full h-full object-cover rounded-xl transition-opacity duration-300"
              />
            </div>

            {/* Product Info */}
            <div className="mt-4">
              <h2 className="font-medium text-base text-gray-800">{p.name}</h2>
              <p className="text-gray-500 text-sm capitalize mt-1">
                {p.gender} · {p.category}
              </p>

              {/* Price Section */}
              {p.discount ? (
                <div className="mt-2 flex items-center justify-start gap-2">
                  <div className="flex items-center space-x-2">
                    {/* Discounted Price */}
                    <p className="text-black font-bold text-base">
                      Rp{" "}
                      {(p.price - (p.price * p.discount) / 100).toLocaleString(
                        "id-ID"
                      )}
                    </p>

                    {/* Original Price (crossed out) */}
                    <p className="text-gray-400 line-through text-sm">
                      Rp{p.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Discount Percentage Badge */}
                  <span className="text-red-600 border border-red-600 text-xs font-medium px-2 py-0.5 rounded">
                    -{p.discount}%
                  </span>
                </div>
              ) : (
                // Normal price when no discount
                <p className="text-black font-bold text-base mt-2">
                  Rp{p.price.toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // Show categorized product list
  return (
    <div className="p-10">
      {/* Category Navigation */}
      <div className="flex justify-center gap-8 mb-10">
        <button 
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-lg ${
            selectedCategory === "all" 
              ? "bg-black text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          All
        </button>
        <button 
          onClick={() => setSelectedCategory("cycling")}
          className={`px-4 py-2 rounded-lg ${
            selectedCategory === "cycling" 
              ? "bg-black text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Cycling
        </button>
        <button 
          onClick={() => setSelectedCategory("running")}
          className={`px-4 py-2 rounded-lg ${
            selectedCategory === "running" 
              ? "bg-black text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Running
        </button>
        <button 
          onClick={() => setSelectedCategory("padel")}
          className={`px-4 py-2 rounded-lg ${
            selectedCategory === "padel" 
              ? "bg-black text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Padel
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {filteredProducts.map((p) => (
          <Link
            key={p.id}
            to={`/products?series=${p.series}&category=${p.category}&colorway=${p.colorway}`}
            className="space-y-6 hover:opacity-90 transition-opacity"
          >
            <div className="flex justify-center aspect-[3.5/4]">
              <img
                src={p.images && p.images[0] ? p.images[0].replace(/^\.\.\/\.\.\/images\//, '/images/') : ""}
                alt={p.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="mt-4">
              <h2 className="font-medium text-base text-gray-800">{p.name}</h2>
              <p className="text-gray-500 text-sm capitalize mt-1">{p.category}</p>
              {p.discount ? (
                <div className="mt-2 flex items-center justify-start gap-2">
                  <div className="flex items-center space-x-2">
                    <p className="text-black font-bold text-base">
                      Rp {(p.price - (p.price * p.discount) / 100).toLocaleString("id-ID")}
                    </p>
                    <p className="text-gray-400 line-through text-sm">
                      Rp{p.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="text-red-600 border border-red-600 text-xs font-medium px-2 py-0.5 rounded">
                    -{p.discount}%
                  </span>
                </div>
              ) : (
                <p className="text-black font-bold text-base mt-2">
                  Rp{p.price.toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Products;
