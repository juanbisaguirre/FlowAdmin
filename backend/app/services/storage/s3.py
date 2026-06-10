import boto3
import logging
from botocore.exceptions import ClientError
from app.core.config import settings

logger = logging.getLogger(__name__)

class S3StorageService:
    def __init__(self):
        # We read these from settings in a real environment
        # e.g., settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", "minioadmin"),
            aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", "minioadmin"),
            endpoint_url=getattr(settings, "AWS_ENDPOINT_URL", "http://minio:9000"),
            region_name=getattr(settings, "AWS_REGION", "us-east-1")
        )
        self.bucket_name = getattr(settings, "AWS_BUCKET_NAME", "flowadmin-pdfs")

    def ensure_bucket_exists(self):
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                logger.info(f"Bucket {self.bucket_name} not found. Creating it...")
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            else:
                logger.error(f"Error checking bucket: {e}")

    def upload_file(self, file_name: str, file_bytes: bytes, content_type: str = 'application/pdf') -> str:
        """Uploads a file and returns the object key"""
        self.ensure_bucket_exists()
        
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_name,
                Body=file_bytes,
                ContentType=content_type
            )
            return file_name
        except Exception as e:
            logger.error(f"Failed to upload file {file_name} to S3: {e}")
            return ""

    def generate_presigned_url(self, object_name: str, expiration=3600) -> str:
        """Generate a presigned URL to share an S3 object"""
        if not object_name:
            return ""
            
        try:
            response = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_name},
                ExpiresIn=expiration
            )
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            return ""

        return response
