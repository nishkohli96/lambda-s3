# Lambda-S3

Code snippet of a Lambda function which triggers when a file is uploaded to an S3 bucket. It copies the file to a destination bucket and sends an SNS notification.

The function is automatically updated whenever changes are pushed to the main branch via GitHub Actions, which:
- Builds the source code.
- Zips the build and uploads it to a **version-enabled S3 Bucket**, to revert code, if needed.
- Updates the Lambda function code from the S3 bucket.