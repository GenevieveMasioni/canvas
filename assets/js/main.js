window.onload = () => {
  const canvas = document.getElementById("drawing-area");
  const drawingBoard = new DrawingBoard(canvas);

  const projectNameInput = document.getElementById("project-name");
  const clearBtn = document.getElementById("toolbar-eraser-all");
  const downloadBtn = document.getElementById("toolbar-download");
  const saveProjectBtn = document.getElementById("toolbar-save-project");
  const openProjectBtn = document.getElementById("toolbar-open-project");
  const sizePicker = document.getElementById("size-picker");
  const colorPicker = document.getElementById("color-picker");
  const filePicker = document.createElement("input");
  const undoBtn = document.getElementById("toolbar-undo");
  const redoBtn = document.getElementById("toolbar-redo");
  const errorMessageWrapper = document.getElementById("error-message-wrapper");
  const errorMessage = document.getElementById("error-message-content");
  const errorMessageCloseBtn = document.getElementById("error-message-close");
  var selectedBackgroundPattern; 

  function initializeUI() {
    filePicker.type = "file";
    sizePicker.value = 3;
    colorPicker.value = "#373737";
    drawingBoard.setProjectName(projectNameInput.value);
  }

  function openFilePicker() {
    filePicker.click();
  }

  function handleKeyboardShortcut(e) {
    if (e.ctrlKey && e.code == "KeyW") {
      drawingBoard.undoAction();
    }

    if (e.ctrlKey && e.code == "KeyY") {
      drawingBoard.redoAction();
    }

    if (e.code == "KeyE") {
      drawingBoard.clear();
    }

    if (e.ctrlKey && e.code == "KeyS") {
      drawingBoard.saveProject();
    }

    if (e.ctrlKey && e.code == "KeyO") {
      openFilePicker();
    }

    if (e.ctrlKey && e.code == "KeyD") {
      drawingBoard.download();
    }
  }
  
  function handleColorChoice(e) {
    colorPicker.value = `${e.target.dataset.value}`;
    colorPicker.dispatchEvent(new Event("change"));
  }

  function handleBackgroundPatternChoice(e) {
    const pattern = e.target;
    if (selectedBackgroundPattern) {
      selectedBackgroundPattern.classList.remove("selected");
    }
    pattern.classList.add("selected");
    selectedBackgroundPattern = pattern;
    document.body.style.backgroundImage = `url(${pattern.dataset.url})`;
  }

  function setupEventListeners() {
    document.querySelectorAll(".stroke-color-choice")
      .forEach((colorChoice) => {
        colorChoice.style.backgroundColor = `${colorChoice.dataset.value}`;
        colorChoice.addEventListener("click", handleColorChoice);
      });

    document.querySelectorAll(".toolbar-background-pattern-choice")
      .forEach((pattern) => {
        pattern.addEventListener("click", handleBackgroundPatternChoice);
      });

    sizePicker.addEventListener("change", 
    (e) => drawingBoard.setLineWidth(sizePicker.value));
    colorPicker.addEventListener("change", 
    (e) => drawingBoard.setStrokeColor(colorPicker.value));

    clearBtn.addEventListener("click", (e) => drawingBoard.clear());
    downloadBtn.addEventListener("click", (e) => drawingBoard.download());
    filePicker.addEventListener("change", 
    (e) => drawingBoard.openProject(e.target.files[0]));
    projectNameInput.addEventListener("change", 
    (e) => drawingBoard.setProjectName(e.target.value));

    saveProjectBtn.addEventListener("click", (e) => drawingBoard.saveProject());
    openProjectBtn.addEventListener("click", openFilePicker);

    undoBtn.addEventListener("click", (e) => drawingBoard.undoAction());
    redoBtn.addEventListener("click", (e) => drawingBoard.redoAction());

    window.addEventListener("keydown", handleKeyboardShortcut);
    canvas.addEventListener("error", (e) => { 
      errorMessage.textContent = e.message; 
      errorMessageWrapper.classList.remove("hidden"); 
    });
    errorMessageCloseBtn.addEventListener("click", (e) => { 
      errorMessageWrapper.classList.add("hidden"); 
    });
  }

  initializeUI();
  setupEventListeners();
}
