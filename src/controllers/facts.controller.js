import DB from "../config/db";
import queries from "../models/queries"


async function get_hierarchy(req, res){

        const { id } = req.params

        try {
           let q = `with final_table as(
            WITH RECURSIVE emp_path AS
            (
              SELECT ar.associate_id, ar.associate_id::varchar as id_path , name as name_path, 1 lvl
                FROM associate_reporting ar join associate_detail ad on ar.associate_id =ad.associate_id
              UNION ALL
              SELECT c.associate_id, CONCAT(cp.id_path, '>', c.associate_id) , CONCAT(cp.name_path, ' > ', ad2.name),lvl+1
                FROM emp_path AS cp JOIN associate_reporting AS c
                  ON cp.associate_id = c.reports_to join associate_detail ad2 on ad2.associate_id = c.associate_id 
            )
            SELECT associate_id, split_part(id_path,'>',1)::integer as sp ,name_path, id_path FROM 
            emp_path 
            )
        select name_path from final_table where (associate_id=${id} or sp=${id}) and associate_id <> sp order by name_path;
                `
            let q2 = `select name, region_name, age, contact, date_of_signup from associate_detail ad join regions r on ad.region = r.region_id where associate_id = ${id}`
            const hierarchy = await DB.query(q)
            const profile = await DB.query(q2)
            res.status(200).json({"profile":profile.rows,"hierarchy":hierarchy.rows})
        } catch (err) {
            console.log(err)
            res.send(err, 503)
        }

}

async function stats(req, res){
    const { id } = req.params

        try {
            let q = `select * from associate_fact where associate_id = ${id}`
            const data = await DB.query(q)
            res.status(200).json({"Associate Stats":data.rows})
        } catch (err) {
            console.log(err)
            res.send(err, 503)
        }
}

async function tb5(req, res){
        try {
            let q = `select af.associate_id,name 
            from 
            associate_fact af join (select associate_id,name, current_date - date_of_signup as age_in_company 
            from 
            associate_detail) ad on af.associate_id = ad.associate_id 
            order by floor((total_comission_earned/100)/age_in_company) desc limit 5`
            let q2 = `select af.associate_id,name 
            from 
            associate_fact af join (select associate_id,name, current_date - date_of_signup as age_in_company 
            from 
            associate_detail) ad on af.associate_id = ad.associate_id 
            order by floor((total_comission_earned/100)/age_in_company) limit 5`
            const data = await DB.query(q)
            const data2 = await DB.query(q2)
            res.status(200).json({"Criteria":"(totalsale*daily_average_sale*total_commission)/age_in_company","Top 5":data.rows, "Bottom 5":data2.rows})
        } catch (err) {
            console.log(err)
            res.send(err, 503)
        }
}

async function rstats(req, res){

        try {
            let q = `select * from region_fact rf join regions r on rf.region_id=r.region_id`
            const data = await DB.query(q)
            res.status(200).json({"Region Stats":data.rows})
        } catch (err) {
            console.log(err)
            res.send(err, 503)
        }
}

async function product_distribution(req, res){
    try {
        let q = `select region_name, product_name, units_sold, total_sale_amount 
        from ( select region_id ,product_id , sum(units) as units_sold, sum(amount) as total_sale_amount from 
        orders group by region_id ,product_id order by region_id ) as a join regions r on r.region_id = a.region_id join products p on p.product_id = a.product_id`
        const data = await DB.query(q)
        res.status(200).json({"Product Distribution across regions":data.rows})
    } catch (err) {
        console.log(err)
        res.send(err, 503)
    }
}

async function business_insights(req, res){
    try {
        let cpst = `select *, indirect_commission/total_subordinates_in_chain as commission_per_subordinate from (select associate_id, total_comission_earned-total_sale*.25 as indirect_commission,
            total_subordinates_in_chain from associate_fact) af order by commission_per_subordinate desc limit 5 `
        let cpsb = `select *, indirect_commission/total_subordinates_in_chain as commission_per_subordinate from (select associate_id, total_comission_earned-total_sale*.25 as indirect_commission,
            total_subordinates_in_chain from associate_fact) af order by indirect_commission desc limit 5 `
        let sbag = `with AgeGroup as (
            select *
            from (values 
                (25,30,'25-30')
              , (30,35,'30-35')
              , (35,40,'35-40')
              , (45,50,'45-50')
              , (50,55,'50-55')
              , (55,60,'55-60')
                ) as t(ami,ama,ag)
          )
          , cte as (
          select
              ag,ad.*
            from AgeGroup aa join associate_detail ad on ad.age>=aa.ami and ad.age<=aa.ama  )
          select ag, sum(amount) from cte c join orders o on c.associate_id=o.associate_id group by ag order by sum desc  `
        
        let sbm = `select date_part('month', order_dt) as m, sum(amount) from orders group by m order by sum desc`
        let sbr = `select region_name, sum from (select ad2.region, sum(amount) from 
        associate_detail ad2 join orders o on o.associate_id = ad2.associate_id group by ad2.region) a 
        join regions r on a.region=r.region_id order by sum desc`

        const cpst_data = await DB.query(cpst)
        const cpsb_data = await DB.query(cpsb)
        const sbag_data = await DB.query(sbag)
        const sbm_data = await DB.query(sbm)
        const sbr_data = await DB.query(sbr)

        res.status(200).json({"commission_per_subordinates_top_5":cpst_data.rows,
                            "commission_per_subordinates_bottom_5":cpsb_data.rows,
                            "sale_by_age_group":sbag_data.rows,
                            "sale_by_months(1-12 => jan - dec)":sbm_data.rows,
                            "associate_sale_by_region":sbr_data.rows})
    } catch (err) {
        console.log(err)
        res.send(err, 503)
    }
}


export{ get_hierarchy , stats, tb5, rstats, product_distribution, business_insights}