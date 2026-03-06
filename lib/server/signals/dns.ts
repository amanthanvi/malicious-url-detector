import {
  resolve4,
  resolveCname,
  resolveMx,
  resolveNs,
  resolveTxt,
} from "node:dns/promises";

import type { DNSData } from "@/lib/domain/types";
import { withTimeout } from "@/lib/server/http";

export async function runDnsSignal(url: string): Promise<DNSData> {
  const hostname = new URL(url).hostname;

  const [addresses, cnames, mxRecords, nameservers, txtRecords] =
    await Promise.allSettled([
      withTimeout(resolve4(hostname), 5_000, "A record lookup"),
      withTimeout(resolveCname(hostname), 5_000, "CNAME lookup"),
      withTimeout(resolveMx(hostname), 5_000, "MX lookup"),
      withTimeout(resolveNs(hostname), 5_000, "NS lookup"),
      withTimeout(resolveTxt(hostname), 5_000, "TXT lookup"),
    ]);

  const addressList = addresses.status === "fulfilled" ? addresses.value : [];
  const cnameList = cnames.status === "fulfilled" ? cnames.value : [];
  const mxList =
    mxRecords.status === "fulfilled"
      ? mxRecords.value.map((entry) => entry.exchange)
      : [];
  const nameserverList =
    nameservers.status === "fulfilled" ? nameservers.value : [];
  const txtList =
    txtRecords.status === "fulfilled"
      ? txtRecords.value.map((record) => record.join("")).filter(Boolean)
      : [];

  if (addressList.length === 0 && cnameList.length === 0) {
    throw new Error("DNS lookups did not resolve any A or CNAME records.");
  }

  const anomalies: string[] = [];

  if (hostname.includes("xn--")) {
    anomalies.push("The hostname uses punycode encoding.");
  }

  if (addressList.length >= 6) {
    anomalies.push("The hostname resolves to a high number of A records.");
  }

  if (mxList.length === 0) {
    anomalies.push("No MX records were published for the domain.");
  }

  return {
    addresses: addressList,
    cnames: cnameList,
    mx: mxList,
    txt: txtList,
    nameservers: nameserverList,
    anomalies,
  };
}
