import DB from "../config/db";
import { Router } from "express";
import { readFileSync } from "fs";
import uploader from "../middlewares/uploader";
import s3, { BUCKET_NAME } from "../config/aws";
import queries from "../models/queries"


async function upload_associate(req, res) {
    const Body = await readFileSync(req.file.path);

    s3.upload(
      {
        Body,
        Bucket: BUCKET_NAME,
        Key: `employees/${Date.now()}/associates.csv`,
      },
      async (err, data) => {
        if (err) {
          return res.status(503).json({"message":"S3 Upload Failed."})
        }
        let query = `\copy emp(emp_id,
        name,
        reports_to,
        region,	
        age,
        contact) FROM '${req.file.path}' DELIMITER ',' CSV HEADER;
      `;
      for(let i=0; i<queries.associate_queries.length;i++)
        query = query+queries.associate_queries[i]
        try {
            let client = await DB.connect();
            await client.query(query);
            client.release()   
            return res.status(201).json({
                S3filePath: data.Location,
                message: `File uploaded successfully. Fact Tables Updated`,
              });
        } catch (error) {
            res.status(503).json({message:"duplicate or incorrect data not allowed"});
        }
      }
    );
  };

  async function upload_sales(req, res) {
    const Body = await readFileSync(req.file.path);
  
    s3.upload(
      {
        Body,
        Bucket: BUCKET_NAME,
        Key: `sales/${Date.now()}/sales.csv`,
      },
      async (err, data) => {
        if (err) {
          return res.status(503).json({"message":"S3 Upload Failed."})
        }
  
        let query = `\COPY txns FROM '${req.file.path}' DELIMITER ',' CSV HEADER;`;
        for(let i=0; i<queries.sales_queries.length;i++)
          query = query+queries.sales_queries[i]
  
          try {
            let client = await DB.connect();
            await client.query(query);
            client.release()   
            return res.status(201).json({
                S3filePath: data.Location,
                message: `File uploaded successfully. Fact Tables Updated`,
              });
        } catch (error) {
          console.log(error)
            res.status(503).json({message:"duplicate or incorrect data not allowed"});
        }
  
        return res.status(201).json({
          S3filePath: data.Location,
          message: `File uploaded successfully.  Fact Tables Updated`,
        });
      }
    );
  };

  export { upload_associate, upload_sales }