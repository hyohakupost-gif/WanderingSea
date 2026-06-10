# Operations

このドキュメントは、WanderingSea の日常運用、更新、問い合わせ、障害時確認ポイントを整理する。

関連ドキュメント:

- `docs/architecture.md`
- `docs/data-model.md`
- `docs/deployment.md`
- `docs/testing-checklist.md`

## 運用対象

| 対象 | 役割 |
|---|---|
| GitHub Pages フロントエンド | 利用者がアクセスする ID 検索画面。 |
| 検索 API | 手紙 ID を検索する GAS Web App。 |
| 最新掲載状況 API | 最新の掲載状況を返す JSONP API。 |
| Google Spreadsheet | 検索 API のデータソース。 |
| Google Forms | 手紙投函フォーム。 |
| X アカウント | 問い合わせ・削除依頼の窓口。 |

## 通常運用

### 手紙データ更新

想定フロー:

1. 手紙データが Google Forms などからスプレッドシートに集約される。
2. 検索用シート `ID照会システム連携用` に ID、投函日、差出人、タイトルが配置される。
3. 検索 API がシートを読み、検索結果として返す。
4. 利用者は GitHub Pages 画面から ID を検索する。

注意:

- 検索 API は 300 秒キャッシュするため、更新直後は反映に最大 5 分程度の遅れがあり得る。
- ID が空の行は検索対象外。
- シート列の並び替えは API 破壊につながる。

### 最新掲載状況更新

フロントエンドは最新掲載状況 API の `last_updated` を表示する。

表示箇所:

```text
#last-update-time
```

要確認:

- 最新掲載状況 API の実装場所。
- `last_updated` を手動更新するのか、自動集計するのか。
- 検索用シートの最新日付と一致させる運用か。

### 問い合わせ対応

画面には以下の問い合わせ導線がある。

| 導線 | 定義箇所 |
|---|---|
| X アカウントへの DM | `lang/language.json`, `link/link_ja.txt`, `link/link_en.txt` |
| 手紙投函フォーム | `link/link_ja.txt`, `link/link_en.txt` |
| 駅内 ID 検索方法 | `js/i18n.js` の YouTube URL |

問い合わせ時に確認する項目:

- 投函日時。
- 差出人名。
- タイトル。
- 画面で入力した検索条件。
- 最新掲載状況に表示されている日時。
- 検索結果が多すぎるエラーか、該当なしエラーか。

## 障害時確認

### ページが表示されない

確認項目:

- GitHub Pages が有効か。
- `index.html` が公開対象ブランチに存在するか。
- ブラウザコンソールに 404 や JavaScript エラーがないか。
- `css/styles.css`、`js/*.js`、`lang/language.json`、`link/*.txt` が読み込めているか。

### 翻訳が表示されない

確認項目:

- `lang/language.json` が取得できているか。
- JSON の構文エラーがないか。
- `data-i18n` のキーが `language.json` に存在するか。
- `localStorage.lang` に `ja` または `en` 以外が入っていないか。

### フッターリンクが表示されない

確認項目:

- `link/link_ja.txt` または `link/link_en.txt` が取得できているか。
- ファイル内が `表示名,URL` 形式になっているか。
- リンク名または URL にカンマが含まれていないか。

### 検索できない

確認項目:

- `js/config.js` の `SCRIPT_URL` が正しいか。
- GAS Web App が公開されているか。
- GAS が対象スプレッドシートを読める権限を持つか。
- シート名が `ID照会システム連携用` のままか。
- B-E 列に期待どおりのデータがあるか。
- ブラウザコンソールまたは Network に CORS、JSON parse、通信エラーがないか。

### 検索結果が見つからない

確認項目:

- `id` 列が空でないか。
- 差出人名・タイトルが検索用シートに存在するか。
- 大文字小文字以外の表記揺れがないか。
- 300 秒キャッシュの影響を受けていないか。
- 結果が 30 件を超えてエラーになっていないか。

### 最新掲載状況が表示されない

確認項目:

- `js/config.js` の `LAST_UPDATE_API_URL` が正しいか。
- API が JSONP 形式で `callback(...)` を返しているか。
- `callback` 関数名が URL パラメータと一致しているか。
- レスポンスに `last_updated` が含まれているか。

## 定期確認

月次またはリリース前に確認する項目:

- 検索 API の Web App URL が有効。
- 最新掲載状況 API の Web App URL が有効。
- Google Forms リンクが有効。
- X アカウントリンクが有効。
- YouTube の案内動画リンクが有効。
- `docs/gas-api.md` と実装が乖離していない。
- `docs/testing-checklist.md` の主要項目が通る。

## 変更時の注意

- API の request/response が変わる場合は、フロントエンド、GAS、`docs/gas-api.md` を同時に確認する。
- シート列を変更する場合は `gas/IDSearchSystem.js` を更新する必要がある。
- `appsscript.json` は明示依頼なしに変更しない。
- 外部 URL を変更する場合は、日本語・英語の両方の導線を確認する。

## 要確認

- 運用担当者。
- 手紙データの更新頻度。
- 最新掲載状況の更新方法。
- 問い合わせ対応時の標準テンプレート。
- 障害時の連絡経路。
