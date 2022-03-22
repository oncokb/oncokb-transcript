package org.mskcc.oncokb.curation.web.rest;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.service.DrugService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Drug}.
 */
@RestController
@RequestMapping("/api")
public class DrugController {

    private final Logger log = LoggerFactory.getLogger(DrugController.class);

    private final DrugService drugService;

    public DrugController(DrugService drugService) {
        this.drugService = drugService;
    }

    @GetMapping("/drugs/search")
    public List<Drug> findDrugs(@RequestParam(value = "query") String query) {
        log.debug("REST request to search Drugs");
        return drugService.searchDrug(query);
    }

    @GetMapping("/drugs/search-by-code/{code}")
    public Optional<Drug> findDrugByCode(@PathVariable(value = "code") String code) {
        log.debug("REST request to search Drugs");
        return drugService.findByCode(code);
    }
}
