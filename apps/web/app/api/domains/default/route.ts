import { DubApiError } from "@/lib/api/errors";
import { withWorkspace } from "@/lib/auth";
import { getDefaultDomainsQuerySchema } from "@/lib/zod/schemas/domains";
import { prisma } from "@dub/prisma";
import { DUB_DOMAINS_ARRAY } from "@dub/utils";
import { NextResponse } from "next/server";
import * as z from "zod/v4";

const DEFAULT_DOMAIN_SYSTEM_FIELDS = new Set(["id", "projectId"]);

const mapFieldToDomain = (field: string) => {
  const matched = DUB_DOMAINS_ARRAY.find(
    (domain) => domain.replace(".", "") === field,
  );

  if (matched) {
    return matched;
  }

  // Backward compatibility for self-hosted installs that still store `dubsh`.
  if (field === "dubsh" && DUB_DOMAINS_ARRAY.length === 1) {
    return DUB_DOMAINS_ARRAY[0];
  }

  return undefined;
};

// GET /api/domains/default - get default domains
export const GET = withWorkspace(
  async ({ workspace, searchParams }) => {
    const { search } = getDefaultDomainsQuerySchema.parse(searchParams);

    const data = await prisma.defaultDomains.findUnique({
      where: {
        projectId: workspace.id,
      },
    });

    let defaultDomains: string[] = [];

    if (data) {
      defaultDomains = Object.entries(data)
        .filter(
          ([key, value]) =>
            !DEFAULT_DOMAIN_SYSTEM_FIELDS.has(key) &&
            typeof value === "boolean" &&
            value,
        )
        .map(([field]) => mapFieldToDomain(field))
        .filter((domain): domain is string => Boolean(domain))
        .filter((domain) =>
          search ? domain?.toLowerCase().includes(search.toLowerCase()) : true,
        );
    }

    return NextResponse.json(defaultDomains);
  },
  {
    requiredPermissions: ["domains.read"],
  },
);

const updateDefaultDomainsSchema = z.object({
  defaultDomains: z.array(z.enum(DUB_DOMAINS_ARRAY as [string, ...string[]])),
});

// PATCH /api/domains/default - edit default domains
export const PATCH = withWorkspace(
  async ({ req, workspace }) => {
    const { defaultDomains } = await updateDefaultDomainsSchema.parseAsync(
      await req.json(),
    );

    if (workspace.plan === "free" && defaultDomains.includes("dub.link")) {
      throw new DubApiError({
        code: "forbidden",
        message:
          "You can only use dub.link on a Pro plan and above. Upgrade to Pro to use this domain.",
      });
    }

    const existingDefaults = await prisma.defaultDomains.findUnique({
      where: {
        projectId: workspace.id,
      },
    });

    if (!existingDefaults) {
      throw new DubApiError({
        code: "not_found",
        message: "Workspace default domains not found.",
      });
    }

    const updateData = Object.fromEntries(
      Object.entries(existingDefaults)
        .filter(
          ([key, value]) =>
            !DEFAULT_DOMAIN_SYSTEM_FIELDS.has(key) && typeof value === "boolean",
        )
        .map(([key]) => {
          const mappedDomain = mapFieldToDomain(key);
          return [key, mappedDomain ? defaultDomains.includes(mappedDomain) : false];
        }),
    );

    const response = await prisma.defaultDomains.update({
      where: {
        projectId: workspace.id,
      },
      data: updateData,
    });

    return NextResponse.json(response);
  },
  {
    requiredPermissions: ["domains.write"],
  },
);
