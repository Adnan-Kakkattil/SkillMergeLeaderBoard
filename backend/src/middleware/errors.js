export function notFoundHandler(_req, res) {
  return res.status(404).json({ error: "Route not found." });
}

export function errorHandler(err, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(err);
  if (res.headersSent) {
    return;
  }

  return res.status(500).json({ error: "Internal server error." });
}
