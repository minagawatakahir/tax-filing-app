/**
 * API のエラーメッセージを取り出す。
 * responseType: 'blob' のリクエストでは、エラーの本文も Blob で返るので、JSON として読む。
 */
export const readApiErrorMessage = async (err: any, fallback: string): Promise<string> => {
  const data = err?.response?.data;
  try {
    if (data && typeof data === 'object' && typeof data.text === 'function') {
      const parsed = JSON.parse(await data.text());
      return parsed?.error || fallback;
    }
    if (data?.error) return data.error;
  } catch {
    // JSON でなければ既定のメッセージ
  }
  return fallback;
};
