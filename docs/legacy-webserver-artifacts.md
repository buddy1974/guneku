# Legacy web-server artefacts — preserved text, non-operative

Three files were removed from `public/images/gallery/mchibe-mta-event-guneku2023/` on
2026-09-06 and their contents preserved here. They are recorded as **history, not
configuration**. Nothing in this document is read by anything.

They came from the retired Joomla site and are Joomla's standard "protect this folder" trio:
an Apache directive, its IIS equivalent, and a blank page to defeat directory listing. All
three were written to make a directory unreachable.

**Under Next.js on Vercel they did the opposite.** Next serves everything inside `public/`
as a static asset and reads none of it as configuration. Verified in production on
2026-09-06, before removal:

| Path | Response |
|---|---|
| `…/.htaccess` | `200 application/octet-stream`, 30 bytes — the deny rule, downloadable |
| `…/web.config` | `200 application/octet-stream`, 186 bytes — the deny rule, downloadable |
| `…/index.html` | `200 text/html`, 47 bytes |
| `…/` (the directory itself) | `200 text/html` — served the blank page |

Two files whose entire content is *deny everyone* were handed to anyone who asked for them,
and the file written to hide the folder was serving a blank white page on the guneku.org
domain. This is R-007's lesson in its plainest form: **`public/` is served, and a rule about
access that lives inside it is just a file.** Access control on this site is
`middleware.ts`, and nothing else.

---

## `.htaccess` — 31 bytes

```
order deny,allow
deny from all
```

Apache access control. Next.js and Vercel do not read `.htaccess`.

## `web.config` — 193 bytes

```xml
<?xml version="1.0" encoding="utf-8" ?>
<configuration>
    <system.web>
        <authorization>
            <deny users="*"/>
        </authorization>
    </system.web>
</configuration>
```

The IIS equivalent of the same rule. Equally inert here.

## `index.html` — 50 bytes

```html
<html>
<body bgcolor="#FFFFFF">
</body>
</html>
```

A blank page, the old trick for stopping a web server from listing a directory. Next does not
list directories, so it prevented nothing — and because Next resolves a directory request to
`index.html`, it was what the directory URL returned.

---

## If any of these ever seem needed again

They are not. Restoring one would not restore the protection it describes; it would put the
text back inside a directory that is served. A path that must not be public belongs outside
`public/` — `archive-held/` for material the record says must not be published,
`archive-staging/` for material nobody has classified yet.
