package org.mskcc.oncokb.curation.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.MatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.WildcardQueryBuilder;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.service.dto.SearchResultDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.convert.ElasticsearchConverter;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SearchService {

    private final Logger log = LoggerFactory.getLogger(SearchService.class);

    private final ElasticsearchOperations elasticsearchOperations;

    public SearchService(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
    }

    public SearchResultDTO search(String query) {
        log.debug("Request to search for query {}", query);
        return searchIndices(query);
    }

    private SearchResultDTO searchIndices(String query) {
        ElasticsearchConverter converter = elasticsearchOperations.getElasticsearchConverter();
        List<SearchHit<FdaSubmission>> fdaSubmissions = new ArrayList<>();
        List<SearchHit<CompanionDiagnosticDevice>> cdxs = new ArrayList<>();
        List<SearchHit<Article>> articles = new ArrayList<>();
        List<SearchHit<Drug>> drugs = new ArrayList<>();
        List<SearchHit<Gene>> genes = new ArrayList<>();
        List<SearchHit<Alteration>> alterations = new ArrayList<>();

        // Prepare individual queries
        String wildcardQueryString = query + "*";
        QueryBuilder fdaSubmissionQuery = QueryBuilders
            .boolQuery()
            .should(new WildcardQueryBuilder("deviceName", wildcardQueryString))
            .should(new WildcardQueryBuilder("number", wildcardQueryString))
            .should(new WildcardQueryBuilder("supplementNumber", wildcardQueryString));
        QueryBuilder cdxQuery = QueryBuilders
            .boolQuery()
            .should(new WildcardQueryBuilder("name", wildcardQueryString))
            .should(new WildcardQueryBuilder("manufacturer", wildcardQueryString));
        QueryBuilder articleQuery = QueryBuilders.boolQuery().should(new WildcardQueryBuilder("pmid", wildcardQueryString));
        QueryBuilder drugQuery = QueryBuilders
            .boolQuery()
            .should(new WildcardQueryBuilder("name", wildcardQueryString))
            .should(new WildcardQueryBuilder("brands.name", wildcardQueryString));
        QueryBuilder geneQuery = QueryBuilders.boolQuery().should(new WildcardQueryBuilder("hugoSymbol", wildcardQueryString));
        try {
            Long entrezGeneId = Long.parseLong(query);
            ((BoolQueryBuilder) geneQuery).should(new MatchQueryBuilder("entrezGeneId", entrezGeneId));
        } catch (NumberFormatException e) {}
        QueryBuilder alterationQuery = QueryBuilders.boolQuery().should(new WildcardQueryBuilder("name", wildcardQueryString));

        // Prepare overall query
        QueryBuilder combinedQuery = QueryBuilders
            .boolQuery()
            .should(fdaSubmissionQuery)
            .should(cdxQuery)
            .should(articleQuery)
            .should(drugQuery)
            .should(geneQuery)
            .should(alterationQuery);

        // Execute query on the listed indices
        SearchHits<AllDocuments> sh = elasticsearchOperations.search(
            new NativeSearchQueryBuilder().withQuery(combinedQuery).build(),
            AllDocuments.class,
            IndexCoordinates.of("fdasubmission", "companiondiagnosticdevice", "article", "drug", "gene", "alteration")
        );

        sh.forEach(hit -> {
            String indexName = hit.getIndex();
            if (indexName != null) {
                Document document = Document.from(hit.getContent());
                if (hit.getId() != null) {
                    document.setId(hit.getId());
                }
                // Map the json objects to the appropriate classes according to the index
                switch (indexName.toLowerCase()) {
                    case "fdasubmission":
                        FdaSubmission fdaSubmission = converter.read(FdaSubmission.class, document);
                        fdaSubmissions.add(searchHit(fdaSubmission, hit));
                        break;
                    case "companiondiagnosticdevice":
                        CompanionDiagnosticDevice cdx = converter.read(CompanionDiagnosticDevice.class, document);
                        cdxs.add(searchHit(cdx, hit));
                        break;
                    case "article":
                        Article article = converter.read(Article.class, document);
                        articles.add(searchHit(article, hit));
                        break;
                    case "drug":
                        Drug drug = converter.read(Drug.class, document);
                        drugs.add(searchHit(drug, hit));
                        break;
                    case "gene":
                        Gene gene = converter.read(Gene.class, document);
                        genes.add(searchHit(gene, hit));
                        break;
                    case "alteration":
                        Alteration alteration = converter.read(Alteration.class, document);
                        alterations.add(searchHit(alteration, hit));
                        break;
                    default:
                        break;
                }
            }
        });
        return new SearchResultDTO(fdaSubmissions, cdxs, articles, drugs, genes, alterations);
    }

    private <T> SearchHit<T> searchHit(T content, SearchHit<?> source) {
        return new SearchHit<T>(
            source.getIndex(),
            source.getId(),
            null,
            source.getScore(),
            source.getSortValues().toArray(new Object[0]),
            source.getHighlightFields(),
            source.getInnerHits(),
            source.getNestedMetaData(),
            null,
            null,
            content
        );
    }
}

/**
 * We represent the search results returned by Elasticsearch as JSON, so that
 * we can search by multiple indices.
 */
class AllDocuments implements Map<String, Object> {

    private final Map<String, Object> delegate = new LinkedHashMap<>();

    @Override
    public int size() {
        return delegate.size();
    }

    @Override
    public boolean isEmpty() {
        return delegate.isEmpty();
    }

    @Override
    public boolean containsKey(Object key) {
        return delegate.containsKey(key);
    }

    @Override
    public boolean containsValue(Object value) {
        return delegate.containsValue(value);
    }

    @Override
    public Object get(Object key) {
        return delegate.get(key);
    }

    @Override
    public Object put(String key, Object value) {
        return delegate.put(key, value);
    }

    @Override
    public Object remove(Object key) {
        return delegate.remove(key);
    }

    @Override
    public void putAll(Map<? extends String, ?> m) {
        delegate.putAll(m);
    }

    @Override
    public void clear() {
        delegate.clear();
    }

    @Override
    public Set<String> keySet() {
        return delegate.keySet();
    }

    @Override
    public Collection<Object> values() {
        return delegate.values();
    }

    @Override
    public Set<Entry<String, Object>> entrySet() {
        return delegate.entrySet();
    }

    @Override
    public boolean equals(Object o) {
        return delegate.equals(o);
    }

    @Override
    public int hashCode() {
        return delegate.hashCode();
    }
}
