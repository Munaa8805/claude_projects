import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './state/AppState';
import WebLayout from './web/WebLayout';
import Overview from './web/pages/Overview';
import Recovery from './web/pages/Recovery';
import Sleep from './web/pages/Sleep';
import Activity from './web/pages/Activity';
import Workouts, { WorkoutDetail } from './web/pages/Workouts';
import Plan from './web/pages/Plan';
import Insights from './web/pages/Insights';
import Settings from './web/pages/Settings';
import MobileShell from './mobile/MobileShell';
import { MActivity, MPlan, MRecovery, MSleep, MWorkoutDetail, Profile, Today } from './mobile/screens';
import { LiveWorkout, Onboarding, WorkoutSummary } from './mobile/flows';

export default function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route element={<WebLayout />}>
            <Route index element={<Overview />} />
            <Route path="recovery" element={<Recovery />} />
            <Route path="sleep" element={<Sleep />} />
            <Route path="activity" element={<Activity />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="workouts/:id" element={<WorkoutDetail />} />
            <Route path="plan" element={<Plan />} />
            <Route path="insights" element={<Insights />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="m" element={<MobileShell />}>
            <Route index element={<Today />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="recovery" element={<MRecovery />} />
            <Route path="sleep" element={<MSleep />} />
            <Route path="activity" element={<MActivity />} />
            <Route path="plan" element={<MPlan />} />
            <Route path="profile" element={<Profile />} />
            <Route path="workout/live" element={<LiveWorkout />} />
            <Route path="workout/summary" element={<WorkoutSummary />} />
            <Route path="workout/:id" element={<MWorkoutDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}
