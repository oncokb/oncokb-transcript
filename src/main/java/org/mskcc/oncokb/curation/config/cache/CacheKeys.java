package org.mskcc.oncokb.curation.config.cache;

public final class CacheKeys {

    public static final String GENES_BY_ENTREZ_GENE_ID = "genesByEntrezGeneId";
    public static final String GENES_BY_HUGO_SYMBOL = "genesByHugoSymbol";
    public static final String GENE_ALIASES_BY_NAME = "geneAliasesByName";

    public static final String USERS_BY_LOGIN_CACHE = "usersByLogin";
    public static final String USERS_BY_EMAIL_CACHE = "usersByEmail";

    public static final String TRANSCRIPTS_BY_ENSEMBL_TRANSCRIPT_IDS = "findByReferenceGenomeAndEnsemblTranscriptIdIsIn";
    public static final String TRANSCRIPTS_BY_ENSEMBL_GENE_CANONICAL = "findByEnsemblGeneAndCanonicalIsTrue";
    public static final String SEQUENCE_BY_TRASCRIPT_AND_TYPE = "findOneByTranscriptAndSequenceType";
}
