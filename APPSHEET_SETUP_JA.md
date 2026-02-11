# カフェレビュー投稿アプリ（Google AppSheet）作成手順

この手順で、**行ったことがあるカフェのレビューを投稿できる**アプリを作成できます。

## 1. データ準備（Google スプレッドシート）
1. Google Driveで新規スプレッドシートを作成
2. シート1に `Cafes.csv` の内容を貼り付けてシート名を `Cafes`
3. シート2に `Reviews.csv` の内容を貼り付けてシート名を `Reviews`
4. 1行目はヘッダーのまま保持

## 2. AppSheet アプリ作成
1. [AppSheet](https://www.appsheet.com/) を開く
2. `Make a new app` -> `Start with your own data`
3. 先ほどのスプレッドシートを選択
4. テーブルとして `Cafes` と `Reviews` が追加されたことを確認

## 3. 列の型と式を設定

### Cafes テーブル
- `CafeID`: `Text`、Key = ON、Initial value:
  - `UNIQUEID()`
- `Name`: `Name`
- `Address`: `Address`
- `NearestStation`: `Text`
- `Visited`: `Yes/No`（初期値 `TRUE` 推奨）
- `Notes`: `LongText`
- `CreatedAt`: `DateTime`、Initial value:
  - `NOW()`

### Reviews テーブル
- `ReviewID`: `Text`、Key = ON、Initial value:
  - `UNIQUEID()`
- `CafeID`: `Ref`（参照先: `Cafes`）
- `VisitDate`: `Date`
- `Rating`: `Number`、Valid_if:
  - `AND([Rating] >= 1, [Rating] <= 5)`
- `Title`: `Text`
- `Comment`: `LongText`
- `Photo`: `Image`
- `ReviewerEmail`: `Email`、Initial value:
  - `USEREMAIL()`
- `CreatedAt`: `DateTime`、Initial value:
  - `NOW()`

## 4. 「行ったことがあるカフェだけ」投稿可能にする
`Reviews` の `CafeID` 列に以下を設定:

- `Valid_if`:
```appsheet
SELECT(Cafes[CafeID], [Visited] = TRUE)
```

これで、`Visited = TRUE` のカフェのみ選択可能になります。

## 5. 表示（UX）を整える
1. `Views` で以下を追加
   - `Cafes`（Deck or Table）
   - `Reviews`（Deck）
   - `レビュー投稿`（Form、対象テーブル: `Reviews`）
2. `レビュー投稿` をメニュー上位に配置

## 6. 便利な派生列（任意）

### Cafes に平均評価列を追加（Virtual Column）
- 列名: `AverageRating`
- App formula:
```appsheet
AVERAGE(SELECT(Reviews[Rating], [CafeID] = [_THISROW].[CafeID]))
```

### Cafes にレビュー件数列を追加（Virtual Column）
- 列名: `ReviewCount`
- App formula:
```appsheet
COUNT(SELECT(Reviews[ReviewID], [CafeID] = [_THISROW].[CafeID]))
```

## 7. 権限（任意）
- `Security` -> `Require user sign-in` を ON
- 必要なら `ReviewerEmail = USEREMAIL()` で本人レビューのみ編集可能に制限

## 8. 動作確認
1. カフェ一覧を表示
2. `レビュー投稿` でレビュー追加
3. `Visited = FALSE` のカフェが選べないことを確認
4. 画像添付と評価（1〜5）が保存されることを確認

## 9. 本人レビューのみ編集・削除を許可（推奨）
### 9-1. 本人以外は編集不可
`Data` -> `Columns` -> `Reviews` で、編集させたい列（`Rating`, `Title`, `Comment`, `Photo` など）の
`Editable_If` を以下に設定:

```appsheet
[ReviewerEmail] = USEREMAIL()
```

### 9-2. 本人以外は削除不可
`Behavior` -> `Actions` の `Reviews` テーブルの削除アクション（Delete）に対し、
`Only if this condition is true` を以下に設定:

```appsheet
[ReviewerEmail] = USEREMAIL()
```

これで、ログイン中ユーザーが作成したレビューのみ編集/削除できます。

## 10. カフェランキング表示を追加（平均評価順）
### 10-1. ランキング用スコア列を追加（Virtual Column）
`Cafes` に Virtual Column `RankingScore` を追加:

```appsheet
([AverageRating] * 1000) + [ReviewCount]
```

注: 平均評価を優先し、同点時はレビュー件数が多い方を上位にします。

### 10-2. Slice を作成
`Data` -> `Slices` -> `New Slice`

- Name: `CafeRanking`
- Source table: `Cafes`
- Row filter condition:
```appsheet
[ReviewCount] > 0
```

### 10-3. ランキングビューを作成
`UX` -> `Views` -> `New View`

- View name: `ランキング`
- For this data: `CafeRanking`
- View type: `Deck` または `Table`
- Sort by: `RankingScore` (Descending)

これで、レビュー投稿済みカフェのランキングを表示できます。

---

## このリポジトリ内ファイル
- `Cafes.csv`: カフェマスタ初期データ
- `Reviews.csv`: レビュー初期データ
- `APPSHEET_SETUP_JA.md`: このセットアップ手順
