import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton, SecondaryButton } from '../components/TripUI'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-gradient-to-b from-sky-50 via-white to-emerald-50 p-6 shadow-soft">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-emerald-100 blur-2xl" />
        <div className="absolute -left-12 bottom-0 h-28 w-28 rounded-full bg-sky-100 blur-xl" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative"
        >
          {/* removed promotional badge as requested */}
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-appText">
            Plan better journeys with one beautiful mobile app.
          </h1>
          <p className="mt-3 text-sm leading-6 text-appMuted">
            Hotels, flights, places, and AI itinerary in a native-feeling travel product.
          </p>
        </motion.div>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-white p-4 shadow-soft">
        <img
          src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1400&q=80"
          alt="Travel collage"
          className="h-56 w-full rounded-3xl object-cover"
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <PrimaryButton onClick={() => navigate('/home')} className="w-full">
            Start Planning
            <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/ai')} className="w-full">
            Ask AI
          </SecondaryButton>
        </div>
      </section>

      {/* Manali spotlight removed as requested */}
    </div>
  )
}
