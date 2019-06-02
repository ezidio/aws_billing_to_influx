
import {InfluxDB, FieldType} from 'influx';

export default new InfluxDB({
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
  });