# Data Model

このドキュメントは、WanderingSea の検索 API が扱うデータ構造と、フロントエンドが期待するフィールドを整理する。

関連ドキュメント:

- `docs/architecture.md`
- `docs/gas-api.md`
- `docs/frontend-flow.md`

## データソース

### 確定情報

検索 API は Google Apps Script の `SpreadsheetApp.getActiveSpreadsheet()` を使い、アクティブスプレッドシートをデータソースにする。

対象シート名:

```text
ID照会システム連携用
```

GAS 実装:

```js
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName('ID照会システム連携用');
const data = sheet.getDataRange().getValues();
```

### 推測

- Google Forms などで収集した手紙データを、検索用シートに整形している可能性がある。
- 最新掲載状況 API も同じ、または関連するスプレッドシートを参照している可能性がある。

## シート列定義

GAS 実装上の列参照は 0 始まり配列で行われる。

| シート列 | 配列 index | API フィールド | 用途 |
|---|---:|---|---|
| A | `0` | なし | レスポンス未使用。 |
| B | `1` | `id` | 手紙 ID。空の場合は行ごと検索対象外。 |
| C | `2` | `date` | 投函日。`yyyy/MM/dd` に整形して返す。 |
| D | `3` | `name` | 差出人名。検索対象、レスポンス表示対象。 |
| E | `4` | `title` | 手紙タイトル。検索対象、レスポンス表示対象。 |

## レコード定義

検索 API の成功レスポンスに含まれる 1 件分のデータ。

```json
{
  "id": "12345",
  "date": "2026/06/03",
  "name": "Alice",
  "title": "Voyage"
}
```

| フィールド | 型 | 必須 | 生成元 | 備考 |
|---|---|---:|---|---|
| `id` | string/number | yes | シート B 列 | 空の場合、その行はスキップされる。 |
| `date` | string | yes | シート C 列 | GAS で `yyyy/MM/dd` に整形される。 |
| `name` | string | no | シート D 列 | 空でもレスポンスには入り得る。 |
| `title` | string | no | シート E 列 | 空でもレスポンスには入り得る。 |

## 検索条件

| 条件 | 仕様 |
|---|---|
| `name` のみ | 差出人名に対する部分一致検索。 |
| `title` のみ | タイトルに対する部分一致検索。 |
| `name` と `title` | 両方に一致する AND 検索。 |
| 大文字小文字 | 区別しない。 |
| 空文字 | 条件なしとして扱う。ただし両方空はエラー。 |
| 最大件数 | 30 件。31 件以上はエラー。 |

GAS は検索前に以下のように文字列化している。

```js
const safeName = String(name || "");
const safeTitle = String(title || "");
```

そのため、`name` または `title` が空でも検索処理自体は継続できる。

## 日付

GAS は C 列の値を `new Date(date)` に渡し、Apps Script のタイムゾーンで `yyyy/MM/dd` に整形する。

```js
const formattedDate = Utilities.formatDate(
  new Date(date),
  Session.getScriptTimeZone(),
  "yyyy/MM/dd"
);
```

`gas/appsscript.json` のタイムゾーン:

```json
{
  "timeZone": "Etc/GMT-9"
}
```

注意:

- `Etc/GMT-9` は UTC+9 として扱われるが、表記が直感と逆になりやすい。
- C 列が Date として解釈できない値の場合、整形結果や例外発生の確認が必要。

## ID の扱い

### 確定情報

- `id` が空の行は `continue` でスキップされる。
- `id` はレスポンスにそのまま入る。
- フロントでは `textContent` に入れ、コピー時は `navigator.clipboard.writeText(id)` に渡す。

### 注意

- シート上で ID が数値として保存されている場合、先頭ゼロは失われる可能性がある。
- ID に先頭ゼロ、ハイフン、英字などが必要な場合は、シート側または GAS 側で文字列として扱う必要がある。

## キャッシュモデル

検索 API は GAS の Script Cache を使う。

| 項目 | 値 |
|---|---|
| CacheService | `CacheService.getScriptCache()` |
| キャッシュキー接頭辞 | `v3_search_` |
| キー材料 | `nameQuery + "_" + titleQuery` |
| エンコード | `Utilities.base64Encode(...)` |
| TTL | 300 秒 |

注意:

- 同一検索条件では最大 300 秒間、古いレスポンスが返る可能性がある。
- データ更新直後の確認では、キャッシュの影響を考慮する。

## 最新掲載状況データ

### 確定情報

フロントエンドは JSONP の `callback(data)` で以下を期待する。

```json
{
  "last_updated": "2026/06/03"
}
```

表示先:

```text
#last-update-time
```

### 要確認

- `last_updated` の生成元。
- 表示形式の正式仕様。
- 検索 API のシートと同じデータソースか。
- 更新タイミングが手動か自動か。

## 要確認

- シート A 列の用途。
- ヘッダー行の有無と、検索対象に含めてよいか。
- C 列の実データ型。
- ID を文字列として維持すべきか。
- 最新掲載状況 API のデータソース。
