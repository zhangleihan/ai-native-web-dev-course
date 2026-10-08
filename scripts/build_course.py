#!/usr/bin/env python3
"""Build offline course.js from lecture markdown."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_DIR = ROOT / "markdown"
DATA_DIR = ROOT / "data"

LECTURES = [
    (0, "课前导读（不另计学时）", "课程目标"),
    (1, "AI 时代的网络应用开发", "浏览器、服务器与 SPA"),
    (2, "Web 与 HTTP 原理", "HTTP GET/POST、状态码与报文头"),
    (3, "现代前端基础", "语义、布局与事件：案例筛选"),
    (4, "React 与组件化", "组件、props、state 与列表的 key"),
    (5, "后端与 REST API", "REST 资源、Express 与 JSON 契约"),
    (6, "数据库与数据建模", "约束、参数化查询与事务"),
    (7, "前后端集成", "fetch、CORS 与请求生命周期"),
    (8, "身份认证与 Web 安全", "认证、授权、Token 与不能信任的前端"),
    (9, "实时 Web 应用", "轮询、SSE 与服务器推送"),
    (10, "测试与软件工程", "API 测试、组件测试与评测分层"),
    (11, "Docker 与部署", "镜像、Compose 与 CI 流水线"),
    (12, "AI Coding 与 Vibe Coding", "TypeScript 护栏与可验证规格"),
    (13, "LLM Web Application", "服务端模型、JSON Schema 与流式输出"),
    (14, "Agentic Web Application", "工具循环、授权与审批状态机"),
    (15, "AI-FDE 综合项目", "贯通业务链与小型评估集"),
    (16, "Demo Day 与架构复盘", "用证据说明系统能力"),
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
    ("key", "", "语义、布局与事件：案例筛选"),
    ("js", "a", "JavaScript 基础"),
    ("terrarium", "b", "花艺瓶：HTML、CSS、DOM 与闭包"),
    ("typing", "c", "打字游戏：事件、状态与 DOM"),
    ("project", "d", "项目关联"),
    ("class", "e", "课堂练习"),
    ("homework", "f", "课后练习"),
]

INTRO = """
<p><strong>16 讲 × 2 学时 = 32 学时</strong>。第 0 部分为课前导读，不另占学时。以 AI-FDE 的最小业务切片或独立案例库，理解并实现现代全栈与 AI 原生应用。</p>
<p>主线：交互页面 → 案例 API 与数据库 → 身份及权限 → 测试与交付 → 带证据的 AI 建议 → 受控工具执行。完整平台、多 Agent 和复杂基础设施为拓展。</p>
<p>每讲包含目标、概念与示例、自检、项目关联、课堂练习、课后练习。第 3 讲另保留 JavaScript 补充与两项选修实验。模拟数据与真实服务必须明确区分。</p>
""".strip()

ATTRIBUTION = """
本教材参考 Full Stack Open 及各讲列出的官方资料；旧课实验保留原材料署名。各来源版权与许可独立，公开阅读不等于可任意再分发。详见仓库 SOURCES.md。正文按课程目标重新组织，外部链接不表示已复制全部内容。
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
            if kind == "key":
                sec_title = (MD_DIR / f"{num:02d}-key.md").read_text(encoding="utf-8").splitlines()[0].removeprefix("# ")
            sections.append({"id": key, "letter": letter, "title": sec_title})
        parts.append({"id": str(num), "title": title, "hours": 0 if num == 0 else 2, "sections": sections})

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
