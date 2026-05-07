import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LoadingScreen } from './components/layout/LoadingScreen'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const LendPage = lazy(() => import('./pages/LendPage'))
const BorrowPage = lazy(() => import('./pages/BorrowPage'))
const PositionPage = lazy(() => import('./pages/PositionPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lend" element={<LendPage />} />
          <Route path="/borrow" element={<BorrowPage />} />
          <Route path="/positions" element={<PositionPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
