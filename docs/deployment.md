# Deployment

このドキュメントは、WanderingSea のフロントエンドと Google Apps Script バックエンドのデプロイ確認項目を整理する。

関連ドキュメント:

- `docs/architecture.md`
- `docs/gas-api.md`
- `docs/testing-checklist.md`

## 構成

WanderingSea は 2 つの配信面で構成される。

| 面 | 配信先 | ソース |
|---|---|---|
| フロントエンド | GitHub Pages | `index.html`, `css/*`, `js/*`, `lang/*`, `link/*` |
| バックエンド | Google Apps Script Web App | `gas/*` |

## フロントエンド

### デプロイ対象

| パス | 内容 |
|---|---|
| `index.html` | エントリーポイント。 |
| `css/styles.css` | スタイル。 |
| `js/*.js` | フロントエンドロジック。 |
| `lang/language.json` | 翻訳文言。 |
| `link/*.txt` | 言語別リンク。 |
| `docs/*` | プロジェクト文書。GitHub Pages に含まれる場合がある。 |

### デプロイ前確認

- `index.html` から参照する相対パスが正しいこと。
- `js/config.js` の `SCRIPT_URL` が検索 API の最新デプロイ URL であること。
- `js/config.js` の `LAST_UPDATE_API_URL` が最新掲載状況 API の最新デプロイ URL であること。
- `lang/language.json` が JSON として正しいこと。
- `link/link_ja.txt` と `link/link_en.txt` が `表示名,URL` 形式であること。
- GitHub Pages の公開ブランチと公開ディレクトリ設定がリポジトリ運用と一致していること。

### デプロイ後確認

- ページが表示できる。
- 日本語表示が初期表示される。
- `JP` / `EN` 切替が動作する。
- 検索 API が呼び出せる。
- 最新掲載状況が表示される。
- フッターリンクが表示され、外部リンクが新規タブで開く。
- Cloudflare Web Analytics の読み込みが意図どおりである。

## Google Apps Script

### 管理対象

| パス | 内容 |
|---|---|
| `gas/IDSearchSystem.js` | 検索 API の `doGet(e)` 実装。 |
| `gas/appsscript.json` | Apps Script 実行設定。 |
| `gas/.clasp.json` | clasp の `scriptId` など。 |

### appsscript.json

現在の設定:

```json
{
  "timeZone": "Etc/GMT-9",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

注意:

- `appsscript.json` は明示的な依頼がない限り変更しない。
- `access: ANYONE_ANONYMOUS` のため、公開 URL を知っている利用者から呼び出せる。
- `executeAs: USER_DEPLOYING` のため、デプロイしたユーザー権限でスプレッドシートを読む。

### clasp

`.clasp.json` には Apps Script の `scriptId` が定義されている。

```json
{
  "scriptId": "12d1GTuE9WVDU0_DAgy9U3Wmf8smqh6znKMO1ibTvo0vJhCG8zzBoQ2Wy"
}
```

想定される作業:

1. `gas/` 配下を clasp で Apps Script に push する。
2. Apps Script 側で Web App としてデプロイする。
3. 発行された Web App URL を `js/config.js` の `SCRIPT_URL` に反映する。
4. API 仕様が変わった場合は `docs/gas-api.md` を更新する。

要確認:

- 現在の `SCRIPT_URL` が `.clasp.json` の `scriptId` からデプロイされた Web App か。
- 最新掲載状況 API の Apps Script プロジェクトがどこで管理されているか。

## URL 更新手順

検索 API URL を更新する場合:

1. GAS の検索 API をデプロイする。
2. Web App URL を取得する。
3. `js/config.js` の `SCRIPT_URL` を更新する。
4. `docs/gas-api.md` の endpoint 記述に変更が必要か確認する。
5. フロントエンドで検索動作を確認する。

最新掲載状況 API URL を更新する場合:

1. 最新掲載状況 API をデプロイする。
2. Web App URL を取得する。
3. `js/config.js` の `LAST_UPDATE_API_URL` を更新する。
4. JSONP の `callback=callback` に対応していることを確認する。
5. `#last-update-time` の表示を確認する。

## リリース前チェック

- API 契約変更がある場合、フロントエンドと GAS の両方を更新した。
- API 契約変更がある場合、`docs/gas-api.md` を更新した。
- `docs/testing-checklist.md` の基本確認を実施した。
- `gas/appsscript.json` を不要に変更していない。
- 公開 URL や scriptId を意図せず差し替えていない。

## ロールバック観点

フロントエンド:

- 直前の GitHub Pages 公開状態へ戻す。
- `js/config.js` の API URL 差し替えを戻す。

GAS:

- Apps Script の以前のデプロイバージョンを再公開する。
- 新しい Web App URL を発行した場合は、フロントエンド側 URL も戻す。

## 要確認

- 実際の GitHub Pages 公開ブランチ。
- clasp を実行する標準手順。
- GAS のバージョン管理とデプロイ担当者。
- 最新掲載状況 API のデプロイ手順。
