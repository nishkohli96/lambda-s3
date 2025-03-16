import 'dotenv/config';
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

/**
 * I'm copying objects from an S3 bucket in ap-south-1 to a
 * bucket in us-west-1. Hence I need to specify the region name
 * in this case, else I would get a "PermanentRedirect" error as
 * source & destination buckets are not in the same region.
 */
const s3Dest = new S3Client({
  region: 'us-west-1',
});

export const snsClient = new SNSClient();

const DSTN_BUCKET = process.env.DSTN_BUCKET;
const snsTopicArn = process.env.AWS_SNS_TOPIC_ARN;

export const handler = async (event) => {
  try {
    console.log('🚀 Event Details:', JSON.stringify(event, null, 2));
    const record = event.Records[0];
    const sourceBucket = record.s3.bucket.name;

    const copyPromises = event.Records.map(async (record) => {
      const objectKey = record.s3.object.key;
      const copyParams = {
        Bucket: DSTN_BUCKET,
        CopySource: `${sourceBucket}/${objectKey}`,
        Key: objectKey
      };
      await s3Dest.send(new CopyObjectCommand(copyParams));
      console.log(`✅ File copied: ${objectKey}`);
    });

    const copyObjectsResponse = await Promise.all(copyPromises);

    /* Send event info to SNS */
    const input = {
      TopicArn: snsTopicArn,
      Message: JSON.stringify(event.Records, null, 2),
      Subject: 'Manual SNS Notification of S3 copying objects'
    };
    const command = new PublishCommand(input);
    const snsResponse = await snsClient.send(command);
    return {
      statusCode: 200,
      message: `${event.Records.length} file(s) copied successfully`,
      data: {
        s3: copyObjectsResponse,
        sns: snsResponse
      }
    };
  } catch (error) {
    console.error('❌ Error copying file:', error);
    return {
      statusCode: 500,
      body: 'Failed to copy file'
    };
  }
};
