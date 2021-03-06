const Firestore = require('@google-cloud/firestore');
const escapeHtml = require('escape-html');
const moment = require('moment');

// const PROJECTID = 'test-project-285722';
const db = new Firestore();
// {
//   // projectId: PROJECTID,
//   // timestampsInSnapshots: true,
// });

exports.getNetprobeData = async(req, res) => {
  res.set('Access-Control-Allow-Origin', "*");
  res.set('Access-Control-Allow-Methods', 'GET');

  if (req.method != 'GET') {
    // console.log(`${req.method} requests are not allowed.`);
    return res.status(403).send(`Method ${req.method} is not allowed.`);
  }

  console.log(`Got request parameters:\n\n${JSON.stringify(req.query)}`);

  let node = escapeHtml(req.query.nodeId);
  let ds = escapeHtml(req.query.dataset);
  if (!(node && ds)) {
    // console.log(`No nodeId query parameter was provided.`);
    return res.status(400).send(
      "Query parameters 'nodeId' and 'dataset' are required.");
  }

  let start = escapeHtml(req.query.start);
  let end = escapeHtml(req.query.end);
  console.log(`Got query for start: '${start}' (${typeof start}), end: '${end}' (${typeof end}), node: '${node}', dataset: '${ds}'`);

  endDate = new Date();
  if(end !== 'undefined' && end.length > 6){
    console.log(`Parsing moment from: '${end}'`);
    try{
      endDate = new Date(parseInt(end));
    }
    catch(err){
      console.log("Error parsing end date: " + err);
    }
  }

  let startDate = new Date()
  startDate.setHours(endDate.getHours()-6);

  if(start !== 'undefined' && start.length > 6){
    console.log(`Parsing moment from: '${start}'`);
    try{
      startDate = new Date(parseInt(start));
    }
    catch(err){
      console.log("Error parsing start date: " + err);
    }
  }

  let startSec = Math.floor(startDate.getTime()/1000);
  let endSec = Math.ceil(endDate.getTime()/1000);

  console.log(`Retrieving ${ds} results for node: ${node} between ${startSec} and ${endSec}`);
  console.log(`Where clause #1: 'tstamp', '<=', '${endSec}'`)
  console.log(`Where clause #2: 'tstamp', '>=', '${startSec}'`)
  db.collection(`netprobe/${node}/${ds}`)
    .where('tstamp', '<=', endSec)
    .where('tstamp', '>=', startSec)
    .orderBy('tstamp')
    .limit(400)
    .get().then((docs)=>{
      let data = [];
      docs.forEach(doc => {
        let record = doc.data();
        let ts = new Date(record.tstamp * 1000);
        record.tstamp = ts;
        record.tstr = ts.toLocaleTimeString();
        data.push(record);
      });

      return res.status(200).send(data);
    }).catch(err=>{
      console.error(err);
      return res.status(400).send({ error: 'Unable to retrieve', err });
    });

};
