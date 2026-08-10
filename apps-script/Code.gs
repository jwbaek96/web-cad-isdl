const SHEET_CONFIG = {
  home: {
    greeting: [
      { header: 'Images', key: 'image', type: 'images' },
      { header: 'English', key: 'english', type: 'text' },
      { header: 'Korean', key: 'korean', type: 'text' },
    ],
    highlights: [
      { header: 'Title', key: 'title', type: 'text' },
      { header: 'Image', key: 'image', type: 'images' },
      { header: 'File Link', key:  'link', type: 'text' },
    ],
  },
  members: {
    Director: [
      { header: 'Role (직책/학위)', key: '직책', type: 'text' },
      { header: 'Name (이름)', key: '이름', type: 'text' },
      { header: 'Image', key: 'image', type: 'image' },
      { header: 'Email', key: 'E-mail', type: 'text' },
      { header: 'Office', key: 'office', type: 'text' },
      { header: 'Education', key: 'Education', type: 'text' },
      { header: 'Professional experience', key: 'Professional experiences', type: 'text' },
      { header: 'Professional Service', key: 'Professional Services', type: 'text' },
      { header: 'Award', key: 'Award', type: 'text' },
      { header: 'CV Link', key: 'cvlink', type: 'url' },
    ],
    Researchers: [
      { header: 'Role (직책/학위)', key: '직책', type: 'text' },
      { header: 'Name (이름)', key: '이름', type: 'text' },
      { header: 'Image', key: 'image', type: 'image' },
      { header: 'Email', key: 'E-mail', type: 'text' },
      { header: 'Education', key: 'Education', type: 'text' },
      { header: 'Research area', key: 'Research area', type: 'text' },
    ],
    Alumni: [
      { header: 'Role (직책/학위)', key: '학위', type: 'text' },
      { header: 'Name (이름)', key: '이름', type: 'text' },
      { header: 'Image', key: 'image', type: 'image' },
      { header: 'Email', key: 'E-mail', type: 'text' },
      { header: 'Education', key: 'Education', type: 'text' },
      { header: 'Research area', key: 'Research area', type: 'text' },
      { header: 'career (진로)', key: '졸업 후 진로', type: 'text' },
    ],
  },
  research: [
    { header: 'Category', key: 'category', type: 'text' },
    { header: 'Title', key: 'Title', type: 'text' },
    { header: 'YouTube', key: 'Link', type: 'url' },
    { header: 'Thumbnail', key: 'Thumb', type: 'image' },
    { header: 'File Link', key: 'File', type: 'text' },
  ],
  publications: [
    { header: 'Category', key: 'category', type: 'text' },
    { header: 'Title', key: 'Title', type: 'text' },
    { header: 'Link', key: 'Link', type: 'url' },
  ],
  ips: [
    { header: 'Category', key: 'category', type: 'text' },
    { header: 'Title', key: 'Title', type: 'text' },
  ],
  lecture: {
    status: '- Preparing -',
    message: 'The lecture page is currently being prepared. Please check back later.',
  },
  news_award: [
    { header: 'Category', key: 'category', type: 'text' },
    { header: 'Title', key: 'Title', type: 'text' },
    { header: 'Date', key: 'Date', type: 'text' },
    { header: 'Thumbnail', key: 'Main Image', type: 'image' },
    { header: 'Images', key: 'Image', type: 'images' },
    { header: 'Text', key: 'Text', type: 'text' },
  ],
};

function doGet(e) {
  const payload = buildSiteData();
  const callbackName = e && e.parameter && e.parameter.callback;

  if (callbackName) {
    const body = `${callbackName}(${JSON.stringify(payload)});`;
    return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function buildSiteData() {
  const ss = getSpreadsheet_();

  return {
    home: readHomeSheet(ss.getSheetByName('Home')),
    members: readMembersSheet(ss.getSheetByName('Members')),
    research: readCategorySheet(ss.getSheetByName('Research'), SHEET_CONFIG.research),
    publications: readCategorySheet(ss.getSheetByName('Publications'), SHEET_CONFIG.publications),
    ips: readCategorySheet(ss.getSheetByName('IPs'), SHEET_CONFIG.ips),
    lecture: readLectureSheet(ss.getSheetByName('Lecture')),
    news_award: readCategorySheet(ss.getSheetByName('NewsAward'), SHEET_CONFIG.news_award),
    menu: ['Home', 'Members', 'Research', 'Publications', 'IPs', 'Lecture', 'NewsAward'],
  };
}

function getSpreadsheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }

  throw new Error('Spreadsheet not found. Set SPREADSHEET_ID in Script Properties or bind this script to the spreadsheet.');
}

function readHomeSheet(sheet) {
  if (!sheet) return { greeting: {}, highlights: [] };

  const greetingHeaderRow = findHeaderRow(sheet, SHEET_CONFIG.home.greeting.map((column) => column.header));
  const highlightHeaderRow = findHeaderRow(sheet, SHEET_CONFIG.home.highlights.map((column) => column.header));

  return {
    greeting: greetingHeaderRow ? readSingleRow(sheet, greetingHeaderRow + 1, SHEET_CONFIG.home.greeting) : {},
    highlights: highlightHeaderRow ? readTableRows(sheet, highlightHeaderRow, SHEET_CONFIG.home.highlights) : [],
  };
}

function readMembersSheet(sheet) {
  if (!sheet) return { Director: [], Researchers: [], Alumni: [] };

  return {
    Director: readMembersSection(sheet, 'Director', SHEET_CONFIG.members.Director, ['Researchers', 'Alumni']),
    Researchers: readMembersSection(sheet, 'Researchers', SHEET_CONFIG.members.Researchers, ['Alumni']),
    Alumni: readMembersSection(sheet, 'Alumni', SHEET_CONFIG.members.Alumni, []),
  };
}

function readCategorySheet(sheet, columns) {
  if (!sheet) return {};

  const headerRow = findHeaderRow(sheet, columns.map((column) => column.header));
  if (!headerRow) return {};

  const rows = readTableRows(sheet, headerRow, columns);
  return groupRowsByCategory(rows);
}

function readLectureSheet(sheet) {
  if (!sheet) return { ...SHEET_CONFIG.lecture };

  const statusCell = findTextCell(sheet, 'status');
  const messageCell = findTextCell(sheet, 'message');

  return {
    status: statusCell ? String(statusCell.getDisplayValue()).trim() : SHEET_CONFIG.lecture.status,
    message: messageCell ? String(messageCell.getDisplayValue()).trim() : SHEET_CONFIG.lecture.message,
  };
}

function readMembersSection(sheet, sectionTitle, columns, stopTitles) {
  const sectionCell = findTextCellInColumn(sheet, sectionTitle, 1);
  if (!sectionCell) return [];

  const titleRow = sectionCell.getRow();
  const headerRow = titleRow + 1; // header is always directly below title

  const endRow = findNextSectionTitleRow(sheet, headerRow, stopTitles);
  return readTableRows(sheet, headerRow, columns, endRow);
}

function readSingleRow(sheet, row, columns) {
  const headerRow = row - 1;
  const mapping = mapHeaders(sheet, headerRow, columns);
  const rowValues = readRawValues(sheet, row, mapping);
  return normalizeRow(rowValues, columns);
}

function readTableRows(sheet, headerRow, columns, endRow) {
  const mapping = mapHeaders(sheet, headerRow, columns);
  const rows = [];
  const lastRow = endRow || sheet.getLastRow();

  for (let row = headerRow + 1; row <= lastRow; row += 1) {
    const rowValues = readRawValues(sheet, row, mapping);
    if (isEmptyObject(rowValues)) continue;
    rows.push(normalizeRow(rowValues, columns));
  }

  return rows;
}

function readRawValues(sheet, row, mapping) {
  const values = {};

  Object.keys(mapping).forEach((header) => {
    const value = sheet.getRange(row, mapping[header]).getDisplayValue();
    if (String(value).trim() !== '') values[header] = value;
  });

  return values;
}

function mapHeaders(sheet, headerRow, columns) {
  const lastColumn = sheet.getLastColumn();
  const headerValues = sheet.getRange(headerRow, 1, 1, lastColumn).getDisplayValues()[0];
  const normalizedHeaders = headerValues.map(normalizeHeader);
  const mapping = {};

  columns.forEach((column) => {
    const index = normalizedHeaders.indexOf(normalizeHeader(column.header));
    if (index !== -1) mapping[column.header] = index + 1;
  });

  return mapping;
}

function normalizeRow(rowValues, columns) {
  const normalized = {};

  columns.forEach((column) => {
    const value = rowValues[column.header];
    if (value === undefined || value === null || String(value).trim() === '') return;
    normalized[column.key] = normalizeCellValue(column, value);
  });

  return normalized;
}

function normalizeCellValue(column, value) {
  if (column.type === 'image') {
    return normalizeImageCell(value)[0] || '';
  }

  if (column.type === 'images') {
    return normalizeImageCell(value);
  }

  if (column.type === 'url') {
    return normalizeUrlCell(value);
  }

  return String(value).trim();
}

function normalizeImageCell(value) {
  return splitCsv(value).map((url) => toWebImageUrl(url));
}

function normalizeUrlCell(value) {
  const urls = splitCsv(value).map((url) => toWebUrl(url));
  if (urls.length === 0) return '';
  if (urls.length === 1) return urls[0];
  return urls.join(', ');
}

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function toWebUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';

  const fileId = extractDriveFileId(trimmed);
  if (!fileId) return trimmed;

  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function toWebImageUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';

  const fileId = extractDriveFileId(trimmed);
  if (!fileId) return trimmed;

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

function extractDriveFileId(url) {
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = String(url || '').match(pattern);
    if (match && match[1]) return match[1];
  }

  return '';
}

function findHeaderRow(sheet, expectedHeaders) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  for (let row = 1; row <= lastRow; row += 1) {
    const values = sheet.getRange(row, 1, 1, lastColumn).getDisplayValues()[0];
    const normalized = values.map(normalizeHeader);
    const matchesAll = expectedHeaders.every((header) => normalized.includes(normalizeHeader(header)));
    if (matchesAll) return row;
  }

  return 0;
}

function findHeaderRowBelow(sheet, startRow, expectedHeaders) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  for (let row = startRow + 1; row <= lastRow; row += 1) {
    const values = sheet.getRange(row, 1, 1, lastColumn).getDisplayValues()[0];
    const normalized = values.map(normalizeHeader);
    const matchesAll = expectedHeaders.every((header) => normalized.includes(normalizeHeader(header)));
    if (matchesAll) return row;
  }

  return 0;
}

// finds the row before the next section title appears in column A
function findNextSectionTitleRow(sheet, startRow, stopTitles) {
  if (!stopTitles || stopTitles.length === 0) return sheet.getLastRow();

  const lastRow = sheet.getLastRow();
  const stopSet = stopTitles.map(normalizeHeader);

  for (let row = startRow + 1; row <= lastRow; row += 1) {
    const value = normalizeHeader(sheet.getRange(row, 1).getDisplayValue());
    if (stopSet.includes(value)) return row - 1;
  }

  return lastRow;
}

function findTextCell(sheet, text) {
  const found = sheet.createTextFinder(text).findNext();
  return found || null;
}

function findTextCellInColumn(sheet, text, columnIndex) {
  const lastRow = sheet.getLastRow();
  const targetColumn = columnIndex || 1;

  for (let row = 1; row <= lastRow; row += 1) {
    const value = sheet.getRange(row, targetColumn).getDisplayValue();
    if (normalizeHeader(value) === normalizeHeader(text)) return sheet.getRange(row, targetColumn);
  }

  return null;
}

function groupRowsByCategory(rows) {
  return rows.reduce((acc, row) => {
    const category = row.category || '';
    if (!category) return acc;
    if (!acc[category]) acc[category] = [];

    const copy = { ...row };
    delete copy.category;
    acc[category].push(copy);
    return acc;
  }, {});
}

function normalizeHeader(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/[()]/g, '')
    .trim()
    .toLowerCase();
}

function isEmptyObject(value) {
  return !value || Object.keys(value).length === 0;
}
