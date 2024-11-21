document.addEventListener("DOMContentLoaded", () => {
  const colorPickerContainer = document.getElementById("color-picker-container");
  const addColorButton = document.getElementById("add-color");
  const qrModal = document.getElementById("qr-modal");
  const qrImageModal = document.getElementById("qr-image-modal");
  const closeModal = document.querySelector(".close");
  const downloadPngButton = document.getElementById("download-png");
  const downloadSvgButton = document.getElementById("download-svg");

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

  // Generar QR y manejar la respuesta
  document.getElementById("qr-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const colorInputs = document.querySelectorAll("input[name='colors[]']");
    const colors = Array.from(colorInputs).map((input) => input.value);

    formData.append("color", colors.join(",")); // Agregar colores al formulario

    const response = await fetch("/generate", { method: "POST", body: formData });
    const result = await response.json();

    if (result.status === "success") {
      showModal(result.qr_image, result.qr_image.replace(".png", ".svg"));
    } else {
      alert(`Error: ${result.message}`);
    }
  });
});
