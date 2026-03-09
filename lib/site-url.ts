const LOCAL_SITE_URL = "http://localhost:3000";
const PRODUCTION_SITE_URL = "https://www.scrutinix.net";

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NODE_ENV === "production"
      ? PRODUCTION_SITE_URL
      : LOCAL_SITE_URL)
  );
}
