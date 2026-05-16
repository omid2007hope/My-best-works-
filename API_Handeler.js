// ! Handler

import { useEffect, useState } from "react";

export function useHandleApi(apiFn) {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchAndLoad() {
      setLoading(true);
      setError("");

      try {
        const data = await apiFn();

        if (!ignore) {
          setDataList(Array.isArray(data) ? data : []);
        }
      } catch (reqError) {
        if (!ignore) {
          setError(
            reqError?.response?.data?.error ||
              reqError?.message ||
              "Could not load any data.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAndLoad();

    return () => {
      ignore = true;
    };
  }, [apiFn]);

  return {
    dataList,
    loading,
    error,
    setDataList,
  };
}

// ! transaction handler

("use client");

import { listSellerProducts } from "@/app/features/seller/services/seller-products-service";
import { useHandleApi } from "@/app/lib/function";

export function useSellerProducts() {
  const {
    dataList: products,
    loading,
    error,
    setDataList: setProducts,
  } = useHandleApi(listSellerProducts);
  return { products, loading, error, setProducts };
}

// ! example of usage

import { useSellerProducts } from "@/app/features/seller/hooks/product/use-seller-products";

export default function SellerProductsOverview() {
  const { products, loading, error, setProducts } = useSellerProducts();

  return (
    <SectionCard id="seller-products" className="max-w-5xl">
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <article
            key={product._id}
            className="flex flex-col rounded-3xl border border-orange-200 bg-orange-50 p-5 transition-all hover:shadow-lg hover:border-amber-300"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-950 line-clamp-2">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  {product.category}
                  {product.subCategory ? ` / ${product.subCategory}` : ""}
                </p>
              </div>
              <div className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-bold text-amber-950 shadow-sm">
                ${Number(product.price || 0).toFixed(2)}
              </div>
            </div>

            <p className="flex-1 line-clamp-3 text-sm text-amber-900">
              {product.description}
            </p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
