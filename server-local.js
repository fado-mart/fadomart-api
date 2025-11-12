import app from "./api/server.js";

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`🚀 Server is running locally on http://localhost:${port}`);
});