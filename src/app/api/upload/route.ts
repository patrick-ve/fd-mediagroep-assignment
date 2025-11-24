// API route for Excel file upload

import { NextRequest, NextResponse } from 'next/server';
import { ExcelParser } from '@/features/parsers/excel-parser';
import { isValidExcelFile } from '@/lib/utils';

const excelParser = new ExcelParser();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand geüpload' },
        { status: 400 }
      );
    }

    if (!isValidExcelFile(file.name)) {
      return NextResponse.json(
        { error: 'Ongeldig bestandstype. Alleen .xlsx en .xls bestanden zijn toegestaan.' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Bestand is te groot. Maximale grootte is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const chartData = await excelParser.parseExcelBuffer(buffer);

    return NextResponse.json({
      success: true,
      data: chartData,
      message: 'Excel-bestand succesvol verwerkt'
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        error: 'Fout bij het verwerken van het Excel-bestand',
        details: error instanceof Error ? error.message : 'Onbekende fout'
      },
      { status: 500 }
    );
  }
}
