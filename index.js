const Firestore = require('@google-cloud/firestore');
const escapeHtml = require('escape-html');

// const PROJECTID = 'test-project-285722';
const db = new Firestore();
// {
//   // projectId: PROJECTID,
//   // timestampsInSnapshots: true,
// });

exports.getNetprobeData = async(req, res) => {
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

  console.log(`Retrieving ${ds} results for node: ${node}`);
  const snapshot = await db.collection(`netprobe/${node}/${ds}`)
    .orderBy('tstamp')
    .limit(100)
    .get();

  let data = [];
  snapshot.forEach(doc => {
    let record = doc.data();
    let ts = new Date(record.tstamp * 1000);
    record.tstamp = ts;
    record.tstr = ts.toLocaleTimeString();
    data.push(record);
  });

  return res.status(200).send(data);
};
