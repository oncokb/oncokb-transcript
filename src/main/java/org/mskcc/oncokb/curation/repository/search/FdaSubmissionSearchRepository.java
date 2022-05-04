package org.mskcc.oncokb.curation.repository.search;

import java.util.List;
import java.util.stream.Collectors;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.WildcardQueryBuilder;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
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
 * Spring Data Elasticsearch repository for the {@link FdaSubmission} entity.
 */
public interface FdaSubmissionSearchRepository
    extends ElasticsearchRepository<FdaSubmission, Long>, FdaSubmissionSearchRepositoryInternal {}

interface FdaSubmissionSearchRepositoryInternal {
    Page<FdaSubmission> search(String query, Pageable pageable);
}

class FdaSubmissionSearchRepositoryInternalImpl implements FdaSubmissionSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    FdaSubmissionSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Page<FdaSubmission> search(String query, Pageable pageable) {
        QueryBuilder queryBuilder = QueryBuilders
            .boolQuery()
            .should(new WildcardQueryBuilder("deviceName", query + "*"))
            .should(new WildcardQueryBuilder("number", query + "*"))
            .should(new WildcardQueryBuilder("supplementNumber", query + "*"))
            .should(new WildcardQueryBuilder("type.name", query + "*"))
            .should(new WildcardQueryBuilder("type.type", query + "*"))
            .should(new WildcardQueryBuilder("type.shortName", query + "*"));
        NativeSearchQuery nativeSearchQuery = new NativeSearchQueryBuilder().withQuery(queryBuilder).withPageable(pageable).build();
        SearchHits<FdaSubmission> searchHits = elasticsearchTemplate.search(nativeSearchQuery, FdaSubmission.class);
        List<FdaSubmission> hits = searchHits.map(SearchHit::getContent).stream().collect(Collectors.toList());

        return new PageImpl<>(hits, pageable, searchHits.getTotalHits());
    }
}
