const computeSimilarity = (x, y) => {
  const dotProduct = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const magnitudeX = Math.sqrt(x.reduce((sum, xi) => sum + xi * xi, 0));
  const magnitudeY = Math.sqrt(y.reduce((sum, yi) => sum + yi * yi, 0));
  return dotProduct / (magnitudeX * magnitudeY);
};

export default computeSimilarity;