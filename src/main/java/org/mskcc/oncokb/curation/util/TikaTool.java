package org.mskcc.oncokb.curation.util;

import static com.amazonaws.services.cloudformation.model.ResourceAttribute.Metadata;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.microsoft.OfficeParserConfig;
import org.apache.tika.parser.ocr.TesseractOCRConfig;
import org.apache.tika.parser.pdf.PDFParser;
import org.apache.tika.parser.pdf.PDFParserConfig;
import org.apache.tika.sax.BodyContentHandler;
import org.apache.tika.sax.ToXMLContentHandler;
import org.apache.tika.sax.boilerpipe.BoilerpipeContentHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.ContentHandler;
import org.xml.sax.SAXException;

public class TikaTool {

    private static final Logger log = LoggerFactory.getLogger(TikaTool.class);

    public static String parseToPlainText(String fileName) throws IOException, SAXException, TikaException {
        BodyContentHandler handler = new BodyContentHandler();
        AutoDetectParser parser = new AutoDetectParser();

        Metadata metadata = new Metadata();
        try (InputStream stream = new FileInputStream(fileName)) {
            parser.parse(stream, handler, metadata);
            return handler.toString();
        }
    }

    public static String parseToHTML(String fileName) throws IOException, SAXException, TikaException {
        ContentHandler handler = new ToXMLContentHandler();

        AutoDetectParser parser = new AutoDetectParser();
        Metadata metadata = new Metadata();
        try (InputStream stream = new FileInputStream(fileName)) {
            parser.parse(stream, handler, metadata);
            return handler.toString();
        }
    }

    public static String parseBodyToHTML(String fileName) {
        ContentHandler handler = new BodyContentHandler(new ToXMLContentHandler());
        AutoDetectParser parser = new AutoDetectParser();
        Metadata metadata = new Metadata();
        try (InputStream stream = new FileInputStream(fileName)) {
            parser.parse(stream, handler, metadata);
        } catch (TikaException | IOException | SAXException e) {
            log.error("ERROR occurred: {}", e.getMessage());
            e.printStackTrace();
            return null;
        }
        return handler.toString();
    }

    public static String cleanup(String text) {
        if (text == null) {
            log.error("Trying to clean up an empty PDF/Doc file!");
            return null;
        }
        String[] lines = text.split("\n");
        StringBuilder sb = new StringBuilder(100000);
        for (String line : lines) {
            if (line.length() == 0) continue;
            sb.append(line + "\n");
        }
        return sb.toString();
    }

    public static String parseDocument(String fileName) {
        BodyContentHandler handler = new BodyContentHandler(-1);
        AutoDetectParser parser = new AutoDetectParser();
        PDFParser parse;
        Metadata metadata = new Metadata();
        try (InputStream stream = new FileInputStream(fileName)) {
            parser.parse(stream, handler, metadata);
        } catch (TikaException | IOException | SAXException e) {
            log.error("An error occurred with converting {} to plain text", fileName);
            log.error(e.getMessage());
            e.printStackTrace();
            return null;
        }
        return handler.toString();
    }

    public static String parseDocumentHTML(String fileName) {
        ContentHandler handler = new ToXMLContentHandler();
        AutoDetectParser parser = new AutoDetectParser();
        Metadata metadata = new Metadata();
        try (InputStream stream = new FileInputStream(fileName)) {
            parser.parse(stream, handler, metadata);
        } catch (TikaException | IOException | SAXException e) {
            log.error("An error occurred with converting {} to HTML", fileName);
            log.error(e.getMessage());
            e.printStackTrace();
            return null;
        }
        return handler.toString();
    }

    public static String OfficeParseDocument(String fileName) {
        ParseContext parseContext = new ParseContext();
        AutoDetectParser parser = new AutoDetectParser();
        ContentHandler contentHandler = new BodyContentHandler();
        Metadata metadata = new Metadata();
        TesseractOCRConfig config = new TesseractOCRConfig();
        config.setSkipOcr(true);

        OfficeParserConfig officeParserConfig = new OfficeParserConfig();
        officeParserConfig.setIncludeHeadersAndFooters(false);
        parseContext.set(OfficeParserConfig.class, officeParserConfig);
        parseContext.set(TesseractOCRConfig.class, config);

        try (InputStream stream = new FileInputStream(fileName)) {
            parser.parse(stream, new BoilerpipeContentHandler(contentHandler), metadata, parseContext);
        } catch (TikaException | IOException | SAXException e) {
            log.error("An error occurred with converting {} to HTML", fileName);
            log.error(e.getMessage());
            e.printStackTrace();
            return null;
        }
        return contentHandler.toString();
    }

    public static String OfficeParseHTMLDocument(String fileName) {
        ParseContext parseContext = new ParseContext();
        AutoDetectParser parser = new AutoDetectParser();
        ContentHandler contentHandler = new ToXMLContentHandler();
        Metadata metadata = new Metadata();
        TesseractOCRConfig config = new TesseractOCRConfig();
        config.setSkipOcr(true);

        PDFParserConfig pdfParserConfig = new PDFParserConfig();
        pdfParserConfig.setExtractUniqueInlineImagesOnly(true);
        OfficeParserConfig officeParserConfig = new OfficeParserConfig();
        officeParserConfig.setIncludeHeadersAndFooters(false);
        parseContext.set(OfficeParserConfig.class, officeParserConfig);
        parseContext.set(PDFParserConfig.class, pdfParserConfig);
        parseContext.set(TesseractOCRConfig.class, config);

        try (InputStream stream = new FileInputStream(fileName)) {
            parser.parse(stream, contentHandler, metadata, parseContext);
        } catch (TikaException | IOException | SAXException e) {
            log.error("An error occurred with converting {} to HTML", fileName);
            log.error(e.getMessage());
            e.printStackTrace();
            return null;
        }
        return contentHandler.toString();
    }
}
