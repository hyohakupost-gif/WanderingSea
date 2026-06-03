function doGet(e) {
try{
  // =========================
  // 設定値
  // =========================
  const MAX_RESULTS = 30;
  const CACHE_SECONDS = 300;

  const nameQuery = e.parameter.name ? e.parameter.name.trim() : "";
  const titleQuery = e.parameter.title ? e.parameter.title.trim() : "";

  // 検索条件チェック
  if (nameQuery.length < 1 && titleQuery.length < 1) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "検索ワードを入力してください"
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }

  // キャッシュ確認
  const cache = CacheService.getScriptCache();
  const cacheKey =
    "v3_search_" +
    Utilities.base64Encode(nameQuery + "_" + titleQuery);

  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return ContentService.createTextOutput(cachedData)
      .setMimeType(ContentService.MimeType.JSON);
  }

  // スプレッドシート読み込み
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('ID照会システム連携用');
  const data = sheet.getDataRange().getValues();

  const results = [];
  let totalMatches = 0;

  // 検索文字列を事前に小文字化
  const lowerNameQuery = nameQuery.toLowerCase();
  const lowerTitleQuery = titleQuery.toLowerCase();

  for (let i = 0; i < data.length; i++) {

    const id = data[i][1];
    const date = data[i][2];
    const name = data[i][3];
    const title = data[i][4];

    if (!id) continue;

const safeName = String(name || ""); 
const safeTitle = String(title || "");

const isNameMatch =
  (
    nameQuery === "" ||
    safeName.toLowerCase().includes(lowerNameQuery)
  );

const isTitleMatch =
  (
    titleQuery === "" ||
    safeTitle.toLowerCase().includes(lowerTitleQuery)
  );



    if (isNameMatch && isTitleMatch) {

      totalMatches++;

      // 表示用データは MAX_RESULTS 件まで
      if (results.length < MAX_RESULTS) {

        const formattedDate = Utilities.formatDate(
          new Date(date),
          Session.getScriptTimeZone(),
          "yyyy/MM/dd"
        );

        results.push({
          id: id,
          date: formattedDate,
          name: name,
          title: title
        });
      }
    }
  }

  let response;

  if (totalMatches === 0) {

    response = {
      status: "error",
      message: "該当するデータはありません"
    };

  } else if (totalMatches > MAX_RESULTS) {

    response = {
      status: "error",
      message:
        "検索結果が多すぎます\n" +
        "（現在の検索結果：" +
        totalMatches +
        "件：" +
        MAX_RESULTS +
        "件以下に絞ってください）"
    };

  } else {

    response = {
      status: "success",
      data: results
    };
  }

  const responseString = JSON.stringify(response);

  cache.put(cacheKey, responseString, CACHE_SECONDS);

  return ContentService.createTextOutput(responseString)
    .setMimeType(ContentService.MimeType.JSON);

}catch (err) { return ContentService .createTextOutput( JSON.stringify({ status: "debug_error", message: String(err) }) ) .setMimeType(ContentService.MimeType.JSON); } }
