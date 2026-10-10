import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/server/shared/errors/app-error";

export function errorResponse(error: unknown, requestId?: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "The request did not pass validation.",
          requestId,
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.exposeMessage ? error.message : "An internal error occurred.",
          requestId,
        },
      },
      { status: error.statusCode },
    );
  }

  // Unexpected errors are intentionally not serialized to clients.
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An internal error occurred.",
        requestId,
      },
    },
    { status: 500 },
  );
}
