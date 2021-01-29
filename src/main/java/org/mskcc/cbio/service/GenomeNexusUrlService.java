package org.mskcc.cbio.service;

import org.genome_nexus.ApiClient;
import org.genome_nexus.client.EnsemblControllerApi;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.springframework.stereotype.Service;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
@Service
public class GenomeNexusUrlService {

    public final String ENSEMBL_37_API_URL = "https://grch37.rest.ensembl.org";
    public final String ENSEMBL_38_API_URL = "https://rest.ensembl.org";

    public final String GN_37_URL = "https://www.genomenexus.org";
    public final String GN_38_URL = "https://grch38.genomenexus.org";
    private final int GN_READ_TIMEOUT_OVERRIDE = 30000;

    private final EnsemblControllerApi ensemblControllerApi38;
    private final EnsemblControllerApi ensemblControllerApi37;

    public GenomeNexusUrlService() {
        this.ensemblControllerApi37 = getGNEnsemblControllerApi(GN_37_URL);
        this.ensemblControllerApi38 = getGNEnsemblControllerApi(GN_38_URL);
    }

    private EnsemblControllerApi getGNEnsemblControllerApi(String url) {
        ApiClient client = new ApiClient();
        client.setReadTimeout(GN_READ_TIMEOUT_OVERRIDE);
        client.setBasePath(url);
        return new EnsemblControllerApi(client);
    }

    public EnsemblControllerApi getEnsemblControllerApi(ReferenceGenome referenceGenome) {
        switch (referenceGenome) {
            case GRCh37:
                return this.ensemblControllerApi37;
            case GRCh38:
                return this.ensemblControllerApi38;
            default:
                return new EnsemblControllerApi();
        }
    }

    public String getEnsemblSequenceGETUrl(ReferenceGenome referenceGenome, String transcript) {
        return getEnsemblAPIUrl(referenceGenome) + "/sequence/id/" + transcript;
    }

    public String getEnsemblSequencePOSTUrl(ReferenceGenome referenceGenome) {
        return getEnsemblAPIUrl(referenceGenome) + "/sequence/id";
    }

    public String getEnsemblAPIUrl(ReferenceGenome referenceGenome) {
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
