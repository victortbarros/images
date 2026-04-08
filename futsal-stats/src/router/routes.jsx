import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { Dashboard } from '../pages/Dashboard'
import { Elenco } from '../pages/Elenco'
import { EstatisticasJogador } from '../pages/EstatisticasJogador'
import { Partidas } from '../pages/Partidas'
import { NovaPartida } from '../pages/NovaPartida'
import { DetalhePartida } from '../pages/DetalhePartida'
import { Estatisticas } from '../pages/Estatisticas'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'elenco', element: <Elenco /> },
      { path: 'elenco/:id', element: <EstatisticasJogador /> },
      { path: 'partidas', element: <Partidas /> },
      { path: 'partidas/nova', element: <NovaPartida /> },
      { path: 'partidas/:id', element: <DetalhePartida /> },
      { path: 'estatisticas', element: <Estatisticas /> },
    ],
  },
])
