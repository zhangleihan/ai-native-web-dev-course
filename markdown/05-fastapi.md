# FastAPI 教程：参数、模型、响应与工程组织

## 1. 用同一个业务问题学习 Python 后端

案例库后端需要读取集合、创建记录并查询详情。本节使用 FastAPI 完成这三类接口，与 Express 的请求处理方式比较。先学清输入从哪里来、何时校验、如何返回结果，再扩展工程组织；不要求把综合实验整体改写成 Python。

Python 路线需要能阅读函数、字典、列表推导式和类型注解。下面这些写法在后续代码中会反复出现：

| 写法 | 含义 | 与接口开发的关系 |
|---|---|---|
| `def get_case(case_id: str):` | 声明函数和参数类型 | 对应一条请求的处理函数 |
| `@app.get('/path')` | 使用装饰器登记函数 | 把路径和函数关联 |
| `str \| None` | 字符串或 None | 表达可缺省参数 |
| `Literal['beginner', ...]` | 限定允许的字面值 | 表达枚举规则 |
| `class CaseInput(BaseModel)` | 定义 Pydantic 模型 | 集中描述输入字段 |
| `**body.model_dump()` | 将字典展开为关键字参数 | 用已校验字段构造对象 |
| `raise HTTPException(...)` | 抛出框架识别的异常 | 中断正常执行并返回错误 |

FastAPI 是框架，Uvicorn 是承载应用的 ASGI 服务器，Pydantic 负责模型校验。三者一起工作，不是三个互相替代的框架。装饰器、参数与文档入口可参考[官方 First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)。

## 2. 建立隔离环境并启动

从课程根目录执行，使用 Python 3.12：

```bash
cd labs/fastapi-basics
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-lock.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Windows PowerShell 使用 `.venv\Scripts\Activate.ps1` 激活。虚拟环境隔离项目依赖；锁文件记录本次验证版本。不要把 .venv 复制进仓库。

`main:app` 表示从 main.py 导入名为 app 的应用对象。`--reload` 用于开发修改后重启；不是生产部署方案。端口8001与 Express 实验的3002不同，先确认自己正在请求哪一个服务。

| 地址 | 用途 |
|---|---|
| `http://127.0.0.1:8001/api/health` | 检查服务是否响应 |
| `http://127.0.0.1:8001/docs` | 浏览交互文档并发送请求 |
| `http://127.0.0.1:8001/openapi.json` | 获取机器可读接口描述 |

打开 `/docs`，展开 POST /api/cases，选择 Try it out，提交一个完整对象。观察响应中的201和 Location，再调用 GET 详情读取它。文档是方便的接口客户端，不能代替业务正确性与权限检查。

## 3. 用函数签名说明参数来自哪里

```python
@app.get("/api/cases/{case_id}", response_model=CaseOut)
def get_case(case_id: str):
    if case_id not in items:
        raise HTTPException(status_code=404, detail="案例不存在")
    return items[case_id]
```

这段来自配套 main.py 的 create_app。`case_id` 出现在路径模板中，因此框架从路径读取它；CaseOut 是响应模型；items 是外围函数中创建的内存字典。

集合函数包含：

```python
def list_cases(kw: str = Query(default="", max_length=100),
               difficulty: Difficulty | None = None):
    ...
```

这里没有同名路径占位符，kw 与 difficulty 属于查询参数。Query 补充默认值和约束，省略 kw 表示空字符串；省略 difficulty 表示不按难度限制。GET `/api/cases?kw=链路&difficulty=beginner` 按两个条件的交集筛选。

创建函数的 `body: CaseInput` 则声明请求体；`response: Response` 是框架提供的响应对象，不需要客户端提交名为 response 的 JSON 字段。不要将 Python 函数的所有参数都误认为查询参数。[请求体与参数识别](https://fastapi.tiangolo.com/tutorial/body/)

## 4. 把请求模型与响应模型分开

```python
Difficulty = Literal["beginner", "intermediate", "advanced"]

class CaseInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    title: str = Field(min_length=1, max_length=100)
    industry: str = Field(min_length=1, max_length=50)
    difficulty: Difficulty

class CaseOut(CaseInput):
    id: str

class CaseList(BaseModel):
    items: list[CaseOut]
    total: int
```

CaseInput 是客户端可以提交的字段；CaseOut 继承这些字段并增加服务器生成的 id；CaseList 描述集合响应。创建模型没有 id，客户端提交 id 会被 extra="forbid" 拒绝。

`str_strip_whitespace=True` 让模型先规范化字符串，再验证长度。全空格标题会被拒绝。Field 说明长度，Literal 说明难度枚举。未知字段被拒绝，可以尽早发现客户端将 difficulty 拼错等问题。

类型注解本身不会阻止任意 Python 函数被错误调用。这里的校验由 FastAPI 与 Pydantic 在请求入口执行。框架也可能转换某些输入，如查询整数参数从文本转换为 int；需要严格类型时应明确配置并测试，不笼统理解为“类型不符全部自动拒绝”。

数据模型不等于数据库实体。BaseModel 不会自动建表；第6讲将区分接口模型、数据库结构与映射关系。

## 5. 追踪一次创建请求

完整关键逻辑如下，定义在 create_app 的作用域中：

```python
@app.post("/api/cases", response_model=CaseOut, status_code=201)
def create_case(body: CaseInput, response: Response):
    item = CaseOut(id=str(uuid4()), **body.model_dump())
    items[item.id] = item
    response.headers["Location"] = f"/api/cases/{item.id}"
    return item
```

处理顺序为：收到 JSON → 校验 CaseInput → 调用函数 → 生成 UUID → 写入内存 → 设置 Location → 按 CaseOut 返回 JSON。输入校验失败时，函数不会执行，自然也不会写入记录。

函数返回 Python 对象即可，由框架负责生成 JSON。response_model 同时表达输出结构、进行响应校验并限制输出字段；例如内部对象将来多出调试字段，明确响应模型有助于避免无意暴露。输出字段的选择仍须依据产品与安全规则。[响应模型与输出过滤](https://fastapi.tiangolo.com/tutorial/response-model/)

服务端违反响应模型属于实现错误，不能把它算成用户输入错误。如果给 total 返回无法解释为整数的值，需要修正实现，而不是让客户端换请求。

## 6. 读懂错误结构

提交 `{"title":"","industry":"通信","difficulty":"beginner"}`，会得到422。下面为简化形状，实际内容以当前版本输出为准：

```json
{
  "detail": [
    {"loc": ["body", "title"], "msg": "校验消息", "type": "校验类型"}
  ]
}
```

loc 帮助定位参数来自 body、query 或 path 以及具体字段；msg 描述校验问题。不要对某个版本完整错误文本做脆弱的字符串判断。字段错误需要修正输入，服务端500则需要检查实现或外部依赖。

资源不存在时主动抛出 `HTTPException(status_code=404, detail="案例不存在")`，响应为 detail 字段。它与422的列表形状不同，前端应处理这一差异。FastAPI 允许自定义异常处理器，以适配团队已有错误契约。[HTTPException 与校验错误](https://fastapi.tiangolo.com/tutorial/handling-errors/)

| 意图 | Express 入门实验 | FastAPI 基础实验 |
|---|---|---|
| 创建成功 | 201 + Location | 201 + Location |
| 校验失败 | 400 + error | 422 + detail |
| 缺失详情 | 404 + error | 404 + detail |
| 支持的列表查询 | kw、industry、difficulty、offset、limit | kw、difficulty |
| 支持的资源操作 | 列表、详情、创建、PATCH、DELETE | 列表、详情、创建 |
| 框架默认生成OpenAPI | 不会；本讲工具扩展独立维护描述 | 从路由与模型导出 |

二者共享业务主题，但当前不是完全可互换的后端。先补齐能力和契约差异，再替换前端调用。

## 7. 从一个文件组织到多个模块

当前 main.py 用少量代码展示完整请求链。项目增加时可按下面的结构逐步拆分：

```text
app/
  main.py          创建应用与注册路由
  schemas.py       CaseInput、CaseOut 等接口模型
  routers/
    cases.py       案例接口
  services/        业务规则
  repositories/    存储访问
```

FastAPI 的 APIRouter 可以将同类接口放在一个模块，再由 app.include_router 注册。下面是结构示意，router 和 create_case 应由实际模块导入或定义：

```python
router = APIRouter(prefix="/api/cases", tags=["cases"])
router.add_api_route("", create_case, methods=["POST"],
                     response_model=CaseOut, status_code=201)
app.include_router(router)
```

prefix 统一路径，tags 方便文档分组；它们并不自动赋予访问权限。不必在只有三条接口时建立十几个空模块，先让拆分解决代码边界问题。[官方多文件应用](https://fastapi.tiangolo.com/tutorial/bigger-applications/)

## 8. 依赖注入：复用处理前置步骤

如果多个列表接口都需要分页参数，可以把解析规则放进共同函数，再用 Depends 声明。下面是独立小例子，可保存为 dependency_demo.py，并用 `python -m uvicorn dependency_demo:app --port 8002` 运行：

```python
from typing import Annotated
from fastapi import Depends, FastAPI, Query

app = FastAPI()

def page_args(offset: int = Query(default=0, ge=0),
              limit: int = Query(default=10, ge=1, le=50)):
    return {"offset": offset, "limit": limit}

@app.get("/api/page-demo")
def page_demo(page: Annotated[dict, Depends(page_args)]):
    return page
```

请求 `/api/page-demo?offset=0&limit=2` 返回解析后的分页值；`limit=0` 返回422。FastAPI 先解析 page_args 的参数，再将结果提供给 page_demo。传给 Depends 的是函数本身，不能写成 `Depends(page_args())` 提前执行。

这展示了依赖注入的工作方式，并未给基础案例 API 自动增加分页。实际项目可进一步提供数据库连接或已验证用户；定义一个函数名为 get_user，也不代表认证已经实现。[依赖系统](https://fastapi.tiangolo.com/tutorial/dependencies/)

## 9. 更新时区分未提交和 null

扩展 PATCH 时，首先决定字段省略、默认值和显式 null 的语义。如果把所有缺省字段连同默认值写回对象，就可能覆盖用户没有修改的数据。

Pydantic 可通过 `model_dump(exclude_unset=True)` 提取显式提交的字段。例如仅提交标题时，更新字典应只有 title。之后还需验证字段是否允许为 null、更新后的对象是否完整有效，以及编号对应资源是否存在；不能只做一个不加检查的字典合并。[部分更新](https://fastapi.tiangolo.com/tutorial/body-updates/)

本实验尚未实现 PATCH。练习时先参考 Express 的契约，再确定 Python 的错误状态与结构。不要在文档中把拟实现内容写成已经通过验证。

## 10. 同步、异步与状态生命周期

普通 def 处理函数可用于同步库，FastAPI 会安排其在线程池执行。支持异步的数据库或 HTTP 客户端适合 async def 配合 await；把阻塞调用写在 async 函数中并不会自动转换为非阻塞调用。CPU 密集计算通常还需考虑单独进程、任务系统等方案。[官方异步说明](https://fastapi.tiangolo.com/async/)

create_app 每次创建独立字典；请求之间共享同一应用实例的字典，应用实例之间不共享。浏览器刷新保留进程数据；停止服务、开发热重载、增加新进程后则是不同生命周期。此例不能以多个 worker 可靠共享案例。

## 11. 保存验证证据

另一个已激活环境的终端运行 `python -m unittest -v`。现有测试验证创建和详情、筛选、坏 JSON 与字段错误、404、OpenAPI 以及应用实例隔离。它们通过 TestClient 调用应用，不要求先监听固定端口。[FastAPI 测试教程](https://fastapi.tiangolo.com/tutorial/testing/)

手工再做一次完整流程：创建 → 读取 Location → 按难度筛选 → 提交非法字段 → 重启 → 重新查询。分别记录状态码、返回对象与集合数量。自动测试并没有验证浏览器跨源调用、真实数据库或用户权限。

## 自检与参考答案

<details><summary>为什么 CaseOut 应包含 id，而 CaseInput 不接受它？</summary><p>服务器负责分配标识。区分输入和输出，能够限制客户端可写字段，并向前端明确说明创建后会得到哪些数据。</p></details>

<details><summary>为什么 Depends 应接收函数，而不是函数执行结果？</summary><p>框架需要在请求处理时解析参数并调用依赖。提前调用会失去当前请求上下文和自动校验机制。</p></details>

<details><summary>自动生成的文档已经列出201，还要测试什么？</summary><p>还需实际创建，验证状态码、Location、响应内容、后续读取及校验失败没有副作用；声明与运行可能不一致。</p></details>

## 阅读定位

★★★★★ [First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)与[Request Body](https://fastapi.tiangolo.com/tutorial/body/)：对照完整基础实验，读懂参数到函数的过程。

★★★★☆ [Response Model](https://fastapi.tiangolo.com/tutorial/response-model/)、[Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)、[Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)：在基础接口通过后阅读。

完整实验见 [labs/fastapi-basics](labs/fastapi-basics/README.md)。核查日期2026-10-28，代码 API 采用 Pydantic 2；旧教程的 dict 等写法不要与本例混用。

## OpenAPI自动化对照

继续阅读[OpenAPI与自动化工具](#/part/5/g)，区分框架从代码导出的描述与设计先行的独立契约。FastAPI默认/openapi.json、/docs、/redoc分别提供描述与文档入口；自动生成不代表全部运行时错误都已声明。当前Python案例的422/detail与Express的400/error不同，不可共用同一份响应契约。
