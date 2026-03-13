import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SesionWithEjercicios } from '../lib/types-sesiones';

const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error fetching image for PDF:", error);
        return null;
    }
};

export async function generateSessionPDF(sesion: SesionWithEjercicios) {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Variables & Constants
    const emerald = [5, 150, 105]; // bg-emerald-600
    const zincDark = [24, 24, 27]; // bg-zinc-950
    const grayText = [100, 100, 100];
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    const centerText = (text: string, y: number, size: number = 10, color: number[] = [0, 0, 0], font = 'helvetica', style = 'normal') => {
        doc.setFont(font, style);
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // 1. Header Section
    doc.setFillColor(zincDark[0], zincDark[1], zincDark[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');

    centerText('PLAN DE ENTRENAMIENTO - PISTA5', 15, 10, [150, 150, 150], 'helvetica', 'bold');
    centerText(sesion.objetivos ? sesion.objetivos.toUpperCase() : 'SESIÓN DE ENTRENAMIENTO', 25, 16, [255, 255, 255], 'helvetica', 'bold');

    // 2. Info Bar
    doc.setFillColor(emerald[0], emerald[1], emerald[2]);
    doc.rect(0, 35, pageWidth, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`FECHA: ${format(new Date(sesion.fecha), 'EEEE d MMMM yyyy', { locale: es }).toUpperCase()}`, margin, 40.5);

    // Centered info in bar
    const timeText = `DURACIÓN: ${sesion.ejercicios.reduce((acc, curr) => acc + (curr.ejercicio.duracion_minutos || 0), 0)} min`;
    doc.text(timeText, (pageWidth - doc.getTextWidth(timeText)) / 2, 40.5);

    // Right info in bar
    const locationText = `LUGAR: ${sesion.lugar || 'N/A'}`;
    doc.text(locationText, pageWidth - margin - doc.getTextWidth(locationText), 40.5);

    // 3. Body Section - Notes
    let currentY = 52;

    if (sesion.material || sesion.observaciones) {
        doc.setFillColor(245, 245, 245);
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, currentY, contentWidth, 25, 'FD'); // Background for notes

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(zincDark[0], zincDark[1], zincDark[2]);
        doc.text('MATERIAL Y OBSERVACIONES', margin + 4, currentY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);

        const textMaterial = sesion.material ? `Material: ${sesion.material}` : 'Material: -';
        doc.text(textMaterial, margin + 4, currentY + 12);

        if (sesion.observaciones) {
            const splitNotes = doc.splitTextToSize(`Notas: ${sesion.observaciones}`, contentWidth - 8);
            doc.text(splitNotes, margin + 4, currentY + 18);
            // Adjust currentY based on notes height
            if (splitNotes.length > 2) {
                // Dynamic height is nice but assume max of 3 lines fit in 25 for now
            }
        }
        currentY += 32;
    }

    // 4. Exercises List
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.text('ESTRUCTURA DE LA SESIÓN', margin, currentY);
    currentY += 8;

    for (let i = 0; i < sesion.ejercicios.length; i++) {
        const se = sesion.ejercicios[i];
        const ex = se.ejercicio;

        // Check page break need before drawing exercise block (assume an exercise takes around 60-70 units)
        if (currentY > pageHeight - 60) {
            doc.addPage();
            currentY = 20;
        }



        // Number and Stage tag
        doc.setFillColor(emerald[0], emerald[1], emerald[2]);
        doc.rect(margin, currentY, 6, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        // Center the number in the square
        doc.text(`${i + 1}`, margin + 1.5, currentY + 4.5);

        doc.setTextColor(zincDark[0], zincDark[1], zincDark[2]);
        doc.setFontSize(11);
        doc.text(`${ex.titulo.toUpperCase()}`, margin + 8, currentY + 4.5);

        // Sub tags
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        const detailsText = `${ex.etapa_sesion.toUpperCase()}  |  ${ex.duracion_minutos || '--'} MIN  |  ${ex.n_jugadores || '--'} JUGADORES`;
        doc.text(detailsText, pageWidth - margin - doc.getTextWidth(detailsText), currentY + 4.5);

        currentY += 8;

        // Divider
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 4;

        // Draw image if available
        let textX = margin;
        let textAvailableWidth = contentWidth;
        let imageMaxHeight = 0;

        if (ex.url_imagen) {
            const b64 = await fetchImageAsBase64(ex.url_imagen);
            if (b64) {
                const imgWidth = 70;
                const imgHeight = 45; // Fixed proportion box

                try {
                    // Try to add the image
                    doc.addImage(b64, 'JPEG', margin, currentY, imgWidth, imgHeight);
                    // Add border
                    doc.setDrawColor(200, 200, 200);
                    doc.rect(margin, currentY, imgWidth, imgHeight, 'D');

                    textX = margin + imgWidth + 5;
                    textAvailableWidth = contentWidth - imgWidth - 5;
                    imageMaxHeight = imgHeight;
                } catch (e) {
                    console.error("Error setting image in PDF", e);
                }
            }
        }

        let textStartY = currentY;

        // Description
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(emerald[0], emerald[1], emerald[2]);
        doc.text('DESCRIPCIÓN:', textX, textStartY);
        textStartY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        const descText = doc.splitTextToSize(ex.descripcion || 'Sin descripción', textAvailableWidth);
        doc.text(descText, textX, textStartY);
        textStartY += (descText.length * 3.5) + 4;

        // Objectives & Rules etc
        if (ex.objetivo_principal) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(emerald[0], emerald[1], emerald[2]);
            doc.text('OBJETIVO:', textX, textStartY);
            textStartY += 4;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            const objText = doc.splitTextToSize(ex.objetivo_principal, textAvailableWidth);
            doc.text(objText, textX, textStartY);
            textStartY += (objText.length * 3.5) + 4;
        }

        if (ex.reglas) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(emerald[0], emerald[1], emerald[2]);
            doc.text('REGLAS:', textX, textStartY);
            textStartY += 4;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            const rglText = doc.splitTextToSize(ex.reglas, textAvailableWidth);
            doc.text(rglText, textX, textStartY);
            textStartY += (rglText.length * 3.5) + 4;
        }

        // We jump the cursor below either the text or the image, whichever is tallest
        const totalHeightUsed = Math.max(textStartY - currentY, imageMaxHeight);
        currentY += totalHeightUsed + 8; // add space for next exercise
    }

    // Wrap-up: Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(zincDark[0], zincDark[1], zincDark[2]);
        doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`PISTA5 SOFTWARE DE ENTRENAMIENTO`, margin, pageHeight - 4);
        doc.text(`PÁGINA ${i} DE ${totalPages}`, pageWidth - margin - 20, pageHeight - 4);
    }

    // Output
    const sanitizedTitle = (sesion.objetivos || 'sesion').substring(0, 15).replace(/[^a-z0-9]/gi, '_');
    const filename = `P5_${format(new Date(sesion.fecha), 'yyyyMMdd')}_${sanitizedTitle}.pdf`;
    doc.save(filename);
}
