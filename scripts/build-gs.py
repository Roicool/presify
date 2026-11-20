#!/usr/bin/env python3
"""Minify webflow/global-styles.src.html → webflow/global-styles.html (the Webflow embed copy).

Webflow HtmlEmbed settings are capped at 50,000 characters, so the embed holds the minified file.
Edit the .src file, run `python3 scripts/build-gs.py`, paste/write global-styles.html into the embed.
"""
import pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent / 'webflow'
s = (root / 'global-styles.src.html').read_text()
body = s[s.index('<style>') + 7:s.rindex('</style>')]
ver = re.search(r'GLOBAL CSS\s+(P[\d.]+)', body).group(1)
body = re.sub(r'/\*.*?\*/', '', body, flags=re.S)
body = re.sub(r'\s+', ' ', body)
body = re.sub(r'\s*([{};,>])\s*', r'\1', body).replace(';}', '}').strip()
out = f'<style>/* Presify Global CSS {ver} (minified; source: Roicool/presify webflow/global-styles.src.html) */{body}</style>\n'
if len(out) > 50000:
    sys.exit(f'Too long for a Webflow embed: {len(out)} chars')
(root / 'global-styles.html').write_text(out)
print(f'{ver}: {len(out)} chars')
