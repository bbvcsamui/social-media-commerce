import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/learn", "/teacher", "/change-password", "/quiz", "/exam", "/assignment", "/simulations", "/certificate"];

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project-ref")) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (!user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  if (user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const { data: profile } = await supabase.from("profiles")
      .select("role,must_change_password").eq("id", user.id).single();
    let destination: string | undefined;
    if (!profile) destination = "/login";
    else if (profile.must_change_password && path !== "/change-password") destination = "/change-password";
    else if ((path === "/teacher" || path.startsWith("/teacher/")) && profile.role !== "teacher") destination = "/learn";
    if (destination) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = destination;
      redirect.search = "";
      const result = NextResponse.redirect(redirect);
      response.cookies.getAll().forEach((cookie) => result.cookies.set(cookie));
      return result;
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
