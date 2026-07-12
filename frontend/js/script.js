// AssetFlow frontend auth integration script
(() => {
  const API_BASE = "http://127.0.0.1:8000/api";

  const validators = {
    full_name: v => !v.trim() ? "Full name is required" : v.length > 150 ? "Max 150 characters" : "",
    email: v => !v ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email" : "",
    username: v => !v ? "Username is required" : v.length < 3 ? "At least 3 characters" : v.length > 50 ? "Max 50 characters" : "",
    password: v => !v ? "Password is required" : v.length < 4 ? "At least 4 characters" : "",
    role: v => !v ? "Choose a role" : "",
    department_id: v => !v ? "Choose a department" : "",
  };

  function setState(field, msg) {
    const wrap = field.closest("[data-field]");
    if (!wrap) return;
    const err = wrap.querySelector("[data-error]");
    wrap.classList.remove("valid", "invalid");
    if (msg) {
      wrap.classList.add("invalid");
      if (err) err.textContent = msg;
    } else if (field.value) {
      wrap.classList.add("valid");
      if (err) err.textContent = "";
    } else {
      if (err) err.textContent = "";
    }
  }

  function bind(form) {
    if (!form) return;
    const fields = form.querySelectorAll("[data-field] input, [data-field] select");
    
    fields.forEach(f => {
      const name = f.name;
      const run = () => setState(f, (!f.required && !f.value) ? "" : (validators[name] || (() => ""))(f.value));
      f.addEventListener("blur", run);
      f.addEventListener("input", () => {
        const wrap = f.closest("[data-field]");
        if (wrap && wrap.classList.contains("invalid")) run();
        if (name === "password") updateStrength(f.value);
      });
      f.addEventListener("change", run);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      fields.forEach(f => {
        if (!f.required && !f.value) { setState(f, ""); return; }
        const msg = (validators[f.name] || (() => ""))(f.value);
        setState(f, msg);
        if (msg) ok = false;
      });

      if (!ok) {
        const first = form.querySelector(".invalid input, .invalid select");
        first && first.focus();
        return;
      }

      const btn = form.querySelector("#submitBtn");
      const label = btn.querySelector("span");
      const originalLabel = label.textContent;
      const statusDiv = form.querySelector(".form-status");

      // Set sending state
      btn.disabled = true;
      label.textContent = "Sending…";
      if (statusDiv) {
        statusDiv.textContent = "";
        statusDiv.style.color = "var(--text-mute)";
      }

      const kind = form.getAttribute("data-kind");
      const formData = new FormData(form);

      try {
        if (kind === "signup") {
          // Map form fields to API payload
          const payload = {
            fullname: formData.get("full_name"),
            email: formData.get("email"),
            username: formData.get("username"),
            password: formData.get("password"),
            role: formData.get("role"),
            department_id: formData.get("department_id") ? parseInt(formData.get("department_id"), 10) : null
          };

          const response = await fetch(`${API_BASE}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          const data = await response.json();

          if (response.ok) {
            label.textContent = "Registered ✓";
            if (statusDiv) {
              statusDiv.textContent = "Account created successfully! Redirecting to sign in...";
              statusDiv.style.color = "#10b981"; // Success green
            }
            setTimeout(() => {
              window.location.href = "./login.html";
            }, 1800);
          } else {
            throw new Error(data.detail || "Signup failed");
          }

        } else if (kind === "login") {
          const payload = {
            username: formData.get("username"),
            password: formData.get("password")
          };

          const response = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          const data = await response.json();

          if (response.ok) {
            label.textContent = "Success ✓";
            if (statusDiv) {
              statusDiv.textContent = "Login successful! Redirecting to dashboard...";
              statusDiv.style.color = "#10b981";
            }
            // Store user info in localStorage for session handling
            localStorage.setItem("currentUser", JSON.stringify(data));
            
            setTimeout(() => {
              window.location.href = "./dashboard.html";
            }, 1000);
          } else {
            throw new Error(data.detail || "Invalid username or password");
          }

        } else if (kind === "forgot") {
          // Forgot password is mocked as it is not defined in the backend API router
          label.textContent = "Sent ✓";
          if (statusDiv) {
            statusDiv.textContent = "If this email is registered, a password recovery link has been sent.";
            statusDiv.style.color = "#10b981";
          }
          setTimeout(() => {
            btn.disabled = false;
            label.textContent = originalLabel;
            form.reset();
          }, 3000);
        }
      } catch (err) {
        btn.disabled = false;
        label.textContent = originalLabel;
        if (statusDiv) {
          statusDiv.textContent = `Error: ${err.message}`;
          statusDiv.style.color = "#ef4444"; // Error red
        }
      }
    });
  }

  function updateStrength(v) {
    const bar = document.querySelector(".strength");
    if (!bar) return;
    let score = 0;
    if (v.length >= 4) score++;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
    bar.setAttribute("data-level", String(score));
  }

  document.addEventListener("DOMContentLoaded", () => {
    bind(document.getElementById("signupForm"));
    bind(document.getElementById("loginForm"));
    bind(document.getElementById("forgotForm"));
  });
})();
