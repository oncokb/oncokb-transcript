package org.mskcc.oncokb.curation.service;

import java.net.URI;
import java.net.URL;
import org.mskcc.oncokb.curation.security.SecurityUtils;
import org.mskcc.oncokb.curation.service.dto.ClustalOResp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class EbiService {

    private final Logger log = LoggerFactory.getLogger(EbiService.class);

    public final String BASE_URL = "https://www.ebi.ac.uk/Tools/services/rest";
    public final String CLUSTAL_O_URL = "/clustalo";
    public final String MVIEW_URL = "/mview";

    private HttpHeaders getCommonEbiHttpHeaders() {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return httpHeaders;
    }

    private String runEbiJob(HttpEntity entity, String toolUrl) throws InterruptedException {
        try {
            RestTemplate restTemplate = new RestTemplate();
            // Post to run
            String jobId = restTemplate.postForObject(getEbiApiUrl(toolUrl + "/run"), entity, String.class);

            // Check status
            String status = "";
            while (!status.equals("FINISHED")) {
                status = restTemplate.getForObject(URI.create(getEbiApiUrl(toolUrl + "/status/" + jobId)), String.class);
                Thread.sleep(1000);
            }

            return jobId;
        } catch (Exception e) {
            log.error("Failed ");
            throw e;
        }
    }

    private String runClustaloJob(String sequence) throws InterruptedException {
        // Prep the POST body before running the ClustalO alignment
        HttpHeaders httpHeaders = getCommonEbiHttpHeaders();

        MultiValueMap<String, String> map = new LinkedMultiValueMap<String, String>();
        map.add("stype", "protein");
        map.add("sequence", sequence);
        map.add("email", SecurityUtils.getCurrentUserLogin().orElseThrow());
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(map, httpHeaders);

        return runEbiJob(entity, CLUSTAL_O_URL);
    }

    private String runMviewJob(String clustaloJobId) throws InterruptedException {
        // Prep the POST body before sending to MView
        HttpHeaders httpHeaders = getCommonEbiHttpHeaders();

        MultiValueMap<String, String> map = new LinkedMultiValueMap<String, String>();
        map = new LinkedMultiValueMap<String, String>();
        map.add("stype", "protein");
        map.add("informat", "automatic");
        map.add("outputformat", "mview");
        map.add("sequence", clustaloJobId);
        map.add("htmlmarkup", "head");
        map.add("css", "true");
        map.add("toolId", "mview");
        map.add("pcid", "aligned");
        map.add("alignment", "true");
        map.add("ruler", "true");
        map.add("width", "100");
        map.add("coloring", "identity");
        map.add("colormap", "RED");
        map.add("email", SecurityUtils.getCurrentUserLogin().orElseThrow());
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(map, httpHeaders);
        return runEbiJob(entity, MVIEW_URL);
    }

    public ClustalOResp alignUsingClustalO(String sequence) throws InterruptedException {
        // Run ClustalO job
        String clustaloJobId = runClustaloJob(sequence);

        // Run MView job
        String mviewJobIds = runMviewJob(clustaloJobId);

        // Return result
        ClustalOResp clustalOResp = new ClustalOResp();
        RestTemplate restTemplate = new RestTemplate();
        clustalOResp.setClustalo(
            restTemplate.getForObject(
                URI.create(getEbiApiUrl(CLUSTAL_O_URL + "/result/" + clustaloJobId + "/aln-clustal_num")),
                String.class
            )
        );
        clustalOResp.setFasta(
            restTemplate.getForObject(URI.create(getEbiApiUrl(CLUSTAL_O_URL + "/result/" + clustaloJobId + "/fa")), String.class)
        );
        clustalOResp.setMview(
            restTemplate.getForObject(URI.create(getEbiApiUrl(MVIEW_URL + "/result/" + mviewJobIds + "/aln-html")), String.class)
        );
        return clustalOResp;
    }

    private String getEbiApiUrl(String tool) {
        return BASE_URL + tool;
    }
}
