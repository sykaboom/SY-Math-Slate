import { NextResponse } from "next/server";

import {
  resolveMarketplaceCatalog,
  type MarketplaceCatalogResolution,
} from "@features/extensions/marketplace";

type MarketplaceCatalogPayload = Extract<
  MarketplaceCatalogResolution,
  { ok: true }
>["catalog"];

type MarketplaceErrorResponse = {
  ok: false;
  code: string;
  message: string;
  path?: string;
};

type MarketplaceSuccessResponse = {
  ok: true;
  catalog: MarketplaceCatalogPayload;
};

const toError = (
  status: number,
  code: string,
  message: string,
  path?: string
): NextResponse<MarketplaceErrorResponse> =>
  NextResponse.json(
    {
      ok: false,
      code,
      message,
      ...(path ? { path } : {}),
    },
    { status }
  );

export async function GET() {
  const catalogResult = resolveMarketplaceCatalog();
  if (!catalogResult.ok) {
    return toError(
      500,
      catalogResult.code,
      catalogResult.message,
      catalogResult.path
    );
  }

  const body: MarketplaceSuccessResponse = {
    ok: true,
    catalog: catalogResult.catalog,
  };
  return NextResponse.json(body, { status: 200 });
}
