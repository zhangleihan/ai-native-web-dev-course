#!/usr/bin/env python3
"""Build offline course.js from lecture markdown."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_DIR = ROOT / "markdown"
DATA_DIR = ROOT / "data"

LECTURES = [
    (0, "课程介绍", "课程目标"),
    (1, "AI 时代的网络应用开发", "浏览器、服务器与 SPA"),
    (2, "Web 与 HTTP 原理", "HTTP GET/POST、状态码与报文头"),
    (3, "现代前端基础", "内容、外观、行为：三块原生练习"),
    (4, "React 与组件化", "组件、props、state 与列表的 key"),
    (5, "后端与 REST API", "REST 资源、Express 与 JSON 契约"),
    (6, "数据库与数据建模", "关系表、外键、事务：从 Ontology 到 SQL"),
    (7, "前后端集成", "fetch、CORS 与三种 UI 状态"),
    (8, "身份认证与 Web 安全", "认证、授权、Token 与不能信任的前端"),
    (9, "实时 Web 应用", "轮询、SSE 与服务器推送"),
    (10, "测试与软件工程", "API 测试、组件测试与评测分层"),
    (11, "Docker 与部署", "镜像、Compose 与 CI 流水线"),
    (12, "AI Coding 与 Vibe Coding", "TypeScript 护栏与可验证规格"),
    (13, "LLM Web Application", "服务端模型、JSON Schema 与流式输出"),
    (14, "Agentic Web Application", "单向数据流、工具循环与审批状态机"),
    (15, "AI-FDE 综合项目", "路由、hooks 与可演示切片"),
    (16, "Demo Day 与架构复盘", "把请求链讲圆：哪些线已经变实"),
]

# 默认四节；第 3 讲把 JS / 花艺瓶 / 打字游戏拆成独立小节
DEFAULT_KINDS = [
    ("key", "", None),  # title 用 LECTURES 第三列
    ("project", "a", "项目关联"),
    ("class", "b", "课堂练习"),
    ("homework", "c", "课后练习"),
]

LECTURE_0_SECTIONS = [
    ("key", "", "课程目标"),
    ("content", "a", "核心内容"),
    ("assess", "b", "考核与授课方式"),
    ("contact", "c", "教师、微信群与开发环境"),
]

LECTURE_3_SECTIONS = [
    ("key", "", "内容、外观、行为：三块原生练习"),
    ("js", "a", "JavaScript 基础"),
    ("terrarium", "b", "花艺瓶：HTML、CSS 与 DOM"),
    ("typing", "c", "打字游戏：事件驱动"),
    ("project", "d", "项目关联"),
    ("class", "e", "课堂练习"),
    ("homework", "f", "课后练习"),
]

INTRO = """
<p>先上 <strong>第 0 讲课程介绍</strong>（目标、大纲、考核、微信群），再进入 <strong>16 讲 × 2 学时 = 32 学时</strong>正课。目标：抓住网络应用开发的原理，用 AI Coding 把 <strong>AI-FDE 工程管理实训平台</strong>（<code>FDE-Workspace/web</code>）从 Fake Data POC 做成可持久化、可认证、可跑真实模型的系统。</p>
<p>贯穿案例就是这个平台：登录与角色、案例库（Golden Case「通信网络故障处理」）、Discover → Eval、Agent Studio、FDE Copilot。Full Stack Open 的原理写进各讲关键内容。第 3 讲的原生练习材料在 <code>labs/js-basics</code>、<code>labs/terrarium</code>、<code>labs/typing-game</code>。</p>
<p>每讲通常四节：关键内容（标题随讲次变化）、项目关联、课堂练习、课后练习。第 3 讲额外拆出 JavaScript、花艺瓶、打字游戏三个独立小节。</p>
""".strip()

ATTRIBUTION = """
课堂讲义由授课团队编写，原理部分融合赫尔辛基大学 Full Stack Open 中文版（CC BY-NC-SA 3.0，中文翻译 ZhangWei）的可教学要点。第 3 讲原生练习改编自旧课 native-web-app-dev（Web Dev for Beginners）。平台案例来自 AI-FDE 工程管理实训平台 POC。对外再分发须保留署名与相同许可。
""".strip()


def read_lecture_md(lecture: int, kind: str) -> str:
    path = MD_DIR / f"{lecture:02d}-{kind}.md"
    text = path.read_text(encoding="utf-8")
    if text.startswith("# "):
        text = text.split("\n", 1)[1].lstrip()
    return text.strip() + "\n"


def sections_spec(num: int, key_title: str) -> list[tuple[str, str, str]]:
    if num == 0:
        return LECTURE_0_SECTIONS
    if num == 3:
        return LECTURE_3_SECTIONS
    out = []
    for kind, letter, title in DEFAULT_KINDS:
        out.append((kind, letter, key_title if title is None else title))
    return out


def main() -> None:
    pages = {}
    parts = []
    for num, title, key_title in LECTURES:
        specs = sections_spec(num, key_title)
        sections = []
        for kind, letter, sec_title in specs:
            key = str(num) if not letter else f"{num}-{letter}"
            pages[key] = read_lecture_md(num, kind)
            sections.append({"id": key, "letter": letter, "title": sec_title})
        parts.append({"id": str(num), "title": title, "hours": 2, "sections": sections})

    payload = {
        "title": "AI 原生网络应用开发",
        "subtitle": "32 学时 · 以 FDE 实训平台为贯穿案例",
        "intro": INTRO,
        "attribution": ATTRIBUTION,
        "parts": parts,
        "pages": pages,
    }
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    js = "window.COURSE_DATA = " + json.dumps(payload, ensure_ascii=False).replace("<", "\\u003c") + ";\n"
    (DATA_DIR / "course.js").write_text(js, encoding="utf-8")
    print(f"wrote {len(pages)} pages -> {DATA_DIR / 'course.js'}")


if __name__ == "__main__":
    main()
