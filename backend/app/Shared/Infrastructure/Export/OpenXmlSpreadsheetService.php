<?php

namespace App\Shared\Infrastructure\Export;

use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class OpenXmlSpreadsheetService
{
    /**
     * Generate an authentic, valid OpenXML Excel (.xlsx) file in a temporary path.
     *
     * @param string $sheetTitle Title of the worksheet
     * @param array $headers List of column headers, e.g. ['STT', 'Mã', 'Tên']
     * @param array $rows Array of associative or indexed row arrays
     * @return string Absolute path to the generated .xlsx temporary file
     */
    public function generateXlsx(string $sheetTitle, array $headers, array $rows): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'xlsx_');
        $zip = new ZipArchive();
        $zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        // 1. [Content_Types].xml
        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n"
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            . '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
            . '</Types>';
        $zip->addFromString('[Content_Types].xml', $contentTypes);

        // 2. _rels/.rels
        $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n"
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            . '</Relationships>';
        $zip->addFromString('_rels/.rels', $rels);

        // 3. xl/_rels/workbook.xml.rels
        $wbRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n"
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            . '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>'
            . '</Relationships>';
        $zip->addFromString('xl/_rels/workbook.xml.rels', $wbRels);

        // 4. xl/workbook.xml
        $safeSheetTitle = htmlspecialchars(mb_substr($sheetTitle, 0, 31), ENT_QUOTES | ENT_XML1, 'UTF-8');
        $workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n"
            . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheets>'
            . '<sheet name="' . $safeSheetTitle . '" sheetId="1" r:id="rId1"/>'
            . '</sheets>'
            . '</workbook>';
        $zip->addFromString('xl/workbook.xml', $workbook);

        // 5. xl/styles.xml (Standard Calibri styling with bold header)
        $styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n"
            . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<fonts count="2">'
            . '<font><sz val="11"/><name val="Calibri"/></font>'
            . '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'
            . '</fonts>'
            . '<fills count="3">'
            . '<fill><patternFill patternType="none"/></fill>'
            . '<fill><patternFill patternType="gray125"/></fill>'
            . '<fill><patternFill patternType="solid"><fgColor rgb="FF059669"/></patternFill></fill>' // Emerald 600 header fill
            . '</fills>'
            . '<borders count="2">'
            . '<border><left/><right/><top/><bottom/></border>'
            . '<border><left style="thin"><color rgb="FFD1D5DB"/></left><right style="thin"><color rgb="FFD1D5DB"/></right><top style="thin"><color rgb="FFD1D5DB"/></top><bottom style="thin"><color rgb="FFD1D5DB"/></bottom></border>'
            . '</borders>'
            . '<cellStyleXfs count="1">'
            . '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>'
            . '</cellStyleXfs>'
            . '<cellXfs count="3">'
            . '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/>' // 0: Normal data cell
            . '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>' // 1: Header cell
            . '<xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"/>' // 2: Decimal number cell
            . '</cellXfs>'
            . '</styleSheet>';
        $zip->addFromString('xl/styles.xml', $styles);

        // Process strings and worksheet data
        $sharedStrings = [];
        $sharedStringMap = [];

        $getStringIndex = function (string $str) use (&$sharedStrings, &$sharedStringMap): int {
            if (isset($sharedStringMap[$str])) {
                return $sharedStringMap[$str];
            }
            $idx = count($sharedStrings);
            $sharedStrings[] = $str;
            $sharedStringMap[$str] = $idx;
            return $idx;
        };

        $sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n"
            . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<sheetData>';

        $rowIndex = 1;

        // Write Header Row
        $sheetXml .= '<row r="' . $rowIndex . '" spans="1:' . count($headers) . '">';
        foreach ($headers as $colIdx => $headerText) {
            $colLetter = $this->getColumnLetter($colIdx + 1);
            $strIdx = $getStringIndex((string) $headerText);
            $sheetXml .= '<c r="' . $colLetter . $rowIndex . '" s="1" t="s"><v>' . $strIdx . '</v></c>';
        }
        $sheetXml .= '</row>';
        $rowIndex++;

        // Write Data Rows
        foreach ($rows as $row) {
            $colCount = count($headers);
            $sheetXml .= '<row r="' . $rowIndex . '" spans="1:' . $colCount . '">';
            $colIdx = 0;
            foreach ($row as $cellVal) {
                if ($colIdx >= $colCount) break;
                $colLetter = $this->getColumnLetter($colIdx + 1);

                if (is_numeric($cellVal) && !preg_match('/^0[0-9]+/', (string) $cellVal)) {
                    // Numeric cell
                    $sheetXml .= '<c r="' . $colLetter . $rowIndex . '" s="0"><v>' . $cellVal . '</v></c>';
                } elseif ($cellVal === null || $cellVal === '') {
                    $sheetXml .= '<c r="' . $colLetter . $rowIndex . '" s="0"/>';
                } else {
                    $strIdx = $getStringIndex((string) $cellVal);
                    $sheetXml .= '<c r="' . $colLetter . $rowIndex . '" s="0" t="s"><v>' . $strIdx . '</v></c>';
                }
                $colIdx++;
            }
            $sheetXml .= '</row>';
            $rowIndex++;
        }

        $sheetXml .= '</sheetData></worksheet>';
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheetXml);

        // 6. xl/sharedStrings.xml
        $ssXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n"
            . '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="' . count($sharedStrings) . '" uniqueCount="' . count($sharedStrings) . '">';
        foreach ($sharedStrings as $str) {
            $safeStr = htmlspecialchars($str, ENT_QUOTES | ENT_XML1, 'UTF-8');
            $ssXml .= '<si><t>' . $safeStr . '</t></si>';
        }
        $ssXml .= '</sst>';
        $zip->addFromString('xl/sharedStrings.xml', $ssXml);

        $zip->close();

        return $tempFile;
    }

    /**
     * Download the spreadsheet as an HTTP StreamedResponse.
     */
    public function downloadXlsx(string $filename, string $sheetTitle, array $headers, array $rows): StreamedResponse
    {
        $filePath = $this->generateXlsx($sheetTitle, $headers, $rows);

        $response = new StreamedResponse(function () use ($filePath) {
            $stream = fopen($filePath, 'rb');
            fpassthru($stream);
            fclose($stream);
            @unlink($filePath);
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ]);

        return $response;
    }

    private function getColumnLetter(int $colIndex): string
    {
        $letter = '';
        while ($colIndex > 0) {
            $modulo = ($colIndex - 1) % 26;
            $letter = chr(65 + $modulo) . $letter;
            $colIndex = (int) (($colIndex - $modulo) / 26);
        }
        return $letter;
    }
}
