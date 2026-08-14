// ============================================================
// 開啟網站時自動觸發「掃描雲端相簿」的 GitHub Token
// 建立方式：
//   GitHub → Settings → Developer settings → Fine-grained personal access tokens
//   → 只勾選此 repo (AngusZE7/memory-album) → Permissions → Actions: Read and write
//   → 產生的 token 貼到下面 GH_PAT 的引號裡
// 注意：此檔案會被公開（GitHub Pages 是公開網站），
//       token 權限務必只開「Actions」，不要勾其他權限。
// ============================================================
const GH_PAT = '';
