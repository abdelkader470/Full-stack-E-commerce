import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/useAuthStore";
import { useShopStore } from "../store/useShopStore";

export function Auth({ mode = "login" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { login, register, loading, error } = useAuthStore();
  const hydrateUserData = useShopStore((state) => state.hydrateUserData);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      await hydrateUserData();
      navigate("/profile");
    } catch (submitError) {
      setFormError(submitError.message);
    }
  };

  return (
    <section className="mx-auto grid min-h-[72vh] max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
      <Helmet>
        <title>{isRegister ? "Create Account" : "Login"} | Marketlane</title>
      </Helmet>
      <div className="relative overflow-hidden rounded-lg bg-black p-8 text-white">
        <img
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80"
          alt="Clothing store account"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="relative">
          <ShieldCheck className="h-10 w-10 text-white" />
          <h1 className="mt-6 text-4xl font-extrabold">Secure clothing store access</h1>
          <p className="mt-4 text-slate-200">
            Customer profiles, clothing order history, saved addresses, saved styles, and admin role control use JWT-backed access.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="self-center rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="text-2xl font-extrabold">{isRegister ? "Create account" : "Welcome back"}</h2>
        <p className="mt-2 text-sm text-slate-500">
          Demo accounts are available after running the backend seed script.
        </p>
        {(formError || error) && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError || error}</p>
        )}
        <div className="mt-6 space-y-4">
          {isRegister && (
            <input
              type="text"
              name="name"
              autoComplete="name"
              className="focus-ring w-full rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          )}
          <input
            type="email"
            name="email"
            autoComplete="email"
            className="focus-ring w-full rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            type="password"
            name="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={8}
            className="focus-ring w-full rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Password, minimum 8 characters"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        <Button className="mt-6 w-full" variant="accent" disabled={loading}>
          {loading ? "Please wait" : isRegister ? "Create account" : "Sign in"}
        </Button>
        <p className="mt-5 text-center text-sm text-slate-500">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <Link className="font-bold text-black underline underline-offset-4 dark:text-white" to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create one"}
          </Link>
        </p>
      </form>
    </section>
  );
}
