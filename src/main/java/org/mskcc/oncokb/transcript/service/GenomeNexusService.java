package org.mskcc.oncokb.transcript.service;

import org.genome_nexus.ApiClient;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.EnsemblControllerApi;
import org.genome_nexus.client.EnsemblGene;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.springframework.stereotype.Service;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
@Service
public class GenomeNexusService {

    public final String GN_37_URL = "https://www.genomenexus.org";
    public final String GN_38_URL = "https://grch38.genomenexus.org";
    private final int GN_READ_TIMEOUT_OVERRIDE = 30000;

    private final EnsemblControllerApi ensemblControllerApi38;
    private final EnsemblControllerApi ensemblControllerApi37;

    public GenomeNexusService() {
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

    public EnsemblGene findCanonicalEnsemblGeneTranscript(ReferenceGenome referenceGenome, Integer entrezGeneId) throws ApiException {
        return this.getEnsemblControllerApi(referenceGenome).fetchCanonicalEnsemblGeneIdByEntrezGeneIdGET(Integer.toString(entrezGeneId));
    }
}
