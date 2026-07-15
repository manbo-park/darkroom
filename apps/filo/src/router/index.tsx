import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SplashScreen } from '@/screens/SplashScreen';
import { FilmListScreen } from '@/screens/FilmListScreen';
import { ShootingScreen } from '@/screens/ShootingScreen';
import { RollDetailScreen } from '@/screens/RollDetailScreen';
import { MasterDataScreen } from '@/screens/MasterDataScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { TutorialScreen } from '@/screens/TutorialScreen';

export const router = createBrowserRouter([
    { path: '/', element: <SplashScreen /> },
    { path: '/tutorial', element: <TutorialScreen /> },
    { path: '/rolls', element: <FilmListScreen /> },
    { path: '/rolls/:rollId', element: <RollDetailScreen /> },
    { path: '/shoot', element: <ShootingScreen /> },
    { path: '/master', element: <MasterDataScreen /> },
    { path: '/settings', element: <SettingsScreen /> },
    { path: '*', element: <Navigate to="/" replace /> },
]);
