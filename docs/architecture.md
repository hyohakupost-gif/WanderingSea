# WanderingSea Architecture Specification

このドキュメントは、既存実装からリバースエンジニアリングした WanderingSea の仕様書案です。

調査日時: 2026-06-09

## 1. フォルダ階層・主要ファイル一覧

```text
WanderingSea/
├── AGENTS.md
├── README.md
├── index.html
├── css/
│   └── styles.css
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── deployment.md
│   ├── frontend-flow.md
│   ├── i18n.md
│   ├── operations.md
│   ├── gas-api.md
│   └── testing-checklist.md
├── gas/
│   ├── .clasp.json
│   ├── IDSearchSystem.js
│   └── appsscript.json
├── js/
│   ├── config.js
│   ├── i18n.js
│   ├── link-loader.js
│   ├── search.js
│   └── update-status.js
├── lang/
│   └── language.json
└── link/
    ├── link_en.txt
    └── link_ja.txt
```

## 2. 各ファイル・フォルダの役割

### 確定情報

| パス | 役割 |
|---|---|
| `index.html` | GitHub Pages で配信される単一ページのエントリーポイント。画面構造、JS/CSS 読み込み、Cloudflare Web Analytics 読み込みを定義する。 |
| `css/styles.css` | 画面全体の色、余白、フォーム、結果カード、言語切替、フッターリンク、更新日時表示のスタイルを定義する。 |
| `js/config.js` | GAS Web App の URL を `SCRIPT_URL` と `LAST_UPDATE_API_URL` として定義する。 |
| `js/i18n.js` | `lang/language.json` を読み込み、`data-i18n` と `data-i18n-placeholder` に翻訳を反映する。言語設定を `localStorage` に保存する。 |
| `js/search.js` | 検索フォームの入力取得、検索 API 呼び出し、結果カード描画、ID コピー処理を担当する。 |
| `js/link-loader.js` | `link/link_ja.txt` または `link/link_en.txt` を読み込み、フッターリンクを生成する。 |
| `js/update-status.js` | 最新掲載状況 API を JSONP で呼び出し、`#last-update-time` に反映する。 |
| `lang/language.json` | 日本語・英語の UI 文言、プレースホルダー、エラーメッセージ、説明文を保持する。 |
| `link/link_ja.txt` | 日本語表示時のフッターリンク定義。1 行につき `表示名,URL` 形式。 |
| `link/link_en.txt` | 英語表示時のフッターリンク定義。1 行につき `表示名,URL` 形式。 |
| `gas/IDSearchSystem.js` | GAS 側の検索 API 実装。スプレッドシートから ID・投函日・差出人・タイトルを検索して JSON を返す。 |
| `gas/appsscript.json` | Apps Script の実行設定。タイムゾーン、V8 ランタイム、Web App 公開設定を定義する。 |
| `gas/.clasp.json` | clasp 管理用設定。Apps Script の `scriptId` と対象拡張子を保持する。 |
| `docs/gas-api.md` | フロントエンドが利用する GAS API 仕様。検索 API と最新更新日時 API の契約を記載する。 |
| `docs/frontend-flow.md` | フロントエンドの初期表示、言語切替、検索、コピー、リンク読み込みのイベントフローを記載する。 |
| `docs/data-model.md` | Google Spreadsheet の検索用シート、列定義、API レコード、キャッシュ、ID の扱いを記載する。 |
| `docs/deployment.md` | GitHub Pages と clasp/GAS のデプロイ観点、URL 更新手順、リリース前確認を記載する。 |
| `docs/operations.md` | 通常運用、手紙データ更新、最新掲載状況、問い合わせ、障害時確認ポイントを記載する。 |
| `docs/i18n.md` | 翻訳キー、HTML との対応、言語別リンク、文言追加手順を記載する。 |
| `docs/testing-checklist.md` | 変更後の手動テスト項目、API 疎通確認、表示確認、リリース前最小確認を記載する。 |
| `AGENTS.md` | Codex がこのリポジトリで作業する際のプロジェクトルール。 |
| `README.md` | プロジェクト名のみを記載する簡易 README。 |

### 推測

- `gas/` は clasp により Google Apps Script プロジェクトへ push/deploy される想定。
- `index.html` と静的アセットは GitHub Pages でそのまま配信される想定。
- 最新掲載状況 API の GAS 実装は、別 Apps Script プロジェクトまたは未管理ファイルとして存在する可能性がある。

## 3. 画面構成

### 確定情報

画面は `index.html` に定義された単一ページで構成される。

1. アプリタイトル
2. 説明文
3. 最新掲載状況
4. 検索フォーム
5. 検索結果表示エリア
6. 言語切替ボタン
7. 追加リンク
8. コピーライトフッター

主要 DOM 要素:

| 要素 | 用途 |
|---|---|
| `#name` | 差出人名の検索キーワード入力。最大 20 文字。 |
| `#title` | 手紙タイトルの検索キーワード入力。最大 20 文字。 |
| `#searchButton` | 検索実行ボタン。 |
| `#results` | 検索中、エラー、検索結果カードを表示する領域。 |
| `#last-update-time` | 最新掲載状況 API の `last_updated` を表示する領域。 |
| `#description-tail` | 翻訳文と案内リンクを組み合わせて生成される説明文の末尾。 |
| `#footer-links` | 言語別リンクファイルから生成される外部リンク領域。 |

### 推測

- 主要ユースケースは「漂泊ノ海に投函された手紙の ID を検索し、別サービス内の ID 照会システムで使えるようにする」こと。
- 「駅内の ID 照会システム」は、この GitHub Pages アプリとは別の利用場所を指している。

## 4. GAS 連携まわりの仕様

`docs/gas-api.md` と重複する詳細なリクエスト・レスポンス仕様は同ドキュメントを参照する。

### 確定情報

- フロントエンドは 2 つの GAS Web App URL を利用する。
- 検索 API は `js/config.js` の `SCRIPT_URL` に定義される。
- 最新掲載状況 API は `js/config.js` の `LAST_UPDATE_API_URL` に定義される。
- 検索 API は `js/search.js` から `GET` で呼び出される。
- 検索 API のクエリパラメータは `name` と `title`。
- `name` と `title` は、フロント側で `trim()` され、`encodeURIComponent()` で URL エンコードされる。
- フロント側は、少なくとも片方の入力が 1 文字以上でない場合、API を呼ばずに入力エラーを表示する。
- 検索 API は GAS 側でも空条件を検証する。
- GAS 側は `CacheService.getScriptCache()` を使い、同一検索条件のレスポンスを 300 秒キャッシュする。
- GAS 側はアクティブスプレッドシートの `ID照会システム連携用` シートを読む。
- GAS 側は列 B を `id`、列 C を `date`、列 D を `name`、列 E を `title` として扱う。
- `id` が空の行は検索対象外。
- 検索は部分一致、大小文字を区別しない。
- `name` と `title` が両方指定された場合は AND 条件。
- 最大結果数は 30 件。30 件を超える場合は成功レスポンスではなくエラーを返す。
- 最新掲載状況 API は `js/update-status.js` から JSONP で呼び出される。
- JSONP の callback 名は固定で `callback`。
- `callback(data)` は `data.last_updated` を画面に表示する。
- `gas/appsscript.json` の Web App 設定は `executeAs: USER_DEPLOYING`、`access: ANYONE_ANONYMOUS`。

### 実装と docs/gas-api.md の差分・注意

- GAS 実装では「該当データなし」を `status: "error"` として返すため、`js/search.js` の `!result.data || result.data.length === 0` 分岐は、通常の該当なしでは到達しない可能性が高い。
- GAS 実装の過多エラーメッセージは `docs/gas-api.md` の例と句読点・括弧内表現が完全一致していない。
- `status: "debug_error"` は `js/search.js` では専用分岐がなく、`result.data` がないケースとして `No results found.` 表示になる可能性がある。
- 最新掲載状況 API の GAS ソースはこのリポジトリ内では確認できない。

### 要確認

- 最新掲載状況 API の GAS 実装がどこで管理されているか。
- 検索 API のデプロイ URL と `gas/.clasp.json` の `scriptId` が同一 Apps Script プロジェクトを指しているか。
- 検索対象シート `ID照会システム連携用` のヘッダー行有無。現在の GAS 実装は 0 行目から検索している。
- GAS のタイムゾーン `Etc/GMT-9` が日本時間意図で設定されているか。

## 5. 外部データ・外部サービス・ライブラリの利用状況

### 確定情報

| 種別 | 利用箇所 | 内容 |
|---|---|---|
| Google Apps Script Web App | `js/config.js`, `js/search.js`, `js/update-status.js` | 検索 API と最新掲載状況 API。 |
| Google Spreadsheet | `gas/IDSearchSystem.js` | 検索 API のデータソース。アクティブスプレッドシートを使用。 |
| Google Forms | `link/link_ja.txt`, `link/link_en.txt` | 手紙投函フォームへのリンク。 |
| X | `lang/language.json`, `link/*.txt` | 問い合わせ先 DM へのリンク。 |
| YouTube | `js/i18n.js` | 駅内での ID 検索方法案内リンク。 |
| Google Fonts Material Icons | `index.html`, `js/search.js` | コピーアイコン表示。 |
| Cloudflare Web Analytics | `index.html` | アクセス解析用 beacon。 |
| Web Clipboard API | `js/search.js` | 検索結果 ID のコピー。 |
| Web Storage API | `js/i18n.js`, `js/search.js`, `js/link-loader.js` | 言語設定を `localStorage` に保存・参照。 |

### 推測

- 外部 JS ライブラリのビルド工程はなく、ブラウザ標準 API と CDN 読み込みのみで動作する静的サイト。
- `npm` や bundler は利用していない。

## 6. JavaScript/CSS/HTML の責務分担

### HTML

- ページの静的構造を定義する。
- 翻訳対象の要素に `data-i18n` または `data-i18n-placeholder` を付与する。
- JS 読み込み順を制御する。
- Cloudflare Web Analytics と Material Icons を読み込む。

### JavaScript

| ファイル | 責務 |
|---|---|
| `config.js` | API エンドポイント定数。 |
| `i18n.js` | 翻訳 JSON 読み込み、言語切替、説明文リンク組み立て。 |
| `search.js` | 検索 API 通信、入力検証、結果カード生成、コピー処理。 |
| `link-loader.js` | 言語別リンクテキストの取得と DOM 生成。 |
| `update-status.js` | 最新掲載状況 API の JSONP 読み込み。 |

### CSS

- ダークテーマの配色変数を定義する。
- 600px 幅の中央寄せレイアウトを定義する。
- フォーム、ボタン、結果カード、言語切替、更新日時表示、フッターリンクの見た目を担当する。

### 注意

- `i18n.js` は `escapeHtml()` を利用しているが、`escapeHtml()` は `search.js` で定義されている。実行時には両方とも `window.load` 後に動くため成立しているが、ファイル読み込み順や関数の分離を変える場合は注意が必要。
- `setLang()` は HTML の `onclick` から直接呼ばれるため、グローバル関数であることが前提。
- `callback()` も JSONP から直接呼ばれるため、グローバル関数であることが前提。

## 7. 主要なユーザー操作と処理フロー

### 初期表示

1. ブラウザが `index.html` を読み込む。
2. `css/styles.css` が適用される。
3. `js/config.js` で API URL 定数が定義される。
4. `DOMContentLoaded` で `link-loader.js` が現在の言語設定を読み、`link/link_{lang}.txt` からフッターリンクを生成する。
5. `window.load` で `i18n.js` が `lang/language.json` を取得する。
6. `setLang(localStorage.getItem('lang') || 'ja')` により文言、プレースホルダー、説明文、フッターリンクが反映される。
7. `window.load` で `update-status.js` が最新掲載状況 API の JSONP script を追加する。
8. GAS から `callback({ last_updated: ... })` が呼ばれると、`#last-update-time` が更新される。

### 言語切替

1. ユーザーが `JP` または `EN` ボタンを押す。
2. HTML の `onclick` から `setLang('ja')` または `setLang('en')` が呼ばれる。
3. 言語設定が `localStorage` に保存される。
4. `data-i18n` と `data-i18n-placeholder` の文言が更新される。
5. 説明文末尾の案内リンクが再生成される。
6. `link/link_{lang}.txt` が読み込まれ、フッターリンクが更新される。

### 検索

1. ユーザーが差出人名またはタイトルを入力する。
2. 検索ボタン押下、または入力欄で Enter 押下により `search()` が実行される。
3. 進行中の検索がある場合は `AbortController` で中断される。
4. 入力値が両方空なら、フロント側でエラーメッセージを表示して終了する。
5. 検索ボタンを disabled にし、検索中メッセージを表示する。
6. `SCRIPT_URL?name=...&title=...` を `fetch()` する。
7. GAS はスプレッドシートを検索し、JSON を返す。
8. `status: "error"` の場合、`message` をエラーとして表示する。
9. `status: "success"` の場合、`data` の各要素から結果カードを生成する。
10. 処理終了後、検索ボタンを再度有効化する。

### ID コピー

1. ユーザーが結果カード右側の Material Icons コピーアイコンを押す。
2. `navigator.clipboard.writeText(id)` で ID をクリップボードへコピーする。
3. アイコン表示を一時的に `check` に変更し、1.5 秒後に戻す。

## 8. 現在実装済みの機能一覧

### 確定情報

- 手紙 ID の検索
- 差出人名による部分一致検索
- タイトルによる部分一致検索
- 差出人名とタイトルの AND 検索
- 検索条件未入力時のフロント側入力検証
- GAS 側の検索条件検証
- 最大 30 件制限
- 検索結果過多時のエラー表示
- 検索結果なし時のエラー表示
- 検索中表示
- 連続検索時の前回リクエスト中断
- 検索結果カード表示
- ID コピー
- 日本語・英語 UI 切替
- 言語設定のブラウザ保存
- 言語別フッターリンク表示
- 最新掲載状況の表示
- 外部の投函フォーム、問い合わせ先、利用方法動画への導線
- Cloudflare Web Analytics によるアクセス解析
- GAS キャッシュによる検索レスポンスの短期キャッシュ

### 推測

- GitHub Pages で静的サイトとして公開済み。
- Google Spreadsheet の内容更新により検索対象データが変わる。
- 「最新掲載状況」は掲載対象スプレッドシートまたは別管理データから取得している。

## 9. 今後 Codex が安全に改修するために必要な注意点

### API 契約

- `gas/` または `js/search.js` を変更する場合は、必ず `docs/gas-api.md` も確認する。
- `name`、`title`、`status`、`data`、`message`、`last_updated` の名前を変更するとフロント・GAS 間の互換性が壊れる。
- `LAST_UPDATE_API_URL` は JSONP 前提。通常の JSON fetch に変える場合は CORS と GAS 側レスポンス形式を同時に確認する。
- `callback` 関数名は URL パラメータとグローバル関数名が固定で対応している。
- 検索 API の `debug_error` をフロントでどう表示するかは未整理。エラー処理変更時に確認する。

### データ仕様

- GAS はシート名 `ID照会システム連携用` と列位置に強く依存している。
- 列追加や並び替えを行う場合は `gas/IDSearchSystem.js` と `docs/gas-api.md` の更新が必要。
- 日付は `new Date(date)` と `Utilities.formatDate()` に依存するため、シート上の日付形式変更に注意する。
- `id` が数値の場合、JSON では数値として返る可能性がある。フロントでは `textContent` と clipboard に渡しているため大きな問題は起きにくいが、ID の先頭ゼロが必要な場合はシート側または GAS 側で文字列維持が必要。

### フロントエンド

- `index.html` の script 読み込み順に依存がある。
- `i18n.js` は `escapeHtml()` に依存しているため、`search.js` との関係を崩す場合は共通ユーティリティ化を検討する。
- `setLang()` と `callback()` は外部から呼ばれるため、モジュール化する場合は `window` への公開が必要。
- `link/*.txt` は単純にカンマ区切りで解析しているため、リンク名にカンマを含めると壊れる。
- `description_tail` は翻訳 JSON 内に HTML を含む。編集時は XSS を避けるため、信頼済みの固定文言以外を混ぜない。
- `lang/language.json` のキー追加・変更時は `index.html` と JS 側参照の対応を確認する。

### CSS・UI

- `styles.css` には `.update-status` と `#last-update-time` の定義が重複している。修正する場合は見た目の差分に注意する。
- `index.html` にインライン style が残っているため、CSS 整理時には優先順位を確認する。
- 600px の単一カラム前提。画面構成を増やす場合はモバイル表示の確認が必要。

### 運用

- `gas/appsscript.json` は AGENTS.md で明示的に「依頼がない限り変更しない」対象。
- `.clasp.json` には scriptId が含まれるため、公開範囲や共有時の扱いに注意する。
- デプロイ先 URL を変える場合は `js/config.js` と `docs/gas-api.md` を更新する。
- GitHub Pages はビルドなしの静的配信に見えるため、追加ライブラリ導入時は CDN・依存管理・ブラウザ互換性を明示する。

## 確定情報まとめ

- WanderingSea は GitHub Pages の静的フロントエンドと Google Apps Script バックエンドで構成される。
- フロントエンドは検索 API と最新掲載状況 API の 2 つの GAS Web App を呼び出す。
- 検索 API はこのリポジトリの `gas/IDSearchSystem.js` に実装がある。
- 最新掲載状況 API のフロント側呼び出しはあるが、対応する GAS 実装はこのリポジトリ内では確認できない。
- UI は日本語・英語に対応している。
- 検索結果は ID、投函日、差出人、タイトルを表示し、ID をクリップボードへコピーできる。

## 推測まとめ

- このアプリは、外部の「漂泊ノ海」サービスまたは駅内システムで利用する手紙 ID を探す補助ツール。
- 手紙データは Google Forms などからスプレッドシートへ集約され、その一部を GAS 検索 API が公開している。
- 最新掲載状況 API は、検索 API とは別 Apps Script または別ファイルで管理されている。

## 要確認

- 最新掲載状況 API の GAS 実装場所。
- `SCRIPT_URL` のデプロイ元と `gas/.clasp.json` の `scriptId` の対応関係。
- Google Spreadsheet の実際の列定義、ヘッダー行、データ開始行。
- `ID` に先頭ゼロや文字列形式が必要か。
- `debug_error` をユーザーにどう表示すべきか。
- `No results found.` の英語固定表示が現在の仕様として許容されるか。
- `docs/gas-api.md` と実装のエラーメッセージ差分をどちらに寄せるべきか。
- `description_tail` に HTML を含める運用を継続するか。

## 作成済みドキュメント

1. `docs/frontend-flow.md`
   - 初期表示、言語切替、検索、コピー、リンク読み込みのイベントフローを図付きで整理する。

2. `docs/data-model.md`
   - Google Spreadsheet のシート名、列定義、型、サンプル行、ID の文字列扱いを明文化する。

3. `docs/deployment.md`
   - GitHub Pages と clasp/GAS のデプロイ手順、URL 更新手順、確認項目をまとめる。

4. `docs/operations.md`
   - 手紙データ更新、最新掲載状況更新、問い合わせ対応、障害時確認ポイントをまとめる。

5. `docs/i18n.md`
   - 翻訳キー一覧、HTML を含む文言の扱い、リンク文言追加手順をまとめる。

6. `docs/testing-checklist.md`
   - 変更後に確認すべき手動テスト項目、API 疎通確認、表示確認、言語切替確認をまとめる。

## 次に作るべきドキュメント案

1. `docs/security.md`
   - JSONP、HTML を含む翻訳文、公開 GAS URL、Cloudflare Web Analytics、外部リンクの安全性を整理する。

2. `docs/api-error-handling.md`
   - `status: "error"`、`status: "debug_error"`、通信失敗、該当なし、30 件超過時の表示仕様を整理する。

3. `docs/spreadsheet-maintenance.md`
   - 検索用シートの更新手順、列変更禁止事項、ID 文字列維持、キャッシュ影響を運用担当者向けに整理する。
