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

  let node = escapeHtml(req.query.nodeId);
  let ds = escapeHtml(req.query.dataset);
  if (!(node && ds)) {
    // console.log(`No nodeId query parameter was provided.`);
    return res.status(400).send(
      "Query parameters 'nodeId' and 'dataset' are required.");
  }

  let start = escapeHtml(req.query.start);
  let end = escapeHtml(req.query.end);

  endDate = new Date();
  if(end){
    endDate = moment(end).toDate();
  }

  let startDate = new Date()
  start.setHours(end.getHours()-6);

  if(start){
    startDate = moment(start).toDate();
  }

  console.log(`Retrieving ${ds} results for node: ${node} between ${startDate} and ${endDate}`);
  db.collection(`netprobe/${node}/${ds}`)
    .where(`tstamp <= ${endDate.getTime()}`).where(`tstamp >= ${startDate.getTime()}`)
    .orderBy('tstamp')
    .limit(400)
    .get().then(docs=>{
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

    })

};
