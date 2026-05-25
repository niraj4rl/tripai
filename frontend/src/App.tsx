import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Hotels from './pages/Hotels'
import HotelDetail from './pages/HotelDetail'
import Flights from './pages/Flights'
import Planner from './pages/Planner'
import Saved from './pages/Saved'
import SavedTripDetail from './pages/SavedTripDetail'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/dashboard"
              element={<Navigate to="/home" replace />}
            />

            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotels/:hotelId" element={<HotelDetail />} />
            
            <Route path="/flights" element={<Flights />} />
            
            <Route path="/ai" element={<Planner />} />
            
            <Route path="/saved" element={<Saved />} />
            <Route path="/saved/:tripId" element={<SavedTripDetail />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
