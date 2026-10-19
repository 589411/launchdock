#!/usr/bin/env python3
"""產生 scripts/check-xlsx.mjs 用的小型 .xlsx 測試檔，以及獨立算出的參考答案 expected.json。

- openpyxl 能做的（真實 Excel 風格的檔案、1904 系統）用 openpyxl 產生。
- openpyxl 做不到的（公式字串快取值、內嵌字串、豐富文字、注音、非連續欄列、
  自訂日期格式、stored 壓縮、ZIP 註解、加密／舊版 OLE 標頭）用 zipfile 手工組。
- 參考答案全部由 Python 的 datetime／字面值推得，不呼叫任何 TypeScript 實作。

用法：python3 scripts/fixtures/build-xlsx-fixtures.py
"""
import datetime as dt
import json
import posixpath
import zipfile
from pathlib import Path

import openpyxl
from openpyxl.styles import Font
from openpyxl.utils.datetime import CALENDAR_MAC_1904

OUT = Path(__file__).resolve().parent / 'xlsx'
OUT.mkdir(parents=True, exist_ok=True)

NS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
RNS = 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'

expected = {}


def rect(rows):
    """補齊成矩形（參考答案的形狀規則）"""
    w = max((len(r) for r in rows), default=0)
    return [list(r) + [''] * (w - len(r)) for r in rows]


def sheet_expect(name, rows):
    return {'name': name, 'rows': rect(rows)}


# ── 獨立的日期換算（與 TS 實作寫法刻意不同：用 timedelta 從基準日加） ──
def serial_1900(s):
    whole = int(s // 1)
    frac = s - whole
    secs = round(frac * 86400)
    if whole == 60 and secs == 0:
        return '1900-02-29'
    base = dt.datetime(1899, 12, 31) if whole < 60 else dt.datetime(1899, 12, 30)
    d = base + dt.timedelta(days=whole, seconds=secs)
    if secs == 0:
        return d.strftime('%Y-%m-%d')
    if whole == 0:
        return d.strftime('%H:%M:%S')  # 純時間
    return d.strftime('%Y-%m-%d %H:%M:%S')


def serial_1904(s):
    whole = int(s // 1)
    secs = round((s - whole) * 86400)
    d = dt.datetime(1904, 1, 1) + dt.timedelta(days=whole, seconds=secs)
    if secs == 0:
        return d.strftime('%Y-%m-%d')
    if whole == 0:
        return d.strftime('%H:%M:%S')
    return d.strftime('%Y-%m-%d %H:%M:%S')


def fmt_dt(v):
    if isinstance(v, dt.datetime):
        if v.time() == dt.time(0, 0):
            return v.strftime('%Y-%m-%d')
        return v.strftime('%Y-%m-%d %H:%M:%S')
    return v.strftime('%Y-%m-%d')


# ── 手工組 xlsx ──
def ws(rows_xml, extra=''):
    return f'{XML}<worksheet {NS}>\n<sheetData>{rows_xml}</sheetData>{extra}</worksheet>'


def make_xlsx(path, sheets, shared=None, styles=None, date1904=False,
              compression=zipfile.ZIP_DEFLATED, comment=None):
    """sheets: list of dict(name, xml, rid, path, state=None)"""
    sheet_tags = ''.join(
        f'<sheet name="{s["name"]}" sheetId="{i + 1}"'
        + (f' state="{s["state"]}"' if s.get('state') else '')
        + f' r:id="{s["rid"]}"/>'
        for i, s in enumerate(sheets)
    )
    pr = '<workbookPr date1904="1"/>' if date1904 else '<workbookPr/>'
    workbook = f'{XML}<workbook {NS} {RNS}>{pr}<sheets>{sheet_tags}</sheets></workbook>'
    rels = ''.join(
        f'<Relationship Id="{s["rid"]}" Type="{REL_NS}/worksheet" Target="{s["target"]}"/>' for s in sheets
    )
    if styles:
        rels += f'<Relationship Id="rIdStyles" Type="{REL_NS}/styles" Target="styles.xml"/>'
    if shared:
        rels += f'<Relationship Id="rIdSst" Type="{REL_NS}/sharedStrings" Target="sharedStrings.xml"/>'
    rels_xml = f'{XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{rels}</Relationships>'
    root_rels = (f'{XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                 f'<Relationship Id="rId1" Type="{REL_NS}/officeDocument" Target="xl/workbook.xml"/></Relationships>')
    with zipfile.ZipFile(path, 'w', compression) as z:
        z.writestr('[Content_Types].xml', f'{XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>')
        z.writestr('_rels/.rels', root_rels)
        z.writestr('xl/workbook.xml', workbook)
        z.writestr('xl/_rels/workbook.xml.rels', rels_xml)
        if styles:
            z.writestr('xl/styles.xml', styles)
        if shared:
            z.writestr('xl/sharedStrings.xml', f'{XML}<sst {NS}>' + ''.join(f'<si>{x}</si>' for x in shared) + '</sst>')
        for s in sheets:
            t = s['target']
            full = t.lstrip('/') if t.startswith('/') else 'xl/' + t
            z.writestr(posixpath.normpath(full), s['xml'])
        if comment:
            z.comment = comment


STYLES = f'''{XML}<styleSheet {NS}>
<numFmts count="9">
<numFmt numFmtId="164" formatCode="yyyy\\-mm\\-dd"/>
<numFmt numFmtId="165" formatCode="yyyy/m/d\\ hh:mm:ss"/>
<numFmt numFmtId="166" formatCode="0.00"/>
<numFmt numFmtId="167" formatCode="#,##0 &quot;days&quot;"/>
<numFmt numFmtId="168" formatCode="[Red]0.0"/>
<numFmt numFmtId="169" formatCode="[$-409]d\\-mmm\\-yy;@"/>
<numFmt numFmtId="170" formatCode="General"/>
<numFmt numFmtId="171" formatCode="0.00_);\\(0.00\\)"/>
<numFmt numFmtId="172" formatCode="yyyy&quot;年&quot;m&quot;月&quot;d&quot;日&quot;"/>
</numFmts>
<fonts count="1"><font/></fonts>
<cellXfs count="14">
<xf numFmtId="0"/>
<xf numFmtId="14" applyNumberFormat="1"/>
<xf numFmtId="22" applyNumberFormat="1"><alignment horizontal="center"/></xf>
<xf numFmtId="164"/>
<xf numFmtId="165"/>
<xf numFmtId="166"/>
<xf numFmtId="167"/>
<xf numFmtId="168"/>
<xf numFmtId="9"/>
<xf numFmtId="18"/>
<xf numFmtId="169"/>
<xf numFmtId="170"/>
<xf numFmtId="171"/>
<xf numFmtId="172"/>
</cellXfs>
</styleSheet>'''


def num(ref, v, s=None):
    sa = f' s="{s}"' if s is not None else ''
    return f'<c r="{ref}"{sa}><v>{v}</v></c>'


# ───────── 1. features.xlsx：文字／型別／日期／稀疏／隱藏／空表／特殊關聯路徑 ─────────
shared = [
    '<t>姓名</t>',  # 0
    '<r><rPr><b/></rPr><t>Hello</t></r><r><t xml:space="preserve"> 世界</t></r>',  # 1 豐富文字
    '<t>A&amp;B &lt;x&gt; &quot;q&quot; &apos;a&apos; &#65;&#x42;&#x4E2D;</t>',  # 2 實體
    '<t>東京</t><rPh sb="0" eb="2"><t>トウキョウ</t></rPh>',  # 3 注音要忽略
    '<t xml:space="preserve">  spaced  </t>',  # 4
    '<t>a_x0041_b</t>',  # 5 _xHHHH_ 跳脫
]
text_rows = (
    '<row r="1">'
    '<c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c>'
    '<c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c><c r="F1" t="s"><v>5</v></c></row>\n'
    '<row r="2">'
    '<c r="A2" t="inlineStr"><is><t>內嵌</t></is></c>'
    '<c r="B2" t="inlineStr"><is><r><t>a</t></r><r><t>b</t></r></is></c>'
    '<c r="C2" t="str"><f>A1&amp;"x"</f><v>姓名x</v></c>'
    '<c r="D2" t="b"><v>1</v></c><c r="E2" t="b"><v>0</v></c>'
    '<c r="F2" t="e"><f>1/0</f><v>#DIV/0!</v></c></row>\n'
    '<row r="3">'
    '<c r="A3"><v>1200</v></c><c r="B3" t="n"><v>0.1</v></c><c r="C3"><v>1E-05</v></c>'
    '<c r="D3"><v>-0.30000000000000004</v></c><c r="E3"><v>123456789012345678</v></c>'
    '<c r="F3"><f>1+1</f><v>2</v></c></row>'
)
expected_text = [
    ['姓名', 'Hello 世界', 'A&B <x> "q" \'a\' AB中', '東京', '  spaced  ', 'aAb'],
    ['內嵌', 'ab', '姓名x', 'true', 'false', ''],
    ['1200', '0.1', '1E-05', '-0.30000000000000004', '123456789012345678', '2'],
]

# 日期表：(原文, 樣式索引, 預期)
date_cases = []
for s_raw, st in [('1', 1), ('59', 1), ('60', 1), ('61', 1), ('25569', 1), ('45000', 1), ('36526', 3),
                  ('45000.5', 4), ('45000.75', 2), ('45292.99998842592', 4)]:
    date_cases.append((s_raw, st, serial_1900(float(s_raw))))
# 自訂格式 [$-409]d\-mmm\-yy 與 yyyy"年"m"月"d"日" 也是日期
date_cases.append(('45000', 10, dt.date(2023, 3, 15).strftime('%Y-%m-%d')))
date_cases.append(('45000', 13, dt.date(2023, 3, 15).strftime('%Y-%m-%d')))
date_cases.append(('0.5', 9, '12:00:00'))
for s_raw, st in [('45000', 0), ('3.14159', 5), ('45000', 6), ('45000', 7), ('0.25', 8), ('45000', 11), ('45000', 12), ('45000', 99)]:
    date_cases.append((s_raw, st, s_raw))  # 非日期格式：原文
date_rows = ''.join(f'<row r="{i + 1}">{num(f"A{i + 1}", r, st)}</row>' for i, (r, st, _) in enumerate(date_cases))
expected_dates = [[e] for (_, _, e) in date_cases]

# 稀疏表：缺列、缺欄、空列、樣式空格、合併儲存格
sparse_rows = (
    '<row r="1"><c r="A1" t="inlineStr"><is><t>h1</t></is></c><c r="C1" t="inlineStr"><is><t>h3</t></is></c></row>'
    '<row r="3"><c r="B3" t="inlineStr"><is><t>x</t></is></c></row>'
    '<row r="4"/>'
    '<row r="5"><c r="A5" t="inlineStr"><is><t>tail</t></is></c></row>'
    '<row r="6"><c r="A6" s="0"/><c r="D6" s="1"/></row>'
    '<row r="7"><c r="C7" t="inlineStr"><is><t></t></is></c></row>'
    '<row r="8"/>'
)
sparse_extra = '<mergeCells count="1"><mergeCell ref="A1:B1"/></mergeCells>'
expected_sparse = [['h1', '', 'h3'], ['', '', ''], ['', 'x', ''], ['', '', ''], ['tail', '', '']]

# 寬欄：Z、AA、AB、XFD 之外的 AZ 與 BA
wide_rows = ('<row r="1"><c r="Z1" t="inlineStr"><is><t>z</t></is></c><c r="AA1" t="inlineStr"><is><t>aa</t></is></c>'
             '<c r="AB1" t="inlineStr"><is><t>ab</t></is></c><c r="AZ1" t="inlineStr"><is><t>az</t></is></c>'
             '<c r="BA1" t="inlineStr"><is><t>ba</t></is></c></row>'
             '<row r="2"><c r="A2" t="inlineStr"><is><t>first</t></is></c></row>')
wide = [''] * 53
wide[25], wide[26], wide[27], wide[51], wide[52] = 'z', 'aa', 'ab', 'az', 'ba'
expected_wide = [wide, ['first'] + [''] * 52]

make_xlsx(
    OUT / 'features.xlsx',
    [
        dict(name='文字', rid='rId7', target='worksheets/sheet1.xml', xml=ws(text_rows)),
        dict(name='日期', rid='rId3', target='worksheets/dates.xml', xml=ws(date_rows)),
        dict(name='稀疏', rid='rId9', target='worksheets/sparse.xml', xml=ws(sparse_rows, sparse_extra)),
        dict(name='寬欄 &amp; 名稱', rid='rId4', target='/xl/worksheets/wide.xml', xml=ws(wide_rows)),
        dict(name='隱藏', rid='rId5', target='worksheets/../worksheets/hidden.xml', state='hidden',
             xml=ws('<row r="1"><c r="A1" t="inlineStr"><is><t>secret</t></is></c></row>')),
        dict(name='空', rid='rId6', target='worksheets/empty.xml',
             xml=f'{XML}<worksheet {NS}><sheetData/></worksheet>'),
    ],
    shared=shared,
    styles=STYLES,
)
expected['features.xlsx'] = [
    sheet_expect('文字', expected_text),
    sheet_expect('日期', expected_dates),
    sheet_expect('稀疏', expected_sparse),
    sheet_expect('寬欄 & 名稱', expected_wide),
    sheet_expect('隱藏', [['secret']]),
    sheet_expect('空', []),
]

# ───────── 2. dates-1904-handmade.xlsx ─────────
rows1904 = [('0', 1), ('1', 1), ('43000', 1), ('43000.5', 4), ('0.5', 9), ('1462', 1), ('45000', 0)]
xml1904 = ''.join(f'<row r="{i + 1}">{num(f"A{i + 1}", v, st)}</row>' for i, (v, st) in enumerate(rows1904))
make_xlsx(OUT / 'dates-1904-handmade.xlsx',
          [dict(name='Mac', rid='rId1', target='worksheets/sheet1.xml', xml=ws(xml1904))],
          styles=STYLES, date1904=True)
expected['dates-1904-handmade.xlsx'] = [sheet_expect('Mac', [[serial_1904(float(v)) if st != 0 else v] for v, st in rows1904])]

# ───────── 3. stored.xlsx：stored（method 0）＋ ZIP 註解 ─────────
make_xlsx(OUT / 'stored.xlsx',
          [dict(name='S', rid='rId1', target='worksheets/sheet1.xml',
                xml=ws('<row r="1"><c r="A1" t="inlineStr"><is><t>a</t></is></c><c r="B1" t="inlineStr"><is><t>b</t></is></c></row>'
                       '<row r="2"><c r="A2"><v>1</v></c><c r="B2"><v>2</v></c></row>'))],
          compression=zipfile.ZIP_STORED, comment=b'a plain zip comment')
expected['stored.xlsx'] = [sheet_expect('S', [['a', 'b'], ['1', '2']])]

# ───────── 4. openpyxl 產生的真實風格檔案 ─────────
wb = openpyxl.Workbook()
s1 = wb.active
s1.title = '銷售'
data = [
    ['日期', '品名', '數量', '單價', '已付款', '備註'],
    [dt.date(2024, 1, 15), '拿鐵 Latte', 2, 120, True, None],
    [dt.datetime(2024, 2, 29, 13, 45, 30), '茶 & 糕 <特價>', 10, 0.1, False, '含稅'],
    [dt.date(2000, 1, 1), '空白欄在中間', None, 1234.5, True, 'x'],
]
for r in data:
    s1.append(r)
s1['A8'].font = Font(bold=True)  # 只有樣式、沒有值的尾端格子，不該產生多餘列
s2 = wb.create_sheet('Sheet 2')
s2.append(['k', 'v'])
s2.append(['長文字', 'line1\nline2'])
s3 = wb.create_sheet('隱藏頁')
s3.sheet_state = 'hidden'
s3.append(['h'])
wb.save(OUT / 'openpyxl-basic.xlsx')


def cell_str(v):
    if v is None:
        return ''
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (dt.date, dt.datetime)):
        return fmt_dt(v)
    return str(v)


expected['openpyxl-basic.xlsx'] = [
    sheet_expect('銷售', [[cell_str(c) for c in r] for r in data]),
    sheet_expect('Sheet 2', [['k', 'v'], ['長文字', 'line1\nline2']]),
    sheet_expect('隱藏頁', [['h']]),
]

# ───────── 5. openpyxl 1904 ─────────
wb = openpyxl.Workbook()
wb.epoch = CALENDAR_MAC_1904
w = wb.active
w.title = 'Mac1904'
vals = [dt.datetime(2023, 3, 15), dt.datetime(1904, 1, 2), dt.datetime(2024, 2, 29, 13, 45, 30), dt.datetime(2030, 12, 31, 0, 0, 1)]
for v in vals:
    w.append([v])
wb.save(OUT / 'openpyxl-1904.xlsx')
expected['openpyxl-1904.xlsx'] = [sheet_expect('Mac1904', [[fmt_dt(v)] for v in vals])]

# ───────── 6. rows20.xlsx：maxRows 截斷 ─────────
wb = openpyxl.Workbook()
w = wb.active
w.title = 'R'
for i in range(1, 21):
    w.append([i, f'row{i}'])
w2 = wb.create_sheet('R2')
for i in range(1, 8):
    w2.append([i * 10])
wb.save(OUT / 'rows20.xlsx')
expected['rows20.xlsx'] = [
    sheet_expect('R', [[str(i), f'row{i}'] for i in range(1, 21)]),
    sheet_expect('R2', [[str(i * 10)] for i in range(1, 8)]),
]

# ───────── 7. 非 xlsx 的各種檔案（錯誤路徑） ─────────
OLE = bytes([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])
(OUT / 'legacy.xls').write_bytes(OLE + b'\x00' * 504 + 'Workbook'.encode('utf-16-le') + b'\x00' * 400)
(OUT / 'encrypted-ole.xlsx').write_bytes(
    OLE + b'\x00' * 504 + 'EncryptionInfo'.encode('utf-16-le') + b'\x00' * 64
    + 'EncryptedPackage'.encode('utf-16-le') + b'\x00' * 400)
with zipfile.ZipFile(OUT / 'encrypted-entry.xlsx', 'w', zipfile.ZIP_STORED) as z:
    z.writestr('EncryptionInfo', b'\x04\x00\x04\x00')
    z.writestr('EncryptedPackage', b'\x00' * 64)
(OUT / 'not-a-zip.xlsx').write_text('日期,金額\n2024-01-01,100\n', encoding='utf-8')
full = (OUT / 'features.xlsx').read_bytes()
(OUT / 'truncated.xlsx').write_bytes(full[: len(full) // 2])

(OUT / 'expected.json').write_text(json.dumps(expected, ensure_ascii=False, indent=1), encoding='utf-8')
print('OK', sorted(p.name for p in OUT.iterdir()))
