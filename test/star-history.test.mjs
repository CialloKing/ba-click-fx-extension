import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  fetchCurrentStargazerDates,
  formatHistoryDate,
  parseStarHistoryCsv,
  reconstructStarHistory,
  renderStarHistorySvg,
  serializeStarHistoryCsv,
  updateStarHistory,
  upsertObservedStarCount,
} from '../scripts/update-star-history.mjs';

const repository = 'CialloKing/ba-click-fx-extension';
const observedAt = '2026-09-02T19:17:00.000Z';
const observation = { date: '2026-09-03', stars: 55, observedAt };
const runtimeOptions =
{
  apiUrl: 'https://api.github.test',
  now: new Date(observedAt),
  repository,
  token: 'test-token',
};
const response = (payload, status = 200) => Response.json(payload, { status });

function temporaryDirectory(t)
{
  const directory = mkdtempSync(join(tmpdir(), 'ba-click-fx-extension-stars-'));

  t.after(() => rmSync(directory, { force: true, recursive: true }));
  return directory;
}

test('Star API 自动分页、去重并按上海日期回溯', async () =>
{
  const requestedPages = [];
  const firstPage = Array.from({ length: 100 }, (_, index) =>
    ({ starred_at: '2026-09-01T15:59:59.000Z', user: { id: index + 1 } }));
  const dates = await fetchCurrentStargazerDates(
  {
    ...runtimeOptions,
    fetchImpl: async (url, init) =>
    {
      const page = Number(url.searchParams.get('page'));

      assert.equal(url.searchParams.get('per_page'), '100');
      assert.equal(url.pathname, `/repos/${repository}/stargazers`);
      assert.equal(init.headers.Authorization, 'Bearer test-token');
      assert.equal(init.headers.Accept, 'application/vnd.github.star+json');
      requestedPages.push(page);
      return response(page === 1 ? firstPage :
        [firstPage[0], { starred_at: '2026-09-01T16:00:00.000Z', user: { id: 101 } }]);
    },
  });

  assert.deepEqual(requestedPages, [1, 2]);
  assert.equal(dates.length, 101);
  assert.equal(formatHistoryDate(dates[0]), '2026-09-01');
  assert.equal(formatHistoryDate(dates.at(-1)), '2026-09-02');
  assert.deepEqual(reconstructStarHistory(dates, '2026-09-03'),
  [
    { date: '2026-09-01', stars: 100, source: 'reconstructed', observedAt: '' },
    { date: '2026-09-02', stars: 101, source: 'reconstructed', observedAt: '' },
  ]);
});

test('同日幂等、更新数量、取消 Star 与漏跑日期均保留真实观测', () =>
{
  const first = upsertObservedStarCount([], observation);
  const repeated = upsertObservedStarCount(first.rows,
    { ...observation, observedAt: '2026-09-02T20:17:00.000Z' });
  const changed = upsertObservedStarCount(first.rows,
    { ...observation, stars: 56, observedAt: '2026-09-02T20:17:00.000Z' });
  const decreased = upsertObservedStarCount(changed.rows,
    { date: '2026-09-05', stars: 54, observedAt: '2026-09-04T19:17:00.000Z' });

  assert.equal(repeated.changed, false);
  assert.deepEqual(repeated.rows, first.rows);
  assert.equal(changed.rows.length, 1);
  assert.equal(changed.rows[0].stars, 56);
  assert.equal(changed.rows[0].observedAt, '2026-09-02T20:17:00.000Z');
  assert.deepEqual(decreased.rows.map(({ date, stars }) => [date, stars]),
    [['2026-09-03', 56], ['2026-09-05', 54]]);
  assert.deepEqual(parseStarHistoryCsv(serializeStarHistoryCsv(decreased.rows)), decreased.rows);
});

test('CSV 接受单个 BOM，拒绝无效日期、重复日期、负数与错误来源', () =>
{
  const rows = upsertObservedStarCount([], observation).rows;
  const csv = serializeStarHistoryCsv(rows);

  assert.deepEqual(parseStarHistoryCsv(`\uFEFF${csv}`), rows);
  for (const invalidCsv of
  [
    `\uFEFF\uFEFF${csv}`,
    csv.replaceAll('\n', '\r\n'),
    'date,stars\n2026-09-03,55\n',
    'date,stars,source,observed_at\n2026-02-30,1,reconstructed,\n',
    csv.replace(',55,', ',-1,'),
    csv.replace(',observed,', ',estimated,'),
    csv.replace(observedAt, ''),
    csv.replace(observedAt, '2026-09-01T19:17:00.000Z'),
    csv + csv.split('\n')[1] + '\n',
  ])
  {
    assert.throws(() => parseStarHistoryCsv(invalidCsv));
  }
});

test('初始化同时生成回溯和当天实测，文件使用 BOM 与 LF 且重复更新不改写', async (t) =>
{
  const dataDir = temporaryDirectory(t);
  const options =
  {
    ...runtimeOptions,
    dataDir,
    fetchImpl: async (url) => response(url.pathname.endsWith('/stargazers')
      ? [{ starred_at: '2026-09-01T10:00:00Z', user: { id: 1 } }]
      : { stargazers_count: 55 }),
  };
  const initial = await updateStarHistory({ ...options, bootstrap: true });

  assert.deepEqual(initial.rows.map(({ date, stars, source }) => [date, stars, source]),
  [
    ['2026-09-01', 1, 'reconstructed'],
    ['2026-09-02', 1, 'reconstructed'],
    ['2026-09-03', 55, 'observed'],
  ]);
  assert.deepEqual(readdirSync(dataDir).sort(), ['README.md', 'star-history.svg', 'stars.csv']);
  const snapshot = Object.fromEntries(readdirSync(dataDir)
    .map((name) => [name, readFileSync(join(dataDir, name), 'utf8')]));

  for (const content of Object.values(snapshot))
  {
    assert.equal(content[0], '\uFEFF');
    assert.notEqual(content[1], '\uFEFF');
    assert.equal(content.includes('\r'), false);
  }
  assert.deepEqual(parseStarHistoryCsv(snapshot['stars.csv']), initial.rows);
  assert.match(snapshot['README.md'], /cannot recover removed Stars/);
  const repeated = await updateStarHistory(
    { ...options, now: new Date('2026-09-02T20:17:00.000Z') });

  assert.equal(repeated.changed, false);
  await assert.rejects(updateStarHistory({ ...options, bootstrap: true }), /refuses to overwrite/);
  for (const [name, content] of Object.entries(snapshot))
  {
    assert.equal(readFileSync(join(dataDir, name), 'utf8'), content);
  }
});

test('损坏 CSV 与 API 失败不会改写数据，初始化请求失败也不留下文件', async (t) =>
{
  const dataDir = temporaryDirectory(t);
  const csvPath = join(dataDir, 'stars.csv');
  const svgPath = join(dataDir, 'star-history.svg');
  const options =
  {
    ...runtimeOptions,
    dataDir,
    fetchImpl: async () => response({ message: 'failure' }, 503),
  };

  writeFileSync(csvPath, 'invalid CSV sentinel\n');
  writeFileSync(svgPath, 'SVG sentinel\n');
  await assert.rejects(updateStarHistory(options), /CSV header/);
  assert.equal(readFileSync(csvPath, 'utf8'), 'invalid CSV sentinel\n');
  const csv = serializeStarHistoryCsv(upsertObservedStarCount([], observation).rows);

  writeFileSync(csvPath, csv);
  await assert.rejects(updateStarHistory(options), /HTTP 503/);
  assert.equal(readFileSync(csvPath, 'utf8'), csv);
  assert.equal(readFileSync(svgPath, 'utf8'), 'SVG sentinel\n');
  const emptyDir = temporaryDirectory(t);

  await assert.rejects(updateStarHistory(
  {
    ...options,
    dataDir: emptyDir,
    bootstrap: true,
    fetchImpl: async (url) => url.pathname.endsWith('/stargazers')
      ? response([]) : response({ message: 'failure' }, 503),
  }), /HTTP 503/);
  assert.deepEqual(readdirSync(emptyDir), []);
});

test('SVG 输出稳定，兼容空数据、单点与零 Star', () =>
{
  const rows = upsertObservedStarCount([], { ...observation, stars: 0 }).rows;
  const svg = renderStarHistorySvg(rows, repository);

  assert.equal(svg, renderStarHistorySvg(rows, repository));
  assert.match(svg, /width="960" height="480" viewBox="0 0 720 360"/);
  assert.match(svg, /0 Stars/);
  assert.match(svg, /<circle data-series="stars"/);
  assert.doesNotMatch(svg, /NaN|Infinity/);
  assert.match(renderStarHistorySvg([], repository), /No Star history yet/);
});
