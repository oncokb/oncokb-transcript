package org.mskcc.oncokb.curation.web.rest;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.json.JSONArray;
import org.json.JSONObject;
import org.mskcc.oncokb.curation.config.Constants;
import org.mskcc.oncokb.curation.service.S3Service;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.mskcc.oncokb.curation.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@RestController
@RequestMapping("/api")
public class VariantRecommendController {

    private final Logger log = LoggerFactory.getLogger(VariantRecommendController.class);

    private static final String ENTITY_NAME = "variant-recommendation";

    @Autowired
    private S3Service s3Service;

    @GetMapping("/variant-recommendation/{filename}")
    public ResponseEntity<String> requestData(@PathVariable String filename) throws IOException {
        Optional<ResponseInputStream<GetObjectResponse>> s3object = s3Service.getObject(Constants.ONCOKB_S3_BUCKET, filename);
        if (s3object.isPresent()) {
            BufferedReader reader = new BufferedReader(new InputStreamReader(s3object.orElseThrow(), StandardCharsets.UTF_8));
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BadRequestAlertException("File is empty", ENTITY_NAME, "fileempty");
            }
            String[] headers = headerLine.split("\t");
            JSONArray jsonArray = new JSONArray();
            String line;
            while ((line = reader.readLine()) != null) {
                String[] data = line.split("\t");
                JSONObject jsonObject = new JSONObject();
                for (int i = 0; i < headers.length; i++) {
                    jsonObject.put(headers[i], "n/a".equals(data[i]) ? null : data[i]);
                }
                jsonArray.put(jsonObject);
            }
            return ResponseEntity.ok(jsonArray.toString());
        } else {
            throw new ResourceNotFoundException("File not Found", ENTITY_NAME, "nofile");
        }
    }
}
