import { NextResponse } from "next/server";

type TrustRequest = {
  requestedRole?: unknown;
  roleToken?: unknown;
};

const isHostRole = (value: unknown): boolean => value === "host";
const isStudentRole = (value: unknown): boolean => value === "student";

export async function POST(request: Request) {
  let payload: TrustRequest = {};
  try {
    payload = (await request.json()) as TrustRequest;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid-json",
        message: "request body must be valid JSON.",
      },
      { status: 400 }
    );
  }

  const requestedRole = payload.requestedRole;
  if (!isHostRole(requestedRole) && !isStudentRole(requestedRole)) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid-role",
        message: "requestedRole must be 'host' or 'student'.",
      },
      { status: 400 }
    );
  }

  if (isStudentRole(requestedRole)) {
    return NextResponse.json({
      ok: true,
      trusted: true,
      role: "student",
    });
  }

  const expectedHostToken = (process.env.SY_MATH_SLATE_HOST_ROLE_TOKEN ?? "").trim();
  if (expectedHostToken === "") {
    return NextResponse.json(
      {
        ok: false,
        code: "host-token-not-configured",
        message: "host role token is not configured on server.",
      },
      { status: 500 }
    );
  }

  const providedRoleToken =
    typeof payload.roleToken === "string" ? payload.roleToken : "";
  if (providedRoleToken !== expectedHostToken) {
    return NextResponse.json(
      {
        ok: false,
        code: "host-token-invalid",
        message: "host role token is invalid.",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    ok: true,
    trusted: true,
    role: "host",
  });
}
