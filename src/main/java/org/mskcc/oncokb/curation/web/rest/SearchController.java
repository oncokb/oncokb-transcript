package org.mskcc.oncokb.curation.web.rest;

import org.mskcc.oncokb.curation.service.SearchService;
import org.mskcc.oncokb.curation.service.dto.SearchResultDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for general search
 */
@RestController
@RequestMapping("/api")
public class SearchController {

    private final Logger log = LoggerFactory.getLogger(SearchController.class);

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/_search/all")
    public ResponseEntity<SearchResultDTO> search(@RequestParam String query) {
        return new ResponseEntity<SearchResultDTO>(searchService.search(query), HttpStatus.OK);
    }
}
