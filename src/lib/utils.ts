// Utility functions

export function sanitizeFilePath(filePath: string): string {
  // Remove any path traversal attempts
  return filePath.replace(/\.\./g, '').replace(/^\/+/, '');
}

export function formatTimestamp(): string {
  return new Date().toISOString();
}

export function isValidExcelFile(filename: string): boolean {
  const validExtensions = ['.xlsx', '.xls'];
  return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}
