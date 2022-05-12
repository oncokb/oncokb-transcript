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
import org.mskcc.oncokb.curation.vm.ensembl.EnsemblSequence;
import org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
@Service
public class EnsemblService {

    public final String ENSEMBL_37_API_URL = "https://grch37.rest.ensembl.org";
    public final String ENSEMBL_38_API_URL = "https://rest.ensembl.org";

    private String getSequenceGETUrl(ReferenceGenome referenceGenome, String transcript) {
        return getEnsemblAPIUrl(referenceGenome) + "/sequence/id/" + transcript;
    }

    private String getSequencePOSTUrl(ReferenceGenome referenceGenome) {
        return getEnsemblAPIUrl(referenceGenome) + "/sequence/id";
    }

    public Optional<EnsemblSequence> getProteinSequence(ReferenceGenome referenceGenome, String transcript) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(httpHeaders);

        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<EnsemblSequence> response = restTemplate.exchange(
                getSequenceGETUrl(referenceGenome, transcript),
                HttpMethod.GET,
                entity,
                EnsemblSequence.class
            );
            return Optional.of(response.getBody());
        } catch (RestClientException exception) {
            exception.printStackTrace();
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
        List<org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> ensemblTranscriptList = getIds(
            referenceGenome,
            Collections.singletonList(transcriptId),
            true,
            true
        );
        return ensemblTranscriptList.size() > 0 ? Optional.of(ensemblTranscriptList.get(0)) : Optional.empty();
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

        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.postForObject(getLookupPOSTUrl(referenceGenome, includeUtr, expand), entity, String.class);
        Gson gson = new Gson();
        Type type = new TypeToken<Map<String, EnsemblTranscript>>() {}.getType();
        Map<String, org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> transcriptMap = gson.fromJson(response, type);
        return transcriptMap.values().stream().filter(val -> val != null).collect(Collectors.toList());
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
