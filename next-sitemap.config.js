/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://retroxp.games",
  generateRobotsTxt: true,
  changefreq: "monthly",
  priority: 0.8,
};
