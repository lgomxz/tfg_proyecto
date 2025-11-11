import { Controller, Post, Body, Res } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { Response } from 'express';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Post('download')
  async downloadExcel(
    @Body()
    data: { labelId: string; prediction: string; estimatedAge?: string }[],
    @Res() res: Response,
  ) {
    const buffer = await this.excelService.generateExcelBuffer(data);

    // Configuración de cabeceras de respuesta para descarga de Excel
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=predictions.xlsx',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
