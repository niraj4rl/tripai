export type HotelCardData = {
  id: string
  name: string
  location: string
  address: string
  rating: number
  reviews: string
  pricePerNight: number
  tag: string
  image: string
  saved?: boolean
  amenities: string[]
  highlights: string[]
}

export type DealCardData = {
  id: string
  title: string
  subtitle: string
  image: string
  price: number
  originalPrice: number
  discount: string
  cta: string
}

export const destinationFilters = ['Price: Low to High', 'Price: High to Low', 'Rating', 'Popular']

export const hotelFilters = ['Beach view', 'Breakfast included', 'Free cancellation', 'Family friendly']

export const featuredHotels: HotelCardData[] = [
  {
    id: 'pawana',
    name: 'Sharayu Pawana Lake',
    location: 'Pune, Maharashtra',
    address: 'Pawana, Lonavala road · 18 min from the lake',
    rating: 4.8,
    reviews: '1.2k',
    pricePerNight: 1999,
    tag: 'Lake stay',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80',
    saved: true,
    amenities: ['2 Bed', '1 Bath', 'WiFi', 'Parking'],
    highlights: ['BBQ deck', 'Sunset view', 'Campfire'],
  },
  {
    id: 'woow',
    name: 'Hotel WooW Suites',
    location: 'Pune, Maharashtra',
    address: 'Koregaon Park · boutique stay with quiet interiors',
    rating: 4.7,
    reviews: '986',
    pricePerNight: 2999,
    tag: 'Boutique',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    amenities: ['2 Bed', '2 Bath', 'AC', 'Breakfast'],
    highlights: ['Minimal interiors', 'Workspace', 'Late check-in'],
  },
  {
    id: 'camp',
    name: 'Cool and Fire Camping',
    location: 'Coorg, Karnataka',
    address: 'Valley ridge · premium tented stay',
    rating: 4.9,
    reviews: '2.1k',
    pricePerNight: 2999,
    tag: 'Camping',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80',
    amenities: ['Tents', 'Bonfire', 'Meals', 'Guide'],
    highlights: ['Mountain air', 'Night camp', 'Private trail'],
  },
]

export const dealCards: DealCardData[] = [
  {
    id: 'camping-deal',
    title: 'Cool and Fire Camping',
    subtitle: 'Coorg and Fire Camping',
    image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?auto=format&fit=crop&w=900&q=80',
    price: 2999,
    originalPrice: 25000,
    discount: '40% OFF',
    cta: 'ADD',
  },
  {
    id: 'night-camp',
    title: 'Mid Night Pawan Camp',
    subtitle: 'Coastal tent escape',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    price: 3000,
    originalPrice: 4500,
    discount: '33% OFF',
    cta: 'ADD',
  },
  {
    id: 'party-luxury',
    title: 'Party Package - Imported Liquor + Food',
    subtitle: 'Tap room · premium group night',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80',
    price: 9850,
    originalPrice: 25000,
    discount: '37% OFF',
    cta: 'ADD',
  },
  {
    id: 'party-single',
    title: 'Party Package - Single Malt + Food',
    subtitle: 'Tap room · small group night',
    image: 'https://images.unsplash.com/photo-1541542684-4a3a4f2d2d9b?auto=format&fit=crop&w=900&q=80',
    price: 100500,
    originalPrice: 150000,
    discount: '33% OFF',
    cta: 'ADD',
  },
]

export const amenities = [
  'WiFi',
  'Parking',
  'Air Conditioning',
  'Breakfast',
  'Pool',
  '24h Front Desk',
]

export const tripMetrics = [
  { label: 'Trips planned', value: '12' },
  { label: 'Saved stays', value: '34' },
  { label: 'Budget used', value: '78%' },
]

export const discoveryPills = ['Trending now', 'Weekend stays', 'Lake view', 'City escape', 'Camping']

export const detailAmenities = [
  { label: 'WiFi', icon: 'wifi' },
  { label: 'Parking', icon: 'car' },
  { label: 'Air conditioning', icon: 'snow' },
  { label: 'Breakfast', icon: 'food' },
  { label: '2 Bedrooms', icon: 'bed' },
  { label: '2 Baths', icon: 'bath' },
] as const

export const featuredStats = [
  { label: 'From', value: '₹1,999' },
  { label: 'Rating', value: '4.8' },
  { label: 'Guests', value: '2-4' },
]

export function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value)
}