import { saveAs } from 'file-saver';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { SoapNoteRecord } from '../models/note';

const FONT = 'Times New Roman';
const TEXT_SIZE = 24; // 12pt in half-points
const DASH = '—';

function safe(value?: string | number | null): string {
  if (value === null || value === undefined) return DASH;
  const text = String(value).trim();
  return text || DASH;
}

function spacedHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    thematicBreak: false,
  });
}

function subHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: TEXT_SIZE, font: FONT })],
    spacing: { before: 200, after: 80 },
  });
}

function textBlock(text?: string | null): Paragraph[] {
  const value = (text || '').trim();
  if (!value) {
    return [new Paragraph({ text: DASH, spacing: { after: 120 } })];
  }
  const lines = value.split(/\r?\n/);
  return lines.map((line, idx) => {
    const cleaned = line.trim();
    return new Paragraph({
      text: cleaned || DASH,
      spacing: { after: idx === lines.length - 1 ? 120 : 40 },
    });
  });
}

function objectiveParagraph(index: number, objectiveText?: string, cueingLevel?: string): Paragraph[] {
  return [
    new Paragraph({
      children: [new TextRun({ text: `${index}. ${safe(objectiveText)}` })],
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Cueing: ${safe(cueingLevel)}` })],
      indent: { left: 720 },
      spacing: { after: 100 },
    }),
  ];
}

function dataTable(note: SoapNoteRecord): Table {
  const header = new TableRow({
    children: ['Target', 'Trials', 'Correct', 'Accuracy (%)', 'Cueing', 'Notes'].map(
      (label) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
        }),
    ),
  });

  const rows = note.soap.objective.dataRows.length
    ? note.soap.objective.dataRows.map(
        (row) =>
          new TableRow({
            children: [
              safe(row.target),
              safe(row.trials),
              safe(row.correct),
              safe(row.accuracy),
              safe(row.cueing),
              safe(row.notes),
            ].map(
              (value) =>
                new TableCell({
                  children: [new Paragraph({ text: value })],
                }),
            ),
          }),
      )
    : [
        new TableRow({
          children: new Array(6).fill(0).map(
            () =>
              new TableCell({
                children: [new Paragraph({ text: DASH })],
              }),
          ),
        }),
      ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...rows],
  });
}

function fileDate(note: SoapNoteRecord): string {
  const raw = note.header.dateOfSession || '';
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : '';
  return valid || new Date().toISOString().slice(0, 10);
}

export async function exportDocx(note: SoapNoteRecord): Promise<void> {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: TEXT_SIZE,
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'EIU CDS Speech Language Hearing Clinic SOAP Note System',
                bold: true,
                size: 28,
                font: FONT,
              }),
            ],
            spacing: { after: 180 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            text: `${safe(note.header.clientKey)} | ${safe(note.header.dateOfSession)} | Session ${safe(note.header.sessionNumber)}`,
            spacing: { after: 80 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            text: `${safe(note.header.studentClinician)} | ${safe(note.header.supervisor)} | ${safe(note.header.location)}`,
            spacing: { after: 220 },
          }),

          spacedHeading('Therapy Plan'),
          subHeading('Long-Term Goals'),
          ...textBlock(note.therapyPlan.longTermGoals),

          subHeading('Short-Term Objectives'),
          ...(note.therapyPlan.shortTermObjectives.length
            ? note.therapyPlan.shortTermObjectives.flatMap((o, i) => objectiveParagraph(i + 1, o.objectiveText, o.cueingLevel))
            : [new Paragraph({ text: DASH, spacing: { after: 120 } })]),

          subHeading('Methods / Procedures'),
          ...textBlock(note.therapyPlan.methodsProcedures),

          subHeading('Materials / Stimuli'),
          ...textBlock(note.therapyPlan.materialsStimuli),

          subHeading('Data Plan'),
          ...textBlock(note.therapyPlan.dataPlan),

          spacedHeading('SOAP'),
          subHeading('Subjective'),
          ...textBlock(note.soap.subjective),

          subHeading('Objective Narrative'),
          ...textBlock(note.soap.objective.narrative),

          subHeading('Objective Data Table'),
          dataTable(note),

          subHeading('Assessment'),
          ...textBlock(note.soap.assessment),

          subHeading('Plan'),
          ...textBlock(note.soap.plan),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `SOAP_Note_${fileDate(note)}.docx`);
}
