/**
 * API Route: Pattern Analysis
 * Triggers LSTM-based analysis of user conversation patterns
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let token: string | null = null;
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get auth token for debugging
    token = await getToken({ template: "convex" });

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      userId,
      hasToken: !!token,
    });
  } catch (error: any) {
    console.error("Pattern analysis error:", error);
    console.log("Auth token present:", !!token, "template=convex", "convex_url:", process.env.NEXT_PUBLIC_CONVEX_URL);

    return NextResponse.json(
      {
        error: "Pattern analysis failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Check pattern analysis status
 */
export async function GET(req: Request) {
  let token: string | null = null;
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get auth token for debugging
    token = await getToken({ template: "convex" });

    return NextResponse.json({
      authenticated: true,
      userId,
      hasToken: !!token,
    });
  } catch (error: any) {
    console.error("Pattern status check error:", error);
    console.log("Auth token present:", !!token, "template=convex", "convex_url:", process.env.NEXT_PUBLIC_CONVEX_URL);
    return NextResponse.json(
      {
        error: "Failed to check pattern status",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete user pattern data
 */
export async function DELETE(req: Request) {
  let token: string | null = null;
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get auth token for debugging
    token = await getToken({ template: "convex" });

    return NextResponse.json({
      success: true,
      message: "Authentication successful - data deletion not implemented yet",
      userId,
      hasToken: !!token,
    });
  } catch (error: any) {
    console.error("Pattern deletion error:", error);
    console.log("Auth token present:", !!token, "template=convex", "convex_url:", process.env.NEXT_PUBLIC_CONVEX_URL);
    return NextResponse.json(
      {
        error: "Failed to delete pattern data",
        message: error.message,
      },
      { status: 500 }
    );
  }
}