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
    <div className="grid grid-cols-3 gap-6 p-6">
      {filtered.map((p) => (
        <Link
          key={p.id}
          to={`/product/${p.id}`}
          className="border rounded-lg p-4 shadow hover:shadow-lg transition"
        >
          <img
            src={p.images[0]}
            alt={p.name}
            className="w-full h-64 object-fill mb-2"
          />
          <h2 className="font-bold text-lg text-gray-700">{p.name}</h2>
          <p className="text-gray-600 capitalize">
            {p.gender} · {p.category}
          </p>
        </Link>
      ))}
    </div>
  );
}
