package org.mskcc.oncokb.curation.web.rest;

import java.io.FileNotFoundException;
import org.mskcc.oncokb.curation.importer.PubMedImporter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ArticleController {

    private final Logger log = LoggerFactory.getLogger(ArticleController.class);

    private final PubMedImporter pubMedImporter;

    public ArticleController(PubMedImporter pubMedImporter) {
        this.pubMedImporter = pubMedImporter;
    }

    @GetMapping("/articles/import")
    public ResponseEntity<Void> importPubMeArticle(@RequestParam(required = true) String pmid) throws FileNotFoundException {
        boolean saved = pubMedImporter.addArticlePMID(pmid);
        if (saved) {
            saved = pubMedImporter.addArticleFullText(pmid);
            if (saved) {
                pubMedImporter.uploadArticleFullTextToS3(pmid);
            } else {
                log.warn("The full text for PMID {} wasn't saved", pmid);
            }
        } else {
            log.warn("The article for PMID {} wasn't saved", pmid);
        }
        return ResponseEntity.ok().build();
    }
}
