document.addEventListener("DOMContentLoaded", () => {
  const colorPickerContainer = document.getElementById("color-picker-container");
  const addColorButton = document.getElementById("add-color");
  const qrModal = document.getElementById("qr-modal");
  const qrImageModal = document.getElementById("qr-image-modal");
  const closeModal = document.querySelector(".close");
  const downloadPngButton = document.getElementById("download-png");
  const downloadSvgButton = document.getElementById("download-svg");

  const form = document.getElementById("qr-form");

  // Límite máximo de colores
  const MAX_COLORS = 10;

  // Función para asignar eventos a los selectores de color
  function assignColorEvent(colorInput, colorCircle) {
    colorCircle.addEventListener("click", () => {
      colorInput.click(); // Abrir el selector de color
    });

    colorInput.addEventListener("input", () => {
      colorCircle.style.backgroundColor = colorInput.value; // Actualizar color visible
    });

    colorCircle.style.backgroundColor = colorInput.value; // Inicializar color
  }

  // Añadir un nuevo selector de color
  addColorButton.addEventListener("click", () => {
    const currentColors = document.querySelectorAll(".color-input").length;

    if (currentColors < MAX_COLORS) {
      const newColorInput = document.createElement("div");
      newColorInput.classList.add("color-input");

      newColorInput.innerHTML = `
        <div class="color-circle"></div>
        <input type="color" name="colors[]" value="#000000" hidden>
      `;

      const colorCircle = newColorInput.querySelector(".color-circle");
      const colorInput = newColorInput.querySelector("input[type='color']");

      assignColorEvent(colorInput, colorCircle);

      colorPickerContainer.insertBefore(newColorInput, addColorButton);
    } else {
      alert("No puedes agregar más de 10 colores.");
    }
  });

  // Inicializar el primer selector de color
  const initialColorInput = document.querySelector(".color-input input[type='color']");
  const initialColorCircle = document.querySelector(".color-input .color-circle");
  assignColorEvent(initialColorInput, initialColorCircle);

  // Mostrar el modal
  const showModal = (imageSrc, svgSrc) => {
    qrImageModal.src = imageSrc;

    // Configurar los enlaces de descarga
    downloadPngButton.href = imageSrc;
    downloadPngButton.download = "qr_code.png"; // Nombre para el archivo PNG

    downloadSvgButton.href = svgSrc;
    downloadSvgButton.download = "qr_code.svg"; // Nombre para el archivo SVG

    qrModal.style.display = "flex";
  };

  // Cerrar el modal
  closeModal.addEventListener("click", () => {
    qrModal.style.display = "none";
  });

  // Resetear el formulario sin recargar la página
  const resetForm = () => {
    form.reset();
    const colorInputs = document.querySelectorAll(".color-input");
    colorInputs.forEach((input, index) => {
      if (index > 0) input.remove(); // Elimina los colores adicionales
    });
    initialColorCircle.style.backgroundColor = "#000000"; // Resetear al color negro por defecto
  };

  // Generar QR y manejar la respuesta
  document.getElementById("qr-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    // Mostrar el indicador de carga
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "flex";

    const formData = new FormData(e.target);
    const colorInputs = document.querySelectorAll("input[name='colors[]']");
    const colors = Array.from(colorInputs).map((input) => input.value);
  
    formData.append("color", colors.join(","));
  
    try {
      const response = await fetch("/generate", { method: "POST", body: formData });
      const result = await response.json();
  
      if (result.status === "success") {
        showModal(result.qr_image, result.qr_svg);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert("Error al generar el QR. Intenta nuevamente.");
    } finally {
      // Ocultar el spinner
      loadingSpinner.style.display = "none";
    }
  });  
});
