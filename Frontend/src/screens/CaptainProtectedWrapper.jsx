import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCaptain } from "../contexts/CaptainContext";
import VerifyEmail from "../components/VerifyEmail";
import Loading from "./Loading";

// Demo mode: skip login/backend and preview the captain dashboard with mock data.
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const DEMO_CAPTAIN = {
  _id: "demo-captain-001",
  email: "demo.captain@quickride.app",
  phone: "+92 300 1234567",
  fullname: { firstname: "Ali", lastname: "Khan" },
  vehicle: { color: "White", number: "ABC-123", capacity: 4, type: "car" },
  status: "active",
  emailVerified: true,
  rides: [
    { status: "completed", fare: 350, distance: 8200, updatedAt: new Date().toISOString() },
    { status: "completed", fare: 220, distance: 5400, updatedAt: new Date().toISOString() },
    { status: "completed", fare: 480, distance: 12300, updatedAt: "2024-01-10T10:00:00Z" },
    { status: "cancelled", fare: 0, distance: 0, updatedAt: "2024-01-09T10:00:00Z" },
  ],
};

function CaptainProtectedWrapper({ children }) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { captain, setCaptain } = useCaptain();

  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(null);

  useEffect(() => {
    // --- Demo bypass: no backend required ---
    if (DEMO_MODE) {
      setCaptain(DEMO_CAPTAIN);
      setIsVerified(true);
      setLoading(false);
      return;
    }

    if (!token) {
      navigate("/captain/login");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/captain/profile`, {
        headers: {
          token: token,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const captain = response.data.captain;
          setCaptain(captain);
          localStorage.setItem(
            "userData",
            JSON.stringify({ type: "captain", data: captain, }));
        }
        setIsVerified(captain.emailVerified)
      })
      .catch((err) => {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/captain/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) return <Loading />;

  if (isVerified === false) {
    return <VerifyEmail user={captain} role={"captain"} />;
  }

  return <>{children}</>;
}

export default CaptainProtectedWrapper;
