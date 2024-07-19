package org.mskcc.oncokb.curation.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.genome_nexus.ApiClient;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.*;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
@Service
public class GenomeNexusService {

    public final String GN_37_URL = "https://www.genomenexus.org";
    public final String GN_38_URL = "https://grch38.genomenexus.org";
    private final int GN_READ_TIMEOUT_OVERRIDE = 30000;
    private final String MSK_ISOFORM_OVERRIDE_SOURCE = "mskcc";

    private final EnsemblControllerApi ensemblControllerApi38;
    private final EnsemblControllerApi ensemblControllerApi37;

    private final AnnotationControllerApi annotationControllerApi38;
    private final AnnotationControllerApi annotationControllerApi37;

    private final Logger log = LoggerFactory.getLogger(GenomeNexusService.class);

    public GenomeNexusService() {
        this.ensemblControllerApi37 = getGNEnsemblControllerApi(GN_37_URL);
        this.ensemblControllerApi38 = getGNEnsemblControllerApi(GN_38_URL);
        this.annotationControllerApi37 = getAnnotationControllerApi(GN_37_URL);
        this.annotationControllerApi38 = getAnnotationControllerApi(GN_38_URL);
    }

    private ApiClient getDefaultApiClient(String url) {
        ApiClient client = new ApiClient();
        client.setReadTimeout(GN_READ_TIMEOUT_OVERRIDE);
        client.setBasePath(url);
        return client;
    }

    private EnsemblControllerApi getGNEnsemblControllerApi(String url) {
        return new EnsemblControllerApi(getDefaultApiClient(url));
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

    private AnnotationControllerApi getAnnotationControllerApi(String url) {
        return new AnnotationControllerApi(getDefaultApiClient(url));
    }

    public AnnotationControllerApi getAnnotationControllerApi(ReferenceGenome referenceGenome) {
        switch (referenceGenome) {
            case GRCh37:
                return this.annotationControllerApi37;
            case GRCh38:
                return this.annotationControllerApi38;
            default:
                return new AnnotationControllerApi();
        }
    }

    public VariantAnnotation annotateGenomicChange(ReferenceGenome referenceGenome, String genomicChange) throws ApiException {
        return this.getAnnotationControllerApi(referenceGenome).fetchVariantAnnotationGET(
                genomicChange,
                MSK_ISOFORM_OVERRIDE_SOURCE,
                null,
                Collections.singletonList("annotation_summary")
            );
    }

    public EnsemblGene findCanonicalEnsemblGeneTranscript(ReferenceGenome referenceGenome, Integer entrezGeneId) throws ApiException {
        return this.getEnsemblControllerApi(referenceGenome).fetchCanonicalEnsemblGeneIdByEntrezGeneIdGET(Integer.toString(entrezGeneId));
    }

    public List<EnsemblGene> findCanonicalEnsemblGeneTranscript(ReferenceGenome referenceGenome, List<Integer> entrezGeneIds)
        throws ApiException {
        List<EnsemblGene> ensemblGenesList = new ArrayList<>();
        List<String> idStrs = entrezGeneIds.stream().map(id -> Integer.toString(id)).collect(Collectors.toList());
        int postThreshold = 1000;
        for (int i = 0; i < idStrs.size(); i += postThreshold) {
            ensemblGenesList.addAll(
                this.getEnsemblControllerApi(referenceGenome).fetchCanonicalEnsemblGeneIdByEntrezGeneIdsPOST(
                        idStrs.subList(i, Math.min(idStrs.toArray().length, i + postThreshold))
                    )
            );
        }
        return ensemblGenesList;
    }

    public EnsemblTranscript findCanonicalEnsemblTranscript(ReferenceGenome referenceGenome, String hugoSymbol) throws ApiException {
        return this.getEnsemblControllerApi(referenceGenome).fetchCanonicalEnsemblTranscriptByHugoSymbolGET(hugoSymbol, null);
    }
}
