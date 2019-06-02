import {InfluxDB, FieldType} from 'influx';

const influx = new InfluxDB({
    host: 'localhost',
    database: 'aws_billing_data',
    schema: [
      {
        measurement: 'billing',
        fields: {
          usage: FieldType.FLOAT,
          cost: FieldType.FLOAT
        },
        tags: [
          'product', 'region', 'account', 'unit', 'productFamily', 'service', 'id'
        ]
      }
    ]
  })

influx.query(`
    select sum(cost) from billing group by account, product, service, productFamily
  `).then((result:any[]) => {
      result.sort((a,b) => b.sum - a.sum)
        .forEach(r => console.log(`"[${r.account}] ${r.product}","${r.service}","${r.productFamily}",${r.sum}`))
  })