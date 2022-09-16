package org.mskcc.oncokb.curation.util;

import java.io.*;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.*;

public class GzipUtils {

    private static GzipUtils instance = null;

    public GzipUtils() {}

    public static GzipUtils getInstance() {
        if (instance == null) {
            instance = new GzipUtils();
        }
        return instance;
    }

    private static final int BUFFER = 1024;

    public static void compress(Path originalPath, Path compressPath) throws IOException {
        if (originalPath != null && compressPath != null) {
            FileOutputStream os = new FileOutputStream(compressPath.toString());
            ZipOutputStream zipOut = new ZipOutputStream(os);

            compress(originalPath, zipOut);
            zipOut.close();
        }
    }

    private static void compress(Path originalPath, ZipOutputStream zipOut) throws IOException {
        if (originalPath != null && zipOut != null) {
            if (Files.isHidden(originalPath)) {
                return;
            }
            if (Files.isDirectory(originalPath)) {
                try (DirectoryStream<Path> stream = Files.newDirectoryStream(originalPath)) {
                    for (Path file : stream) {
                        compress(file, zipOut);
                    }
                }
                return;
            }
            writeToStream(originalPath, zipOut);
        }
    }

    public static void writeToStream(Path path, ZipOutputStream zipOut) throws IOException {
        zipOut.putNextEntry(new ZipEntry(path.getFileName().toString()));
        FileInputStream fis = new FileInputStream(path.toFile());
        int len = 0;
        byte[] buffer = new byte[BUFFER];
        while ((len = fis.read(buffer)) != -1) {
            zipOut.write(buffer, 0, len);
        }
        fis.close();
        zipOut.closeEntry();
    }

    public static void deCompress(File compressFile, File originalFile, COMPRESSED_FILE_FORMAT fileFormat) throws IOException {
        if (originalFile != null && originalFile.isFile() && compressFile != null && compressFile.isFile()) {
            FileInputStream is = new FileInputStream(compressFile);
            FileOutputStream os = new FileOutputStream(originalFile);
            deCompress(is, os, fileFormat);
            is.close();
            os.close();
        }
    }

    public static void deCompress(String compressFile, String originalFile, COMPRESSED_FILE_FORMAT fileFormat) throws IOException {
        if (originalFile != null && compressFile != null) {
            FileInputStream is = new FileInputStream(compressFile);
            FileOutputStream os = new FileOutputStream(originalFile);
            deCompress(is, os, fileFormat);
            is.close();
            os.close();
        }
    }

    public static byte[] deCompress(byte[] bytes, COMPRESSED_FILE_FORMAT fileFormat) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        deCompress(bais, baos, fileFormat);
        bytes = baos.toByteArray();
        bais.close();
        baos.close();
        return bytes;
    }

    public static void deCompress(InputStream is, OutputStream os, COMPRESSED_FILE_FORMAT fileFormat) throws IOException {
        switch (fileFormat) {
            case ZIP:
                getZipContent(is, os);
                break;
            case GZIP:
                getGZipContent(is, os);
                break;
            default:
                break;
        }
    }

    public static void getZipContent(InputStream is, OutputStream os) throws IOException {
        ZipInputStream zin = new ZipInputStream(is);
        ZipEntry ze = zin.getNextEntry();
        writeToOutputStream(zin, os, (int) ze.getSize());
    }

    public static void getGZipContent(InputStream is, OutputStream os) throws IOException {
        InputStream fis = new GZIPInputStream(is);
        writeToOutputStream(fis, os, BUFFER);
    }

    private static void writeToOutputStream(InputStream is, OutputStream os, int bufferSize) throws IOException {
        byte[] buffer = new byte[bufferSize];
        int len = 0;
        while ((len = is.read(buffer)) != -1) {
            os.write(buffer, 0, len);
        }
        os.flush();
        is.close();
    }
}
