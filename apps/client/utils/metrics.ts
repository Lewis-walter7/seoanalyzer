export const calculateAverage = (data: number[]): number => {
  const total = data.reduce((acc, value) => acc + value, 0);
  return total / data.length;
};

export const tallyCounts = (items: any[], key: string): number => {
  return items.filter((item) => item[key]).length;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
