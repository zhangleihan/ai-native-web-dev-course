# FastAPI 案例库入门实验

对应教材第5讲 FastAPI 对照教程。使用 Python 3.12，从课程根目录执行：

```bash
cd labs/fastapi-basics
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-lock.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Windows PowerShell 激活命令为 `.venv\Scripts\Activate.ps1`。打开 http://127.0.0.1:8001/docs 交互调用，访问 `/openapi.json` 查看接口描述。另一个已激活虚拟环境的终端执行 `python -m unittest -v`。

接口：GET /api/health、GET/POST /api/cases、GET /api/cases/{case_id}。创建需要 title、industry、difficulty，后者允许 beginner/intermediate/advanced。列表支持 kw 和 difficulty。验证错误为422，缺失资源为404，创建成功为201并返回Location。

内存数据在进程重启、开发热重载后丢失；只用单进程本机练习，未实现数据库、认证和跨进程一致性。依赖范围位于 requirements.txt；验证后生成的 requirements-lock.txt 记录本次解析版本，可用 `python -m pip install -r requirements-lock.txt` 复现。

## 验证记录

2026-10-28：Python 3.12 环境中3项接口测试通过。测试依赖提示 httpx 适配未来将弃用，当前锁定组合可用；未验证公网部署和真实数据库。

## 分页依赖独立示例

`dependency_demo.py` 对应教材Depends一节；执行 `python -m uvicorn dependency_demo:app --host 127.0.0.1 --port 8002`。GET /api/page-demo?offset=0&limit=2 返回分页值，limit=0返回422。它是独立概念示例，未改变基础案例API的查询能力。
