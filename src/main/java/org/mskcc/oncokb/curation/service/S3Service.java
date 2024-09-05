package org.mskcc.oncokb.curation.service;

import java.util.Optional;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.config.application.AwsProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@Service
public class S3Service {

    private final Logger log = LoggerFactory.getLogger(S3Service.class);
    private final ApplicationProperties applicationProperties;
    private S3Client s3Client;

    public S3Service(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
        AwsProperties awsProperties = applicationProperties.getAws();
        if (awsProperties != null) {
            String accessKeyId = awsProperties.getAccessKeyId();
            String secretAccessKey = awsProperties.getSecretAccessKey();
            String region = awsProperties.getRegion();
            AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
            s3Client = S3Client.builder().region(Region.of(region)).credentialsProvider(StaticCredentialsProvider.create(awsCreds)).build();
            log.info("S3 Client successfully initialized");
        } else {
            log.error("AWS credentials not configured properly");
        }
    }

    /**
     * Get an object from aws s3
     * @param bucket s3 bucket name
     * @param objectPath the path of the object
     * @return a S3 object
     */
    public Optional<ResponseInputStream<GetObjectResponse>> getObject(String bucket, String objectPath) {
        try {
            ResponseInputStream<GetObjectResponse> s3object = s3Client.getObject(
                GetObjectRequest.builder().bucket(bucket).key(objectPath).build(),
                ResponseTransformer.toInputStream()
            );
            return Optional.of(s3object);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return Optional.empty();
        }
    }
}
