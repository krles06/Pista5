import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SesionWithEjercicios } from '../lib/types-sesiones';

export async function generateSessionPDF(sesion: SesionWithEjercicios) {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Colors
    const emerald = [5, 150, 105]; // bg-emerald-600
    const zincDark = [24, 24, 27]; // bg-zinc-950

    // Helper for center text
    const centerText = (text: string, y: number, size: number = 10, color: number[] = [0, 0, 0]) => {
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // 1. Header Section
    doc.setFillColor(zincDark[0], zincDark[1], zincDark[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    centerText('PISTA5 - PLAN DE ENTRENAMIENTO', 15, 10, [150, 150, 150]);
    centerText(sesion.objetivos?.toUpperCase() || 'SESIÓN DE ENTRENAMIENTO', 28, 18, [255, 255, 255]);

    // 2. Info Bar
    doc.setFillColor(emerald[0], emerald[1], emerald[2]);
    doc.rect(0, 40, pageWidth, 10, 'F');

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`FECHA: ${format(new Date(sesion.fecha), 'EEEE d MMMM yyyy', { locale: es }).toUpperCase()}`, 10, 46.5);
    doc.text(`LUGAR: ${sesion.lugar || 'N/A'}`, 100, 46.5);
    doc.text(`TIEMPO: ${sesion.ejercicios.reduce((acc, curr) => acc + (curr.ejercicio.duracion_minutos || 0), 0)} min`, 160, 46.5);

    // 3. Body Section
    let currentY = 60;

    // General Notes
    if (sesion.observaciones || sesion.material) {
        doc.setFontSize(11);
        doc.setTextColor(zincDark[0], zincDark[1], zincDark[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES Y MATERIAL', 10, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const notes = [
            sesion.material ? `Material: ${sesion.material}` : '',
            sesion.observaciones ? `Notas: ${sesion.observaciones}` : ''
        ].filter(Boolean).join('\n');

        const splitNotes = doc.splitTextToSize(notes, pageWidth - 20);
        doc.text(splitNotes, 10, currentY);
        currentY += (splitNotes.length * 5) + 10;
    }

    // 4. Exercises List
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.text('DESARROLLO DE LA SESIÓN', 10, currentY);
    currentY += 8;

    sesion.ejercicios.forEach((se, index) => {
        // Check page break
        if (currentY > 260) {
            doc.addPage();
            currentY = 20;
        }

        const ex = se.ejercicio;

        // Exercise Header
        doc.setFillColor(245, 245, 245);
        doc.rect(10, currentY, pageWidth - 20, 8, 'F');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(zincDark[0], zincDark[1], zincDark[2]);
        doc.text(`${index + 1}. ${ex.titulo.toUpperCase()}`, 13, currentY + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`${ex.etapa_sesion} | ${ex.duracion_minutos || '--'} min | ${ex.n_jugadores || '--'} jug.`, pageWidth - 13, currentY + 5.5, { align: 'right' });

        currentY += 13;

        // Exercise details
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        const desc = doc.splitTextToSize(`Descripción: ${ex.descripcion || 'Sin descripción'}`, pageWidth - 25);
        doc.text(desc, 15, currentY);
        currentY += (desc.length * 4.5) + 3;

        if (ex.reglas) {
            const reglas = doc.splitTextToSize(`Reglas: ${ex.reglas}`, pageWidth - 25);
            doc.setTextColor(emerald[0], emerald[1], emerald[2]);
            doc.text(reglas, 15, currentY);
            currentY += (reglas.length * 4.5) + 3;
        }

        currentY += 5; // spacing between exercises
    });

    // Footer - Page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    // Save PDF
    const filename = `Sesion_${format(new Date(sesion.fecha), 'yyyyMMdd')}.pdf`;
    doc.save(filename);
}
