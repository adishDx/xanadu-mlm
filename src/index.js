import cors from "cors";
import { join } from "path";
import express from "express";
import { json } from "body-parser";
import migrate from "./migrations";
import EmployeeRoute from "./api/routes";
// import queries from "./models/queries"

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(json());
app.use(express.static(join(__dirname, "./uploads")));

app.use("/api", EmployeeRoute);

app.get('*', function(req, res){
  res.status(404).json({"msg":"Well You Have Come A Wrong Way", 
"Available Routes":["/api/associate/hierarchy/:id", "/api/associate/stats/:id",
"/api/associate/topbottom5/", "/api/associates/upload", "/api/sales/upload", "/api/region/stats/", "/api/region/product_dist/"]});
});

const startApp = async () => {
  try {
    await migrate();
    // console.log(queries.sales_queries)
    app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));
  } catch (err) {
    console.log(`Unable to start server.`);
    console.log(err);
  }
};

startApp();
