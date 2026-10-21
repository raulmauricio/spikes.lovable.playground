import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Profile = { id: string; full_name: string | null; email: string | null; created_at: string };
type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: Profile[] };

export function GoogleLoginPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [list, setList] = useState<ListState>({ status: "loading" });
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setList({ status: "loading" });
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = !!roles?.some((r) => r.role === "admin");
      if (cancelled) return;
      setIsAdmin(admin);
      if (!admin) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .eq("provider", "google")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setList(error ? { status: "error", message: error.message } : { status: "ready", rows: data ?? [] });
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function signIn() {
    setSignInError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setSignInError("Sign-in failed. Please try again.");
  }

  if (!authReady) {
    return <p className="text-center text-sm text-muted-foreground">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">Sign in to continue.</p>
        <button
          onClick={signIn}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Continue with Google
        </button>
        {signInError && <p className="text-sm text-destructive">{signInError}</p>}
      </div>
    );
  }

  const name = (user.user_metadata?.["full_name"] as string) || (user.user_metadata?.["name"] as string) || "";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Signed in</p>
        <p className="text-base text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Sign out
        </button>
      </div>

      {!isAdmin ? (
        <p className="text-center text-sm text-muted-foreground">
          The registered users list is visible to administrators only.
        </p>
      ) : (
        <UsersTable state={list} />
      )}
    </div>
  );
}

function UsersTable({ state }: { state: ListState }) {
  if (state.status === "error") {
    return <p className="text-center text-sm text-destructive">Couldn't load users: {state.message}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <th className="py-3 pr-4 font-normal">Full name</th>
            <th className="py-3 pr-4 font-normal">Email</th>
            <th className="py-3 font-normal">Registered</th>
          </tr>
        </thead>
        <tbody>
          {state.status === "loading" &&
            [0, 1, 2].map((i) => (
              <tr key={i} className="border-b border-border">
                {[0, 1, 2].map((j) => (
                  <td key={j} className="py-3 pr-4">
                    <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
                  </td>
                ))}
              </tr>
            ))}
          {state.status === "ready" && state.rows.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-muted-foreground">
                No users yet
              </td>
            </tr>
          )}
          {state.status === "ready" &&
            state.rows.map((r) => (
              <tr key={r.id} className="border-b border-border">
                <td className="py-3 pr-4 text-foreground">{r.full_name || "—"}</td>
                <td className="py-3 pr-4 text-muted-foreground">{r.email}</td>
                <td className="py-3 text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
