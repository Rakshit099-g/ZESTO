import { useEffect, useState } from "react";
import type { IMenuItems } from "../types";
import { restaurantApi } from "../services/api";
import toast from "react-hot-toast";
import { BiCartAdd, BiHide, BiLoaderAlt, BiShow, BiTrash } from "react-icons/bi";


interface CardProps {
  item: IMenuItems;
  isSeller: boolean;
  onItemDelete: (itemId: string) => void;
  onAddToCart?: (item: IMenuItems) => void;
  onAvailabilityChange: (itemId: string, isAvailable: boolean) => void;
}
const MenuItemCard = ({ item, isSeller, onItemDelete, onAddToCart,onAvailabilityChange }: CardProps) => {
  const [available, setAvailable] = useState(item.isAvailable);
  const [imgError, setImgError] = useState(false);
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);
 
  // parent ne naya data diya (refetch) toh local state sync kar do
//   useEffect(() => {
//     setAvailable(item.isAvailable);
//   }, [item.isAvailable]);
 
  const toggleAvailability = async () => {
    if (busy) return;
    setBusy("toggle")
    setAvailable(!available)
    try {
      const {data} = await restaurantApi.put(`/api/item/status/${item._id}`);
      const nowAvailable: boolean = data.item.isAvailable;
      onAvailabilityChange(item._id, nowAvailable);
      toast.success(nowAvailable ? `${item.name} is now available` : `${item.name} is now unavailable`);
      
    } catch (error:any) {
      toast.error(error?.response?.data?.message || "Update not available");
    } finally {
      setBusy(null);
    }
  };
 
  const deleteItem = async () => {
    if (busy) return;
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      await restaurantApi.delete(`/api/item/${item._id}`);
      toast.success("Item deleted");
      onItemDelete(item._id);
    } catch (error:any) {
      toast.error(error?.response?.data?.message || "Could not delete item");
    } finally {
      setBusy(null);
    }
  };
 
  const addToCart = () => {
    if (!available) return;
    if (onAddToCart) onAddToCart(item);
    else toast("Cart is coming soon");
  };
 
  return (
        <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Left: image */}
      <div className="relative h-28 w-28 shrink-0 bg-gray-100 sm:h-32 sm:w-32">
        {item.image && !imgError ? (
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition ${available ? "" : "grayscale opacity-60"}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e23744] to-[#ff6b76] text-3xl font-bold text-white">
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
        {!available && (
          <span className="absolute inset-x-0 bottom-0 bg-gray-900/75 py-0.5 text-center text-[10px] font-semibold text-white">
            Unavailable
          </span>
        )}
      </div>
 
      {/* Right: name, description, price + actions */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold leading-tight text-gray-900">{item.name}</h3>
          {item.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</p>}
        </div>
 
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
 
          {isSeller ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleAvailability}
                disabled={busy !== null}
                aria-pressed={available}
                aria-label={available ? "Mark as unavailable" : "Mark as available"}
                title={available ? "Available: click to hide from customers" : "Unavailable: click to show to customers"}
                className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors disabled:opacity-60 ${
                  available
                    ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    : "border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {busy === "toggle" ? (
                  <BiLoaderAlt className="animate-spin text-lg" />
                ) : available ? (
                  <BiShow className="text-lg" />
                ) : (
                  <BiHide className="text-lg" />
                )}
              </button>
 
              <button
                type="button"
                onClick={deleteItem}
                disabled={busy !== null}
                aria-label={`Delete ${item.name}`}
                title="Delete item"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
              >
                {busy === "delete" ? <BiLoaderAlt className="animate-spin text-lg" /> : <BiTrash className="text-lg" />}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={addToCart}
              disabled={!available}
              className="flex items-center gap-1.5 rounded-md bg-[#e23744] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#c92f3b] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              <BiCartAdd className="text-base" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default MenuItemCard