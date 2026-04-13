module.exports = async (req, res) => {
  const apiKey = process.env.FOOTBALL_API_KEY;
  const { endpoint } = req.query;
  const url =
    "https://api.football-data.org/v4/" +
    (endpoint || "matches?status=SCHEDULED&limit=20");

  try {
    const response = await fetch(url, {
      headers: { "X-Auth-Token": apiKey ?? "" },
    });
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
