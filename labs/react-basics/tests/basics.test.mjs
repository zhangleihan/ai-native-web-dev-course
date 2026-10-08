import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { initialCases, filterCases, toggleFavorite } from '../src/model.js';

const ids = items => items.map(item => item.id);
test('筛选：全部、关键词规范化、行业、组合与空结果', () => {
  assert.equal(filterCases(initialCases, '', 'all', false, []).length, 3);
  assert.deepEqual(ids(filterCases(initialCases, ' DNS ', 'telecom', false, [])), ['case-003']);
  assert.equal(filterCases(initialCases, '', 'telecom', false, []).length, 2);
  assert.equal(filterCases(initialCases, '链路', 'retail', false, []).length, 0);
  assert.equal(filterCases(initialCases, '不存在', 'all', false, []).length, 0);
});
test('收藏与筛选组合；空收藏只看收藏为空', () => {
  assert.deepEqual(ids(filterCases(initialCases, '', 'all', true, ['case-001'])), ['case-001']);
  assert.equal(filterCases(initialCases, '', 'retail', true, ['case-001']).length, 0);
  assert.equal(filterCases(initialCases, '', 'all', true, []).length, 0);
});
test('收藏添加、再次取消和多次更新不修改输入数组', () => {
  const original = Object.freeze(['case-001']);
  const added = toggleFavorite(original, 'case-002');
  assert.deepEqual(added, ['case-001', 'case-002']);
  assert.deepEqual(toggleFavorite(added, 'case-002'), ['case-001']);
  assert.deepEqual(toggleFavorite(original, 'case-001'), []);
  assert.deepEqual(original, ['case-001']);
  assert.notStrictEqual(added, original);
});
test('筛选不修改冻结的案例输入', () => {
  const frozen = Object.freeze(initialCases.map(item => Object.freeze({ ...item })));
  assert.equal(filterCases(frozen, '', 'telecom', false, []).length, 2);
  assert.deepEqual(ids(frozen), ['case-001', 'case-002', 'case-003']);
});

// Bundle the actual components and renderer together; never automate a browser here.
const directory = await mkdtemp(join(tmpdir(), 'react-basics-check-'));
after(() => rm(directory, { recursive: true, force: true }));
const sourceDir = fileURLToPath(new URL('../src/', import.meta.url));
await build({ stdin: {
  contents: `import React from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';
    import CasesPage, { CaseList, CaseCard, FilterBar } from './App.jsx';
    import StaticPage from './StaticPage.jsx';
    import SearchPage from './SearchPage.jsx';
    export function render(name, props = {}) {
      const components = { CasesPage, CaseList, CaseCard, FilterBar, StaticPage, SearchPage };
      return renderToStaticMarkup(React.createElement(components[name], props));
    }`, resolveDir: sourceDir, loader: 'jsx' },
  bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic',
  outfile: join(directory, 'render.cjs'), logLevel: 'silent' });
const { render } = (await import(pathToFileURL(join(directory, 'render.cjs')).href)).default;
test('三个阶段可以实际静态渲染；数量与卡片标题正确', () => {
  assert.equal((render('StaticPage').match(/<li>/g) || []).length, 3);
  assert.match(render('SearchPage'), /找到 3 条案例/);
  const complete = render('CasesPage');
  assert.match(complete, /显示 3 \/ 3 条 · 已收藏 0 条/);
  assert.match(complete, /DNS 解析失败/);
});
test('空态与收藏按钮的可访问状态', () => {
  assert.match(render('CaseList', { items: [], favoriteIds: [], onToggleFavorite() {} }), /没有匹配/);
  const card = render('CaseCard', { item: initialCases[0], isFavorite: true, onToggleFavorite() {} });
  assert.match(card, /aria-pressed="true"/);
  assert.match(card, /aria-label="取消收藏：链路中断"/);
});
test('受控筛选展示父组件传入的值，而不是另存默认值', () => {
  const html = render('FilterBar', { keyword: 'DNS', industry: 'telecom', onlyFavorites: true,
    onKeywordChange() {}, onIndustryChange() {}, onOnlyFavoritesChange() {}, onReset() {} });
  assert.match(html, /value="DNS"/);
  assert.match(html, /value="telecom" selected=""/);
  assert.match(html, /type="checkbox" checked=""/);
});
