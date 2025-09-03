// web/src/pages/Products.tsx
import { products } from "../data/products";
import { Link, useLocation } from "react-router-dom";

export default function Products() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const gender = query.get("gender");
  const category = query.get("category");

  const filtered = products.filter(
    (p) =>
      (!gender || p.gender === gender) &&
      (!category || p.category === category)
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 p-10">
      {filtered.map((p) => (
        <Link
          key={p.id}
          to={`/product/${p.id}`}
          className="group transition-transform duration-200 hover:scale-105"
        >
          {/* Product Image */}
          <div className="flex justify-center">
            <img
              src={p.images[0]}
              alt={p.name}
              className="w-full h-full object-cover rounded-xl"
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
                    Rp{(p.price - (p.price * p.discount) / 100).toLocaleString("id-ID")}
                    </p>

                    {/* Original Price (crossed out) */}
                    <p className="text-gray-400 line-through text-sm">Rp{p.price.toLocaleString("id-ID")}</p>
                </div>

                {/* Discount Percentage Badge */}
                <span className="text-red-600 border border-red-600 text-xs font-medium px-2 py-0.5 rounded">
                    -{p.discount}%
                </span>
                </div>
            ) : (
                // Normal price when no discount
                <p className="text-black font-bold text-base mt-2">Rp{p.price.toLocaleString("id-ID")}</p>
            )}
            </div>

        </Link>
      ))}
    </div>
  );
}
