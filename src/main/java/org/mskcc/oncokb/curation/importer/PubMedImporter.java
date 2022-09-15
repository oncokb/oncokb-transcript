package org.mskcc.oncokb.curation.importer;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.xml.parsers.ParserConfigurationException;
import org.joda.time.DateTimeZone;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.ArticleFullText;
import org.mskcc.oncokb.curation.service.ArticleFullTextService;
import org.mskcc.oncokb.curation.service.ArticleService;
import org.mskcc.oncokb.curation.service.S3Service;
import org.mskcc.oncokb.curation.util.ProcessUtil;
import org.mskcc.oncokb.curation.util.TikaTool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.xml.sax.SAXException;

@Component
public class PubMedImporter {

    private static final Logger log = LoggerFactory.getLogger(PubMedImporter.class);

    ArticleService articleService;
    ArticleFullTextService articleFullTextService;
    S3Service s3Service;
    XMLParser parser;

    public PubMedImporter(
        ArticleService articleService,
        ArticleFullTextService articleFullTextService,
        S3Service s3Service,
        XMLParser parser
    ) {
        this.articleService = articleService;
        this.articleFullTextService = articleFullTextService;
        this.s3Service = s3Service;
        this.parser = parser;
    }

    public boolean addArticlePMID(String pmid) {
        if (articleService.findByPmid(pmid).isPresent()) return false;
        try {
            String XMLfile = "pubmed_ids.xml";
            ProcessUtil.runScript("python3 python/pubmed_ids.py " + pmid);
            parser.reload(XMLfile);
            parser.DFS(parser.getRoot(), Tree.articleTree(), null);
            return true;
        } catch (IOException | ParserConfigurationException | SAXException | NoSuchFieldException | IllegalAccessException e) {
            log.error(e.getMessage());
            return false;
        }
    }

    private static void zipFile(File fileToZip, String fileName, ZipOutputStream zipOut) throws IOException {
        if (fileToZip.isHidden()) {
            return;
        }
        if (fileToZip.isDirectory()) {
            if (fileName.endsWith("/")) {
                zipOut.putNextEntry(new ZipEntry(fileName));
                zipOut.closeEntry();
            } else {
                zipOut.putNextEntry(new ZipEntry(fileName + "/"));
                zipOut.closeEntry();
            }
            File[] children = fileToZip.listFiles();
            for (File childFile : children) {
                zipFile(childFile, fileName + "/" + childFile.getName(), zipOut);
            }
            return;
        }
        FileInputStream fis = new FileInputStream(fileToZip);
        ZipEntry zipEntry = new ZipEntry(fileName);
        zipOut.putNextEntry(zipEntry);
        byte[] bytes = new byte[1024];
        int length;
        while ((length = fis.read(bytes)) >= 0) {
            zipOut.write(bytes, 0, length);
        }
        fis.close();
    }

    public boolean uploadArticleFullTextToS3(String pmid) throws FileNotFoundException {
        String PATH = "curation-website/article-full-text/";

        String sourceFile = "PMC/" + pmid;
        FileOutputStream fos = new FileOutputStream(sourceFile + ".zip");
        ZipOutputStream zipOut = new ZipOutputStream(fos);
        File fileToZip = new File(sourceFile);

        try {
            zipFile(fileToZip, pmid, zipOut);
            zipOut.close();
            s3Service.saveObject("oncokb", PATH + pmid + ".zip", new File("PMC/" + pmid + ".zip"));
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean addArticleFullText(String pmid) {
        try {
            boolean found = true;
            if (!(new File("PMC/" + pmid).exists())) found = fetchArticlePdf(pmid);
            if (!found) return false;

            Stream<Path> walk = Files.walk(Paths.get("PMC/" + pmid));
            List<String> files = walk.filter(p -> !Files.isDirectory(p)).map(Path::toString).collect(Collectors.toList());
            if (files.size() == 0) return false;
            walk = Files.walk(Paths.get("PMC/" + pmid));

            files =
                walk
                    .filter(p -> !Files.isDirectory(p))
                    .map(Path::toString)
                    .filter(s -> !s.endsWith(".tar.gz") && !s.endsWith(".pdf"))
                    .collect(Collectors.toList());
            walk = Files.walk(Paths.get("PMC/" + pmid));
            List<String> PDFfiles = walk
                .filter(p -> !Files.isDirectory(p))
                .map(Path::toString)
                .filter(s -> s.endsWith(".pdf"))
                .collect(Collectors.toList());
            if (PDFfiles.size() > 1) {
                for (int i = 0; i < PDFfiles.size(); i++) for (int j = i + 1; j < PDFfiles.size(); j++) {
                    if (new File(PDFfiles.get(i)).length() == new File(PDFfiles.get(j)).length()) {
                        PDFfiles.remove(j);
                        j--;
                    }
                }
                PDFfiles.sort(Comparator.comparingInt(String::length));
                log.info(PDFfiles.toString());
            }
            Optional<Article> articleOptional = articleService.findByPmid(pmid);
            if (articleOptional.isEmpty()) {
                log.info("Article {} does not exist, please import it first.", pmid);
                return false;
            }
            Optional<ArticleFullText> articleFullTextOptional = articleFullTextService.findByArticle(articleOptional.get());
            if (articleFullTextOptional.isPresent()) {
                log.info("ArticleFullText already exists for article {}", pmid);
                return false;
            }
            ArticleFullText fullText = new ArticleFullText();
            fullText.setArticle(articleOptional.get());

            String[] fileNames = new String[PDFfiles.size() + files.size()];
            String[] contentTypes = new String[PDFfiles.size() + files.size()];
            for (int i = 0; i < PDFfiles.size(); i++) {
                fileNames[i] = PDFfiles.get(i).substring(PDFfiles.get(i).lastIndexOf("/") + 1);
                contentTypes[i] = Files.probeContentType(new File(PDFfiles.get(i)).toPath());
                if (i == 0) {
                    log.info("Analyzing " + PDFfiles.get(0));
                    fullText.setText(TikaTool.parseDocument(PDFfiles.get(0)));
                    fullText.setHtml(TikaTool.parseDocumentHTML(PDFfiles.get(0)));
                }
            }
            files.sort((a, b) -> (int) (new File(a).length() - new File(b).length()));
            for (int i = 0; i < files.size(); i++) {
                fileNames[i + PDFfiles.size()] = files.get(i).substring(files.get(i).lastIndexOf("/") + 1);
                try {
                    contentTypes[i + PDFfiles.size()] = Files.probeContentType(new File(files.get(i)).toPath());
                } catch (IOException e) {
                    System.out.println("An exception occurred on item " + i + " of " + (files.size() - 1));
                    contentTypes[i + PDFfiles.size()] = "None";
                }
            }

            articleFullTextService.save(fullText);

            return true;
        } catch (IOException e) {
            log.error(e.getMessage());
            return false;
        }
    }

    public boolean fetchArticlePdf(String pmid) {
        Optional<Article> articleOptional = articleService.findByPmid(pmid);
        if (articleOptional.isEmpty()) {
            log.info("No article {}", pmid);
            return false;
        }
        Article article = articleOptional.get();
        if (article.getPmcid() == null || article.getPmcid().length() < 2) {
            String doiurl;
            String fileName;
            if (article.getDoi() == null) return false;
            if (article.getDoi().indexOf("/") == article.getDoi().lastIndexOf("/")) doiurl =
                "https://www.doi.org/" + article.getDoi(); else doiurl =
                "https://www.doi.org/" +
                article.getDoi().substring(0, article.getDoi().indexOf("/")) +
                article.getDoi().substring(article.getDoi().lastIndexOf("/"));
            try {
                fileName = Math.abs(doiurl.hashCode()) + ".pdf";
                ProcessUtil.runScript("python3 python/doi.py " + doiurl + " " + fileName);
                if (!new File(fileName).exists() && article.getDoi().indexOf("/") != article.getDoi().lastIndexOf("/")) {
                    doiurl = "https://www.doi.org/" + article.getDoi();
                    fileName = Math.abs(doiurl.hashCode()) + ".pdf";
                    ProcessUtil.runScript("python3 python/doi.py " + doiurl + " " + fileName);
                }
                if (!new File(fileName).exists()) {
                    log.info("No DOI PDF file exists");
                    return false;
                }
                log.info("Found DOI PDF and saving into {}", "PMC/" + pmid + "/" + pmid + ".pdf");
                File f = new File("PMC/" + pmid);
                f.mkdir();
                Files.move(Paths.get(fileName), Paths.get("PMC/" + pmid + "/" + pmid + ".pdf"));
                return true;
            } catch (IOException e) {
                log.error(e.getMessage());
                e.printStackTrace();
                return false;
            }
        }
        String PMCId = article.getPmcid().replace("PMC", "");
        boolean found = false;
        try {
            ProcessUtil.runScript("python3 python/PMC.py " + PMCId);
            File f = new File("PMC/" + pmid);
            f.mkdir();
            f = new File(PMCId + ".tar.gz");
            if (f.exists()) {
                //found = true;
                log.info("PMC .tar.gz file found {}", PMCId + ".tar.gz");
                Files.move(Paths.get(PMCId + ".tar.gz"), Paths.get("PMC/" + pmid + "/" + PMCId + ".tar.gz"));
                ProcessUtil.runScript("./expand " + pmid + " " + PMCId);
            } else log.info("No PMC .tar.gz file found");
            f = new File(PMCId + ".pdf");
            if (f.exists()) {
                found = true;
                Files.move(Paths.get(PMCId + ".pdf"), Paths.get("PMC/" + pmid + "/" + PMCId + ".pdf"));
            } else log.info("No PMC [PMCId].pdf file found");
            f = new File("PMC" + PMCId + ".pdf");
            if (f.exists()) {
                log.info("The PMC pdf file {} exists!", "PMC" + PMCId + ".pdf");
                found = true;
                Files.move(Paths.get("PMC" + PMCId + ".pdf"), Paths.get("PMC/" + pmid + "/PMC" + PMCId + ".pdf"));
            } else log.info("No PMC PMC[PMCID].pdf file found");
            // check to see if any PDF files are in the folder!
            Stream<Path> walk = Files.walk(Paths.get("PMC/" + pmid));
            List<String> files = walk
                .filter(p -> !Files.isDirectory(p))
                .map(Path::toString)
                .filter(s -> s.toLowerCase().endsWith(".pdf"))
                .collect(Collectors.toList());
            if (files.size() == 0) found = false; else found = true;
        } catch (IOException e) {
            log.error("Failed with PMC retrieval: {}, continuing with DOI", e.getMessage());
        }
        if (!found) { // try DOI!
            String doiurl;
            String fileName = "demo1.pdf";
            if (article.getDoi() == null) return false;
            if (article.getDoi().indexOf("/") == article.getDoi().lastIndexOf("/")) doiurl =
                "https://www.doi.org/" + article.getDoi(); else doiurl =
                "https://www.doi.org/" +
                article.getDoi().substring(0, article.getDoi().indexOf("/")) +
                article.getDoi().substring(article.getDoi().lastIndexOf("/"));
            try {
                fileName = Math.abs(doiurl.hashCode()) + ".pdf";
                ProcessUtil.runScript("python3 python/doi.py " + doiurl + " " + fileName);
                if (!new File(fileName).exists() && article.getDoi().indexOf("/") != article.getDoi().lastIndexOf("/")) {
                    doiurl = "https://www.doi.org/" + article.getDoi();
                    fileName = Math.abs(doiurl.hashCode()) + ".pdf";
                    ProcessUtil.runScript("python3 python/doi.py " + doiurl + " " + fileName);
                }
                if (!new File(fileName).exists()) {
                    log.info("No DOI PDF file exists");
                    return false;
                }
                log.info("Found DOI PDF and saving into {}", "PMC/" + pmid + "/" + pmid + ".pdf");
                File f = new File("PMC/" + pmid);
                f.mkdir();
                Files.move(Paths.get(fileName), Paths.get("PMC/" + pmid + "/" + pmid + ".pdf"));
                return true;
            } catch (IOException e) {
                log.error("Failed with DOI retrieval: {}", e.getMessage());
                e.printStackTrace();
                return false;
            }
        }
        return found;
    }
}
