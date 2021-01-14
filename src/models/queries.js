const queries = {
    'associate_queries':[`insert into regions(region_name) select distinct region from emp where region not in (select region_name from regions);`,
    `insert into associate_detail select emp_id, name, region_id, age, contact from emp e join regions r on r.region_name=e.region where emp_id not in (select associate_id from associate_detail); `,
`insert into associate_reporting select emp_id, reports_to from emp where emp_id not in (select associate_id from associate_reporting);`,
`insert into associate_fact(associate_id) select associate_id from associate_detail where associate_id not in (select associate_id from associate_fact);`,
`insert into region_fact(region_id) select distinct region_id from regions where region_id not in (select region_id from region_fact);`
],
    'sales_queries':[`insert into orders select txn_id, emp_id, region_id, dt, product_id, units, amount from txns t join regions r on r.region_name = t.region join products p on p.product_name = t.product where txn_id not in (select order_id from orders); `,
`UPDATE associate_fact SET total_sale=subquery.sale FROM (select associate_id as aid, sum(amount) as sale from orders group by associate_id) AS subquery WHERE associate_id=subquery.aid;`,

`UPDATE region_fact SET total_sale=subquery.sale FROM (select region_id as aid, sum(amount) as sale from orders group by region_id) AS subquery WHERE region_id=subquery.aid;`,

`UPDATE associate_fact SET sale_in_last_30_days = subquery.sale FROM (select associate_id as aid, sum(amount) as sale from orders where order_dt > current_date - interval '30' day group by associate_id) AS subquery WHERE associate_id=subquery.aid;`,

`UPDATE region_fact SET sale_in_last_30_days = subquery.sale FROM (select region_id as aid, sum(amount) as sale from orders where order_dt > current_date - interval '30' day group by region_id) AS subquery WHERE region_id=subquery.aid;`,

`UPDATE associate_fact 
SET daily_average_sale_last_180_days = subquery.sale
FROM (select associate_id as aid, sum(amount)/180 as sale from orders where order_dt > current_date - interval '180' day group by associate_id) AS subquery
WHERE associate_id=subquery.aid;
`,

`UPDATE region_fact 
SET daily_average_sale_last_180_days = sale
FROM (select region_id as aid, sum(amount)/180 as sale from orders where order_dt > current_date - interval '180' day group by region_id) AS subquery
WHERE region_id=subquery.aid;`,

`UPDATE associate_fact SET top_region_of_sale =region_name FROM (select associate_id as aid, region_name from (select *,dense_rank() over (partition by associate_id order by sale desc) as r from (select associate_id, region_id, sum(amount) as sale from orders group by associate_id,region_id order by associate_id) as a) as b join regions rr on b.region_id=rr.region_id where r=1) AS subquery WHERE associate_id=subquery.aid;`,

`UPDATE associate_fact SET top_product_sold  =product_name FROM (select associate_id as aid, product_name from (select *,dense_rank() over (partition by associate_id order by sale desc) as r from (select associate_id, product_id, sum(amount) as sale from orders group by associate_id,product_id order by associate_id) as a) as b join products pp on b.product_id=pp.product_id where r=1) AS subquery WHERE associate_id=subquery.aid;`,

`UPDATE region_fact SET top_product_sold  =product_name FROM (select region_id as aid, product_name from (select *,dense_rank() over (partition by region_id order by sale desc) as r from (select region_id, product_id, sum(amount) as sale from orders group by region_id,product_id order by region_id) as a) as b join products pp on b.product_id=pp.product_id where r=1) AS subquery WHERE region_id=subquery.aid;`,

`UPDATE region_fact 
SET most_popular_product  =product_name
FROM (select region_id as aid, product_name from (select *,dense_rank() over (partition by region_id order by sold desc) as r from 
(select region_id, product_id, sum(units) as sold from
orders group by region_id,product_id order by region_id) as a) as b 
join products pp on b.product_id=pp.product_id where r=1) AS subquery
WHERE region_id=subquery.aid;`,

`UPDATE associate_fact 
SET largest_order  = amt
FROM (select associate_id as aid, max(amount) as amt from orders group by associate_id) AS subquery
WHERE associate_id=subquery.aid;`,

`UPDATE region_fact 
SET largest_order  = amt
FROM (select region_id as aid, max(amount) as amt from orders group by region_id) AS subquery
WHERE region_id=subquery.aid;`,

`UPDATE associate_fact 
SET total_comission_earned   = total_commission
FROM (WITH RECURSIVE emp_path AS
(
  SELECT associate_id, associate_id::varchar as id_path , 1 lvl
    FROM associate_reporting 
  UNION ALL
  SELECT c.associate_id, CONCAT(cp.id_path, '>', c.associate_id) , lvl+1
    FROM emp_path AS cp JOIN associate_reporting AS c
      ON cp.associate_id = c.reports_to
)
select sp as aid,sum(commission) as total_commission,  count(*) as total_subordinates_in_chain
 from (SELECT split_part(id_path,'>',1)::integer as sp ,
amount*(.25/lvl)  as commission FROM 
emp_path as pp join (select associate_id, sum(amount) as amount from orders group by associate_id) 
as tt on pp.associate_id=tt.associate_id) as final_table group by sp order by sp) AS subquery
WHERE associate_id=subquery.aid;`,

`UPDATE associate_fact 
SET level_in_hierarchy   = lvl
FROM (WITH RECURSIVE emp_path AS
(
  SELECT associate_id, 0 lvl
    FROM associate_reporting where reports_to is NULL 
  UNION ALL
  SELECT c.associate_id, lvl+1
    FROM emp_path AS cp JOIN associate_reporting AS c
      ON cp.associate_id = c.reports_to
)
select associate_id as aid, lvl from emp_path) AS subquery
WHERE associate_id=subquery.aid;`,

`UPDATE region_fact 
SET associate_count  = cnt
FROM (select region_id as aid, count(*) as cnt from associate_detail ad join regions re on ad.region=re.region_id
group by region_id) AS subquery
WHERE region_id=subquery.aid;
`,
`update associate_detail 
set date_of_signup=date(date '2020-03-01' - trunc(random() * 360 +1) * '1 day'::interval) 
where date_of_signup is null;`,

`delete from txns;`,

`UPDATE associate_fact 
SET total_subordinates_in_chain = tsin from
(WITH RECURSIVE emp_path AS
(
  SELECT associate_id, associate_id::varchar as id_path , 1 lvl
    FROM associate_reporting 
  UNION ALL
  SELECT c.associate_id, CONCAT(cp.id_path, '>', c.associate_id) , lvl+1
    FROM emp_path AS cp JOIN associate_reporting AS c
      ON cp.associate_id = c.reports_to
)
select sp as aid,sum(case when commission is null then 0 else commission end) as total_commission,  count(*) as tsin
 from (SELECT split_part(id_path,'>',1)::integer as sp ,
amount*(.25/lvl)  as commission FROM 
emp_path as pp left join (select associate_id, sum(amount) as amount from orders group by associate_id) 
as tt on pp.associate_id=tt.associate_id) as final_table group by sp order by sp) AS subquery
WHERE associate_id=subquery.aid;`
]
}

export default queries;