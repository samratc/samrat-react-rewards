import express from "express";
import cors from "cors";
import customerRoutes from "./server/routes/customerRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? false : true),
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", customerRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export { app };
