import Subscription from "./pages/Subscription";
import MySubscription from "./pages/MySubscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./pages/AdminRoute";
import AdminCharities from "./pages/AdminCharities";
import AdminDraws from "./pages/AdminDraws";
import AdminUsers from "./pages/AdminUsers";
import AdminContributions from "./pages/AdminContributions";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  Flag,
  Trophy,
  Heart,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  CalendarDays,
  Target,
  ArrowUpRight,
  CircleUserRound,
  RefreshCw,Users
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Auth from "./pages/Auth";
import Scores from "./pages/Scores";
import Draws from "./pages/Draws";
import api from "./api";
import DonationHistory from "./pages/DonationHistory";
import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("dh_token");
  return token ? children : <Navigate to="/login" replace />;
}

function formatScoreDate(date) {
  if (!date) return "—";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDrawMonth(month) {
  if (!month) return "Monthly draw";

  const [year, monthNumber] = month.split("-");
  return new Date(Number(year), Number(monthNumber) - 1, 1)
    .toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scores, setScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [scoresError, setScoresError] = useState("");

  const [draws, setDraws] = useState([]);
  const [drawsLoading, setDrawsLoading] = useState(true);
  const [drawsError, setDrawsError] = useState("");


  const navigate = useNavigate();
  const location = useLocation();
  const isDonationHistoryPage =
  location.pathname === "/donation-history";
  

// const handleLogout = () => {
//   localStorage.removeItem("dh_token");
//   localStorage.removeItem("token");
//   navigate("/login", { replace: true });
// };

const isMySubscriptionPage =
  location.pathname === "/my-subscription";

  const isScoresPage = location.pathname === "/scores";
  const isDrawsPage = location.pathname === "/draws";
  const isCharityPage = location.pathname === "/charity";
const isSubscriptionPage = location.pathname === "/subscription";
const isAdminPage = location.pathname === "/admin";
const isAdminCharitiesPage = location.pathname === "/admin/charities";
const isAdminDrawsPage = location.pathname === "/admin/draws";
const isAdminUsersPage = location.pathname === "/admin/users";
const isAdminContributionsPage =
  location.pathname === "/admin/contributions";
  const isSettingsPage = location.pathname === "/settings";

  const pageTitle =isAdminContributionsPage
  ? "Contribution Management"
  :
  isAdminUsersPage
  ? "User Management"
  : 
  isAdminDrawsPage
  ? "Draw Management"
  :
  isAdminCharitiesPage
    ? "Charity Management"
    :
  isAdminPage
  ? "Admin Dashboard" 
  :isScoresPage
  ? "My Scores"
  : isDrawsPage
    ? "Draw Results"
    : isSettingsPage
  ? "Settings"
    : isCharityPage
      ? "My Charity"
      : isSubscriptionPage
        ? "Subscription": isMySubscriptionPage
          ? "My Subscription"
          : isDonationHistoryPage
            ? "Donation History"
        : "Dashboard";

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "My Scores", icon: Flag, path: "/scores" },
    { label: "Draw Results", icon: Trophy, path: "/draws" },
    { label: "My Charity", icon: Heart, path: "/charity" },
    { label: "Subscription", icon: CreditCard, path: "/subscription" },
    { label: "Settings", icon: Settings, path: "/settings" },
    {
  label: "Draw Management",
  icon: Trophy,
  path: "/admin/draws",
},
{
  label: "User Management",
  icon: Users,
  path: "/admin/users",
},
{
  label: "Contribution Management",
  icon: Heart,
  path: "/admin/contributions",
},
    {
  label: "Charity Management",
  icon: Heart,
  path: "/admin/charities",
},
    {
  label: "My Subscription",
  icon: CreditCard,
  path: "/my-subscription",
},
{
  label: "Donation History",
  path: "/donation-history",
  icon: Heart,
},
{ label: "Admin Dashboard", icon: LayoutDashboard, path: "/admin" },
  ];

  const loadDashboardScores = useCallback(async () => {
    setScoresLoading(true);
    setScoresError("");

    try {
      const response = await api.get("/scores");
      setScores(response.data.data || []);
    } catch (error) {
      setScoresError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load scores. Please try again."
      );
    } finally {
      setScoresLoading(false);
    }
  }, []);

  const loadDashboardDraws = useCallback(async () => {
    setDrawsLoading(true);
    setDrawsError("");

    try {
      const response = await api.get("/draws/published");
      setDraws(
        Array.isArray(response.data.data) ? response.data.data : []
      );
    } catch (error) {
      setDrawsError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load published draw results."
      );
    } finally {
      setDrawsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isScoresPage && !isDrawsPage) {
      loadDashboardScores();
      loadDashboardDraws();
    }
  }, [
    isScoresPage,
    isDrawsPage,
    loadDashboardScores,
    loadDashboardDraws,
  ]);

  // const logout = () => {
  //   localStorage.removeItem("dh_token");
  //   navigate("/login");
  // };
  const logout = () => {
  localStorage.removeItem("dh_token");
  localStorage.removeItem("token");
  navigate("/login", { replace: true });
};

  const latestScore = scores.length > 0 ? scores[0].score : "—";
  const latestDraw = draws.length > 0 ? draws[0] : null;

  return (
    <div className="dh-app">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Flag size={23} />
          </div>

          <div>
            <h2>Digital Heroes</h2>
            <span>PLAY. WIN. GIVE.</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="nav-caption">MENU</div>

        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "nav-active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {item.label === "Draw Results" && (
                  <span className="nav-dot" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="charity-card">
          <div className="charity-icon">
            <Heart size={19} />
          </div>

          <h3>Make an impact</h3>
          <p>
            Your game can help change lives. Every contribution matters.
          </p>

          <NavLink
            to="/charity"
            onClick={() => setSidebarOpen(false)}
          >
            Explore charities <ArrowUpRight size={15} />
          </NavLink>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">DH</div>

          <div className="profile-info">
            <strong>Golf Member</strong>
            <span>Digital Heroes player</span>
          </div>

          <button
            className="logout-btn"
            onClick={logout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="breadcrumb">
                Workspace / {pageTitle}
              </div>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <div className="date-chip">
              <CalendarDays size={16} />
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="user-chip">
              <div className="user-icon">
                <CircleUserRound size={21} />
              </div>

              <div className="user-chip-text">
                <strong>Welcome back</strong>
                <span>Member account</span>
              </div>
            </div>
          </div>
        </header>
{isAdminContributionsPage ? (
  <AdminContributions />
) :isAdminUsersPage ? (
  <AdminUsers />
) :
isAdminDrawsPage ? (
  <AdminDraws />
) : isAdminCharitiesPage ? (
  <AdminCharities />
) :
isAdminPage ? (
  <AdminDashboard />
) : 
isSettingsPage ? (
  <div className="settings-page">
    <h2>Settings</h2>
    <p>Manage your account settings.</p>
  </div>
)
: isCharityPage ? (
  <div className="charity-page">
    <h2>My Charity</h2>
    <p>View and manage your selected charity.</p>
  </div>
):
isSubscriptionPage ? (
  <Subscription />
) : isScoresPage ? (
  <Scores />
) : isDrawsPage ? (
  <Draws />
) : isDonationHistoryPage ? (
  <DonationHistory />
) : isMySubscriptionPage ? (
  <MySubscription />
) : (
  <div className="dashboard-content">
            <section className="welcome-banner">
              <div className="welcome-copy">
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> YOUR PLAYER HUB
                </span>

                <h2>
                  Every round makes
                  <br />
                  <em>a difference.</em>
                </h2>

                <p>
                  Track your scores, follow the monthly draw, and make an
                  impact through the game you love.
                </p>

                <NavLink className="banner-button" to="/scores">
                  <Flag size={17} />
                  Explore my scores
                  <ArrowUpRight size={16} />
                </NavLink>
              </div>

              <div className="banner-art" aria-hidden="true">
                <div className="art-circle art-circle-one" />
                <div className="art-circle art-circle-two" />
                <div className="golf-ball">
                  <div className="ball-dimples" />
                </div>
                <div className="golf-flag">
                  <div className="flag-pole" />
                  <div className="flag-cloth" />
                </div>
                <div className="art-ground" />
                <span className="art-label">PLAY WITH PURPOSE</span>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <h2>Your overview</h2>
                <p>A quick look at your Digital Heroes journey.</p>
              </div>

              <span className="live-label">
                <span /> MEMBER OVERVIEW
              </span>
            </div>

            {scoresError && (
              <div
                role="alert"
                style={{
                  marginBottom: 18,
                  padding: 14,
                  borderRadius: 10,
                  background: "#fff0ee",
                  color: "#963c38",
                  fontSize: 13,
                }}
              >
                {scoresError}
                <button
                  type="button"
                  onClick={loadDashboardScores}
                  style={{
                    marginLeft: 12,
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            <section className="stats-grid">
              <StatCard
                icon={Flag}
                label="Scores recorded"
                value={scoresLoading ? "…" : String(scores.length)}
                foot="Your latest golf rounds"
                tone="green"
              />

              <StatCard
                icon={Target}
                label="Latest score"
                value={scoresLoading ? "…" : String(latestScore)}
                foot={
                  scores.length > 0
                    ? `Played ${formatScoreDate(scores[0].playedAt)}`
                    : "Add your first score"
                }
                tone="blue"
              />

              <StatCard
                icon={Trophy}
                label="Published draws"
                value={drawsLoading ? "…" : String(draws.length)}
                foot={
                  latestDraw
                    ? `Latest: ${formatDrawMonth(latestDraw.month)}`
                    : "No published draws yet"
                }
                tone="gold"
              />

              <StatCard
                icon={Heart}
                label="Charity impact"
                value="—"
                foot="Contribution data not connected"
                tone="rose"
              />
            </section>

            {drawsError && (
              <div
                role="alert"
                style={{
                  marginBottom: 18,
                  padding: 14,
                  borderRadius: 10,
                  background: "#fff0ee",
                  color: "#963c38",
                  fontSize: 13,
                }}
              >
                {drawsError}
                <button
                  type="button"
                  onClick={loadDashboardDraws}
                  style={{
                    marginLeft: 12,
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            <div className="content-grid">
              <section className="panel scores-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Recent scores</h3>
                    <p>Your latest golf rounds in one place.</p>
                  </div>

                  <button
                    type="button"
                    className="text-link"
                    onClick={loadDashboardScores}
                    disabled={scoresLoading}
                    style={{
                      border: 0,
                      background: "transparent",
                      cursor: scoresLoading ? "wait" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                </div>

                {scoresLoading ? (
                  <div className="empty-state">
                    <p>Loading your latest scores…</p>
                  </div>
                ) : scores.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Flag size={25} />
                    </div>

                    <h4>Your golf journey starts here</h4>
                    <p>
                      No scores added yet. Record a round to start tracking
                      your progress.
                    </p>

                    <NavLink className="primary-button" to="/scores">
                      Add your first score
                      <ArrowUpRight size={16} />
                    </NavLink>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={tableHeaderStyle}>Date played</th>
                          <th style={tableHeaderStyle}>Score</th>
                        </tr>
                      </thead>

                      <tbody>
                        {scores.map((item) => (
                          <tr key={item.id}>
                            <td style={tableCellStyle}>
                              {formatScoreDate(item.playedAt)}
                            </td>
                            <td style={tableCellStyle}>
                              <span className="score-value">
                                {item.score}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ paddingTop: 18 }}>
                      <NavLink className="primary-button" to="/scores">
                        Manage my scores
                        <ArrowUpRight size={16} />
                      </NavLink>
                    </div>
                  </div>
                )}
              </section>

              <section className="panel draw-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Monthly draw</h3>
                    <p>Your chance to win and give back.</p>
                  </div>

                  <div className="draw-icon">
                    <Trophy size={19} />
                  </div>
                </div>

                <div className="draw-highlight">
                  <span className="draw-kicker">
                    {drawsLoading
                      ? "LOADING RESULTS"
                      : latestDraw
                        ? formatDrawMonth(latestDraw.month).toUpperCase()
                        : "PUBLISHED RESULTS"}
                  </span>

                  <h4>
                    {drawsLoading ? (
                      <>Checking the latest draw…</>
                    ) : latestDraw ? (
                      <>
                        The winning
                        <br />
                        <span>numbers.</span>
                      </>
                    ) : (
                      <>
                        Good things
                        <br />
                        are on the way.
                      </>
                    )}
                  </h4>

                  <p>
                    {latestDraw
                      ? "Latest officially published winning numbers."
                      : "Published winning numbers will appear here when available."}
                  </p>

                  {latestDraw?.winningNumbers?.length > 0 ? (
                    <div className="number-row">
                      {latestDraw.winningNumbers.map((number) => (
                        <span key={number}>{number}</span>
                      ))}
                    </div>
                  ) : (
                    <p>
                      {drawsLoading
                        ? "Loading…"
                        : "No official results to display yet."}
                    </p>
                  )}

                  {latestDraw && (
                    <small>
                      Published{" "}
                      {latestDraw.publishedAt
                        ? new Date(latestDraw.publishedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "date unavailable"}
                    </small>
                  )}
                </div>

                <NavLink to="/draws" className="draw-link">
                  Explore draw results
                  <ArrowUpRight size={16} />
                </NavLink>

                {drawsError && (
                  <button
                    type="button"
                    onClick={loadDashboardDraws}
                    disabled={drawsLoading}
                    style={{
                      marginTop: 10,
                      border: 0,
                      background: "transparent",
                      color: "#28563c",
                      cursor: "pointer",
                    }}
                  >
                    <RefreshCw size={14} /> Retry loading results
                  </button>
                )}
              </section>
            </div>

            <section className="impact-strip">
              <div className="impact-symbol">
                <Heart size={23} />
              </div>

              <div className="impact-copy">
                <h3>Golf can do more.</h3>
                <p>
                  Choose a charity and make your subscription count towards
                  a cause you care about.
                </p>
              </div>

              <NavLink to="/charity" className="impact-button">
                Discover charities
                <ArrowUpRight size={16} />
              </NavLink>
            </section>

            <footer className="dashboard-footer">
              <span>© {new Date().getFullYear()} Digital Heroes</span>
              <span>Play with purpose. Make a difference.</span>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

const tableHeaderStyle = {
  padding: "12px 10px",
  color: "#829188",
  background: "#f7faf7",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  borderBottom: "1px solid #edf1ed",
};

const tableCellStyle = {
  padding: "14px 10px",
  color: "#365345",
  fontSize: 13,
  borderBottom: "1px solid #edf1ed",
};

function StatCard({ icon: Icon, label, value, foot, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon stat-${tone}`}>
        <Icon size={20} />
      </div>

      <span className="stat-label">{label}</span>
      <div className="stat-value">{value}</div>

      <div className="stat-foot">
        <TrendingUp size={14} /> {foot}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scores"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/charities"
  element={
    <ProtectedRoute>
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/users"
  element={
    <ProtectedRoute>
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/contributions"
  element={
    <ProtectedRoute>
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/draws"
  element={
    <ProtectedRoute>
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    </ProtectedRoute>
  }
/>
      <Route
        path="/draws"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/charity"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/my-subscription"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/donation-history"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/subscription/success"
  element={
    <ProtectedRoute>
      <SubscriptionSuccess />
    </ProtectedRoute>
  }
/>

<Route
  path="/subscription/cancel"
  element={
    <ProtectedRoute>
      <SubscriptionCancel />
    </ProtectedRoute>
  }
/>


      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
