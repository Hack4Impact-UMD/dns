// DNS for umdh4i.org, managed by DNSControl. This file is the source of truth:
// anything in the zone that isn't listed here is deleted on push.
// Docs: https://docs.dnscontrol.org/
//   dnscontrol check    validate this file (no credentials needed)
//   dnscontrol preview  show changes against live Cloudflare
//   dnscontrol push     apply them (CI does this on push to main)

var REG_NONE = NewRegistrar("none");
var DSP_CLOUDFLARE = NewDnsProvider("cloudflare", {
  // Manage Cloudflare "Single Redirect" rules declared with CF_SINGLE_REDIRECT.
  // Rules in the zone that aren't declared here are deleted on push.
  manage_single_redirects: true,
});

DEFAULTS(
  CF_PROXY_DEFAULT_OFF, // records are DNS-only unless marked CF_PROXY_ON
);

D("umdh4i.org", REG_NONE, DnsProvider(DSP_CLOUDFLARE),
  // Placeholder address (TEST-NET-1): the apex only exists so Cloudflare's
  // proxy receives requests and applies the redirect below. Must stay proxied.
  A("@", "192.0.2.1", CF_PROXY_ON),

  // docs
  CNAME("docs", "hack4impact-umd.github.io."),

  // bedrock
  // ACM DNS validation for bedrock.umdh4i.org.
  CNAME("_cd603414f7f27bcfb43cdfc5043d737d.bedrock", "_4f1c978109b7f45e73998e64ebb3ac22.wzccmgtwzk.acm-validations.aws."),
  CNAME("bedrock", "d-29limmalw0.execute-api.us-east-2.amazonaws.com."),

  // bedrock mail (Amazon SES sending domain mail.umdh4i.org)
  // Easy DKIM
  CNAME("hivezjp55bvdcatjswkyuwvvl4pimi4q._domainkey.mail", "hivezjp55bvdcatjswkyuwvvl4pimi4q.dkim.amazonses.com."),
  CNAME("bxtlivffyzffp5wolr5hnsjwyfesevbw._domainkey.mail", "bxtlivffyzffp5wolr5hnsjwyfesevbw.dkim.amazonses.com."),
  CNAME("m4my7xb5jgsikdioykcdr72aj7pw3mos._domainkey.mail", "m4my7xb5jgsikdioykcdr72aj7pw3mos.dkim.amazonses.com."),
  // Custom MAIL FROM domain
  MX("bounce.mail", 10, "feedback-smtp.us-east-2.amazonses.com."),
  TXT("bounce.mail", "v=spf1 include:amazonses.com ~all"),
  // DMARC
  TXT("_dmarc.mail", "v=DMARC1; p=none;"),

  // pixels
  CNAME("pixels", "umd-pixels.web.app."),

  // hagar
  // (live site! communicate with npo before changing)
  CNAME("hagar", "hagar-intl.web.app."),


  // https://umdh4i.org/* -> https://umd.hack4impact.org/*
  // Mirrors the rule originally created in the dashboard. The name is how
  // DNSControl matches the rule in Cloudflare; renaming it deletes and
  // recreates the rule.
  CF_SINGLE_REDIRECT(
    "Redirect to umd.hack4impact.org",
    301,
    '(http.request.full_uri wildcard r"https://umdh4i.org/*")',
    'wildcard_replace(http.request.full_uri, r"https://umdh4i.org/*", r"https://umd.hack4impact.org/${1}")'
  ),
);
