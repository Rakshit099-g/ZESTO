import { useEffect, useState } from "react"
import type { IRestaurant } from "../types"
import { useAppData } from "../Context/AppContext"
import { FiMap, FiMapPin } from "react-icons/fi"
import { useSearchParams } from "react-router-dom"
import { restaurantApi } from "../services/api"
import RestaurantCard from "../components/RestaurantCard"

const Home = () => {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const { location } = useAppData()
  const [searchParams] = useSearchParams()
  const search = searchParams.get("search") || ""
  const fetchRestaurants = async () => {
    if (!location?.latitude || !location.longitude) {
      return
    }
    try {
      setLoading(true)
      const { data } = await restaurantApi.get("api/restaurant/all", {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          search
        }
      })
      setRestaurants(data.restaurants ?? [])

    } catch (error) {
      console.log(error)

    } finally {
      setLoading(false)
    }

  }
  useEffect(() => {
    fetchRestaurants()
  }, [location, search])

  if (loading || !location) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 font-sans">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-100 opacity-60"></div>
          <FiMapPin className="relative z-10 h-8 w-8 animate-bounce text-red-600" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          Locating restaurants...
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Scanning your area for the best places to eat.
        </p>
      </div>
    )
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans selection:bg-red-100 selection:text-red-900">
      <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Nearby Restaurants
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Discover great food around you
          </p>
        </div>
        {restaurants.length > 0 && (
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-block">
            {restaurants.length} places
          </span>
        )}
      </div>

      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restaurants.map((rest) => (
            <RestaurantCard
              key={rest._id}
              id={rest._id}
              name={rest.name}
              image={rest.image ?? ""}
              distance={
                Number.isFinite(Number(rest.distanceKm))
                  ? Number(rest.distanceKm).toFixed(2)
                  : "N/A"
              }
              isOpen={rest.isOpen}
            />
          ))}
        </div>) : (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center transition-all hover:bg-slate-50">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100">
            <FiMap className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            No restaurants nearby
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            We couldn't find any places delivering to your current location
            right now. Try expanding your search or checking back later.
          </p>
        </div>
      )}
    </div>
  )
}

export default Home