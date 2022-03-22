package org.mskcc.oncokb.curation.service;

import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.config.ApplicationProperties;
import org.oncokb.ApiClient;
import org.oncokb.ApiException;
import org.oncokb.client.Gene;
import org.oncokb.client.GenesApi;
import org.springframework.stereotype.Service;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
@Service
public class OncoKbUrlService {

    public final String ONCOKB_API_URL = "https://www.oncokb.org/api/v1";

    private final int ONCOKB_READ_TIMEOUT_OVERRIDE = 30000;

    private final ApiClient apiClient;

    private ApplicationProperties applicationProperties;

    public OncoKbUrlService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;

        ApiClient client = new ApiClient();
        client.setReadTimeout(ONCOKB_READ_TIMEOUT_OVERRIDE);
        if (applicationProperties.getOncokb() != null) {
            client.setBasePath(
                StringUtils.isEmpty(applicationProperties.getOncokb().getUrl())
                    ? ONCOKB_API_URL
                    : applicationProperties.getOncokb().getUrl()
            );
            client.setApiKey(applicationProperties.getOncokb().getApiKey());
        }
        client.setApiKeyPrefix("Bearer");

        this.apiClient = client;
    }

    public List<Gene> getGenes() throws ApiException {
        GenesApi genesApi = new GenesApi(this.apiClient);
        return genesApi.genesGetUsingGET(null);
    }
}
