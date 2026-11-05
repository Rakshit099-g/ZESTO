import { VscLoading } from "react-icons/vsc";
import AddRestaurant from "../components/AddRestaurant";
import { restaurantApi } from "../services/api";
import type { IMenuItems, IRestaurant } from "../types"
import { useEffect, useState } from "react";
import RestaurantProfile from "../components/RestaurantProfile";
import AddMenuItems from "../components/AddMenuItems";
import MenuItems from "../components/MenuItems";
const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("menu");
  const [menuItems,setMenuItems] = useState<IMenuItems[]>([])

  const fetchMenuItems = async(restaurantId:string)=>{
    try{
      const {data} = await restaurantApi.get(`/api/item/all/${restaurantId}`)
      setMenuItems(data)
    }
    catch(error){
      console.log(error)
    }
  }

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await restaurantApi.get(`api/restaurant/my`)
      setRestaurant(data.restaurant || null)

    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchMyRestaurant()
  }, [])

  useEffect(()=>{
    if (!restaurant?._id) return;
    fetchMenuItems(restaurant?._id)
  },[restaurant])

  if (loading) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <VscLoading className="h-10 w-10 animate-spin text-red-600" />
        <p className="animate-pulse text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Loading restaurant...
        </p>
      </div>
    </div>
  );
  if (!restaurant) return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <RestaurantProfile
          restaurant={restaurant}
          onUpdate={setRestaurant}
          isSeller={true}
        />

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex border-gray-100">
            {[
              { key: "menu", label: "Menu Items" },
              { key: "add-item", label: "Add Item" },
              { key: "sales", label: "Sales" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${tab === t.key
                    ? "border-b-2 border-red-500 text-red-500"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-6">
            {tab === "menu" && <MenuItems items={menuItems} onItemDeleted={()=>fetchMenuItems(restaurant?._id)} isSeller={true}/>}
            {tab === "add-item" && <AddMenuItems onItemAdded = {()=>fetchMenuItems(restaurant?._id)}/>}
            {tab === "sales" && <div>Sales component</div>}
          </div>
        </div>
      </div>
    </div>


  )
}

export default Restaurant