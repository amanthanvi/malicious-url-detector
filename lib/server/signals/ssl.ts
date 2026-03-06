import tls from "node:tls";

import type { SSLData } from "@/lib/domain/types";

export async function runSslSignal(url: string): Promise<SSLData> {
  const hostname = new URL(url).hostname;

  return new Promise<SSLData>((resolve, reject) => {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
    });

    socket.setTimeout(8_000);

    socket.once("secureConnect", () => {
      const certificate = socket.getPeerCertificate();
      socket.end();

      if (!certificate || Object.keys(certificate).length === 0) {
        reject(new Error("The endpoint did not present a certificate."));
        return;
      }

      const validTo = certificate.valid_to
        ? new Date(certificate.valid_to).toISOString()
        : null;
      const validFrom = certificate.valid_from
        ? new Date(certificate.valid_from).toISOString()
        : null;
      const daysRemaining = validTo
        ? Math.round(
            (new Date(validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          )
        : null;
      const issuerCommonName = normalizeCertificateName(certificate.issuer?.CN);
      const subjectCommonName = normalizeCertificateName(
        certificate.subject?.CN,
      );
      const authorizationError =
        socket.authorizationError === undefined
          ? null
          : String(socket.authorizationError);

      resolve({
        protocol: socket.getProtocol() ?? "unknown",
        authorized: socket.authorized,
        authorizationError,
        issuer: issuerCommonName,
        subject: subjectCommonName,
        validFrom,
        validTo,
        daysRemaining,
        selfSigned:
          issuerCommonName !== null && issuerCommonName === subjectCommonName,
        fingerprint256: certificate.fingerprint256 ?? null,
      });
    });

    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("The TLS handshake timed out."));
    });

    socket.once("error", (error) => {
      socket.destroy();
      reject(error);
    });
  });
}

function normalizeCertificateName(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
