import express from "express";
import cors from "cors";
import fileTreeRoutes from "./routes/fileTreeRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/file-trees", fileTreeRoutes);

const PORT = process.env.PORT || 9292;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
