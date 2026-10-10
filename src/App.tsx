import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { SafetyHomePage } from "./pages/SafetyHomePage";
import { RoomCheckPage } from "./pages/RoomCheckPage";
import { SafetyQuizPage } from "./pages/SafetyQuizPage";
import { SafetyTeacherPage } from "./pages/SafetyTeacherPage";
import { WeedStartPage } from "./pages/WeedStartPage";
import { WeedBuildPage } from "./pages/WeedBuildPage";
import { WeedResultPage } from "./pages/WeedResultPage";
import { isTeacherAccount } from "./data/setupGuide";
import { useSafetyStore } from "./stores/safetyStore";

function TeacherRoute() {
  const student = useSafetyStore((s) => s.student);
  if (!isTeacherAccount(student.number, student.name)) {
    return <Navigate to="/" replace />;
  }
  return <SafetyTeacherPage />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SafetyHomePage />} />
        <Route path="/room/:roomId" element={<RoomCheckPage />} />
        <Route path="/quiz" element={<SafetyQuizPage />} />
        <Route path="/teacher" element={<TeacherRoute />} />
        <Route path="/weed" element={<WeedStartPage />} />
        <Route path="/weed/build" element={<WeedBuildPage />} />
        <Route path="/weed/result" element={<WeedResultPage />} />
        <Route path="*" element={<SafetyHomePage />} />
      </Routes>
    </HashRouter>
  );
}
