import {
  reverse,
  resolve4,
  resolve6,
  resolveCname,
  resolveMx,
  resolveNs,
  resolveTxt,
} from "node:dns/promises";
import { isIP } from "node:net";

import type { DNSData } from "@/lib/domain/types";
import { withTimeout } from "@/lib/server/http";

export async function runDnsSignal(url: string): Promise<DNSData> {
  const hostname = new URL(url).hostname;

  if (isIP(hostname)) {
    const reverseLookup = await Promise.allSettled([
      withTimeout(reverse(hostname), 5_000, "PTR lookup"),
    ]);
    const reverseHostnames =
      reverseLookup[0]?.status === "fulfilled" ? reverseLookup[0].value : [];

    return {
      subjectType: "ip",
      addresses: [hostname],
      cnames: [],
      mx: [],
      txt: [],
      nameservers: [],
      reverseHostnames,
      anomalies: [],
      observations: [
        "DNS zone records do not apply to literal IP targets.",
        ...(reverseHostnames.length > 0
          ? [`Reverse DNS returned ${reverseHostnames.join(", ")}.`]
          : ["No reverse DNS hostnames were returned for the IP address."]),
      ],
    };
  }

  const [
    ipv4Addresses,
    ipv6Addresses,
    cnames,
    mxRecords,
    nameservers,
    txtRecords,
  ] = await Promise.allSettled([
    withTimeout(resolve4(hostname), 5_000, "A record lookup"),
    withTimeout(resolve6(hostname), 5_000, "AAAA record lookup"),
    withTimeout(resolveCname(hostname), 5_000, "CNAME lookup"),
    withTimeout(resolveMx(hostname), 5_000, "MX lookup"),
    withTimeout(resolveNs(hostname), 5_000, "NS lookup"),
    withTimeout(resolveTxt(hostname), 5_000, "TXT lookup"),
  ]);

  const addressList = unique([
    ...(ipv4Addresses.status === "fulfilled" ? ipv4Addresses.value : []),
    ...(ipv6Addresses.status === "fulfilled" ? ipv6Addresses.value : []),
  ]);
  const cnameList = cnames.status === "fulfilled" ? cnames.value : [];
  const mxList =
    mxRecords.status === "fulfilled"
      ? mxRecords.value.map((entry) => entry.exchange).filter(Boolean)
      : [];
  const nameserverList =
    nameservers.status === "fulfilled" ? nameservers.value : [];
  const txtList =
    txtRecords.status === "fulfilled"
      ? txtRecords.value.map((record) => record.join("")).filter(Boolean)
      : [];

  const anomalies: string[] = [];
  const observations: string[] = [];

  if (hostname.includes("xn--")) {
    anomalies.push("The hostname uses punycode encoding.");
  }

  if (addressList.length >= 6) {
    anomalies.push(
      "The hostname resolves to an unusually high number of address records.",
    );
  }

  if (addressList.length === 0 && cnameList.length === 0) {
    observations.push(
      "No A, AAAA, or CNAME records were returned for the hostname.",
    );
  }

  return {
    subjectType: "hostname",
    addresses: addressList,
    cnames: cnameList,
    mx: mxList,
    txt: txtList,
    nameservers: nameserverList,
    reverseHostnames: [],
    anomalies,
    observations,
  };
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}
