import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  const expireOptions = {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  };

  response.cookies.set("cdp_session_token", "", expireOptions);
  response.cookies.set("cdp_session", "", expireOptions);
  response.cookies.set("cdp_role", "", expireOptions);
  response.cookies.set("cdp_institute", "", expireOptions);

  return response;
}
