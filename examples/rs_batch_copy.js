const qiniu = require("qiniu");
const proc = require("process");

var accessKey = proc.env.QINIU_ACCESS_KEY;
var secretKey = proc.env.QINIU_SECRET_KEY;
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
var config = new qiniu.conf.Config();
var bucketManager = new qiniu.rs.BucketManager(mac, config);

var srcBucket = proc.env.QINIU_TEST_BUCKET;
var srcKey = 'qiniu.mp4';
var destBucket = srcBucket;

//每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
var copyOperations = [
  qiniu.rs.copyOp(srcBucket, srcKey, destBucket, 'qiniu1.mp4', {
    force: true
  }),
  qiniu.rs.copyOp(srcBucket, srcKey, destBucket, 'qiniu2.mp4'),
  qiniu.rs.copyOp(srcBucket, srcKey, destBucket, 'qiniu3.mp4'),
  qiniu.rs.copyOp(srcBucket, srcKey, destBucket, 'qiniu4.mp4'),
];

bucketManager.batch(copyOperations, function(err, respBody, respInfo) {
  if (err) {
    console.log(err);
    //throw err;
  } else {
    // 200 is success, 298 is part success
    if (parseInt(respInfo.statusCode / 100) == 2) {
      respBody.forEach(function(item) {
        if (item.code == 200) {
          console.log(item.code + "\tsuccess");
        } else {
          console.log(item.code + "\t" + item.data.error);
        }
      });
    } else {
      console.log(respInfo.deleteusCode);
      console.log(respBody);
    }
  }
});
