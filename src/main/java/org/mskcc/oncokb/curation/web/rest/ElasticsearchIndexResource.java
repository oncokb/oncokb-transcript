package org.mskcc.oncokb.curation.web.rest;

import java.net.URISyntaxException;
import org.mskcc.oncokb.curation.service.ElasticsearchIndexService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing Elasticsearch index.
 */
@RestController
@RequestMapping("/api")
public class ElasticsearchIndexResource {

    private final Logger log = LoggerFactory.getLogger(ElasticsearchIndexResource.class);

    private final ElasticsearchIndexService elasticsearchIndexService;

    public ElasticsearchIndexResource(ElasticsearchIndexService elasticsearchIndexService) {
        this.elasticsearchIndexService = elasticsearchIndexService;
    }

    /**
     * GET  /elasticsearch/index -> Reindex all Elasticsearch documents
     */
    @GetMapping("/elasticsearch/index")
    public ResponseEntity<Void> reindexAll() throws URISyntaxException {
        log.info("REST request to reindex Elasticsearch");
        elasticsearchIndexService.reindexAll();
        return new ResponseEntity<Void>(HttpStatus.OK);
    }
}
