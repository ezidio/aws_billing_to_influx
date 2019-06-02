import { S3 } from 'aws-sdk';
import zlib from 'zlib';
import csvParser from 'csv-parser';
import {IPoint} from 'influx';
import influx from './influx';

const s3 = new S3();

function readFile(Bucket, Key) {
  console.log(`Processando arquivo ${Key}`);
  let bulkData: IPoint[] = [];

  s3.getObject({
    Bucket,
    Key,
  })
    .createReadStream()
    .pipe(zlib.createGunzip())
    .pipe(csvParser())
    .on('data', async data => {
      const id:string = data['identity/LineItemId'];
      const cost:number = parseFloat(data['lineItem/UnblendedCost']);
      const usage:number = parseFloat(data['lineItem/UsageAmount']);
      const product:string = data['lineItem/ProductCode'];
      const service:string = data['product/servicecode'];
      const productFamily:string = data['product/productFamily'];
      const unit:string = data['pricing/unit'] || 'undefined';
      const region:string = data['product/region'];
      const account:string = data['lineItem/UsageAccountId'];
      const at = new Date(data['lineItem/UsageStartDate']).getTime();
      const point = {
        measurement: 'billing',
        timestamp: at,
        tags: { product, unit, region, account, productFamily, service, id },
        fields: { cost, usage }
      };
      bulkData.push(point);
    })
    .on('end', async () => {
      for (let start = 0; start < bulkData.length; start += 1000) {
        await influx.writePoints(bulkData.slice(start, Math.min(start + 1000, bulkData.length)));
      }
    });
}

influx.getDatabaseNames()
  .then(names => {
    if (!names.includes('aws_billing_data')) {
      return influx.createDatabase('aws_billing_data');
    }
    return undefined;
  })
  .then(() => {
    readFile(process.env.BUCKET, process.env.FILE);
  });
