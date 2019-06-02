import influx from './influx';

influx.query(`
    select sum(cost) from billing group by account, product, service, productFamily
  `).then((result:any[]) => {
      result.sort((a,b) => b.sum - a.sum)
        .forEach(r => console.log(`"[${r.account}] ${r.product}","${r.service}","${r.productFamily}",${r.sum}`))
  })