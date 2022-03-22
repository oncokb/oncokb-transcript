package org.mskcc.oncokb.curation.web.rest;

import java.util.*;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.repository.GeneRepository;
import org.mskcc.oncokb.curation.service.GeneService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class GeneController {

    private final Logger log = LoggerFactory.getLogger(GeneController.class);

    private final GeneService geneService;

    private final GeneRepository geneRepository;

    public GeneController(GeneService geneService, GeneRepository geneRepository) {
        this.geneService = geneService;
        this.geneRepository = geneRepository;
    }

    /**
     * {@code GET  /get-gene/{symbol}} : get the gene by symbol.
     *
     * @param symbol the id of the gene to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the gene, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/find-genes")
    public ResponseEntity<Gene> findGeneBySymbol(@RequestParam String symbol) {
        log.debug("REST request to find Gene : {}", symbol);
        return new ResponseEntity<>(getGeneBySymbol(symbol).orElse(null), HttpStatus.OK);
    }

    @PostMapping("/find-genes")
    public ResponseEntity<Set<Gene>> findGenesBySymbols(@RequestBody List<String> body) {
        Set<Gene> genes = new HashSet<>();
        if (body != null) {
            body
                .stream()
                .forEach(symbol -> {
                    Optional<Gene> geneOptional = getGeneBySymbol(symbol);
                    if (geneOptional.isPresent()) {
                        genes.add(geneOptional.get());
                    }
                });
        }
        return new ResponseEntity<>(genes, HttpStatus.OK);
    }

    private Optional<Gene> getGeneBySymbol(String symbol) {
        Optional<Gene> gene;
        if (StringUtils.isNumeric(symbol)) {
            gene = geneService.findGeneByEntrezGeneId(Integer.parseInt(symbol));
        } else {
            gene = geneService.findGeneByHugoSymbol(symbol);
            if (gene.isEmpty()) {
                gene = geneService.findGeneByAlias(symbol);
            }
        }
        return gene;
    }
}
