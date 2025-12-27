import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Lobby from './pages/Lobby.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ProtectedRoute from './pages/ProtectedRoute.tsx'
import Game from './pages/Game.tsx'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/" element={<App />} >
						<Route index element={<Home />} />
						<Route element={<ProtectedRoute />}>
							<Route path='/dashboard' element={<Dashboard />} />
							<Route path='/lobby/:lobbyId' element={<Lobby />} />
							<Route path='/game/:gameId' element={<Game/>} />
						</Route>
					</Route>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>,
)
