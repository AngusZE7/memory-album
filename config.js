// ============================================================
// 開啟網站時自動觸發「掃描雲端相簿」的 GitHub Token
//
// 注意：GitHub 禁止把 token 放進公開 repo，所以這裡保持空白。
// token 改為「第一次開啟網站時，網頁上跳出輸入框，你貼一次」，
// 之後存在你自己的瀏覽器 localStorage 裡，repo 內不會有任何機密。
//
// Token 建立方式：
//   GitHub → Settings → Developer settings → Fine-grained personal access tokens
//   → 只勾選此 repo (AngusZE7/memory-album) → Permissions → Actions: Read and write
// ============================================================
const GH_PAT = '';
