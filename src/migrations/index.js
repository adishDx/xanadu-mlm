import DB from "../config/db";

const queries = [
  `CREATE TABLE IF NOT EXISTS emp (
        id SERIAL NOT NULL UNIQUE,
        emp_id int NOT NULL,
        name varchar NOT NULL,
        reports_to int default NULL,
        region varchar default NULL,	
        age int NOT NULL,
        contact bigint NULL, 
        PRIMARY KEY (emp_id),
        FOREIGN KEY (reports_to) REFERENCES emp (emp_id) 
          ON DELETE CASCADE ON UPDATE CASCADE
      );
      `,
  `
      CREATE TABLE IF NOT EXISTS txns (
        txn_id int NOT NULL UNIQUE,
        emp_id int NOT NULL,
        region varchar default NULL,
        dt date default NULL,	
        product varchar NOT NULL,
        units int NOT NULL,
        amount decimal(15,2) NOT NULL,
        PRIMARY KEY (txn_id),
        FOREIGN KEY (emp_id) REFERENCES emp (emp_id) 
          ON DELETE CASCADE ON UPDATE CASCADE
      );`,
  `
CREATE TABLE IF NOT EXISTS associate_detail (
    associate_id int NOT NULL,
    name varchar NOT NULL,
    region int default NULL,	
    age int NOT NULL,
    contact bigint NULL,
    date_of_signup date default NULL, 
    PRIMARY KEY (associate_id)
);
`,
  `
CREATE TABLE IF NOT EXISTS associate_reporting (
    associate_id int NOT NULL,
    reports_to int default NULL,
    PRIMARY KEY (associate_id),
    FOREIGN KEY (reports_to) REFERENCES associate_reporting (associate_id) 
      ON DELETE CASCADE ON UPDATE cascade,
    FOREIGN KEY (associate_id) REFERENCES associate_detail (associate_id) 
      ON DELETE CASCADE ON UPDATE CASCADE
);
`,
  `CREATE TABLE IF NOT EXISTS products (
    product_id serial NOT NULL,
    product_name varchar default NULL,
    PRIMARY KEY (product_id)
    );
  `,
  `CREATE TABLE IF NOT EXISTS regions (
    region_id serial NOT NULL,
    region_name varchar default NULL,
    PRIMARY KEY (region_id)
    );`,
  `CREATE TABLE IF NOT EXISTS orders (
        order_id int NOT NULL,
        associate_id int NOT NULL,
        region_id int default NULL,
        order_dt date default NULL,	
        product_id int NOT NULL,
        units int NOT NULL,
        amount decimal(15,2) NOT NULL,
        PRIMARY KEY (order_id),
        FOREIGN KEY (associate_id) REFERENCES associate_reporting (associate_id) 
          ON DELETE CASCADE ON UPDATE cascade,
        FOREIGN KEY (region_id) REFERENCES regions (region_id) 
          ON DELETE CASCADE ON UPDATE cascade,
        FOREIGN KEY (product_id) REFERENCES products (product_id) 
          ON DELETE CASCADE ON UPDATE cascade);
`,
  `CREATE TABLE IF NOT EXISTS associate_fact (
    associate_id int NOT NULL,
    total_sale decimal(15,2) default 0 NULL,
    sale_in_last_30_days decimal(15,2) default 0 NULL,
    total_comission_earned decimal(15,2) default 0 NULL,
    top_product_sold varchar default '' NULL,
    top_region_of_sale varchar default '' NULL,
    largest_order decimal(15,2) default 0 NULL,
    daily_average_sale_last_180_days decimal(15,2) default 0 NULL,
    total_subordinates_in_chain int default 0 null,
    level_in_hierarchy int default 0 null,
    PRIMARY KEY (associate_id),
    FOREIGN KEY (associate_id) REFERENCES associate_reporting (associate_id) 
      ON DELETE CASCADE ON UPDATE cascade);
  `,
  `
  CREATE TABLE IF NOT EXISTS region_fact (
    region_id int NOT NULL,
    total_sale decimal(15,2) default 0 NULL,
    sale_in_last_30_days decimal(15,2) default 0 NULL,
    top_product_sold varchar default '' NULL,
    most_popular_product varchar default '' NULL,
    top_region_of_sale varchar default '' NULL,
    largest_order decimal(15,2) default 0 NULL,
    daily_average_sale_last_180_days decimal(15,2) default 0 NULL,
    associate_count int default 0 null,
    PRIMARY KEY (region_id),
    FOREIGN KEY (region_id) REFERENCES regions (region_id) 
      ON DELETE CASCADE ON UPDATE cascade);
`
];

const executeQueries = async () => {
  let q=""
  for(let i=0;i<queries.length;i++)
    q=q+queries[i]
  await DB.query(q, (error, results) => {
    if (error) {
      throw error;
    }
    console.log(`MIGRATION SUCCESSFULL.`);
  });
};

export default executeQueries;
