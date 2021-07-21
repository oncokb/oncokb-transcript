package org.mskcc.oncokb.transcript.service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;
import org.mskcc.oncokb.transcript.service.aws.models.Site;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@Service
public class AwsService {

    public AwsService() {}

    public Set<Site> getClinicalTrialSites() {
        Region region = Region.US_EAST_1;
        S3Client s3 = S3Client.builder().region(region).build();

        String sitesJsonStr = getObjectBytes(s3, "oncokb", "drug-matching/sites.json");
        JsonObject jsonObject = JsonParser.parseString(sitesJsonStr).getAsJsonObject();

        Set<Site> sites = new HashSet<>();
        Gson gson = new Gson();
        for (String item : jsonObject.keySet()) {
            JsonObject org = jsonObject.getAsJsonObject(item);
            if (org != null && org.has("org")) {
                Site site = gson.fromJson(org.get("org"), Site.class);
                if (site != null) {
                    sites.add(site);
                }
            }
        }
        s3.close();
        return sites;
    }

    public String getObjectBytes(S3Client s3, String bucketName, String keyName) {
        GetObjectRequest objectRequest = GetObjectRequest.builder().key(keyName).bucket(bucketName).build();

        ResponseBytes<GetObjectResponse> objectBytes = s3.getObjectAsBytes(objectRequest);
        return objectBytes.asUtf8String();
    }
}
