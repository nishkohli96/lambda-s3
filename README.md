# Lambda-S3

Code snippet of a Lambda function which triggers when a file is uploaded to an S3 bucket. It copies the file to a destination bucket and sends an SNS notification.

The function is automatically updated whenever changes are pushed to the main branch via GitHub Actions, which:
- Builds the source code.
- Zips the build and uploads it to a **version-enabled S3 Bucket**, to revert code, if needed.
- Updates the Lambda function code from the S3 bucket.

## Caveats

1.  I'm copying objects from an S3 bucket in `ap-south-1` to a bucket in `us-west-1`. Hence I need to specify the region name in this case, else I would get a **PermanentRedirect error** as source & destination buckets are not in the same region.

2.  I also need to add S3 related policy in the **Permissions policies** section for the Lambda IAM role, to deny the lambda from accessing the files. I can create a new Policy, for say only writing to S3 and then attach that policy to the Lambda IAM role to the copying to work fine.

3.  If manually linking to an SNS topic, the SNS permission also needs to be added to the lambda IAM role. Else the SNS can be directly set as the destination for the lambda function.
