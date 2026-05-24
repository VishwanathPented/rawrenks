/* Authentication views */
(function () {
  function loginView() {
    return `
      <div class="auth-shell">
        <h2>Welcome back</h2>
        <p class="muted small" style="margin:-10px 0 20px">Demo accounts — customer: demo@rawrenks.com / demo123 · admin: admin@rawrenks.com / admin123</p>
        <form id="loginForm">
          <div class="row">
            <label>Email</label>
            <input type="email" name="email" required value="demo@rawrenks.com"/>
          </div>
          <div class="row">
            <label>Password</label>
            <input type="password" name="password" required value="demo123"/>
          </div>
          <div class="row" style="text-align:right">
            <a href="#/forgot" class="muted small">Forgot password?</a>
          </div>
          <button type="submit" class="btn-primary">Login</button>
          <button type="button" class="google-btn" onclick="Auth.googleLogin()">
            <span style="color:#4285F4;font-weight:700">G</span> Continue with Google
          </button>
        </form>
        <div class="auth-foot">New here? <a href="#/signup">Create an account</a></div>
      </div>
    `;
  }

  function signupView() {
    return `
      <div class="auth-shell">
        <h2>Create your account</h2>
        <form id="signupForm">
          <div class="row">
            <label>Full Name</label>
            <input type="text" name="name" required />
          </div>
          <div class="row">
            <label>Email</label>
            <input type="email" name="email" required />
          </div>
          <div class="row">
            <label>Password</label>
            <input type="password" name="password" required minlength="6"/>
          </div>
          <button type="submit" class="btn-primary">Create account</button>
          <button type="button" class="google-btn" onclick="Auth.googleLogin()">
            <span style="color:#4285F4;font-weight:700">G</span> Continue with Google
          </button>
        </form>
        <div class="auth-foot">Have an account? <a href="#/login">Login</a></div>
      </div>
    `;
  }

  function forgotView() {
    return `
      <div class="auth-shell">
        <h2>Reset password</h2>
        <p class="muted small">Enter your email and we'll simulate a reset link (this is a demo).</p>
        <form id="forgotForm">
          <div class="row">
            <label>Email</label>
            <input type="email" name="email" required />
          </div>
          <button type="submit" class="btn-primary">Send reset link</button>
        </form>
        <div class="auth-foot"><a href="#/login">Back to login</a></div>
      </div>
    `;
  }

  function bindLogin() {
    const f = document.getElementById("loginForm");
    if (!f) return;
    f.onsubmit = (e) => {
      e.preventDefault();
      const data = new FormData(f);
      const user = Store.findUserByEmail(data.get("email"));
      if (!user) return App.toast("No account found with that email", "err");
      if (user.password !== data.get("password")) return App.toast("Incorrect password", "err");
      if (user.blocked) return App.toast("This account has been blocked", "err");
      Store.setSession(user.id);
      App.toast("Welcome back, " + user.name);
      location.hash = user.role === "admin" ? "#/admin" : "#/";
    };
  }

  function bindSignup() {
    const f = document.getElementById("signupForm");
    if (!f) return;
    f.onsubmit = (e) => {
      e.preventDefault();
      const data = new FormData(f);
      if (Store.findUserByEmail(data.get("email"))) {
        return App.toast("An account with that email already exists", "err");
      }
      const u = Store.addUser({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password")
      });
      Store.setSession(u.id);
      App.toast("Account created — welcome to Rawrenks!");
      location.hash = "#/";
    };
  }

  function bindForgot() {
    const f = document.getElementById("forgotForm");
    if (!f) return;
    f.onsubmit = (e) => {
      e.preventDefault();
      App.toast("Reset link sent (demo). Check your email.");
      location.hash = "#/login";
    };
  }

  function googleLogin() {
    let user = Store.findUserByEmail("google@rawrenks.com");
    if (!user) {
      user = Store.addUser({ name: "Google User", email: "google@rawrenks.com", password: Math.random().toString(36) });
    }
    Store.setSession(user.id);
    App.toast("Signed in with Google");
    location.hash = "#/";
  }

  function logout() {
    Store.setSession(null);
    App.toast("Signed out");
    location.hash = "#/";
  }

  window.Auth = {
    loginView, signupView, forgotView,
    bindLogin, bindSignup, bindForgot,
    googleLogin, logout
  };
})();
