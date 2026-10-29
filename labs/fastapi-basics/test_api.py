import unittest
from fastapi.testclient import TestClient
from main import create_app


class ContractTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(create_app())
        self.addCleanup(self.client.close)

    def test_create_read_filter(self):
        response = self.client.post("/api/cases", json={"title": " 链路中断 ", "industry": "通信", "difficulty": "beginner"})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["title"], "链路中断")
        self.assertEqual(self.client.get(response.headers["location"]).json(), response.json())
        self.assertEqual(self.client.get("/api/cases?kw=链路").json()["total"], 1)
        self.assertEqual(self.client.get("/api/cases?difficulty=advanced").json()["total"], 0)

    def test_invalid_and_missing(self):
        valid = {"title": "案例", "industry": "通信", "difficulty": "beginner"}
        for change in [{"title": " "}, {"difficulty": "easy"}, {"owner": "admin"}, {"title": 42}]:
            self.assertEqual(self.client.post("/api/cases", json=valid | change).status_code, 422)
        self.assertEqual(self.client.post("/api/cases", content="{", headers={"Content-Type": "application/json"}).status_code, 422)
        self.assertEqual(self.client.get("/api/cases/missing").status_code, 404)
        self.assertEqual(self.client.get("/api/cases?difficulty=easy").status_code, 422)

    def test_schema_and_isolation(self):
        schema = self.client.get("/openapi.json").json()
        self.assertIn("201", schema["paths"]["/api/cases"]["post"]["responses"])
        self.client.post("/api/cases", json={"title": "案例", "industry": "通信", "difficulty": "beginner"})
        with TestClient(create_app()) as other:
            self.assertEqual(other.get("/api/cases").json()["total"], 0)


if __name__ == "__main__":
    unittest.main()
