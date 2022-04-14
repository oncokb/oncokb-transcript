package org.mskcc.oncokb.curation.repository.search;

import java.util.List;
import java.util.stream.Collectors;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.MatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.WildcardQueryBuilder;
import org.mskcc.oncokb.curation.domain.Gene;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link Gene} entity.
 */
public interface GeneSearchRepository extends ElasticsearchRepository<Gene, Long>, GeneSearchRepositoryInternal {}

interface GeneSearchRepositoryInternal {
    Page<Gene> search(String query, Pageable pageable);
}

class GeneSearchRepositoryInternalImpl implements GeneSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    GeneSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Page<Gene> search(String query, Pageable pageable) {
        QueryBuilder queryBuilder = QueryBuilders.boolQuery().should(new WildcardQueryBuilder("hugoSymbol", query + "*"));
        try {
            Long entrezGeneId = Long.parseLong(query);
            ((BoolQueryBuilder) queryBuilder).should(new MatchQueryBuilder("entrezGeneId", entrezGeneId));
        } catch (NumberFormatException e) {}
        NativeSearchQuery nativeSearchQuery = new NativeSearchQueryBuilder().withQuery(queryBuilder).withPageable(pageable).build();
        SearchHits<Gene> searchHits = elasticsearchTemplate.search(nativeSearchQuery, Gene.class);
        List<Gene> hits = searchHits.map(SearchHit::getContent).stream().collect(Collectors.toList());

        return new PageImpl<>(hits, pageable, searchHits.getTotalHits());
    }
}
