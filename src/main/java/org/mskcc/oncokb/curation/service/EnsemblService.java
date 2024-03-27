package org.mskcc.oncokb.curation.service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.vm.ensembl.EnsemblArchiveId;
import org.mskcc.oncokb.curation.vm.ensembl.EnsemblSequence;
import org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
@Service
public class EnsemblService {

    private final Logger log = LoggerFactory.getLogger(EnsemblService.class);

    public final String ENSEMBL_37_API_URL = "https://grch37.rest.ensembl.org";
    public final String ENSEMBL_38_API_URL = "https://rest.ensembl.org";

    private String getSequenceGETUrl(ReferenceGenome referenceGenome, String sequenceId) {
        return getEnsemblAPIUrl(referenceGenome) + "/sequence/id/" + sequenceId;
    }

    private String getSequencePOSTUrl(ReferenceGenome referenceGenome) {
        return getEnsemblAPIUrl(referenceGenome) + "/sequence/id";
    }

    public Optional<EnsemblSequence> getProteinSequence(ReferenceGenome referenceGenome, String sequenceId) {
        String mainSequenceId = sequenceId;
        String subversion = null;
        // ensembl does not accept id with subversion, trim it before fetching
        if (sequenceId.contains(".")) {
            int dotIndex = sequenceId.indexOf(".");
            mainSequenceId = sequenceId.substring(0, dotIndex);
            subversion = sequenceId.substring(dotIndex + 1);
        }

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(httpHeaders);

        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<EnsemblSequence> response = restTemplate.exchange(
                getSequenceGETUrl(referenceGenome, mainSequenceId),
                HttpMethod.GET,
                entity,
                EnsemblSequence.class
            );
            EnsemblSequence ensemblSequence = response.getBody();
            if (
                subversion != null &&
                (ensemblSequence.getVersion() == null || !ensemblSequence.getVersion().equals(Integer.parseInt(subversion)))
            ) {
                log.error("The sequence subversion is NOT the latest, aborting");
                return Optional.empty();
            } else {
                return Optional.of(ensemblSequence);
            }
        } catch (RestClientException exception) {
            log.error(exception.getMessage());
            return Optional.empty();
        }
    }

    public List<EnsemblSequence> getProteinSequences(ReferenceGenome referenceGenome, List<String> transcripts) {
        if (transcripts.size() == 0) {
            return new ArrayList<>();
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        JSONObject jsonObject = new JSONObject();
        JSONArray jsonArray = new JSONArray();
        transcripts.stream().forEach(transcript -> jsonArray.put(transcript));
        try {
            jsonObject.put("ids", jsonArray);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        HttpEntity<String> entity = new HttpEntity<>(jsonObject.toString(), httpHeaders);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<EnsemblSequence[]> response = restTemplate.postForEntity(
            getSequencePOSTUrl(referenceGenome),
            entity,
            EnsemblSequence[].class
        );
        return Arrays.asList(response.getBody());
    }

    public Optional<org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> getTranscript(
        ReferenceGenome referenceGenome,
        String transcriptId
    ) {
        log.info("Get info about {} {}", referenceGenome, transcriptId);
        String mainTranscriptId = transcriptId;
        String subversion = null;
        // ensembl does not accept id with subversion, trim it before fetching
        if (transcriptId.contains(".")) {
            int dotIndex = transcriptId.indexOf(".");
            mainTranscriptId = transcriptId.substring(0, dotIndex);
            subversion = transcriptId.substring(dotIndex + 1);
        }
        List<org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> ensemblTranscriptList = getIds(
            referenceGenome,
            Collections.singletonList(mainTranscriptId),
            true,
            true
        );
        EnsemblTranscript ensemblTranscript = ensemblTranscriptList.size() > 0 ? ensemblTranscriptList.get(0) : null;
        if (
            ensemblTranscript != null &&
            subversion != null &&
            (ensemblTranscript.getVersion() == null || !ensemblTranscript.getVersion().equals(Integer.parseInt(subversion)))
        ) {
            log.error("The transcript subversion is NOT the latest transcript, aborting");
            return Optional.empty();
        } else if (ensemblTranscript != null) {
            return Optional.of(ensemblTranscript);
        } else {
            log.error("No transcript found for {} {}", referenceGenome, mainTranscriptId);
            return Optional.empty();
        }
    }

    public Optional<org.mskcc.oncokb.curation.vm.ensembl.EnsemblArchiveId> getArchiveId(ReferenceGenome referenceGenome, String id) {
        List<org.mskcc.oncokb.curation.vm.ensembl.EnsemblArchiveId> ensemblTranscriptList = getArchiveIds(
            referenceGenome,
            Collections.singletonList(id)
        );
        return ensemblTranscriptList.size() > 0 ? Optional.of(ensemblTranscriptList.get(0)) : Optional.empty();
    }

    public List<org.mskcc.oncokb.curation.vm.ensembl.EnsemblArchiveId> getArchiveIds(ReferenceGenome referenceGenome, List<String> ids) {
        if (ids.size() == 0) {
            return new ArrayList<>();
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        JSONObject jsonObject = new JSONObject();
        JSONArray jsonArray = new JSONArray();
        ids.stream().forEach(id -> jsonArray.put(id));
        try {
            jsonObject.put("ids", jsonArray);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        HttpEntity<String> entity = new HttpEntity<>(jsonObject.toString(), httpHeaders);

        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.postForObject(getArchiveIdPOSTUrl(referenceGenome), entity, String.class);
        Gson gson = new Gson();
        Type type = new TypeToken<Map<String, EnsemblArchiveId>>() {}.getType();
        Map<String, org.mskcc.oncokb.curation.vm.ensembl.EnsemblArchiveId> archiveMap = gson.fromJson(response, type);
        return archiveMap.values().stream().filter(val -> val != null).collect(Collectors.toList());
    }

    public Optional<org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> getId(
        ReferenceGenome referenceGenome,
        String id,
        boolean includeUtr,
        boolean expand
    ) {
        List<org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> ensemblTranscriptList = getIds(
            referenceGenome,
            Collections.singletonList(id),
            includeUtr,
            expand
        );
        return ensemblTranscriptList.size() > 0 ? Optional.of(ensemblTranscriptList.get(0)) : Optional.empty();
    }

    public List<org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> getIds(
        ReferenceGenome referenceGenome,
        List<String> ids,
        boolean includeUtr,
        boolean expand
    ) {
        if (ids.size() == 0) {
            return new ArrayList<>();
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        JSONObject jsonObject = new JSONObject();
        JSONArray jsonArray = new JSONArray();
        ids.stream().forEach(id -> jsonArray.put(id));
        try {
            jsonObject.put("ids", jsonArray);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        HttpEntity<String> entity = new HttpEntity<>(jsonObject.toString(), httpHeaders);

        try {
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.postForObject(getLookupPOSTUrl(referenceGenome, includeUtr, expand), entity, String.class);
            Gson gson = new Gson();
            Type type = new TypeToken<Map<String, EnsemblTranscript>>() {}.getType();
            Map<String, org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> transcriptMap = gson.fromJson(response, type);
            return transcriptMap.values().stream().filter(val -> val != null).collect(Collectors.toList());
        } catch (Exception e) {
            log.error(e.getMessage());
            return new ArrayList<>();
        }
    }

    private String getArchiveIdPOSTUrl(ReferenceGenome referenceGenome) {
        StringBuilder sb = new StringBuilder();
        sb.append("/archive/id");
        return getEnsemblAPIUrl(referenceGenome) + sb;
    }

    private String getLookupPOSTUrl(ReferenceGenome referenceGenome, boolean includeUtr, boolean expand) {
        StringBuilder sb = new StringBuilder();
        sb.append("/lookup/id");
        if (includeUtr || expand) {
            List<String> requestParams = new ArrayList<>();
            sb.append("?");
            if (includeUtr) {
                requestParams.add("utr=1");
            }
            if (expand) {
                requestParams.add("expand=1");
            }
            sb.append(StringUtils.join(requestParams, "&"));
        }
        return getEnsemblAPIUrl(referenceGenome) + sb;
    }

    private String getEnsemblAPIUrl(ReferenceGenome referenceGenome) {
        switch (referenceGenome) {
            case GRCh37:
                return ENSEMBL_37_API_URL;
            case GRCh38:
                return ENSEMBL_38_API_URL;
            default:
                return "";
        }
    }
}
