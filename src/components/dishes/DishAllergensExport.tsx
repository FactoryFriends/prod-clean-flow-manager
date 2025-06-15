
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ALLERGENS_ENGLISH } from "../ingredients/constants/allergens";
import jsPDF from "jspdf";

// CSV Exporter
function dishesToCSV(dishes, allProducts, rollupAllergens) {
  const headers = ["Dish Name", "Allergens"];
  const csvRows = dishes.map(dish => {
    const allergens = rollupAllergens(dish, allProducts).join(", ");
    return [`"${dish.name}"`, `"${allergens}"`];
  });
  return [headers.join(";"), ...csvRows.map(row => row.join(";"))].join("\n");
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("CSV downloaded");
}

// PDF Exporter
function dishesToPDF(dishes, allProducts, rollupAllergens) {
  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text("Dish Allergen Report", 15, 15);

  pdf.setFontSize(12);
  let y = 30;
  dishes.forEach(dish => {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
    pdf.text(`Dish: ${dish.name}`, 15, y);
    const allergens = rollupAllergens(dish, allProducts).join(", ") || "None";
    y += 7;
    pdf.text(`Allergens: ${allergens}`, 25, y);
    y += 15;
  });

  pdf.save("dish_allergens.pdf");
}

export function DishAllergensExport({ dishes, allProducts, rollupAllergens, selectedDish }) {
  return (
    <div className="flex gap-2 mt-4">
      <Button
        variant="outline"
        onClick={() => {
          if (!dishes?.length) return toast.error("No dishes available!");
          const csv = dishesToCSV(dishes, allProducts, rollupAllergens);
          downloadCSV(csv, "dish_allergens.csv");
        }}
      >
        Export All as CSV
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          if (!dishes?.length) return toast.error("No dishes available!");
          dishesToPDF(dishes, allProducts, rollupAllergens);
        }}
      >
        Export All as PDF
      </Button>
      {selectedDish && (
        <>
          <Button
            variant="outline"
            onClick={() => {
              const csv = dishesToCSV([selectedDish], allProducts, rollupAllergens);
              downloadCSV(csv, `allergens_${selectedDish.name}.csv`);
            }}
          >
            Export This Dish as CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              dishesToPDF([selectedDish], allProducts, rollupAllergens);
            }}
          >
            Export This Dish as PDF
          </Button>
        </>
      )}
    </div>
  );
}
