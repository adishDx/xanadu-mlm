import { Router } from "express";
import uploader from "../middlewares/uploader";
import { upload_associate, upload_sales } from "../controllers/uploads.controller"
import { get_hierarchy , stats, tb5, rstats, product_distribution, business_insights } from "../controllers/facts.controller"

const router = Router();

router.get("/associate/hierarchy/:id(\\d+)", get_hierarchy);

router.get("/associate/stats/:id(\\d+)", stats);

router.get("/associate/topbottom5/", tb5);

router.get("/region/stats/", rstats);

router.get("/region/product_dist/", product_distribution);

router.get("/business_insights/", business_insights);

router.post("/associates/upload", uploader.single("csvFile"), upload_associate);

router.post("/sales/upload", uploader.single("csvFile"), upload_sales);

export default router;
