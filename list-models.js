import "dotenv/config";

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`
);
const data = await res.json();

const embeddingModels = data.models.filter((m) =>
  m.supportedGenerationMethods?.includes("embedContent")
);

embeddingModels.forEach((m) => console.log(m.name));