import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { post } from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await post("/auth/login", { email, password });
      login(data.user, data.token);
      toast.success("Welcome back!");
      navigate("/chat");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-2">
            Lmina AI Agent
          </h2>
          <p className="text-center text-base-content/60 mb-4">
            Sign in to your account
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="divider">OR</div>
          <p className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="link link-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
