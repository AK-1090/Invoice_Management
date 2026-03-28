import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/login.css";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password toggle
  const togglePassword = () => {
    const input = document.getElementById("password");
    const icon = document.getElementById("passwordToggle");

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  };

  // Handle login submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields", {
        className: "login-toast",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      // VERY IMPORTANT: response interceptor already returns response.data
      localStorage.setItem("token", res.token);
      localStorage.setItem("auth", "true");

      toast.success("Login Successful!", {
        className: "login-toast",
      });

      setTimeout(() => {
        window.location.href = "/invoices";
      }, 800); // redirect to invoice dashboard
    } catch (err) {
      toast.error(err.message || "Invalid email or password", {
        className: "login-toast",
      });
    } finally {
      setLoading(false);
    }
  };

  // Background animation (converted)
  useEffect(() => {
    createParticles();
    setTimeout(createConnectionLines, 100);
    animateCircles();
  }, []);

  // Create particles
  const createParticles = () => {
    const bgAnimation = document.querySelector(".bg-animation");

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      const size = Math.random() * 5 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;

      const tx = (Math.random() - 0.5) * 100;
      const ty = (Math.random() - 0.5) * 100;

      particle.style.setProperty("--tx", `${tx}vw`);
      particle.style.setProperty("--ty", `${ty}vh`);
      particle.style.animationDelay = `${Math.random() * 20}s`;

      bgAnimation.appendChild(particle);
    }
  };

  const createConnectionLines = () => {
    const circles = document.querySelectorAll(".circle");
    const bgAnimation = document.querySelector(".bg-animation");

    circles.forEach((circle, index) => {
      if (index < circles.length - 1) {
        const nextCircle = circles[index + 1];

        const line = document.createElement("div");
        line.classList.add("connection-line");

        const rect1 = circle.getBoundingClientRect();
        const rect2 = nextCircle.getBoundingClientRect();

        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;
        const x2 = rect2.left + rect2.width / 2;
        const y2 = rect2.top + rect2.height / 2;

        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

        line.style.width = `${length}px`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}deg)`;

        bgAnimation.appendChild(line);
      }
    });
  };

  const animateCircles = () => {
    const circles = document.querySelectorAll(".circle");

    circles.forEach((circle) => {
      circle.addEventListener("mouseenter", function () {
        this.style.transform = "scale(1.1)";
        this.style.opacity = "0.3";
      });

      circle.addEventListener("mouseleave", function () {
        this.style.transform = "scale(1)";
        this.style.opacity = "0.2";
      });
    });

    document.addEventListener("mousemove", function (e) {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      const grid = document.querySelector(".grid-lines");
      if (grid) {
        grid.style.backgroundPosition = `${x * 20}px ${y * 20}px`;
      }

      circles.forEach((circle) => {
        circle.style.transform = `translate(${x * 10 - 5}px, ${y * 10 - 5}px)`;
      });
    });
  };

  return (
    <div className="login-page">
      <div className="bg-animation">
        <div className="grid-lines"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="login-container">
        <div className="login-left">
          <div className="logo">
            <i
              className="fa-sharp-duotone fa-solid fa-file-invoice fa-beat fa-lg"
              style={{ color: "#74C0FC" }}
            ></i>
            <span>Invoice Management</span>
          </div>

          <h2>Streamline Your Billing Workflow</h2>
          <p>
            Login to access your intelligent invoice dashboard and manage all
            your financial operations with ease and accuracy.
          </p>

          <ul className="features-list">
            <li>
              <i className="fas fa-check-circle"></i> Generate invoices in
              seconds
            </li>
            <li>
              <i className="fas fa-check-circle"></i> Track payments
              effortlessly
            </li>
            <li>
              <i className="fas fa-check-circle"></i> Manage clients in one
              place learners
            </li>
          </ul>
        </div>

        <div className="login-right">
          <h2>Welcome Back</h2>
          <p>Please sign in to your account</p>

          <div className="social-login">
            <button className="social-btn">
              <i className="fab fa-google"></i> Google
            </button>
            <button className="social-btn">
              <i className="fab fa-github"></i> GitHub
            </button>
          </div>

          <div className="divider">or continue with email</div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter your password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className="fas fa-eye password-toggle"
                id="passwordToggle"
                onClick={togglePassword}
              ></i>
            </div>

            <div className="remember-forgot">
              <div className="remember">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button className="btn-login" disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : "Sign In"}
            </button>
          </form>

          <div className="signup-link">
            Don’t have an account? <a href="#">Sign up now</a>
          </div>
        </div>
      </div>
    </div>
  );
}
