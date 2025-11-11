import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  // Genera un archivo Excel en memoria y devuelve un buffer
  async generateExcelBuffer(data: any[]): Promise<Buffer> {
    // Crea un nuevo libro de excel
    const workbook = new ExcelJS.Workbook();
    // Añade una hoja
    const worksheet = workbook.addWorksheet('Predictions');

    worksheet.columns = [
      { header: 'Label ID', key: 'labelId', width: 20 },
      { header: 'Prediction', key: 'prediction', width: 20 },
      { header: 'Age', key: 'age', width: 15 },
    ];

    // Agrega cada fila con los datos
    data.forEach((item) => {
      worksheet.addRow({
        labelId: item.labelId,
        prediction: item.prediction,
        age: item.estimatedAge || 'Unestimated age',
      });
    });

    // Formatea el encabezado
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '2B2577' },
      };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Escribe el archivo en memoria
    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }
}
