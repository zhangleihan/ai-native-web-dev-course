#!/usr/bin/env python3
"""Check generated course, teaching structure and local links without networking."""
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit
from build_course import LECTURES, read_lecture_md, sections_spec
ROOT = Path(__file__).resolve().parents[1]
def main():
    errors = []
    raw = (ROOT / 'data/course.js').read_text()
    data = json.loads(raw.removeprefix('window.COURSE_DATA = ').strip().removesuffix(';'))
    if len(data['pages']) != 71: errors.append('Expected 71 pages')
    if sum(p['hours'] for p in data['parts']) != 32: errors.append('Hours must total 32')
    if data['parts'][0]['hours'] != 0: errors.append('Orientation must not add hours')
    ids = [s['id'] for p in data['parts'] for s in p['sections']]
    if len(ids) != len(set(ids)) or set(ids) != set(data['pages']): errors.append('Route/page mismatch')
    checked_links = 0
    for num, title, key_title in LECTURES:
        for kind, letter, _ in sections_spec(num, key_title):
            key = str(num) if not letter else f'{num}-{letter}'
            text = read_lecture_md(num, kind)
            if data['pages'].get(key) != text: errors.append(f'{key}: generated data stale')
            if len(re.findall(r'^```', text, re.M)) % 2: errors.append(f'{key}: unclosed fence')
            if num and kind == 'key':
                for heading in ['## 学习目标与课前准备', '## 自检与参考答案', '## 阅读定位']:
                    if heading not in text: errors.append(f'{key}: missing {heading}')
            # Links in rendered pages are relative to index.html, not markdown/.
            clean = re.sub(r'```.*?```', '', text, flags=re.S)
            clean = re.sub(r'`[^`\n]+`', '', clean)
            links = re.findall(r'\]\(([^\s)]+)\)', clean) + re.findall(r'(?:src|href)="([^"]+)"', clean)
            for link in links:
                parsed = urlsplit(link)
                if parsed.scheme or link.startswith(('#', '/')): continue
                path = ROOT / unquote(parsed.path)
                checked_links += 1
                if not path.exists(): errors.append(f'{key}: missing {link}')
    for link in re.findall(r'(?:src|href)="([^"]+)"', (ROOT/'index.html').read_text()):
        parsed = urlsplit(link)
        if not parsed.scheme and parsed.path and not (ROOT/parsed.path).exists(): errors.append(f'index: missing {link}')
    if errors:
        print('\n'.join(errors)); return 1
    print(f'PASS: 71 pages, 32 hours, 16 learning/self-check sections, {checked_links} local content links, generated data matches source')
    return 0
if __name__ == '__main__': sys.exit(main())
