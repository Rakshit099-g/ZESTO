import type { IMenuItems } from "../types";
import MenuItemCard from "./MenuItemCard";

 
interface MenuItemsProps {
  items: IMenuItems[];
  isSeller: boolean;
  onItemDelete: (itemId: string) => void; // delete hone ke baad parent ko batata hai
  onAddToCart?: (item: IMenuItems) => void; // customer ke liye (cart service baad mein)
  onAvailabilityChange: (itemId: string, isAvailable: boolean) => void;
}
 
const MenuItems = ({ items, isSeller, onItemDelete,onAvailabilityChange }: MenuItemsProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {isSeller ? "No menu items yet. Add your first item." : "No items available right now."}
      </div>
    );
  }
 
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <MenuItemCard
          key={item._id}
          item={item}
          isSeller={isSeller}
          onItemDelete={onItemDelete}
          onAvailabilityChange={onAvailabilityChange}
        />
      ))}
    </div>
  );
};
export default MenuItems