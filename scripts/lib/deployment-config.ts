type Environment = Record<string, string | undefined>;
export function checkDeploymentConfig(env: Environment, production: boolean) {
  const errors: string[] = [], warnings: string[] = [];
  const required = ["DATABASE_URL", "DIRECT_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_SITE_URL", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  for (const key of required) if (!env[key]?.trim()) errors.push(`${key}: missing.`);
  for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
    if (!env[key]) continue;
    try {
      const url = new URL(env[key]!);
      if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.pathname.slice(1)) throw new Error();
      if (url.searchParams.has("schema") && url.searchParams.get("schema") !== "public") errors.push(`${key}: this project's backup tooling supports the public schema.`);
      if (production && ["localhost", "127.0.0.1", "host"].includes(url.hostname)) errors.push(`${key}: replace the local/example database address before deployment.`);
    } catch { errors.push(`${key}: invalid PostgreSQL URL.`); }
  }
  const origins: string[] = [];
  for (const key of ["NEXTAUTH_URL", "NEXT_PUBLIC_SITE_URL"]) {
    if (!env[key]) continue;
    try {
      const url = new URL(env[key]!);
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error();
      origins.push(url.origin);
      if (production && (url.protocol !== "https:" || ["localhost", "127.0.0.1", "your-site.netlify.app"].includes(url.hostname))) errors.push(`${key}: use the real HTTPS deployment origin.`);
    } catch { errors.push(`${key}: use an origin such as https://school.netlify.app, without a path or credentials.`); }
  }
  if (origins.length === 2 && origins[0] !== origins[1]) (production ? errors : warnings).push("NEXTAUTH_URL and NEXT_PUBLIC_SITE_URL: origins differ.");
  if (env.NEXTAUTH_SECRET && (env.NEXTAUTH_SECRET.length < 32 || /generate-with|change-me|replace-me/i.test(env.NEXTAUTH_SECRET))) errors.push("NEXTAUTH_SECRET: use a random secret of at least 32 characters.");
  if (env.CLOUDINARY_FOLDER && !/^[a-zA-Z0-9_-]{1,80}$/.test(env.CLOUDINARY_FOLDER)) errors.push("CLOUDINARY_FOLDER: use 1-80 letters, digits, underscores or hyphens.");
  if (!env.CLOUDINARY_FOLDER) warnings.push("CLOUDINARY_FOLDER: existing installations use eastern-view; set an explicit folder for each new school.");
  if (env.CONTEXT && env.CONTEXT !== "production" && env.ALLOW_ISOLATED_PREVIEW !== "1") errors.push("Preview build blocked. Configure a separate test database/media account and ALLOW_ISOLATED_PREVIEW=1 before enabling previews.");
  return { errors, warnings };
}
