import { isIP } from "node:net";

import type { WhoisData } from "@/lib/domain/types";
import { fetchWithTimeout } from "@/lib/server/http";
import { getErrorMessage, SignalSkipError } from "@/lib/server/signal-error";

interface RdapEvent {
  eventAction: string;
  eventDate?: string;
}

export async function runWhoisSignal(url: string): Promise<WhoisData> {
  const hostname = new URL(url).hostname;

  if (isIP(hostname)) {
    throw new SignalSkipError(
      "Registration lookups are not applicable to literal IP targets.",
    );
  }

  const rdapUrl = `https://rdap.org/domain/${hostname}`;
  try {
    const response = await fetchWithTimeout(
      rdapUrl,
      {
        headers: {
          accept: "application/rdap+json, application/json",
        },
      },
      8_000,
    );

    if (!response.ok) {
      throw new Error(`RDAP lookup failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      handle?: string;
      links?: Array<{ href?: string }>;
      entities?: Array<{ roles?: string[]; vcardArray?: unknown[] }>;
      country?: string;
      events?: RdapEvent[];
    };

    const registrationDate = getEventDate(payload.events ?? [], "registration");
    const updatedAt = getEventDate(payload.events ?? [], "last changed");
    const expiresAt = getEventDate(payload.events ?? [], "expiration");
    const registrarEntity = payload.entities?.find((entity) =>
      entity.roles?.includes("registrar"),
    );
    const registrar = readVcardField(registrarEntity?.vcardArray, "fn");
    const ageDays = registrationDate
      ? Math.round(
          (Date.now() - new Date(registrationDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    return {
      subjectType: "domain",
      available: true,
      registrar,
      registeredAt: registrationDate,
      updatedAt,
      expiresAt,
      ageDays,
      country: payload.country ?? null,
      handle: payload.handle ?? null,
      rdapUrl: payload.links?.[0]?.href ?? rdapUrl,
      observations:
        registrar === null
          ? ["The RDAP response did not identify a registrar name."]
          : [],
    };
  } catch (error) {
    return {
      subjectType: "domain",
      available: false,
      registrar: null,
      registeredAt: null,
      updatedAt: null,
      expiresAt: null,
      ageDays: null,
      country: null,
      handle: null,
      rdapUrl,
      observations: [
        `Registration data was unavailable for this scan. ${getErrorMessage(
          error,
          "The RDAP lookup failed.",
        )}`,
      ],
    };
  }
}

function getEventDate(events: RdapEvent[], action: string) {
  return (
    events.find((event) => event.eventAction.toLowerCase() === action)
      ?.eventDate ?? null
  );
}

function readVcardField(vcardArray: unknown[] | undefined, name: string) {
  if (!Array.isArray(vcardArray) || !Array.isArray(vcardArray[1])) {
    return null;
  }

  const record = (vcardArray[1] as unknown[]).find(
    (entry): entry is [string, unknown, unknown, string] =>
      Array.isArray(entry) && entry[0] === name,
  );

  return record?.[3] ?? null;
}
