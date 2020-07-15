package org.mskcc.cbio.service;

import org.genome_nexus.ApiClient;
import org.genome_nexus.client.EnsemblControllerApi;
import org.mskcc.cbio.web.rest.vm.REFERENCE_GENOME;
import org.springframework.stereotype.Service;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
@Service
public class UrlService {
    public final String ENSEMBL_37_API_URL = "https://grch37.rest.ensembl.org";
    public final String ENSEMBL_38_API_URL = "https://rest.ensembl.org";

    public final String GN_37_URL = "https://www.genomenexus.org";
    public final String GN_38_URL = "https://grch38.genomenexus.org";
    private final int GN_READ_TIMEOUT_OVERRIDE = 3000;

    private final EnsemblControllerApi ensemblControllerApi38;
    private final EnsemblControllerApi ensemblControllerApi37;

    public UrlService() {
        this.ensemblControllerApi37 = getGNEnsemblControllerApi(GN_37_URL);
        this.ensemblControllerApi38 = getGNEnsemblControllerApi(GN_38_URL);
    }

    private EnsemblControllerApi getGNEnsemblControllerApi(String url) {
        ApiClient client = new ApiClient();
        client.setReadTimeout(GN_READ_TIMEOUT_OVERRIDE);
        client.setBasePath(url);
        return new EnsemblControllerApi(client);
    }

    public EnsemblControllerApi getEnsemblControllerApi(REFERENCE_GENOME referenceGenome) {
        switch (referenceGenome) {
            case GRCH_37:
                return this.ensemblControllerApi37;
            case GRCH_38:
                return this.ensemblControllerApi38;
            default:
                return new EnsemblControllerApi();
        }
    }

    public String getEnsemblSequenceUrl(REFERENCE_GENOME referenceGenome, String transcript) {
        return getEnsemblAPIUrl(referenceGenome) + "/sequence/id/" + transcript;
    }

    public String getEnsemblAPIUrl(REFERENCE_GENOME referenceGenome) {
        switch (referenceGenome) {
            case GRCH_37:
                return ENSEMBL_37_API_URL;
            case GRCH_38:
                return ENSEMBL_38_API_URL;
            default:
                return "";
        }
    }
}
