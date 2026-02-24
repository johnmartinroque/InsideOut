import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      // 🔥 Save companion document
      await setDoc(doc(db, "companion", user.uid), {
        companionID: user.uid,
        email: user.email,
        createdAt: new Date(),
      });

      // 🔥 Get Firebase ID token
      const token = await user.getIdToken();

      // 💾 Save token & uid
      localStorage.setItem("token", token);
      localStorage.setItem("uid", user.uid);

      // 💾 Save user info
      const userInfo = {
        uid: user.uid,
        email: user.email,
      };

      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-50 to-gray-400 px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Create{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
              Account
            </span>
          </h2>
          <p className="text-gray-500 mt-2">
            Join InsideOut and start monitoring
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm border border-red-100 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50 focus:bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50 focus:bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Eye Icon */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                // Eye Slash
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                // Eye
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
              Confirm Password
            </label>

            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50 focus:bg-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                // Eye Slash
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                // Eye
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-bold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
